import express from 'express';
import { getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../controllers/subcategory.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

router.get('/', asyncHandler(getSubcategories));
router.post('/', authenticate, requireAdmin, upload.single('image'), asyncHandler(createSubcategory));
router.put('/:id', authenticate, requireAdmin, upload.single('image'), asyncHandler(updateSubcategory));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteSubcategory));

export default router;
