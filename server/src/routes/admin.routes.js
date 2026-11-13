import express from 'express';
import { createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import { listAllOrders, updateOrderStatus } from '../controllers/orders.controller.js';
import { upload, validateImages } from '../middleware/upload.middleware.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.post('/products', upload.array('images', 4), validateImages, asyncHandler(createProduct));
router.put('/products/:id', upload.array('images', 4), asyncHandler(updateProduct));
router.delete('/products/:id', asyncHandler(deleteProduct));

router.get('/orders', asyncHandler(listAllOrders));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));

export default router;
