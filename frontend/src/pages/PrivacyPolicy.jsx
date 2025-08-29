import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white py-16 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">Last updated: July 20, 2025</p>
        </header>

        {/* Policy Content */}
        <section className="text-gray-700 leading-relaxed space-y-8">
          <p>
            At GigConnect, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile-responsive web application. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p>
              We collect information about you in a variety of ways. The information we may collect on the Application includes:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>
                <span className="font-semibold">Personal Data:</span> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register as a client or a freelancer.
              </li>
              <li>
                <span className="font-semibold">Financial Data:</span> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you post a gig or make a payment.
              </li>
              <li>
                <span className="font-semibold">Location Data:</span> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using the Application, to provide location-based services.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Create and manage your account.</li>
              <li>Process transactions and payments.</li>
              <li>Provide customer support.</li>
              <li>Enable communication between clients and freelancers.</li>
              <li>Send you updates about new services, promotions, and features.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclosure of Your Information</h2>
            <p>
              We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, and marketing assistance. Your information will not be sold or rented to third parties for their marketing purposes without your explicit consent.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@gigconnect.com" className="text-green-500 hover:underline">privacy@gigconnect.com</a>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
