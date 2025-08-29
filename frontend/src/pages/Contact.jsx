import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'; // Icons for contact info

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend API.
    // For now, we'll just log it to the console.
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We will get back to you shortly.');
    // Clear the form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you. Send us a message or find our contact details below.
          </p>
        </header>

        {/* Contact Form Section */}
        <section className="bg-gray-50 rounded-lg p-8 shadow-md mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Form Column */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-green-500 text-white font-semibold rounded-md shadow-lg hover:bg-green-600 transition-colors duration-300"
                >
                  Submit
                </button>
              </form>
            </div>
            
            {/* Contact Info Column */}
            <div className="flex flex-col space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Details</h2>
              <div className="flex items-start space-x-4">
                <FaEnvelope className="text-green-500 text-2xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">contact@gigconnect.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaPhone className="text-green-500 text-2xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">(123) 456-7890</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaMapMarkerAlt className="text-green-500 text-2xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">123 Freelance Blvd, Thanjavur, India</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                For media inquiries, partnerships, or support, please reach out to us directly. We look forward to connecting with you.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gray-900 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            Connect on Social Media
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Stay up-to-date with the latest news and updates from GigConnect.
          </p>
          <NavLink to="/blog" className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300">
            Visit Our Blog
          </NavLink>
        </section>

      </div>
    </div>
  );
};

export default Contact;
