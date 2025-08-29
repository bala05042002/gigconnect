import express from 'express';
import { createBid, getBidsForGig, acceptBid, getMyAcceptedBids, getMyBids } from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBid);
router.route('/mybids').get(protect, getMyBids);
router.route('/mybids/accepted').get(protect, getMyAcceptedBids); // New route, placed first
router.route('/:gigId').get(protect, getBidsForGig);
router.route('/:bidId/accept').put(protect, acceptBid); // New route

export default router;