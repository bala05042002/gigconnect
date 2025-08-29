import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Gig from '../models/gigModel.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { gigId, reviewedUserId, rating, comment } = req.body;
  const reviewerId = req.user._id;

  const gig = await Gig.findById(gigId).populate('acceptedBid');
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (gig.status !== 'completed') {
    res.status(400);
    throw new Error('Cannot review an incomplete gig');
  }

  // Only gig owner or accepted freelancer can review
  const isGigOwner = gig.user.toString() === reviewerId.toString();
  const isAcceptedFreelancer = gig.acceptedBid?.user.toString() === reviewerId.toString();

  if (!isGigOwner && !isAcceptedFreelancer) {
    res.status(401);
    throw new Error('Not authorized to review this gig');
  }

  // Determine who the reviewed user should be
  let targetUser;
  if (isGigOwner) targetUser = gig.acceptedBid?.user;
  else if (isAcceptedFreelancer) targetUser = gig.user;

  if (!targetUser || targetUser.toString() !== reviewedUserId) {
    res.status(400);
    throw new Error('Invalid reviewed user');
  }

  // Prevent duplicate review
  const existingReview = await Review.findOne({ gig: gigId, user: reviewerId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this gig');
  }

  const review = await Review.create({
    gig: gigId,
    user: reviewerId,
    reviewedUser: reviewedUserId,
    rating,
    comment,
  });

  res.status(201).json(review);
});

// @desc    Get all reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getReviewsForUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewedUser: req.params.userId })
    .populate('user', 'name')
    .populate('gig', 'title');
  res.json(reviews);
});

// @desc    Get all reviews for a gig
// @route   GET /api/reviews/gig/:gigId
// @access  Public
const getReviewsForGig = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ gig: req.params.gigId }).populate('user', 'name');
  res.json(reviews);
});

const getAverageRatingForUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewedUser: req.params.userId });

  if (reviews.length === 0) return res.json({ averageRating: 0, totalReviews: 0 });

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = total / reviews.length;

  res.json({ averageRating: average.toFixed(1), totalReviews: reviews.length });
});

export { createReview, getReviewsForUser, getReviewsForGig, getAverageRatingForUser  };
