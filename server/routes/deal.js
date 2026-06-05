import express from "express";
import { createDealFromOptimization, confirmDeal } from "../controllers/Deals/deals.js";
import  authMiddleware from "../middleware/auth.js"
import { getVendorDeals } from "../controllers/Deals/IncomingDeals.js";
import acceptDeal from "../controllers/Deals/acceptDeal.js";
import rejectDeal from "../controllers/Deals/rejectDeal.js";
const dealRouter = express.Router();

dealRouter.use(authMiddleware); 

dealRouter.post("/create", createDealFromOptimization);
dealRouter.post("/:id/confirm",acceptDeal)
dealRouter.post('/:id/reject',rejectDeal)
dealRouter.post("/:id/confirm", confirmDeal);

export default dealRouter;