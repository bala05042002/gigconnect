import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReviewsList from '../components/ReviewsList';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`https://gig-server.onrender.com/api/profiles/${userId}`);
        setProfile(data);
      } catch (err) {
        setError('Profile not found.');
        if (err.response && err.response.status === 404) {
          toast.info('This user has not created a profile yet.');
        } else {
          toast.error('Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleEdit = () => {
    navigate('/profiles/edit');
  };

  if (loading)
    return (
      <div className="text-center mt-8 text-lg font-semibold text-white">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="text-center min-h-screen bg-black/90 flex flex-col justify-center">
        <p className="text-lg text-red-400 mb-4">{error}</p>
        <p className="text-gray-400">
          <Link
            to="/profiles/edit"
            className="text-indigo-400 hover:text-indigo-200 font-semibold"
          >
            Click here to create your profile.
          </Link>
        </p>
      </div>
    );

  const isOwner = user && user._id === profile.user._id;

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `Updated ${diff} seconds ago`;
    else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col items-center mb-6 relative">
          <img
            src={profile.profilePhoto || '/default-avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-indigo-500 mb-4"
          />
          {isOwner && (
            <button
              onClick={handleEdit}
              className="absolute top-0 right-0 mt-2 mr-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
            >
              Edit
            </button>
          )}
          <h1 className="text-3xl font-bold mb-2 text-center text-white">
            {profile.user.name}
          </h1>
          <p className="text-center text-lg text-gray-300 mb-2 capitalize">
            Role: {profile.user.role}
          </p>
          <p className="text-center text-sm text-gray-400">{timeAgo(profile.updatedAt)}</p>
          {profile.location?.district && (
            <p className="text-center text-sm text-gray-400 mt-1">
              Location: {profile.location.district}
            </p>
          )}
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">Bio</h2>
            <p className="text-gray-200">{profile.bio}</p>
          </div>
        )}

        {user.email && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">Email</h2>
            <a className="text-indigo-400 hover:text-indigo-300" href={`mailto:${user.email}`}>
              {user.email}
            </a>
          </div>
        )}

        {profile.skills.length > 0 && (
          <div className="mb-6 select-none">
            <h2 className="text-xl font-semibold mb-2 text-white">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-indigo-500/30 text-white/90 text-sm font-medium px-2.5 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.portfolio.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">Portfolio</h2>
            <ul className="list-disc list-inside text-gray-200">
              {profile.portfolio.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.startsWith('http') ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profile.createdAt && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">Joined on</h2>
            <p className="text-gray-200">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Reviews List */}
        <ReviewsList userId={userId} />
      </div>
    </div>
  );
};

export default ProfilePage;
