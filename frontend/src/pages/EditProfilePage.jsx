import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import imageCompression from 'browser-image-compression';

const CLOUDINARY_UPLOAD_PRESET = 'profile_upload';
const CLOUDINARY_CLOUD_NAME = 'dlmsik1mu';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const PLACEHOLDER_AVATAR =
  'https://static.vecteezy.com/system/resources/thumbnails/003/337/584/small_2x/default-avatar-photo-placeholder-profile-icon-vector.jpg';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    portfolio: [],
    profilePhoto: '',
    location: { district: '' },
    upiId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to edit your profile.');
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`https://gig-server.onrender.com/api/profiles/${user._id}`);
        setFormData({
          bio: data.bio || '',
          skills: data.skills || [],
          portfolio: data.portfolio || [],
          profilePhoto: data.profilePhoto || '',
          location: data.location || { district: '' },
          upiId: data.upiId || '',
        });
      } catch (err) {
        console.log('No existing profile found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setFormData({ ...formData, skills: value.split(',').map((s) => s.trim()) });
    } else if (name === 'portfolio') {
      setFormData({ ...formData, portfolio: value.split(',').map((p) => p.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      if (file.size > 50 * 1024) {
        const options = { maxSizeMB: 0.05, maxWidthOrHeight: 1024, useWebWorker: true };
        file = await imageCompression(file, options);
      }

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const { data } = await axios.post(CLOUDINARY_UPLOAD_URL, form, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      setFormData({ ...formData, profilePhoto: data.secure_url });
      toast.success('Profile photo uploaded!');
    } catch (err) {
      toast.error('Failed to upload photo.');
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const validateUpi = (upi) => {
    const upiRegex = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upi);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (user.role === 'freelancer' && formData.upiId && !validateUpi(formData.upiId)) {
      toast.error('Invalid UPI ID format. Example: username@upi');
      return;
    }

    try {
      const config = {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      };
      await axios.post('https://gig-server.onrender.com/api/profiles', formData, config);
      toast.success('Profile updated successfully!');
      navigate(`/profiles/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (isLoading)
    return <div className="text-center mt-8 text-white font-semibold">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-lg bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">Edit Your Profile</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <img
              src={formData.profilePhoto || PLACEHOLDER_AVATAR}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-2 object-cover cursor-pointer border-2 border-indigo-500"
              onClick={handlePhotoClick}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            {uploading && <p className="text-gray-400 mt-1">Uploading... {uploadProgress}%</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={onChange}
              rows="5"
              className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:ring focus:ring-indigo-500 focus:border-indigo-400"
              placeholder="Write a short bio..."
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-white font-medium mb-1">District</label>
            <input
              type="text"
              name="district"
              value={formData.location?.district || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, district: e.target.value },
                })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:ring focus:ring-indigo-500 focus:border-indigo-400"
              placeholder="Enter your district"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-white font-medium mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills.join(', ')}
              onChange={onChange}
              className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:ring focus:ring-indigo-500 focus:border-indigo-400"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-white font-medium mb-1">Portfolio Links (comma-separated)</label>
            <input
              type="text"
              name="portfolio"
              value={formData.portfolio.join(', ')}
              onChange={onChange}
              className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:ring focus:ring-indigo-500 focus:border-indigo-400"
              placeholder="e.g., link1.com, link2.com"
            />
          </div>

          {/* UPI ID */}
          {user.role === 'freelancer' && (
            <div>
              <label className="block text-white font-medium mb-1">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={onChange}
                className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:ring focus:ring-indigo-500 focus:border-indigo-400"
                placeholder="e.g., username@upi"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
