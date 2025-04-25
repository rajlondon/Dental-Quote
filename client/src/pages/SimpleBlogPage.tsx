import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SimpleBlogPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#003b95] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Dental Tourism Blog</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Expert advice and information about dental treatments abroad
            </p>
          </div>
        </section>
        
        {/* Blog Content */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-primary">Featured Articles</h2>
              
              <div className="space-y-8">
                {/* Blog Post 1 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">
                      <a href="/blog/how-it-works" className="text-primary hover:text-primary/80">
                        How MyDentalFly.com Works
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your complete guide to affordable, high-quality dental treatment in Istanbul with our full-service concierge experience.
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>MyDentalFly Team</span>
                      <span>April 24, 2025</span>
                    </div>
                  </div>
                </div>
                
                {/* Blog Post 2 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">
                      <a href="/dental-implants" className="text-primary hover:text-primary/80">
                        The Complete Guide to Dental Implants
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Everything you need to know about dental implants, including types, procedures, costs, and what to expect during recovery.
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Dr. Sarah Johnson</span>
                      <span>April 20, 2025</span>
                    </div>
                  </div>
                </div>
                
                {/* Blog Post 3 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">
                      <a href="/veneers" className="text-primary hover:text-primary/80">
                        Comparing Veneers and Crowns: Which is Right for You?
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      A comprehensive comparison of dental veneers and crowns to help you understand the benefits, limitations, and costs of each option.
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Dr. Michael Chen</span>
                      <span>April 18, 2025</span>
                    </div>
                  </div>
                </div>
                
                {/* Blog Post 4 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">
                      <a href="/hollywood-smile" className="text-primary hover:text-primary/80">
                        The Hollywood Smile: Transform Your Appearance
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Learn about the Hollywood Smile procedure and how it combines multiple treatments to create that perfect celebrity smile.
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Dr. Emily Taylor</span>
                      <span>April 15, 2025</span>
                    </div>
                  </div>
                </div>
                
                {/* Blog Post 5 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">
                      <a href="/full-mouth" className="text-primary hover:text-primary/80">
                        Full Mouth Reconstruction: A New Beginning
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Discover how full mouth reconstruction can address multiple dental issues and completely restore your oral health and appearance.
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Dr. James Wilson</span>
                      <span>April 10, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-blue-50 rounded-lg p-8 border border-blue-100 text-center">
              <h2 className="text-2xl font-bold mb-4 text-primary">Ready to Start Your Dental Journey?</h2>
              <p className="text-gray-700 mb-6">
                Get your personalized quote today and save up to 70% on high-quality dental treatment in Istanbul.
              </p>
              <a href="/your-quote" className="inline-block bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-3 px-6 rounded-lg">
                Get Your Free Quote
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SimpleBlogPage;