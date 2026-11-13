import express from 'express';
import { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getAddresses } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(getProfile));
router.put('/', asyncHandler(updateProfile));
router.get('/addresses', asyncHandler(getAddresses));
router.post('/addresses', asyncHandler(addAddress));
router.put('/addresses/:addressId', asyncHandler(updateAddress));
router.delete('/addresses/:addressId', asyncHandler(deleteAddress));

export default router;
