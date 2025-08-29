import express from 'express';
import {
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
} from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getGigs).post(protect, createGig);
router.route('/search/location').get(getGigsByLocation);
router.route('/mygigs').get(protect, getMyGigs);
router.route('/:id').get(getGigById).put(protect, updateGig).delete(protect, deleteGig);

router.route('/:id/freelancer-finish').put(protect, freelancerFinishGig);
router.route('/:id/client-pay').put(protect, clientPayAndCompleteGig); // Kept for existing behavior
router.route('/:id/create-order').post(protect, createRazorpayOrder); // New route
router.route('/:id/verify-payment').post(protect, verifyPaymentAndCompleteGig); // New route
router.route('/:id/cancel-request').put(protect, requestCancelGig);
router.route('/:id/approve-cancel').put(protect, approveCancelGig);
router.route('/:id/reject-cancel').put(protect, rejectCancelGig);

export default router;