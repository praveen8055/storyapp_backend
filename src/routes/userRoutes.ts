import express from 'express';
import  {loginUser ,registerUser}  from '../controllers/userController';
import authMiddleware from '../middleware/auth';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);



export default userRouter;