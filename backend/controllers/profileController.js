import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModel.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';

// @desc    Get all profiles
// @route   GET /api/profiles
// @access  Public
const getProfiles = asyncHandler(async (req, res) => {
  const profiles = await Profile.find({}).populate('user', 'name role');
  res.json(profiles);
});

// @desc    Get a single profile by user ID
// @route   GET /api/profiles/:userId
// @access  Public
const getProfileById = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name role');
  if (profile) {
    const reviews = await Review.find({ user: req.params.userId }).populate('user', 'name');
    res.json({ ...profile.toObject(), reviews });
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});

// @desc    Create or update a user profile
// @route   POST /api/profiles
// @access  Private
const createOrUpdateProfile = asyncHandler(async (req, res) => {
  const { bio, skills, portfolio, profilePhoto, location, upiId } = req.body;
  const user = req.user._id;

  const profileFields = {
    user,
    bio: bio || '',
    skills: Array.isArray(skills) ? skills : skills?.split(',').map((s) => s.trim()) || [],
    portfolio: Array.isArray(portfolio) ? portfolio : portfolio || [],
    profilePhoto: profilePhoto || '',
    location: location || {},
  };

  // ✅ Only allow freelancers to set UPI ID
  const currentUser = await User.findById(user);
  if (currentUser && currentUser.role === 'freelancer') {
    profileFields.upiId = upiId || '';
  }

  const profile = await Profile.findOneAndUpdate(
    { user },
    { $set: profileFields, $setOnInsert: { createdAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(profile);
});

export { getProfiles, getProfileById, createOrUpdateProfile };
