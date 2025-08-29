import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-sm text-gray-500">Effective: July 20, 2025</p>
        </header>

        {/* Terms Content */}
        <section className="text-gray-700 leading-relaxed space-y-8">
          <p>
            Welcome to GigConnect. These Terms and Conditions govern your use of our hyperlocal freelance marketplace web application. By accessing or using the application, you agree to be bound by these terms.
          </p>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using our service, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services and Use of the Application</h2>
            <p>
              GigConnect provides a platform for clients to post job listings (gigs) and for freelancers to create profiles, browse gigs, and apply for opportunities. The application is a marketplace facilitator and is not a party to the direct contracts between clients and freelancers.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>
                <span className="font-semibold">Client Responsibilities:</span> You are responsible for the accuracy of your gig postings and for vetting freelancers.
              </li>
              <li>
                <span className="font-semibold">Freelancer Responsibilities:</span> You are responsible for the accuracy of your profile and for the quality of services you provide.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
            <p>
              You agree not to use the application in any way that is illegal, fraudulent, or harmful. This includes, but is not limited to, posting false information, engaging in spam, or infringing on the intellectual property rights of others.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payments and Fees</h2>
            <p>
              GigConnect may charge a service fee to clients and/or freelancers for using the platform. All payments are processed securely through our third-party payment provider, and you agree to their terms of service.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p>
              GigConnect is provided "as is." We do not guarantee that the application will be uninterrupted, error-free, or free of viruses. In no event shall GigConnect be liable for any damages arising from your use of the application.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TermsAndConditions;
