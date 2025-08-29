import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCurrentPosition } from '../utils/geo';
import AuthContext from '../context/AuthContext';

const CreateGigPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: '',
  });
  const [loading, setLoading] = useState(false);

  const { title, description, category, price } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  console.log(user)

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (user?.role !== 'client') {
      toast.error('Only clients can create gigs.');
      setLoading(false);
      return;
    }

    if (!user?.token) {
      toast.error('User token is missing. Please login again.');
      setLoading(false);
      return;
    }

    try {
      let lat = 0, lon = 0;

      try {
        const position = await getCurrentPosition();
        lat = position.lat;
        lon = position.lon;
      } catch (geoError) {
        console.warn('Geolocation failed, using default coordinates:', geoError);
        // Optionally show toast to user
        toast.info('Geolocation failed. Using default location.');
      }

      const location = {
        type: 'Point',
        coordinates: [lon, lat],
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const payload = { ...formData, location };
      console.log('Submitting payload:', payload);

      const response = await axios.post('http://localhost:5000/api/gigs', payload, config);

      console.log('Backend response:', response.data);
      toast.success('Gig created successfully!');
      navigate('/gigs');
    } catch (error) {
      console.error('Error creating gig:', error);

      if (error.response) {
        // Backend responded with error
        console.error('Backend error response:', error.response.data);
        toast.error(`Failed to create gig: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // No response from backend
        console.error('No response received:', error.request);
        toast.error('Failed to create gig: No response from server.');
      } else {
        // Other errors
        toast.error(`Failed to create gig: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container  mx-auto p-4 md:p-8 bg-black/90 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Post a New Gig</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={onChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              required
              rows="5"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <select
              name="category"
              value={category}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            >
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Writing">Writing</option>
              <option value="Gardening">Gardening</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Price ($)</label>
            <input
              type="number"
              name="price"
              value={price}
              onChange={onChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Gig'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGigPage;