import express from 'express';
import { createReview, getReviewsForUser, getReviewsForGig, getAverageRatingForUser } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/user/:userId', getReviewsForUser);
router.get('/gig/:gigId', getReviewsForGig);
router.get('/user/:userId/average', getAverageRatingForUser);

export default router;
