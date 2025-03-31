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
    id: "dental",
    title: "Dental Work",
    description: "Premium dental procedures including veneers, crowns, implants, and full smile makeovers at a fraction of European prices.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80",
    feature1: "Certified Specialists",
    feature2: "60-70% Savings"
  },
  {
    id: "cosmetic",
    title: "Cosmetic Treatments",
    description: "Advanced aesthetic procedures including botox, fillers, facial treatments, and non-surgical rejuvenation therapies.",
    image: "https://images.unsplash.com/photo-1595784279873-62b38b5e7cd6?auto=format&fit=crop&w=600&q=80",
    feature1: "Board-Certified",
    feature2: "50-60% Savings"
  },
  {
    id: "hair",
    title: "Hair Transplants",
    description: "State-of-the-art FUE and DHI hair restoration techniques performed by specialized teams with high success rates.",
    image: "https://images.unsplash.com/photo-1516549655023-a1779cb75c7d?auto=format&fit=crop&w=600&q=80",
    feature1: "Latest Techniques",
    feature2: "65-75% Savings"
  },
  {
    id: "eye",
    title: "Laser Eye Surgery",
    description: "Advanced LASIK, SMILE, and PRK procedures performed with cutting-edge technology by experienced ophthalmologists.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    feature1: "Modern Equipment",
    feature2: "55-65% Savings"
  },
  {
    id: "wellness",
    title: "Wellness & Anti-aging",
    description: "Holistic treatments including IV therapy, hormone optimization, PRP, and regenerative medicine therapies.",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=600&q=80",
    feature1: "Holistic Approach",
    feature2: "50-60% Savings"
  },
  {
    id: "packages",
    title: "All-Inclusive Packages",
    description: "Customized packages including hotel accommodation, airport transfers, translation services, and local experiences.",
    image: "https://images.unsplash.com/photo-1554189097-ffe88e998a2b?auto=format&fit=crop&w=600&q=80",
    feature1: "Full Support",
    feature2: "Bundle Savings"
  }
];

const FeaturedServices: React.FC = () => {
  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Health & Cosmetic Services</h2>
          <p className="text-neutral-600">We specialize in connecting you with Istanbul's top-rated clinics for a range of premium treatments.</p>
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
