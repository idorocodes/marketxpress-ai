 
import express from 'express';
import { addProduct, getVendorInventory} from '../controllers/Vendors/CreateProduct.js';

import { verifyVendor } from '../middleware/vendorMiddleware.js';
import { updateProduct } from '../controllers/Vendors/UpdateProduct.js';

const vendorRouter = express.Router();

 
vendorRouter.use(verifyVendor);

vendorRouter.post('/add', addProduct);
vendorRouter.get('/inventory', getVendorInventory);
vendorRouter.put('/update/:productId', updateProduct);

export default vendorRouter;