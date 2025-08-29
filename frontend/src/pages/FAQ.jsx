import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa'; // Icon for toggling FAQ answers

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  const faqData = [
    {
      id: 1,
      question: 'What is GigConnect?',
      answer: 'GigConnect is a hyperlocal freelance marketplace that connects clients with skilled freelancers in their local communities. It is designed to make it easy for people to find and hire local talent for specific services while providing freelancers with a platform to showcase their skills and find nearby job opportunities.'
    },
    {
      id: 2,
      question: 'How do I register as a client or freelancer?',
      answer: 'You can register by visiting the Join Now page and selecting whether you want to sign up as a client or a freelancer. The registration process is simple and requires only a few details to get you started.'
    },
    {
      id: 3,
      question: 'How do payments work on GigConnect?',
      answer: 'Payments are managed securely through the platform. Clients can fund their projects, and payments are released to the freelancer once the work is completed and approved. This ensures a safe and transparent transaction for both parties.'
    },
    {
      id: 4,
      question: 'What kind of services can I find on GigConnect?',
      answer: 'You can find a wide range of services, including but not limited to, graphic design, web development, content writing, handyman services, tutoring, and more. Our goal is to connect you with any local talent you may need.'
    },
    {
      id: 5,
      question: 'Is GigConnect available in all cities?',
      answer: 'Currently, we are expanding our services to new regions. You can check our location finder to see if GigConnect is available in your area.'
    },
    {
      id: 6,
      question: 'How do I contact customer support?',
      answer: 'You can reach out to our support team through the contact page, where you can send a message directly. We are always here to help with any questions or issues you may have.'
    },
  ];

  const toggleAnswer = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to the most common questions about GigConnect.
          </p>
        </header>

        {/* FAQ Section */}
        <section className="mb-16 max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((faq) => (
              <div key={faq.id} className="bg-gray-50 rounded-lg shadow-sm p-5 transition-shadow duration-300">
                <button
                  className="flex justify-between items-center w-full text-left font-semibold text-gray-900 focus:outline-none"
                  onClick={() => toggleAnswer(faq.id)}
                >
                  <span>{faq.question}</span>
                  <FaChevronDown 
                    className={`transform transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : 'rotate-0'}`} 
                  />
                </button>
                <div
                  className={`mt-4 text-gray-600 overflow-hidden transition-all duration-300 ease-in-out ${openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gray-900 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            If you can't find the answer you are looking for, our team is ready to help.
          </p>
          <NavLink to="/contact" className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300">
            Contact Us
          </NavLink>
        </section>

      </div>
    </div>
  );
};

export default FAQ;
