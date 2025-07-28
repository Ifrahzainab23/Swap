import express from "express";
import { loginUser, registerUser, adminLogin, UserProfile } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

// return user profile with credit info
userRouter.get("/profile", authUser, UserProfile);



export default userRouter;
