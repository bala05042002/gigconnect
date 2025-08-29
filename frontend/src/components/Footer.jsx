// src/components/Footer.js

import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          {/* Company Info Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-xl font-bold mb-3 text-green-400">GigConnect</h4>
            <p className="text-sm text-gray-400">Connecting local communities with skilled freelancers.</p>
            <p className="text-sm text-gray-500 mt-4">&copy; 2025 GigConnect. All rights reserved.</p>
          </div>

          {/* Company Links Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><NavLink to="/about-us" className="hover:text-green-400 transition-colors duration-300">About Us</NavLink></li>
              <li><NavLink to="/careers" className="hover:text-green-400 transition-colors duration-300">Careers</NavLink></li>
              <li><NavLink to="/blog" className="hover:text-green-400 transition-colors duration-300">Blog</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-green-400 transition-colors duration-300">Contact</NavLink></li>
            </ul>
          </div>

          {/* Support Links Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li><NavLink to="/faq" className="hover:text-green-400 transition-colors duration-300">FAQ</NavLink></li>
              <li><NavLink to="/help-center" className="hover:text-green-400 transition-colors duration-300">Help Center</NavLink></li>
              <li><NavLink to="/privacy-policy" className="hover:text-green-400 transition-colors duration-300">Privacy Policy</NavLink></li>
              <li><NavLink to="/terms-of-service" className="hover:text-green-400 transition-colors duration-300">Terms of Service</NavLink></li>
            </ul>
          </div>

          {/* Social Media Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              {/* Social media links typically do not use NavLink as they point to external sites */}
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300">
                <FaFacebook className="h-6 w-6 text-gray-400 hover:text-white" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300">
                <FaTwitter className="h-6 w-6 text-gray-400 hover:text-white" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300">
                <FaLinkedin className="h-6 w-6 text-gray-400 hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;