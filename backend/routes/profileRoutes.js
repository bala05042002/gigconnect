import express from 'express';
import {
  getProfiles,
  getProfileById,
  createOrUpdateProfile,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProfiles).post(protect, createOrUpdateProfile);
router.route('/:userId').get(getProfileById);

export default router;