import mongoose from 'mongoose';
import Gig from './gigModel.js';
import User from './userModel.js';

const reviewSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 👈 renamed from reviewer
  reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true });


// Check if the 'Review' model already exists to prevent recompiling
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;