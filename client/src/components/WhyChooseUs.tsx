import React from "react";
import { Shield, Award, Users, HeartHandshake, Clock, Star } from "lucide-react";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: "quality",
    icon: "fas fa-check-circle",
    title: "Premium Quality",
    description: "State-of-the-art facilities and internationally trained dentists ensure the highest quality treatment."
  },
  {
    id: "savings",
    icon: "fas fa-euro-sign",
    title: "Significant Savings",
    description: "Save up to 70% on dental treatments compared to UK prices without compromising on quality."
  },
  {
    id: "support",
    icon: "fas fa-comments",
    title: "24/7 Support",
    description: "Our dedicated team provides round-the-clock support throughout your entire dental journey."
  },
  {
    id: "convenience",
    icon: "fas fa-concierge-bell",
    title: "All-Inclusive Service",
    description: "We handle everything from treatment planning to accommodation and travel arrangements."
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-us" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Trusted by thousands for quality dental care in Turkey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className={`${feature.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800">
                {feature.title}
              </h3>
              <p className="text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="#testimonials" className="inline-block bg-transparent border-2 border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors">
            Read Testimonials
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;