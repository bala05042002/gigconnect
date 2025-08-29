import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

const HelpCenter = () => {
  const [openSection, setOpenSection] = useState(null);

  const helpSections = [
    {
      id: 1,
      title: 'Getting Started',
      articles: [
        {
          id: 101,
          title: 'How to create a client profile',
          content: 'Creating a client profile is easy! Simply sign up and fill out your information to get started. You can also connect your social media accounts for a more personalized profile.'
        },
        {
          id: 102,
          title: 'How to create a freelancer profile',
          content: 'To become a freelancer on GigConnect, you need to create a detailed profile that highlights your skills, experience, and portfolio. A great profile attracts more clients and gig opportunities.'
        },
        {
          id: 103,
          title: 'Understanding your dashboard',
          content: 'Your dashboard is your home base. It provides an overview of your active gigs, pending applications, and earnings. You can also manage your profile and settings from here.'
        }
      ]
    },
    {
      id: 2,
      title: 'Managing Gigs & Payments',
      articles: [
        {
          id: 201,
          title: 'How to post a new gig',
          content: 'Posting a gig is a straightforward process. You will need to provide a clear title, a detailed description of the work, the required skills, location, and your budget.'
        },
        {
          id: 202,
          title: 'How to apply for a gig',
          content: 'To apply for a gig, simply find a listing that matches your skills and send a compelling proposal. Be sure to highlight why you are the best person for the job.'
        },
        {
          id: 203,
          title: 'Payment and security on GigConnect',
          content: 'We use a secure escrow system to protect both clients and freelancers. Funds are held securely until the project is completed to your satisfaction.'
        }
      ]
    },
    {
      id: 3,
      title: 'Communication & Community',
      articles: [
        {
          id: 301,
          title: 'Best practices for client-freelancer communication',
          content: 'Clear communication is key to a successful project. We recommend setting clear expectations from the start and providing regular updates throughout the process.'
        },
        {
          id: 302,
          title: 'How to leave a review and feedback',
          content: 'Reviews are important for building trust in the community. After a gig is completed, you can leave a review and provide feedback on your experience.'
        }
      ]
    }
  ];

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            GigConnect Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your guide to everything GigConnect. Find answers and support here.
          </p>
        </header>

        {/* Help Sections */}
        <section className="mb-16 max-w-4xl mx-auto">
          {helpSections.map((section) => (
            <div key={section.id} className="bg-gray-50 rounded-lg shadow-sm p-6 mb-4 transition-shadow duration-300">
              <button
                className="flex justify-between items-center w-full text-left font-semibold text-gray-900 focus:outline-none"
                onClick={() => toggleSection(section.id)}
              >
                <h3 className="text-lg">{section.title}</h3>
                <FaChevronDown 
                  className={`transform transition-transform duration-300 ${openSection === section.id ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>
              <div
                className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${openSection === section.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <ul className="space-y-3">
                  {section.articles.map((article) => (
                    <li key={article.id} className="text-gray-600">
                      <h4 className="font-medium text-gray-800">{article.title}</h4>
                      <p className="text-sm">{article.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gray-900 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            Need more help?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            If you can't find what you are looking for, our support team is here for you.
          </p>
          <NavLink to="/contact" className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300">
            Contact Support
          </NavLink>
        </section>

      </div>
    </div>
  );
};

export default HelpCenter;
