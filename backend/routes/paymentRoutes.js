import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order/:gigId', protect, createOrder);
router.post('/verify/:gigId', protect, verifyPayment);

export default router;
