import mongoose from 'mongoose';

const bidSchema = mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Gig',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    proposal: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;