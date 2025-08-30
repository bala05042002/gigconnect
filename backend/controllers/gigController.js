import asyncHandler from 'express-async-handler';
import Gig from '../models/gigModel.js';
import Bid from '../models/bidModel.js';
import User from '../models/userModel.js';
import { createNotification } from '../controllers/notificationController.js';
import Profile from '../models/profileModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv'

dotenv.config();

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const gigs = await Gig.find({ ...keyword, status: 'open' }).populate('user', 'name');
    res.json(gigs);
});

// @desc    Get a single gig by ID
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'acceptedBid',
            populate: {
                path: 'user',
                select: 'name'
            }
        });

    if (gig) {
        res.json(gig);
    } else {
        res.status(404);
        throw new Error('Gig not found');
    }
});

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Client only)
const createGig = asyncHandler(async (req, res) => {
    const { title, description, category, price, location } = req.body;

    if (req.user.role !== 'client') {
        res.status(403);
        throw new Error('Only clients can create gigs');
    }

    const gig = new Gig({
        user: req.user._id,
        title,
        description,
        category,
        price,
        location,
    });

    const createdGig = await gig.save();
    res.status(201).json(createdGig);
});

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Owner only)
const updateGig = asyncHandler(async (req, res) => {
    const { title, description, category, price, location, status } = req.body;
    const gig = await Gig.findById(req.params.id);

    if (gig) {
        if (gig.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this gig');
        }

        gig.title = title || gig.title;
        gig.description = description || gig.description;
        gig.category = category || gig.category;
        gig.price = price || gig.price;
        gig.location = location || gig.location;
        gig.status = status || gig.status;

        const updatedGig = await gig.save();
        res.json(updatedGig);
    } else {
        res.status(404);
        throw new Error('Gig not found');
    }
});

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner only)
const deleteGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig) {
        if (gig.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this gig');
        }

        if (gig.status !== 'open') {
            res.status(400);
            throw new Error('Cannot delete a gig that is not open.');
        }

        await gig.deleteOne();
        res.json({ message: 'Gig removed' });
    } else {
        res.status(404);
        throw new Error('Gig not found');
    }
});

const getGigsByLocation = asyncHandler(async (req, res) => {
  const { lat, lon, radius } = req.query;

  if (!lat || !lon || !radius) {
    res.status(400);
    throw new Error('Please provide latitude, longitude, and radius in the query.');
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const radiusInKm = parseFloat(radius);

  // Convert km to radians for $centerSphere
  const radiusInRadians = radiusInKm / 6371;

  const gigs = await Gig.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInRadians],
      },
    },
  }).populate('user', 'name');

  res.json(gigs);
});


// @desc    Freelancer marks a gig as finished
// @route   PUT /api/gigs/:id/freelancer-finish
// @access  Private (Freelancer who won the bid only)
const freelancerFinishGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('acceptedBid');

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.acceptedBid?.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to finish this gig');
    }

    if (gig.status !== 'in-progress') {
        res.status(400);
        throw new Error('Gig must be in-progress to be finished.');
    }

    gig.status = 'awaiting_payment';
    const updatedGig = await gig.save();

    // 💡 NEW: Notify the client that the gig has been finished by the freelancer
    await createNotification(
        req,
        gig.user,
        `Your gig "${gig.title}" has been completed by the freelancer and is now awaiting payment.`,
        `/gigs/${gig._id}`
    );

    res.json(updatedGig);
});

