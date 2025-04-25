import React from "react";
import BlogLayout from "@/components/BlogLayout";

const HowItWorksBlogPost: React.FC = () => {
  return (
    <BlogLayout
      hero={{
        title: "How MyDentalFly.com Works",
        subtitle: "Your complete guide to affordable, high-quality dental treatment in Istanbul with our full-service concierge experience.",
        coverImage: "/images/clinics/dentgroup.jpg",
        authorName: "MyDentalFly Team",
        publishDate: "April 24, 2025"
      }}
      relatedPosts={[
        {
          title: "The Complete Guide to Dental Implants",
          slug: "dental-implants",
          image: "/images/treatments/implants.jpg",
          excerpt: "Everything you need to know about dental implants, including types, procedures, costs, and what to expect during recovery."
        },
        {
          title: "Comparing Veneers and Crowns: Which is Right for You?",
          slug: "veneers",
          image: "/images/treatments/veneers.jpg",
          excerpt: "A comprehensive comparison of dental veneers and crowns to help you understand the benefits, limitations, and costs of each option."
        },
        {
          title: "The Hollywood Smile: Transform Your Appearance",
          slug: "hollywood-smile",
          image: "/images/treatments/hollywood.jpg",
          excerpt: "Learn about the Hollywood Smile procedure and how it combines multiple treatments to create that perfect celebrity smile."
        }
      ]}
    >
      <h2>Your Premium Dental Tourism Partner</h2>
      <p>
        MyDentalFly.com is the UK's leading price comparison and concierge service for dental treatments in Turkey. We combine transparent pricing, carefully vetted top-rated clinics, and comprehensive travel planning to provide you with a complete 5-star experience.
      </p>
      <p>
        While saving up to 70% on your dental costs compared to UK prices, you'll receive treatment of equal or better quality than you're accustomed to back home. Best of all, you'll know the price before you even get on the plane.
      </p>

      <h2>Our Simple 6-Step Process</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg my-8">
        <h3>Step 1: Get Your Free Quote</h3>
        <p>
          Use our online calculator to select your required treatments and instantly see pricing. Provide your contact details, and we'll send you a detailed quote.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg my-8">
        <h3>Step 2: Consultation & Planning</h3>
        <p>
          Our team will discuss your requirements and answer questions. If you have dental X-rays, our partner clinics will review them.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg my-8">
        <h3>Step 3: Secure Your Booking</h3>
        <p>
          Place a £200 deposit to secure your treatment dates. This deposit will be deducted from your final treatment cost when you arrive.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg my-8">
        <h3>Step 4: Travel Arrangements</h3>
        <p>
          We handle all your travel logistics — flights, 5-star hotel accommodation, private airport transfers, and clinic transportation.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg my-8">
        <h3>Step 5: Your 5-Star Experience</h3>
        <p>
          Enjoy your treatment at a top-rated Istanbul dental clinic. Between appointments, experience luxury hotel stays and optional extras.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg my-8">
        <h3>Step 6: Comprehensive Aftercare</h3>
        <p>
          Return home with your new smile and full aftercare guidance. We maintain contact to ensure your recovery goes smoothly.
        </p>
      </div>

      <h2>Why Choose MyDentalFly.com?</h2>

      <h3>Transparent Pricing</h3>
      <p>
        Know exactly what you'll pay before traveling. We ensure there are no hidden costs or surprise fees when you arrive. Save up to 70% compared to UK dental prices.
      </p>

      <h3>Vetted Top-Rated Clinics</h3>
      <p>
        We partner only with Istanbul's best dental clinics, ensuring state-of-the-art facilities, highly qualified professionals, and the highest standards of care.
      </p>

      <h3>Complete Concierge Experience</h3>
      <p>
        We handle everything: dental appointments, flights, 5-star accommodation, private transfers, and luxury add-ons. You just need to show up and smile!
      </p>

      <h3>Quality Guarantees</h3>
      <p>
        Our partner clinics provide treatment guarantees, ensuring your peace of mind. We facilitate any follow-up care or revisions needed after your return home.
      </p>

      <h3>Personalized Support</h3>
      <p>
        Our UK-based team provides full support before, during, and after your treatment. We're always available to answer questions and ensure your journey is smooth.
      </p>

      <div className="bg-blue-50 p-6 rounded-lg my-8 border border-blue-100">
        <h3>Ready to Transform Your Smile?</h3>
        <p>
          Start your journey to affordable, high-quality dental care with just a £200 deposit, fully deductible from your treatment cost.
        </p>
        <p>
          <a href="/#pricing" className="text-[#0071c2] font-bold hover:underline">Get Your Free Quote</a> or call us at <a href="tel:+447572445856" className="text-[#0071c2] font-bold hover:underline">+44 7572 445856</a>
        </p>
      </div>
    </BlogLayout>
  );
};

export default HowItWorksBlogPost;