import React from "react";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  feature1: string;
  feature2: string;
}

const services: Service[] = [
  {
    id: "veneers",
    title: "Dental Veneers",
    description: "Premium porcelain and composite veneers customized for natural-looking, beautiful smiles at a fraction of European prices.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80",
    feature1: "Multiple Material Options",
    feature2: "60-70% Savings"
  },
  {
    id: "implants",
    title: "Dental Implants",
    description: "State-of-the-art dental implants using premium materials and advanced techniques for permanent tooth replacement.",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80",
    feature1: "Lifetime Warranty",
    feature2: "65-75% Savings"
  },
  {
    id: "crowns",
    title: "Dental Crowns & Bridges",
    description: "High-quality crowns and bridges made from premium materials for both functional restoration and aesthetic improvement.",
    image: "https://images.unsplash.com/photo-1579033385971-a7bc8c5f4886?auto=format&fit=crop&w=600&q=80",
    feature1: "Same-Day Options",
    feature2: "60-70% Savings"
  },
  {
    id: "hollywood",
    title: "Hollywood Smile",
    description: "Complete smile transformation combining veneers, whitening and other treatments for the perfect celebrity-style smile.",
    image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=600&q=80",
    feature1: "Custom Design",
    feature2: "70-80% Savings"
  },
  {
    id: "orthodontics",
    title: "Orthodontic Solutions",
    description: "Modern orthodontic treatments including clear aligners, ceramic braces, and innovative corrective procedures.",
    image: "https://images.unsplash.com/photo-1608212951338-c0f321c9af9a?auto=format&fit=crop&w=600&q=80",
    feature1: "Invisible Options",
    feature2: "50-65% Savings"
  },
  {
    id: "packages",
    title: "All-Inclusive Dental Packages",
    description: "Comprehensive packages including dental work, premium hotel accommodation, airport transfers, and sightseeing options.",
    image: "https://images.unsplash.com/photo-1596483726032-a751679f107d?auto=format&fit=crop&w=600&q=80",
    feature1: "Full Support",
    feature2: "Bundle Savings"
  }
];

const FeaturedServices: React.FC = () => {
  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Premium Dental Services</h2>
          <p className="text-neutral-600">We specialize in connecting you with Istanbul's top-rated dental clinics for high-quality, affordable treatments.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-display font-semibold text-xl mb-2 text-primary">{service.title}</h3>
                <p className="text-neutral-600 mb-4">{service.description}</p>
                <div className="flex items-center text-sm text-neutral-500">
                  <span className="flex items-center mr-4">
                    <i className="fas fa-check-circle text-secondary mr-2"></i> {service.feature1}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-euro-sign text-secondary mr-2"></i> {service.feature2}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
