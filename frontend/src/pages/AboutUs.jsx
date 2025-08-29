import React from 'react';

const AboutUs = () => {
    return (
        <div className="bg-gray-50 py-16 px-4 md:px-8">
            <div className="container mx-auto max-w-7xl">
                
                {/* Hero Section */}
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">About GigConnect</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Your hyperlocal freelance marketplace, connecting communities with skilled local talent.
                    </p>
                </header>

                {/* Our Mission Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            At GigConnect, our mission is to empower local economies by creating a seamless platform that bridges the gap between clients and freelancers in their own neighborhoods. We believe that talent is everywhere, and by making it easier to find and hire skilled professionals nearby, we can foster stronger, more vibrant communities.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            We're here to help clients save time and find trusted local experts, while giving freelancers a powerful tool to showcase their skills, find meaningful work, and grow their careers right where they live.
                        </p>
                    </div>
                    <div className="order-1 md:order-2">
                        {/* Placeholder for an image or graphic */}
                        <div className="bg-gray-200 h-64 md:h-80 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 italic">Image Placeholder</p>
                        </div>
                    </div>
                </section>

                {/* What We Offer Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">What We Offer</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1: For Clients */}
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Clients</h3>
                            <p className="text-gray-600">
                                Easily find and hire local talent for any project. Post your gig, browse detailed freelancer profiles, and communicate directly with professionals in your area. Secure payments and reviews ensure a trustworthy experience.
                            </p>
                        </div>
                        {/* Card 2: For Freelancers */}
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Freelancers</h3>
                            <p className="text-gray-600">
                                Showcase your skills to a local audience. Create a comprehensive profile, browse and apply for gigs near you, and build your reputation within your community. Your next opportunity is just around the corner.
                            </p>
                        </div>
                        {/* Card 3: For the Community */}
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">For the Community</h3>
                            <p className="text-gray-600">
                                By using GigConnect, you're supporting local businesses and talent. Our platform strengthens the local economy, keeping money within the community and fostering a spirit of mutual support and growth.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="text-center py-12 bg-gray-900 rounded-lg text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to get connected?</h2>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                        Whether you're looking for a skilled professional or your next great opportunity, GigConnect is the place to start.
                    </p>
                    <a href="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300">
                        Join the Community
                    </a>
                </section>

            </div>
        </div>
    );
};

export default AboutUs;