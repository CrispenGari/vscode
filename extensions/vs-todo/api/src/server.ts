import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { appDataSource } from "./utils";
import { PORT } from "./constants";
import { Strategy as GitHubStrategy } from "passport-github2";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "./entities/User";

// ----

(async () => {
  await appDataSource.initialize();
  const app: express.Application = express();
  passport.serializeUser((user: any, done) => {
    done(null, user.accessToken);
  });
  // middlewares
  app.use(cors({ origin: "*" }));
  app.use(passport.initialize());
  app.use(express.json());

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackURL: `http://localhost:${PORT}/auth/github/callback`,
      },
      async (
        _: any,
        __: any,
        profile: any,
        cb: (arg: any, user: any) => void
      ) => {
        let user = await User.findOne({ where: { gitHubId: profile.id } });

        if (user) {
          user.username = profile.displayName;
          (user.photoURL = profile._json.avatar_url),
            (user.bio = profile._json.bio),
            await user.save();
        } else {
          user = await User.create({
            username: profile.displayName,
            gitHubId: profile.id,
            photoURL: profile._json.avatar_url,
            bio: profile._json.bio,
          }).save();
        }
        cb(null, {
          accessToken: jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
              expiresIn: "1y",
            }
          ),
        });
      }
    )
  );

  app.use(router);
  app.listen(PORT);
})()
  .then(() => {
    console.log(`The server is running on port: ${PORT}`);
  })
  .catch((err) => console.log(err));
