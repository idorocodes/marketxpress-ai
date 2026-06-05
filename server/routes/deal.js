import express from "express";
import { createDealFromOptimization, confirmDeal } from "../controllers/Deals/deals.js";
import  authMiddleware from "../middleware/auth.js"
const dealRouter = express.Router();

dealRouter.use(authMiddleware); 

dealRouter.post("/create", createDealFromOptimization);
dealRouter.post("/:id/confirm", confirmDeal);

export default dealRouter;