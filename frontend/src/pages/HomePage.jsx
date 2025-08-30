import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './HomePage.css';
import { icons } from '../Exports';

const HomePage = () => {
  const [gigs, setGigs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  /** ⭐ Render stars for freelancer ratings */
  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-yellow-400 text-lg ${i < Math.round(rating) ? '' : 'opacity-40'}`}
      >
        ★
      </span>
    ));

  /** 🔹 Fetch gigs */
  const fetchGigs = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs`);
      setGigs(data);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    }
  };

  /** 🔹 Fetch freelancers with ratings */
  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profiles`);
      const freelancersOnly = data.filter((f) => f.user?.role === 'freelancer');
      setFreelancers(freelancersOnly);

      const ratingsData = {};
      await Promise.all(
        freelancersOnly.map(async (f) => {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/reviews/user/${f.user._id}/average`
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

  /** 🔹 Intersection Observer for animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        }),
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  /** 🔹 Fetch data on load */
  useEffect(() => {
    fetchFreelancers();
    fetchGigs();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col text-white font-sans bg-gray-900">

      {/* Hero Section */}
      {/* Hero Section with image */}
      <section className="relative flex flex-col-reverse md:flex-row items-center justify-between min-h-screen px-6 md:px-16 py-20 bg-gray-900 text-white overflow-hidden">
  {/* Left: Text Content */}
  <div className="md:w-1/2 flex flex-col justify-center text-center md:text-left space-y-6">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
      Connect. Create. Succeed.
    </h1>
    <p className="text-md sm:text-lg md:text-xl font-light text-gray-300 drop-shadow-md">
      GigConnect is your hyperlocal freelance marketplace. Discover skilled freelancers nearby, post jobs, and collaborate securely — all in one trusted platform.
    </p>
    <p className="text-sm sm:text-md md:text-lg text-gray-400">
      Whether you are a client looking for local talent or a freelancer seeking rewarding projects, GigConnect helps you achieve your goals efficiently and safely. Build your profile, showcase your skills, and connect with opportunities in your community.
    </p>
    <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
      {user?.role === 'client' && (
        <NavLink
          to={user ? 'freelancers' : 'login'}
          className="px-8 sm:px-12 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-transform duration-300 hover:scale-105 shadow-lg"
        >
          Find Talent
        </NavLink>
      )}
      {user?.role === 'freelancer' && (
        <NavLink
          to={user ? 'gigs' : 'login'}
          className="px-8 sm:px-12 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-full font-semibold transition-transform duration-300 hover:scale-105 shadow-lg"
        >
          Find Gigs
        </NavLink>
      )}
    </div>
  </div>

  {/* Right: Hero Image */}
  <div className="md:w-1/2 flex justify-center md:justify-end items-center mb-10 md:mb-0">
    <img
      src={icons.banner} // replace with your image path
      alt="GigConnect Hero"
      className="w-full max-w-sm sm:max-w-md md:max-w-lg rounded-lg shadow-2xl object-cover"
    />
  </div>

  {/* Optional Background Decorations */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600 rounded-full opacity-20 -z-10 animate-pulse"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-15 -z-10 animate-pulse"></div>
</section>



      {/* Gigs Section (for freelancers) */}
      {user?.role === 'freelancer' && (
        <section className="scroll-section py-20 px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 drop-shadow-lg">Latest Gigs</h2>
          {gigs.length === 0 ? (
            <p className="text-gray-300">No gigs available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-xs sm:max-w-2xl lg:max-w-6xl mx-auto">
              {gigs.map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gigs/${gig._id}`}
                  className="p-6 sm:p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
                >
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-400">
                    {gig.title}
                  </h3>
                  <p className="text-sm sm:text-lg text-gray-300 mb-2">{gig.description}</p>
                  <p className="text-gray-400 font-medium">Category: {gig.category}</p>
                  <p className="text-gray-400 font-medium">Price: ₹{gig.price}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Freelancers Section (for clients) */}
      {user?.role === 'client' && (
        <section className="scroll-section py-20 px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 drop-shadow-lg">Freelancers</h2>
          {freelancers.length === 0 ? (
            <p className="text-gray-300">No freelancers available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-xs sm:max-w-2xl lg:max-w-6xl mx-auto">
              {freelancers.map((freelancer) => (
                <Link
                  key={freelancer._id}
                  to={`/profiles/${freelancer.user._id}`}
                  className="p-2 sm:p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105 flex flex-col items-center justify-center"
                >
                  {freelancer?.profilePhoto && (
                    <img
                      src={freelancer.profilePhoto}
                      alt="profile"
                      className="w-20 h-20 rounded-full object-cover object-top"
                    />
                  )}
                  {ratings[freelancer.user._id] && (
                    <div className="flex items-center mb-2">
                      {renderStars(ratings[freelancer.user._id].averageRating)}
                    </div>
                  )}
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-400">
                    {freelancer.user?.name}
                  </h3>
                  <p className="text-sm sm:text-lg text-gray-300 mb-2">{freelancer.bio}</p>
                  <div className="flex flex-row items-center gap-1 flex-wrap">
                    {freelancer.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="flex items-center bg-green-800 px-2 py-0.5 font-semibold rounded-full text-[12px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-[12px] mt-1">
                    Location: {freelancer.location?.district}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* How It Works Section */}
      <section className="scroll-section py-20 px-4 text-center bg-gray-800 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 drop-shadow-lg">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {[
            { step: "1", title: "Post a Gig", desc: "Clients describe their project, budget, and timeline." },
            { step: "2", title: "Browse Talent", desc: "Freelancers apply or get invited to gigs that match." },
            { step: "3", title: "Hire Securely", desc: "Payments are held securely until milestones are met." },
            { step: "4", title: "Get Work Done", desc: "Collaborate with real-time chat and file sharing." },
            { step: "5", title: "Leave a Review", desc: "Both sides build trust through feedback." }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-gray-900 rounded-lg shadow-lg hover:scale-105 transition-transform">
              <div className="text-4xl font-extrabold text-blue-400 mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="scroll-section py-20 px-4 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 drop-shadow-lg">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {["Web Development", "Graphic Design", "Tutoring", "Photography", "Content Writing", "Local Repairs", "Marketing", "Music & Arts"].map((cat, i) => (
            <div key={i} className="p-6 bg-gray-800 rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer">
              <p className="text-lg font-semibold text-blue-400">{cat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="scroll-section py-20 px-4 text-center relative z-10">
        <div className="max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 drop-shadow-lg">Ready to Get Started?</h2>
          <p className="text-md sm:text-xl text-gray-300 mb-8 drop-shadow-md">
            Join thousands of clients and freelancers who are building a better community, one gig at a time.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <button
                onClick={() => navigate('/register', { state: { role: 'client' } })}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Sign Up as a Client
              </button>
              <button
                onClick={() => navigate('/register', { state: { role: 'freelancer' } })}
                className="px-10 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Sign Up as a Freelancer
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user?.role === 'client' && (
              <button
                onClick={() => navigate('/gigs/create', { state: { role: 'client' } })}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Post a Gig
              </button>
            )}
            {user?.role === 'freelancer' && (
              <button
                onClick={() => navigate('/gigs', { state: { role: 'freelancer' } })}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Find Gigs
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
