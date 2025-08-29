import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

let socket;

const FreelancerPage = ({ currentUserId }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [search, setSearch] = useState({ name: '', skill: '', location: '' });
  const [onlineUsers, setOnlineUsers] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    socket = io('http://localhost:5000', { query: { userId: currentUserId } });
    socket.emit('user_online', currentUserId);

    socket.on('update_user_status', ({ userId, status }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: status === 'online' }));
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/profiles');
      const freelancersOnly = data.filter((f) => f.user.role === 'freelancer');
      setFreelancers(freelancersOnly);

      const ratingsData = {};
      await Promise.all(
        freelancersOnly.map(async (f) => {
          try {
            const res = await axios.get(
              `http://localhost:5000/api/reviews/user/${f.user._id}/average`
            );
            ratingsData[f.user._id] = res.data;
          } catch {
            ratingsData[f.user._id] = { averageRating: 0, totalReviews: 0 };
          }
        })
      );
      setRatings(ratingsData);
    } catch (err) {
      toast.error('Failed to fetch freelancers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const filtered = freelancers.filter((f) => {
    const nameMatch = f.user.name.toLowerCase().includes(search.name.toLowerCase());
    const skillMatch = search.skill
      ? f.skills.some((skill) => skill.toLowerCase().includes(search.skill.toLowerCase()))
      : true;
    const locationMatch = search.location
      ? f.location?.district?.toLowerCase().includes(search.location.toLowerCase())
      : true;
    return nameMatch && skillMatch && locationMatch;
  });

  const openChat = (freelancerId) => {
    navigate(`/direct-chat/${freelancerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">Find Freelancers</h1>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto mb-8 bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            value={search.name}
            onChange={(e) => setSearch({ ...search, name: e.target.value })}
            className="px-4 py-3 rounded-xl bg-gray-700/50 text-white placeholder-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-transparent border-transparent outline-none backdrop-blur-sm"
          />
          <input
            type="text"
            placeholder="Search by skill"
            value={search.skill}
            onChange={(e) => setSearch({ ...search, skill: e.target.value })}
            className="px-4 py-3 rounded-xl bg-gray-700/50 text-white placeholder-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-transparent border-transparent outline-none backdrop-blur-sm"
          />
          <input
            type="text"
            placeholder="Search by location"
            value={search.location}
            onChange={(e) => setSearch({ ...search, location: e.target.value })}
            className="px-4 py-3 rounded-xl bg-gray-700/50 text-white placeholder-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-transparent border-transparent outline-none backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Freelancer List */}
      {loading ? (
        <div className="text-center text-lg font-semibold mt-8 text-white">Loading freelancers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">No freelancers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((freelancer) => (
            <div
              key={freelancer.user._id}
              className="relative bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={freelancer.profilePhoto || '/default-avatar.png'}
                    alt={freelancer.user.name}
                    className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500 mb-4"
                  />
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                      onlineUsers[freelancer.user._id] ? 'bg-green-400' : 'bg-gray-500'
                    }`}
                  ></span>
                </div>

                <h2 className="text-xl font-bold text-white">{freelancer.user.name}</h2>
                <p className="text-gray-300 mb-2 capitalize">{freelancer.user.role}</p>

                {ratings[freelancer.user._id] && (
                  <div className="flex items-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starFilled =
                        i < Math.round(ratings[freelancer.user._id].averageRating);
                      return (
                        <span
                          key={i}
                          className={`text-yellow-400 text-lg ${starFilled ? '' : 'opacity-40'}`}
                        >
                          ★
                        </span>
                      );
                    })}
                  </div>
                )}

                {freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-center">
                    {freelancer.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-500/30 text-white/90 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between w-full mt-4">
                  <Link
                    to={`/profiles/${freelancer.user._id}`}
                    className="text-indigo-400 hover:text-indigo-200 font-semibold"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerPage;
