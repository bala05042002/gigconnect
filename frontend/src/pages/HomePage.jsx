import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './HomePage.css';
import AuthContext from '../context/AuthContext';

const HomePage = () => {
  const [gigs, setGigs] = useState([]);

  const user = localStorage.getItem('userInfo');

  useEffect(() => {
    // Intersection Observer to handle scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  useEffect(() => {
    // Fetch gigs from API
    const fetchGigs = async () => {
      try {
        const { data } = await axios.get('https://gig-server.onrender.com/api/gigs') // Adjust the URL if needed
        setGigs(data);
      } catch (error) {
        console.error('Error fetching gigs:', error);
      }
    };
    fetchGigs();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col text-white font-sans bg-gray-900">
      <div className="glowing-orb"></div>

      {/* Hero Section */}
      <section className="scroll-section flex flex-col items-center justify-center min-h-screen text-center px-4 py-20 relative z-10">
        <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 drop-shadow-lg">
            Connect. Create. Succeed.
          </h1>
          <p className="text-md sm:text-xl md:text-2xl font-light mb-8 drop-shadow-md">
            Your hyperlocal freelance marketplace for connecting with top local talent and finding rewarding job opportunities right in your community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <NavLink to={`${user ? 'freelancers' : 'login'}`} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Find Talent
            </NavLink>
            <NavLink to={`${user ? 'gigs' : 'login'}`} className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Find Gigs
            </NavLink>
          </div>
        </div>
      </section>

      {/* Gigs Section */}
      <section className="scroll-section py-20 px-4 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 drop-shadow-lg">
          Latest Gigs
        </h2>
        {gigs.length === 0 ? (
          <p className="text-gray-300">No gigs available right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-xs sm:max-w-2xl lg:max-w-6xl mx-auto">
            {Array.isArray(gigs) && gigs.length > 0 ? (
              gigs.map((gig) => (
                <Link key={gig._id} to={`/gigs/${gig._id}`} className="p-6 sm:p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-400">{gig.title}</h3>
                  <p className="text-sm sm:text-lg text-gray-300 mb-2">{gig.description}</p>
                  <p className="text-gray-400 font-medium">Category: {gig.category}</p>
                  <p className="text-gray-400 font-medium">Price: ₹{gig.price}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-300">No gigs available right now.</p>
            )}

          </div>
        )}
      </section>

      {/* Feature Highlights Section */}
      <section className="scroll-section py-20 px-4 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 drop-shadow-lg">
          Why Choose GigConnect?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-xs sm:max-w-2xl lg:max-w-6xl mx-auto">
          <div className="p-6 sm:p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-400">Local Focus</h3>
            <p className="text-sm sm:text-lg text-gray-300">Easily find and hire skilled professionals in your neighborhood.</p>
          </div>
          <div className="p-6 sm:p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-green-400">Secure & Simple</h3>
            <p className="text-sm sm:text-lg text-gray-300">Our platform ensures secure payments and direct communication.</p>
          </div>
          <div className="p-6 sm:p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-400">Build Your Profile</h3>
            <p className="text-sm sm:text-lg text-gray-300">Freelancers can showcase their portfolio and expertise.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="scroll-section py-20 px-4 text-center relative z-10">
        <div className="max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 drop-shadow-lg">
            Ready to Get Started?
          </h2>
          <p className="text-md sm:text-xl text-gray-300 mb-8 drop-shadow-md">
            Join thousands of clients and freelancers who are building a better community, one gig at a time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div 
              onClick={() => {
                navigate('/register', { state: { role: 'client' } })
              }}
              className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Sign Up as a Client
            </div>
            <div 
              onClick={() => {
                navigate('/register', { state: { role: 'freelancer' } })
              }}
              className="px-10 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Sign Up as a Freelancer
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
