import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ReviewsList = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Backend should populate 'gig' and 'user'
        const { data } = await axios.get(`http://localhost:5000/api/reviews/user/${userId}`);
        setReviews(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchReviews();
  }, [userId]);

  if (loading) return <div className="text-center mt-4">Loading reviews...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => {
            console.log(review);
            
            return (
              <div key={review._id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                  <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                  <span className="text-gray-400">{'★'.repeat(5 - review.rating)}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                {review.gig && (
                  <p className="text-sm text-gray-500 mt-1">
                    Project: 
                    <Link to={`/gigs/${review.gig._id}`} className="text-indigo-600 hover:underline ml-1">
                      {review.gig.title}
                    </Link>
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewsList;
