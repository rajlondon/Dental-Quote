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
    title: "Submit Your Request",
    description: "Fill out our simple form with your treatment needs, budget, preferred dates, and any relevant health information.",
    features: [
      "No obligation quote",
      "Secure and confidential",
      "Response within 24 hours"
    ]
  },
  {
    number: 2,
    title: "Review Personalized Options",
    description: "We'll present you with 3 custom-matched clinics and providers that meet your specific requirements.",
    features: [
      "Vetted, quality providers only",
      "Clear, all-inclusive pricing",
      "Detailed clinic profiles & reviews"
    ]
  },
  {
    number: 3,
    title: "Enjoy Full-Service Support",
    description: "We handle all the details while you focus on your treatment and recovery.",
    features: [
      "Treatment coordination",
      "Travel & accommodation assistance",
      "On-ground support during your stay"
    ]
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">How It Works</h2>
          <p className="text-neutral-600">Our concierge service simplifies the entire process from consultation to recovery, with transparent pricing and personalized support.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-8 shadow-md relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xl">
                {step.number}
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-primary pt-2">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
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
          <a href="#quote-form" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-primary-dark transition-colors">Get Started Today</a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
