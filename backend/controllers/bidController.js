import asyncHandler from 'express-async-handler';
import Bid from '../models/bidModel.js';
import Gig from '../models/gigModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// @desc    Create a new bid
// @route   POST /api/bids
// @access  Private (Freelancers only)
const createBid = asyncHandler(async (req, res) => {
  const { gigId, proposal, price } = req.body;
  const user = req.user;

  if (user.role !== "freelancer") {
    res.status(403);
    throw new Error("Only freelancers can submit bids.");
  }

  const gig = await Gig.findById(gigId).populate("user", "name email");
  if (!gig) {
    res.status(404);
    throw new Error("Gig not found");
  }

  // Check if already bid
  const existingBid = await Bid.findOne({ gig: gigId, user: user._id });
  if (existingBid) {
    res.status(400);
    throw new Error("You have already submitted a bid for this gig.");
  }

  const bid = new Bid({
    gig: gigId,
    user: user._id,
    proposal,
    price,
  });

  const createdBid = await bid.save();

  // ✅ Notification for Client (gig owner)
  await Notification.create({
    user: gig.user._id, // gig owner
    message: `${user.name} applied for your gig "${gig.title}"`,
    link: `/gigs/${gig._id}`,
  });

  res.status(201).json(createdBid);
});

// @desc    Get all bids for a specific gig
// @route   GET /api/bids/:gigId
// @access  Private (Gig owner only)
const getBidsForGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Check if the user requesting is the gig owner
  if (gig.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view bids for this gig.');
  }

  const bids = await Bid.find({ gig: req.params.gigId }).populate('user', 'name');
  res.json(bids);
});

const acceptBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.bidId)
    .populate("gig")
    .populate("user", "name email");

  if (!bid) {
    res.status(404);
    throw new Error("Bid not found");
  }

  const gig = bid.gig;
  if (!gig) {
    res.status(404);
    throw new Error("Associated gig not found");
  }

  // Only gig owner can accept
  if (gig.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized to accept this bid");
  }

  if (gig.status !== "open") {
    res.status(400);
    throw new Error("This gig is no longer open.");
  }

  // Accept bid
  bid.status = "accepted";
  await bid.save();

  // Update gig
  gig.status = "in-progress";
  gig.acceptedBid = bid._id;
  await gig.save();

  // Reject all others
  await Bid.updateMany(
    { gig: gig._id, _id: { $ne: bid._id } },
    { $set: { status: "rejected" } }
  );

  // ✅ Notification for Freelancer
  await Notification.create({
    user: bid.user._id, // freelancer
    message: `Your bid on "${gig.title}" was accepted!`,
    link: `/gigs/${gig._id}`,
  });

  res.json({
    message: "Bid accepted, gig in progress.",
    gigId: gig._id,
    acceptedBid: bid._id,
    gigStatus: gig.status,
  });
});

const getMyAcceptedBids = asyncHandler(async (req, res) => {
  if (req.user.role !== 'freelancer') {
    res.status(403);
    throw new Error('Only freelancers can view this.');
  }
  const bids = await Bid.find({ user: req.user._id, status: 'accepted' }).populate('gig');
  res.json(bids);
});

const getMyBids = asyncHandler(async (req, res) => {
  if (req.user.role !== 'freelancer') {
    res.status(403);
    throw new Error('Only freelancers can view this.');
  }
  const bids = await Bid.find({ user: req.user._id }).populate('gig');
  res.json(bids);
});

export { createBid, getBidsForGig, acceptBid, getMyAcceptedBids, getMyBids };