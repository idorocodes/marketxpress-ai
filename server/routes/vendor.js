 
import express from 'express';
import { addProduct, getVendorInventory} from '../controllers/Vendors/CreateProduct.js';

import { verifyVendor } from '../middleware/vendorMiddleware.js';
import { updateProduct } from '../controllers/Vendors/UpdateProduct.js';
import { getVendorDeals } from '../controllers/Deals/IncomingDeals.js';

const vendorRouter = express.Router();

 
vendorRouter.use(verifyVendor);

vendorRouter.post('/add', addProduct);
vendorRouter.get('/inventory', getVendorInventory);
vendorRouter.get("/deals",getVendorDeals);
vendorRouter.put('/update/:productId', updateProduct);

export default vendorRouter;  