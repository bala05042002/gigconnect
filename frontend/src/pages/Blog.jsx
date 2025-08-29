import React from 'react';

const Blog = () => {
  // Dummy data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: 'The Rise of Hyperlocal Freelancing',
      date: 'July 15, 2025',
      author: 'Jane Doe',
      summary: 'Explore how platforms like GigConnect are changing the way people work and hire, fostering stronger economies within local communities.',
    },
    {
      id: 2,
      title: '5 Tips for Freelancers to Stand Out on GigConnect',
      date: 'June 28, 2025',
      author: 'John Smith',
      summary: 'Learn how to optimize your profile, showcase your best work, and build a great reputation to attract more clients on our platform.',
    },
    {
      id: 3,
      title: 'How to Find the Perfect Freelancer for Your Project',
      date: 'July 2, 2025',
      author: 'GigConnect Team',
      summary: 'A step-by-step guide for clients on how to post a gig, filter talent, and communicate effectively to ensure a successful project outcome.',
    },
    {
      id: 4,
      title: 'Building Your Brand as a Local Professional',
      date: 'May 10, 2025',
      author: 'Alex Chen',
      summary: 'Discover key strategies for marketing yourself in your local community and turning your skills into a profitable freelance career.',
    },
    {
      id: 5,
      title: 'GigConnect’s Commitment to Local Communities',
      date: 'April 22, 2025',
      author: 'GigConnect Team',
      summary: 'Read about our vision to support small businesses and independent contractors, and how we are investing in local talent.',
    },
    {
      id: 6,
      title: 'Spotlight: From Hobbyist to Full-Time Freelancer',
      date: 'March 5, 2025',
      author: 'Maria Garcia',
      summary: 'An inspiring story of one of our top freelancers who turned their passion into a thriving career using GigConnect.',
    },
  ];

  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thoughts, insights, and stories from the GigConnect community.
          </p>
        </header>

        {/* Blog Posts Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500 mb-3">By {post.author} on {post.date}</p>
                <p className="text-gray-600 mb-4">{post.summary}</p>
                <a href={`/blog/${post.id}`} className="text-green-500 font-semibold hover:text-green-600 transition-colors duration-300">
                  Read More &rarr;
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-gray-900 rounded-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            Have a story to share?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            We'd love to feature your journey. Get in touch with our team to submit your article.
          </p>
          <a href="/contact" className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors duration-300">
            Submit Your Story
          </a>
        </section>

      </div>
    </div>
  );
};

export default Blog;