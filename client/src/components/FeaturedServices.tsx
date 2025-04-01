import React from "react";
import istanbulImage from "@assets/image_1743447461115.png";
import veneersSvg from "../assets/dental-veneers.svg";
import implantsSvg from "../assets/dental-implants.svg";
import crownsSvg from "../assets/dental-crowns.svg";
import hollywoodSvg from "../assets/hollywood-smile.svg";
import orthodonticsSvg from "../assets/orthodontics.svg";
import packageSvg from "../assets/dental-package.svg";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  feature1: string;
  feature2: string;
}

// City image for packages
const cityImage = istanbulImage;

const services: Service[] = [
  {
    id: "veneers",
    title: "Dental Veneers",
    description: "Premium porcelain and composite veneers customized for natural-looking, beautiful smiles at a fraction of European prices.",
    image: veneersSvg,
    feature1: "Multiple Material Options",
    feature2: "60-70% Savings"
  },
  {
    id: "implants",
    title: "Dental Implants",
    description: "State-of-the-art dental implants using premium materials and advanced techniques for permanent tooth replacement.",
    image: implantsSvg,
    feature1: "Lifetime Warranty",
    feature2: "65-75% Savings"
  },
  {
    id: "crowns",
    title: "Dental Crowns & Bridges",
    description: "High-quality crowns and bridges made from premium materials for both functional restoration and aesthetic improvement.",
    image: crownsSvg,
    feature1: "Same-Day Options",
    feature2: "60-70% Savings"
  },
  {
    id: "hollywood",
    title: "Hollywood Smile",
    description: "Complete smile transformation combining veneers, whitening and other treatments for the perfect celebrity-style smile.",
    image: hollywoodSvg,
    feature1: "Custom Design",
    feature2: "70-80% Savings"
  },
  {
    id: "orthodontics",
    title: "Orthodontic Solutions",
    description: "Modern orthodontic treatments including clear aligners, ceramic braces, and innovative corrective procedures.",
    image: orthodonticsSvg,
    feature1: "Invisible Options",
    feature2: "50-65% Savings"
  },
  {
    id: "packages",
    title: "All-Inclusive Dental Packages",
    description: "Comprehensive packages including dental work, premium hotel accommodation, airport transfers, and sightseeing options.",
    image: packageSvg,
    feature1: "Full Support",
    feature2: "Bundle Savings"
  }
];

const FeaturedServices: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-sky-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">
            Premium Dental Treatments
          </h2>
          <div className="h-1 w-20 bg-primary-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-neutral-600">We specialize in connecting you with Istanbul's top-rated dental clinics for high-quality, affordable treatments.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-full h-52 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="bg-white/80 p-3 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 z-10 group-hover:scale-105">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-xl mb-3 text-primary-600 group-hover:text-primary-700 transition-colors">{service.title}</h3>
                <p className="text-neutral-600 mb-5 text-sm lg:text-base">{service.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {service.feature1}
                  </span>
                  <span className="flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.879A10 10 0 1110.999 8.505l8.5 8.5" />
                    </svg>
                    {service.feature2}
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
