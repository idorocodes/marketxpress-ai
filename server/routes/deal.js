import express from "express";
import { createDealFromOptimization, confirmDeal } from "../controllers/Deals/deals.js";
import  authMiddleware from "../middleware/auth.js"
import { getVendorDeals } from "../controllers/Deals/IncomingDeals.js";
import acceptDeal from "../controllers/Deals/acceptDeal.js";
import rejectDeal from "../controllers/Deals/rejectDeal.js";
import dealStatus from "../controllers/Deals/DealStatus.js";
import dealQr from "../controllers/Deals/dealsQr.js";
const dealRouter = express.Router();

dealRouter.use(authMiddleware); 

dealRouter.post("/create", createDealFromOptimization);
dealRouter.post("/:id/confirm",confirmDeal)
dealRouter.post("/:id/vendor-confirm",acceptDeal)
dealRouter.get("/:id/qr",dealQr)
dealRouter.post('/:id/reject',rejectDeal)
dealRouter.get("/:id/status",dealStatus)
dealRouter.post("/:id/confirm", confirmDeal);

export default dealRouter;