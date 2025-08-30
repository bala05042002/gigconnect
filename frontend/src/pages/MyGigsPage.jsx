import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { icons } from '../Exports';

// Shimmer placeholder component for dark mode
const GigShimmer = () => (
  <div className="glass-panel p-6 border-t-4 border-indigo-500 shadow-lg animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2 mt-2"></div>
  </div>
);

const MyGigsPage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [editingGigId, setEditingGigId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
  });

  useEffect(() => {
    const fetchMyGigs = async () => {
      if (!user || user.role !== 'client') {
        toast.error('You must be a client to view this page.');
        setLoading(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/mygigs`, config);
        setGigs(data);
      } catch (error) {
        toast.error('Failed to fetch your gigs.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyGigs();
  }, [user]);

  const handleEditClick = (gig) => {
    if (gig.status !== 'open') {
      toast.error('You can only edit gigs that are still open.');
      return;
    }
    setEditingGigId(gig._id);
    setEditFormData({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: gig.price,
    });
  };

  const handleEditSubmit = async (gigId) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}`, editFormData, config);
      setGigs((prev) => prev.map((g) => (g._id === gigId ? data : g)));
      toast.success('Gig updated successfully!');
      setEditingGigId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update gig.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-400">
        My Posted Gigs
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <GigShimmer key={idx} />
          ))}
        </div>
      ) : !gigs || gigs.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-xl text-gray-400">You haven't posted any gigs yet.</p>
          <Link to="/gigs/create" className="text-indigo-500 mt-2 inline-block hover:underline">
            Create a new gig now!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig._id} className="glass-panel p-6 border-t-4 border-indigo-500 shadow-lg relative">
              {editingGigId === gig._id ? (
                <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(gig._id); }} className="space-y-3">
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="Gig Title"
                    className="w-full px-3 py-2 border rounded-md bg-gray-800 text-white"
                    required
                  />
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Gig Description"
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md bg-gray-800 text-white"
                    required
                  />
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    placeholder="Category"
                    className="w-full px-3 py-2 border rounded-md bg-gray-800 text-white"
                    required
                  />
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    placeholder="Price"
                    className="w-full px-3 py-2 border rounded-md bg-gray-800 text-white"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
                    <button type="button" onClick={() => setEditingGigId(null)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <button
                    className="absolute top-0 right-0 mx-2 my-1 px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={() => handleEditClick(gig)}
                  >
                    <img src={icons.edit} alt="" className='w-4 h-4 cursor-pointer' />
                  </button>

                  <h2 className="text-2xl font-semibold mb-2 truncate">{gig.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{gig.description}</p>
                  <div className="text-sm text-gray-200 space-y-1">
                    <p>
                      Price: <span className="font-medium text-green-400">₹{gig.price}</span>
                    </p>
                    <p>
                      Status: <span className={`font-medium ${gig.status === 'open' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {gig.status}
                      </span>
                    </p>
                  </div>
                  <Link to={`/gigs/${gig._id}`} className="mt-4 inline-block text-indigo-400 hover:underline">
                    View Details & Applications
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigsPage;
