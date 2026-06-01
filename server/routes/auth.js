import express from "express"
import Register from "../controllers/Register.js";
import login from "../controllers/Login.js";


const router = express.Router();



router.get("/api/v1/register",Register)
router.get("api/v1/login",login)

export default router;