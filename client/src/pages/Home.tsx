import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, Clock, Award, Users, Sparkles, Calculator } from "lucide-react";
import { Link } from "wouter";

// Clinic Card Component
const ClinicCard = ({ 
  name, 
  image, 
  rating, 
  reviewCount, 
  location, 
  category,
  featured = false
}: { 
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
  featured?: boolean;
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'ring-2 ring-primary' : ''}`}>
      <div className="relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-48 object-cover" 
        />
        {featured && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Promoted
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg">{name}</h3>
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="ml-1 font-semibold">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Users className="w-3.5 h-3.5 mr-1" />
          <span>{reviewCount} reviews</span>
          <span className="mx-2">•</span>
          <span>{location}</span>
        </div>
        
        <div className="flex items-center text-xs font-medium text-primary mb-4">
          <span className="inline-block px-2 py-1 bg-primary/10 rounded">
            {category}
          </span>
        </div>
        
        <Link href={`/clinic/${name.toLowerCase().replace(/\s+/g, '-')}`}>
          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
            View Clinic
          </Button>
        </Link>
      </div>
    </div>
  );
};

// How It Works Section Component
const HowItWorksSection = () => {
  const steps = [
    { 
      icon: <Calculator className="w-8 h-8 text-primary" />, 
      title: "Get Your Quote", 
      description: "Compare treatment options and prices from verified clinics" 
    },
    { 
      icon: <Clock className="w-8 h-8 text-primary" />, 
      title: "Choose a Clinic", 
      description: "Select your preferred clinic based on reviews, prices and location" 
    },
    { 
      icon: <Award className="w-8 h-8 text-primary" />, 
      title: "Pay £200 Deposit", 
      description: "Secure your treatment plan with a £200 refundable deposit" 
    },
    { 
      icon: <Users className="w-8 h-8 text-primary" />, 
      title: "Access Patient Portal", 
      description: "Manage your booking, upload medical records and plan your trip" 
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-full shadow-md mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/how-it-works">
              Learn More About Our Process
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  // Sample clinic data - in production this would come from your database
  const popularClinics = [
    { 
      name: "DentGroup Istanbul", 
      image: "/images/clinics/dentgroup.jpg", 
      rating: 4.8, 
      reviewCount: 245, 
      location: "Istanbul, Turkey", 
      category: "Premium Clinic" 
    },
    { 
      name: "Istanbul Dental Care", 
      image: "/images/clinics/istanbul-dental.jpg", 
      rating: 4.5, 
      reviewCount: 178, 
      location: "Istanbul, Turkey", 
      category: "Affordable Care" 
    },
    { 
      name: "Maltepe Dental Clinic", 
      image: "/images/clinics/maltepe.jpg", 
      rating: 4.9, 
      reviewCount: 320, 
      location: "Istanbul, Turkey", 
      category: "Luxury Experience",
      featured: true
    },
    { 
      name: "Dentakay Istanbul", 
      image: "/images/clinics/dentakay.jpg", 
      rating: 4.7, 
      reviewCount: 210, 
      location: "Istanbul, Turkey", 
      category: "All-Inclusive" 
    }
  ];
  
  const newClinics = [
    { 
      name: "Crown Dental Istanbul", 
      image: "/images/clinics/crown.jpg", 
      rating: 4.6, 
      reviewCount: 42, 
      location: "Istanbul, Turkey", 
      category: "New Facility" 
    },
    { 
      name: "Dental Excellence Turkey", 
      image: "/images/clinics/excellence.jpg", 
      rating: 4.7, 
      reviewCount: 35, 
      location: "Istanbul, Turkey", 
      category: "Technology Focus" 
    }
  ];
  
  // Set page title
  useEffect(() => {
    document.title = "MyDentalFly - Compare Dental Treatment Options in Turkey";
  }, []);
  
  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Popular Clinics Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Clinics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularClinics.map((clinic, index) => (
              <ClinicCard 
                key={index}
                name={clinic.name} 
                image={clinic.image}
                rating={clinic.rating}
                reviewCount={clinic.reviewCount}
                location={clinic.location}
                category={clinic.category}
                featured={clinic.featured}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* New Clinics Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">New Clinics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newClinics.map((clinic, index) => (
              <ClinicCard 
                key={index}
                name={clinic.name} 
                image={clinic.image}
                rating={clinic.rating}
                reviewCount={clinic.reviewCount}
                location={clinic.location}
                category={clinic.category}
              />
            ))}
            
            {/* Empty slots for "View All" */}
            <div className="flex items-center justify-center bg-white rounded-lg shadow-md p-6 border border-dashed border-gray-300 h-full">
              <Link href="/clinics">
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  View All Clinics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      <Footer />
    </>
  );
};

export default Home;
