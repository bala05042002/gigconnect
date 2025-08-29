import React from 'react';

const Careers = () => {
  // Dummy data for job openings
  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Full-Stack Engineer',
      location: 'Remote',
      description: 'Design and build scalable features for both our client and freelancer platforms. Must have strong experience with React, Node.js, and database management.',
    },
    {
      id: 2,
      title: 'Marketing Specialist',
      location: 'On-site, Thanjavur',
      description: 'Develop and execute marketing campaigns to grow our user base. Experience with hyperlocal marketing and social media strategy is a plus.',
    },
    {
      id: 3,
      title: 'Community Success Manager',
      location: 'Remote',
      description: 'Engage with our user community to provide support, gather feedback, and foster a positive environment for both clients and freelancers.',
    },
    {
      id: 4,
      title: 'Product Designer (UI/UX)',
      location: 'Remote',
      description: 'Create intuitive and beautiful user interfaces. You will be responsible for user research, wireframing, and creating high-fidelity prototypes.',
    },
  ];

  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us build the future of hyperlocal freelancing.
          </p>
        </header>

        {/* Culture & Mission Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Mission & Culture
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At GigConnect, we are passionate about empowering people to find meaningful work and build thriving local communities. We're a small, dynamic team that values collaboration, creativity, and a shared commitment to our mission.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We believe that every team member plays a crucial role in our success. We offer a flexible, supportive work environment where you can make a real impact.
              </p>
            </div>
            <div>
              {/* Image Placeholder */}
              <div className="bg-gray-200 h-64 md:h-80 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 italic">Placeholder for a team photo or illustration</p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Openings Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Current Openings
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{job.location}</p>
                <p className="text-gray-600 mb-4">{job.description}</p>
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gray-900 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            Can't find a role that fits?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            We are always looking for talented individuals. Feel free to send us your resume and tell us how you can help GigConnect grow.
          </p>
          <a href="/contact" className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300">
            Get in Touch
          </a>
        </section>

      </div>
    </div>
  );
};

export default Careers;