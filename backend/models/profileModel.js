import mongoose from 'mongoose';

const profileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolio: {
      type: [String],
      default: [],
    },
    profilePhoto: {
      type: String,
      default: '', // empty by default
    },
    location: {
      district: { type: String, default: '' },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [],
      },
    },
    upiId: {
      type: String,
      default: '',   // ✅ only for freelancers
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
