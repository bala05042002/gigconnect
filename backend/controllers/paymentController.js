import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/paymentModel.js';
import Gig from '../models/gigModel.js';

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for a gig
// @route   POST /api/payments/create-order/:gigId
// @access  Private (Client only)
const createOrder = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId).populate('acceptedBid');

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (gig.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to pay for this gig');
  }

  if (!gig.acceptedBid) {
    res.status(400);
    throw new Error('No accepted bid for this gig');
  }

  const amount = gig.price * 100; // Razorpay takes amount in paise

  const options = {
    amount,
    currency: 'INR',
    receipt: `gig_${gig._id}`,
  };

  const order = await razorpay.orders.create(options);

  const payment = new Payment({
    gig: gig._id,
    client: req.user._id,
    freelancer: gig.acceptedBid.user,
    amount: gig.price,
    razorpayOrderId: order.id,
  });

  await payment.save();

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify payment and update gig
// @route   POST /api/payments/verify/:gigId
// @access  Private (Client only)
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const gig = await Gig.findById(req.params.gigId);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'paid';
    await payment.save();

    gig.paymentStatus = 'paid';
    gig.status = 'completed'; // close gig after successful payment
    await gig.save();

    res.json({ success: true, message: 'Payment verified and gig completed' });
  } else {
    payment.status = 'failed';
    await payment.save();

    res.status(400);
    throw new Error('Payment verification failed');
  }
});

export { createOrder, verifyPayment };
