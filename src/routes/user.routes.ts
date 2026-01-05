import { Router } from "express";
import { getUser, getUsers } from "../controllers/user.controller";
import authorize from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get('/', authorize, getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req, res) => {res.send({title: 'Create new user'})});

userRouter.put('/:id', (req, res) => {res.send({title: 'Update user'})});

userRouter.delete('/:id', (req, res) => {res.send({title: 'Delete user'})});

export default userRouter;