// @desc   Create a Razorpay order
// @route   POST /api/gigs/:id/create-order
// @access  Private (Client owner of gig only)
// @desc   Create a Razorpay order (secure for accepted freelancer only)
// @route  POST /api/gigs/:id/create-order
// @access Private (Client owner of gig only)
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate({
    path: 'acceptedBid',
    populate: { path: 'user', select: 'name' },
  });

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Ensure only the gig owner can create order
  if (gig.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to create payment for this gig.');
  }

  if (gig.status !== 'awaiting_payment') {
    res.status(400);
    throw new Error('Gig must be awaiting payment to create an order.');
  }

  const acceptedFreelancerId = gig.acceptedBid?.user?._id;
  if (!acceptedFreelancerId) {
    res.status(400);
    throw new Error('No freelancer assigned to this gig.');
  }

  // Fetch freelancer profile
  const freelancerProfile = await Profile.findOne({ user: acceptedFreelancerId });
  if (!freelancerProfile?.upiId) {
    res.status(400);
    throw new Error('Freelancer does not have a UPI ID.');
  }

  try {
    const options = {
      amount: gig.price * 100, // in paisa
      currency: "INR",
      receipt: gig._id.toString(),
      payment_capture: 1,
      notes: {
        freelancerUpi: freelancerProfile.upiId,
        freelancerId: acceptedFreelancerId.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(201).json({
      order,
      key: process.env.RAZORPAY_KEY_ID,
      freelancerUpi: freelancerProfile.upiId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Razorpay order.', error: error.message });
  }
});

// @desc   Verify payment and complete gig
// @route   POST /api/gigs/:id/verify-payment
// @access  Private (Client owner of gig only)
const verifyPaymentAndCompleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate('acceptedBid');

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (gig.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to complete this gig.');
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify Razorpay signature
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest !== razorpay_signature) {
    res.status(400);
    throw new Error('Invalid signature. Payment verification failed.');
  }

  gig.status = 'completed';
  gig.paymentStatus = 'paid';
  const updatedGig = await gig.save();

  // ✅ Notify freelancer
  if (gig.acceptedBid?.user) {
    await createNotification(
      req,
      gig.acceptedBid.user,
      `Payment of ₹${gig.price} received for gig: "${gig.title}"`,
      `/gigs/${gig._id}`
    );
  }

  res.json({ message: 'Payment successful and gig marked as completed!' });
});

// @desc    Client marks a gig as paid and completed
// @route   PUT /api/gigs/:id/client-pay
// @access  Private (Client owner of gig only)
const clientPayAndCompleteGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to complete this gig');
    }

    if (gig.status !== 'awaiting_payment') {
        res.status(400);
        throw new Error('Gig must be awaiting payment to be completed.');
    }

    gig.status = 'completed';
    gig.paymentStatus = 'paid';
    const updatedGig = await gig.save();

    res.json(updatedGig);
});

// @desc    Client requests gig cancellation
// @route   PUT /api/gigs/:id/cancel-request
// @access  Private (Client owner of gig only)
const requestCancelGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('acceptedBid');

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to request cancellation.');
    }

    if (gig.status !== 'in-progress') {
        res.status(400);
        throw new Error('Only in-progress gigs can be cancelled.');
    }

    gig.status = 'cancellation_pending';
    gig.cancellationRequestedBy = req.user._id;
    const updatedGig = await gig.save();

    await createNotification(
        req,
        gig.acceptedBid.user,
        `Cancellation requested for gig: "${gig.title}"`,
        `/gigs/${gig._id}`
    );

    res.json(updatedGig);
});

// @desc    Freelancer approves gig cancellation
// @route   PUT /api/gigs/:id/approve-cancel
// @access  Private (Freelancer who won the bid only)
const approveCancelGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('acceptedBid');

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.acceptedBid?.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to approve cancellation.');
    }

    if (gig.status !== 'cancellation_pending') {
        res.status(400);
        throw new Error('This gig is not pending cancellation.');
    }

    gig.status = 'cancelled';
    const updatedGig = await gig.save();

    await createNotification(
        req,
        gig.user,
        `Cancellation approved for gig: "${gig.title}"`,
        `/gigs/${gig._id}`
    );

    res.json(updatedGig);
});

// @desc    Freelancer rejects gig cancellation
// @route   PUT /api/gigs/:id/reject-cancel
// @access  Private (Freelancer who won the bid only)
const rejectCancelGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('acceptedBid');

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.acceptedBid?.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to reject cancellation.');
    }

    if (gig.status !== 'cancellation_pending') {
        res.status(400);
        throw new Error('This gig is not pending cancellation.');
    }

    gig.status = 'in-progress';
    const updatedGig = await gig.save();

    await createNotification(
        req,
        gig.user,
        `Cancellation rejected for gig: "${gig.title}"`,
        `/gigs/${gig._id}`
    );

    res.json(updatedGig);
});

const getMyGigs = asyncHandler(async (req, res) => {
    const gigs = await Gig.find({ user: req.user._id });
    res.json(gigs);
});

export {
    getGigs,
    getGigById,
    createGig,
    updateGig,
    deleteGig,
    getGigsByLocation,
    freelancerFinishGig,
    clientPayAndCompleteGig,
    createRazorpayOrder,
    verifyPaymentAndCompleteGig,
    requestCancelGig,
    approveCancelGig,
    rejectCancelGig,
    getMyGigs
};