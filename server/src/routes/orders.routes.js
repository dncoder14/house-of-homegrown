import express from 'express';
import { createOrder, getUserOrders, getOrder, cancelOrder } from '../controllers/orders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

router.use(authenticate);

router.post('/', asyncHandler(createOrder));
router.get('/', asyncHandler(getUserOrders));
router.get('/:id', asyncHandler(getOrder));
router.patch('/:id/cancel', asyncHandler(cancelOrder));

export default router;
