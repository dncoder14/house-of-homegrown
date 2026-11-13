import express from 'express';
import { getProducts, getProduct, getCategoriesList } from '../controllers/products.controller.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

router.get('/', asyncHandler(getProducts));
router.get('/categories', asyncHandler(getCategoriesList));
router.get('/:id', asyncHandler(getProduct));

export default router;
