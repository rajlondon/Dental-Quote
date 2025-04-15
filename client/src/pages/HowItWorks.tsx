import React from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">How MyDentalFly.com Works</h1>
            <p className="text-xl max-w-3xl mx-auto text-center">
              Your complete guide to affordable, high-quality dental treatment in Istanbul with our full-service concierge experience.
            </p>
          </div>
        </section>
        
        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-primary">Your Premium Dental Tourism Partner</h2>
              <p className="text-lg text-neutral-700 mb-6">
                MyDentalFly.com is the UK's leading price comparison and concierge service for dental treatments in Turkey. We combine transparent pricing, carefully vetted top-rated clinics, and comprehensive travel planning to provide you with a complete 5-star experience.
              </p>
              <p className="text-lg text-neutral-700 mb-6">
                While saving up to 70% on your dental costs compared to UK prices, you'll receive treatment of equal or better quality than you're accustomed to back home. Best of all, you'll know the price before you even get on the plane.
              </p>
            </div>
          </div>
        </section>
        
        {/* Process Steps */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">Our Simple 6-Step Process</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">1</div>
                <h3 className="text-xl font-bold mt-4 mb-4 text-primary">Get Your Free Quote</h3>
                <p className="text-neutral-700">
                  Use our online calculator to select your required treatments and instantly see pricing. Provide your contact details, and we'll send you a detailed quote.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">2</div>
                <h3 className="text-xl font-bold mt-4 mb-4 text-primary">Consultation & Planning</h3>
                <p className="text-neutral-700">
                  Our team will discuss your requirements and answer questions. If you have dental X-rays, our partner clinics will review them.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">3</div>
                <h3 className="text-xl font-bold mt-4 mb-4 text-primary">Secure Your Booking</h3>
                <p className="text-neutral-700">
                  Place a £200 deposit to secure your treatment dates. This deposit will be deducted from your final treatment cost when you arrive.
                </p>
              </div>
              
              {/* Step 4 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">4</div>
                <h3 className="text-xl font-bold mt-4 mb-4 text-primary">Travel Arrangements</h3>
                <p className="text-neutral-700">
                  We handle all your travel logistics — flights, 5-star hotel accommodation, private airport transfers, and clinic transportation.
                </p>
              </div>
              
              {/* Step 5 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">5</div>
                <h3 className="text-xl font-bold mt-4 mb-4 text-primary">Your 5-Star Experience</h3>
                <p className="text-neutral-700">
                  Enjoy your treatment at a top-rated Istanbul dental clinic. Between appointments, experience luxury hotel stays and optional extras.
                </p>
              </div>
              
              {/* Step 6 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">6</div>
                <h3 className="text-xl font-bold mt-4 mb-4 text-primary">Comprehensive Aftercare</h3>
                <p className="text-neutral-700">
                  Return home with your new smile and full aftercare guidance. We maintain contact to ensure your recovery goes smoothly.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-primary">Why Choose MyDentalFly.com?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-800">Transparent Pricing</h3>
                    <p className="text-neutral-700">
                      Know exactly what you'll pay before traveling. We ensure there are no hidden costs or surprise fees when you arrive. Save up to 70% compared to UK dental prices.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-800">Vetted Top-Rated Clinics</h3>
                    <p className="text-neutral-700">
                      We partner only with Istanbul's best dental clinics, ensuring state-of-the-art facilities, highly qualified professionals, and the highest standards of care.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-800">Complete Concierge Experience</h3>
                    <p className="text-neutral-700">
                      We handle everything: dental appointments, flights, 5-star accommodation, private transfers, and luxury add-ons. You just need to show up and smile!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-800">Quality Guarantees</h3>
                    <p className="text-neutral-700">
                      Our partner clinics provide treatment guarantees, ensuring your peace of mind. We facilitate any follow-up care or revisions needed after your return home.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-800">Personalized Support</h3>
                    <p className="text-neutral-700">
                      Our UK-based team provides full support before, during, and after your treatment. We're always available to answer questions and ensure your journey is smooth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Smile?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Start your journey to affordable, high-quality dental care with just a £200 deposit, fully deductible from your treatment cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/#pricing" className="bg-white text-primary hover:bg-neutral-100 px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg">
                Get Your Free Quote
              </a>
              <a href="tel:+447572445856" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-medium text-lg transition-colors">
                Call Us: +44 7572 445856
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;