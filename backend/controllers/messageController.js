import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import Gig from '../models/gigModel.js';
import Bid from '../models/bidModel.js';
import { createNotification } from './notificationController.js'; // Import the notification helper

// @desc    Get messages for a specific gig
// @route   GET /api/messages/:gigId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const gigId = req.params.gigId;
  const gig = await Gig.findById(gigId);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Authorization check for in-progress gigs
  if (gig.status === 'in-progress') {
    const acceptedBid = await Bid.findOne({ gig: gigId, status: 'accepted' });
    if (!acceptedBid) {
      res.status(404);
      throw new Error('No accepted applicant found for this gig.');
    }
    const isGigOwner = gig.user.toString() === req.user._id.toString();
    const isAcceptedFreelancer = acceptedBid.user.toString() === req.user._id.toString();

    if (!isGigOwner && !isAcceptedFreelancer) {
      res.status(403);
      throw new Error('You are not authorized to view this chat.');
    }
  }

  const messages = await Message.find({ gig: gigId })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .sort('createdAt');

  res.json(messages);
});

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, gigId, content } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !gigId || !content) {
    res.status(400);
    throw new Error('Receiver, Gig, and Content are required.');
  }

  const gig = await Gig.findById(gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Authorization check for in-progress gigs
  if (gig.status === 'in-progress') {
    const acceptedBid = await Bid.findOne({ gig: gigId, status: 'accepted' });
    if (!acceptedBid) {
      res.status(404);
      throw new Error('No accepted applicant found for this gig.');
    }
    const isGigOwner = gig.user.toString() === senderId.toString();
    const isAcceptedFreelancer = acceptedBid.user.toString() === senderId.toString();

    // Check if both sender and receiver are authorized to chat
    const isReceiverAuthorized = receiverId.toString() === gig.user.toString() || receiverId.toString() === acceptedBid.user.toString();

    if ((!isGigOwner && !isAcceptedFreelancer) || !isReceiverAuthorized) {
      res.status(403);
      throw new Error('You are not authorized to send messages for this gig.');
    }
  }

  const message = new Message({
    sender: senderId,
    receiver: receiverId,
    gig: gigId,
    content: content,
  });

  const createdMessage = await message.save();
  const populatedMessage = await Message.findById(createdMessage._id)
    .populate('sender', 'name')
    .populate('receiver', 'name');

  // 💡 NEW: Send a notification to the receiver
  // Prevents a user from notifying themselves when sending a message.
  if (senderId.toString() !== receiverId.toString()) {
    await createNotification(
      req,
      receiverId,
      `New message from ${populatedMessage.sender.name} on gig "${gig.title}"`,
      `/gigs/${gigId}`
    );
  }

  res.status(201).json(populatedMessage);
});

export { getMessages, sendMessage };