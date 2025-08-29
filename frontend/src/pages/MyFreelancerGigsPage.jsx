import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './MyFreelancerGigsPage.css'; // For animated light effect

const MyFreelancerGigsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMyBids = async () => {
      if (!user || user.role !== 'freelancer') {
        toast.error('You must be a freelancer to view this page.');
        setLoading(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`https://gig-server.onrender.com/api/bids/mybids`, config);
        setBids(data);
      } catch (error) {
        toast.error('Failed to fetch your bids.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyBids();
  }, [user]);

  if (loading) return <div className="text-center mt-8 text-gray-300">Loading your gigs...</div>;
  if (!bids || bids.length === 0) {
    return <div className="text-center mt-8 text-xl text-gray-400">You haven't applied for any gigs yet.</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4 md:p-8 overflow-hidden">
      {/* Animated Light Effects */}
      <div className="floating-light light1"></div>
      <div className="floating-light light2"></div>
      <div className="floating-light light3"></div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-400">My Applied Gigs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bids.map((bid) => (
          <div
            key={bid._id}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 hover:scale-105 transform transition-transform duration-300"
          >
            <h2 className="text-2xl font-semibold mb-2 truncate text-white">{bid.gig.title}</h2>
            <p className="text-gray-300 mb-4 line-clamp-3">{bid.gig.description}</p>
            <div className="text-sm text-gray-200 space-y-1 mb-4">
              <p>
                **Your Price:** <span className="font-medium text-green-400">${bid.price}</span>
              </p>
              <p>
                **Status:**{' '}
                {bid.status === 'accepted' && <span className="font-medium text-green-400">Accepted</span>}
                {bid.status === 'pending' && (
                  <span className="font-medium text-yellow-400">Waiting for client response</span>
                )}
                {bid.status === 'rejected' && (
                  <span className="font-medium text-red-400">You were not selected for this gig. Sorry.</span>
                )}
              </p>
            </div>
            {bid.status === 'accepted' && (
              <Link to={`/gigs/${bid.gig._id}`} className="inline-block text-indigo-400 hover:underline">
                View Gig & Chat
              </Link>
            )}
            {bid.status === 'pending' && (
              <p className="text-gray-400 text-sm italic">You can view this gig until it is filled.</p>
            )}
            {bid.status === 'rejected' && (
              <p className="text-red-400 text-sm italic">This gig is no longer available to you.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFreelancerGigsPage;
