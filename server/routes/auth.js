import express from "express"
import Register from "../controllers/Auth/Register.js";
import login from "../controllers/Auth/Login.js";


const authRouter = express.Router();



authRouter.post("/register",Register)
authRouter.post("/login", login)

export default authRouter