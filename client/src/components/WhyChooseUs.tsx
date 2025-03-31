import React from "react";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: "vetted",
    icon: "fas fa-check-circle",
    title: "Curated, Vetted Providers Only",
    description: "We personally vet each clinic and doctor in our network, selecting only those with proven results, proper certifications, and consistent positive patient outcomes."
  },
  {
    id: "pricing",
    icon: "fas fa-euro-sign",
    title: "Transparent, All-Inclusive Pricing",
    description: "No hidden fees or surprise costs. Our quotes include all necessary treatments, consultations, and selected add-ons so you know exactly what to expect."
  },
  {
    id: "expertise",
    icon: "fas fa-user-md",
    title: "True Medical Expertise",
    description: "Our team includes healthcare professionals who understand your medical needs and can communicate effectively with providers on your behalf."
  },
  {
    id: "experience",
    icon: "fas fa-globe",
    title: "Full-Service Experience",
    description: "From airport pickup to translation services, hotel bookings, and cultural experiences—we handle all aspects of your medical journey."
  },
  {
    id: "support",
    icon: "fas fa-phone-alt",
    title: "Direct, Personal Support",
    description: "Your dedicated concierge is available throughout your treatment journey for questions, concerns, or assistance—before, during, and after your visit."
  },
  {
    id: "safety",
    icon: "fas fa-shield-alt",
    title: "Safety & Quality Assurance",
    description: "We prioritize your wellbeing by selecting only JCI-accredited or equivalent facilities that meet international standards for patient safety and care quality."
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-us" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Why Choose HealthMatch Istanbul</h2>
          <p className="text-neutral-600">What makes our concierge service different from the rest.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className={`${feature.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#testimonials" className="inline-block bg-transparent border-2 border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors">See What Our Clients Say</a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
