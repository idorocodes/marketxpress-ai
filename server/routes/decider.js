import express from 'express';
import { executeOptimizationQuery } from '../decider.js';
import { verifyBuyer } from '../middleware/buyerMidlleware.js';

const deciderRouter = express.Router();

deciderRouter.use(verifyBuyer)
 
deciderRouter.post('/run', executeOptimizationQuery);

export default deciderRouter;