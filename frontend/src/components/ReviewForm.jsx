import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewForm = ({ gigId, reviewedUserId, token, onReviewAdded, existingReview }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [submitted, setSubmitted] = useState(!!existingReview);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');

    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/reviews`, { gigId, reviewedUserId, rating, comment }, config);
      toast.success('Review submitted successfully!');
      setSubmitted(true);
      if (onReviewAdded) onReviewAdded(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="bg-black/90 text-white rounded-lg shadow-md p-6 mt-8">
      {submitted ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Review</h2>
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 text-2xl">{'★'.repeat(rating)}</span>
            <span className="text-gray-300 text-2xl">{'★'.repeat(5 - rating)}</span>
          </div>
          <p className="text-gray-700">{comment}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Rating</label>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className={`text-2xl cursor-pointer ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border rounded-md"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Submit Review
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ReviewForm;
