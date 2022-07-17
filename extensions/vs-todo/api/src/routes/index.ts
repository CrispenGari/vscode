import { Router } from "express";
import passport from "passport";
import { User } from "../entities/User";
import { Todo } from "../entities/Todo";
import { isAuth } from "../utils/isAuth";
import jwt from "jsonwebtoken";
const router: Router = Router();

router.get("/auth/github", passport.authenticate("github", { session: false }));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  (req: any, res) => {
    return res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
  }
);

router.get("/todo", isAuth, async (req: any, res) => {
  const todos = await Todo.find({
    where: { creatorId: req.userId },
    order: { id: "DESC" },
  });
  res.send({ todos });
});

router.post("/todo", isAuth, async (req: any, res) => {
  const todo = await Todo.create({
    creatorId: req.userId,
    title: req.body.title,
  }).save();
  res.send({ todo });
});

router.put("/todo", isAuth, async (req: any, res) => {
  console.log(req.body);
  const todo = await Todo.findOne(req.body.id);
  console.log(todo);
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
  console.log(todo);
});

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
export default router;
