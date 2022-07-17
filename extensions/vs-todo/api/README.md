### API

This is the backend server for our `vstodo` extension. The boiler plate code was cloned using [initialiseur](https://github.com/CrispenGari/initialiseur) by running the following command:

```shell
initialiseur init
```

### Authentication Flow

We are going to use `passport.js` with `github` strategy and `jwt` tokens. For the database we are going to use `orm` specifically, `typeorm` with `mysql` driver. So we need to install the following packages.

```shell
yarn add passport passport-github2 typeorm reflect-metadata mysql2 jsonwebtoken

# types
yarn add -D @types/jsonwebtoken @types/passport @types/passport-github2
```

### Creating a database

Next we are going to create a database called `vstodo` in mysql command client.

```shell
CREATE DATABASE IF NOT EXISTS vstodo;
```

In our `server.ts` we are going to have the following code in it:

```ts
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { appDataSource } from "./utils";
import { PORT } from "./constants";

// ----

(async () => {
  await appDataSource.initialize();
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(router);
  app.listen(PORT);
})()
  .then(() => {
    console.log(`The server is running on port: ${PORT}`);
  })
  .catch((err) => console.log(err));
```

Our `constants/` looks as follows

```ts
export const __prod__: boolean = process.env.NODE_ENV === "production";
export const PORT: any = 3001 || process.env.PORT;
```

Our `utils/` looks as follows:

```ts
import { __prod__ } from "../constants";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Todo } from "../entities/Todo";

export const appDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "vstodo",
  entities: [User, Todo],
  synchronize: !__prod__,
  logging: !__prod__,
});
```

> Now that we have a connection to our database, we are going to create our entities. We are going to create the `User` and the `Todo` entities in the `entities/`. In the `User.ts` we are going to have the following code in it.

```ts
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Todo } from "./Todo";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  gitHubId: string;

  @Column({ unique: false, nullable: true })
  photoURL?: string;

  @OneToMany(() => Todo, (t) => t.creator)
  todos: Todo[];
}
```

In the `Todo.ts` we are going to have the following code in it.

```ts
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "todos" })
export class Todo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ unique: true, type: "boolean", default: false })
  completed: boolean;

  @Column()
  creatorId: number;

  @ManyToOne(() => User, (u) => u.todos)
  @JoinColumn({ name: "creatorId" })
  creator: User;
}
```

Now that we have our `entities` in place we can now setup passport with `github` strategy. In teh `server.ts` we are going to add the following code in it.

```ts
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
```

### So what is going on in this file?

This is the heart of our Authentication flow. We are going to use the github strategy to authenticate using passport.js and we will get the github profile of the user. We will store the fields that we are interested at in our database. We will serialize the `jwt` token in the `serializeUser` function if the authentication process went correct.

> We will need to get some keys that are stored in the `.env` files which looks as follows:

```env
# environment variables here

DATABASE_USERNAME = <YOUR_USERNAME>
DATABASE_PASSWORD = <YOUR_PASSWORD>

# github
GITHUB_CLIENT_ID = <YOUR_GITHUB_CLIENT_ID>
GITHUB_CLIENT_SECRET = <YOUR_GITHUB_CLIENT_SECRET>

# jwt
ACCESS_TOKEN_SECRET = <YOUR_RANDOM_TOKEN>

```

To get the `YOUR_GITHUB_CLIENT_ID` and `YOUR_GITHUB_CLIENT_SECRET` you need to create an `oAuth` application on github you will get them. When you create an auth application on github, there are two important fields that must match the values that we have in our node.js app. The first field is:

Homepage URL:

```
http://localhost:3001/
```

Authorization callback URL:

```
http://localhost:3001/auth/github/callback
```

For our `ACCESS_TOKEN_SECRET` we are going to put a random string. Normally when im generating this i use a `crypto` package in nodejs and run the following in the console.

```shell
node
# then
> const crypto = require("crypto")
> crypto.randomBytes(50).toString('hex')
'29491d9a3d22858ee3707d46797bb606f2500283e07c3e718344f664f521d509a1f0422c83da99052d3ac1accf0a9928d1bc'
```

Now we are ready to create our `routes`. So our routes code will live in `routes/index.ts` file.

```ts
router.get("/auth/github", passport.authenticate("github", { session: false }));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  (req: any, res) => {
    return res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
  }
);
```

When all the values are set, when you go to `http://localhost:3001/auth/github` you should be able authenticate with github to our express application. In the frontend we are going to listen to this redirect url `http://localhost:54321/auth/${req.user.accessToken}` with the accessToken.

Next we are going to create the `/user` route in the `routes` and verify the `accessToken` using `jwt`. We will get the user based on the token that will be in the authorization header and return the user.

```ts
router.get("/user", async (req, res) => {
  // Bearer <Token>
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.send({ user: null });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.send({ user: null });
    return;
  }
  let userId = "";

  try {
    const payload: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    userId = payload.userId;
  } catch (err) {
    res.send({ user: null });
    return;
  }

  if (!userId) {
    res.send({ user: null });
    return;
  }

  const user = await User.findOne({
    where: {
      id: userId as any,
    },
  });

  res.send({ user });
});
```

### Managing todos

To manage todo's for the authenticated user we are going to create a middleware calles `isAuth`. This middleware function will keep tracking if the user is authenticated or not before updating or creating todos and it looks as follows

```ts
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const isAuth: RequestHandler<{}, any, any, {}> = (req: any, _, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("not authenticated");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("not authenticated");
  }

  try {
    const payload: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    req.userId = payload.userId;
    next();
    return;
  } catch {}

  throw new Error("not authenticated");
};
```

### Getting todos for the User

To get all the todos for the authenticated user we do it as follows

```ts
router.get("/todo", isAuth, async (req: any, res) => {
  const todos = await Todo.find({
    where: { creatorId: req.userId },
    order: { id: "DESC" },
  });
  res.send({ todos });
});
```

### Updating todos for the User

To update the todo for the user we do it as follows:

```ts
router.put("/todo", isAuth, async (req: any, res) => {
  const todo = await Todo.findOne(req.body.id);
  if (!todo) {
    res.send({ todo: null });
    return;
  }
  if (todo.creatorId !== req.userId) {
    throw new Error("not authorized");
  }
  todo.completed = !todo.completed;
  await todo.save();
  res.send({ todo });
});
```

### Adding Todos for the Authenticated User

To add a todo for the authenticated user we do it as follows:

```ts
router.post("/todo", isAuth, async (req: any, res) => {
  const todo = await Todo.create({
    creatorId: req.userId,
    title: req.body.title,
  }).save();
  res.send({ todo });
});
```

> Now we can work on the frontend to interact with this server.

### Links

1. [passport-github2](https://www.passportjs.org/packages/passport-github2/)
2. [passport](https://github.com/jaredhanson/passport)
3. [typeorm](https://typeorm.io/)
4. []()
5. []()
