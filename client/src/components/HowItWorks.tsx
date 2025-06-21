
import React from "react";

interface Step {
  number: number;
  title: string;
  description: string;
  features: string[];
}

const steps: Step[] = [
  {
    number: 1,
    title: "Get Your Quote",
    description: "Fill out our simple form to get personalized quotes from top Turkish dental clinics",
    features: [
      "Free consultation",
      "Multiple clinic options",
      "Transparent pricing"
    ]
  },
  {
    number: 2,
    title: "Choose Your Clinic",
    description: "Compare clinics and select the one that best fits your needs and budget",
    features: [
      "Verified clinics",
      "Real patient reviews",
      "Quality guarantees"
    ]
  },
  {
    number: 3,
    title: "Plan Your Trip",
    description: "We help arrange your travel, accommodation, and treatment schedule",
    features: [
      "Flight booking",
      "Hotel reservations",
      "Airport transfers"
    ]
  },
  {
    number: 4,
    title: "Get Treatment",
    description: "Receive world-class dental care while enjoying your stay in Turkey",
    features: [
      "Expert treatment",
      "Modern facilities",
      "Full support"
    ]
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Simple steps to get your dental treatment in Turkey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-8 shadow-md relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xl">
                {step.number}
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-primary pt-2">
                {step.title}
              </h3>
              <p className="text-neutral-600">
                {step.description}
              </p>
              <ul className="mt-4 space-y-2 text-neutral-600">
                {step.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="#quote-form" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-primary-dark transition-colors">
            Get Your Quote
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
