import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import HeroSimple from "@/components/HeroSimple";
import Footer from "@/components/Footer";
import SimpleBlogPage from "@/pages/SimpleBlogPage";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, Clock, Award, Users, Sparkles, Calculator, Building2, Target, Columns, Gem, Zap, Stethoscope, HeartPulse, MapPin } from "lucide-react";
import { Link } from "wouter";
import clinicsData from "@/data/clinics.json";
import TrendingPackageCard from "@/components/TrendingPackageCard";
import { trendingPackages } from "@/data/packages";
import EnhancedOffersCarousel from "@/components/EnhancedOffersCarousel";

// Clinic Card Component
const ClinicCard = ({ 
  id,
  name, 
  image, 
  rating, 
  reviewCount, 
  location, 
  category,
  featured = false
}: { 
  id?: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
  featured?: boolean;
}) => {
  // Create a dynamic stylized placeholder based on clinic name and category
  const getStylizedClinic = () => {
    if (name.includes("DentGroup") || name.includes("Premium")) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative border border-blue-200">
          <div className="absolute inset-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-8 rounded-full bg-blue-500/10 border-8 border-blue-200/50"></div>
                <Target className="absolute inset-0 m-auto h-14 w-14 text-blue-500" />
                <Sparkles className="absolute top-2 right-2 h-6 w-6 text-blue-500/70" />
              </div>
            </div>
            <div className="absolute bottom-4 w-full text-center">
              <span className="text-sm font-bold text-blue-700 bg-white/80 px-3 py-1 rounded-full">{name}</span>
              <div className="text-xs text-blue-500 mt-1 font-medium">Premium Dental Services</div>
            </div>
          </div>
        </div>
      );
    } else if (name.includes("Maltepe") || name.includes("Luxury")) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center relative border border-purple-200">
          <div className="absolute inset-0">
            <div className="grid grid-cols-2 h-full">
              <div className="bg-gradient-to-br from-indigo-100/50 to-indigo-200/30 flex items-center justify-center">
                <Stethoscope className="h-12 w-12 text-indigo-500" />
              </div>
              <div className="bg-gradient-to-tl from-purple-100/50 to-purple-200/30 flex items-center justify-center">
                <HeartPulse className="h-12 w-12 text-purple-500" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 rounded-full p-2">
                <Award className="h-12 w-12 text-indigo-600" />
              </div>
            </div>
            <div className="absolute bottom-4 w-full text-center">
              <span className="text-sm font-bold text-indigo-800 bg-white/80 px-3 py-1 rounded-full">{name}</span>
              <div className="text-xs text-indigo-600 mt-1 font-medium">Luxury Dental Experience</div>
            </div>
          </div>
        </div>
      );
    } else if (name.includes("Affordable") || name.includes("Istanbul Dental Care")) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative border border-green-200">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Columns className="h-16 w-16 text-green-500" />
              <Zap className="absolute top-2 right-2 h-6 w-6 text-green-600" />
            </div>
            <div className="absolute bottom-4 w-full text-center">
              <span className="text-sm font-bold text-green-700 bg-white/80 px-3 py-1 rounded-full">{name}</span>
              <div className="text-xs text-green-600 mt-1 font-medium">Affordable Dental Care</div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center relative border border-amber-200">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-4 rounded-full bg-amber-500/10 animate-pulse"></div>
                <Award className="absolute inset-0 m-auto h-16 w-16 text-amber-600" />
                <Sparkles className="absolute top-3 right-3 h-6 w-6 text-amber-500" />
                <Gem className="absolute bottom-6 left-6 h-8 w-8 text-amber-600/70" />
              </div>
            </div>
            <div className="absolute bottom-4 w-full text-center">
              <span className="text-sm font-bold text-amber-800 bg-white/80 px-3 py-1 rounded-full">{name}</span>
              <div className="text-xs text-amber-600 mt-1 font-medium">Quality Dental Care</div>
            </div>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'ring-2 ring-primary' : ''}`}>
      <div className="relative">
        {image ? (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={image} 
              alt={`${name} dental clinic`} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ) : (
          getStylizedClinic()
        )}
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
        
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/clinic/${id || name.toLowerCase().replace(/\s+/g, '-')}`} className="w-full">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
              View Clinic
            </Button>
          </Link>
          <Link href="/your-quote" className="w-full">
            <Button className="w-full">
              Get a Quote
            </Button>
          </Link>
        </div>
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
          <Button asChild className="bg-white hover:bg-gray-50 text-primary border-2 border-primary/30 hover:border-primary/50 font-medium px-6">
            <Link href="/how-it-works">
              Learn More About Our Process
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  // Transform clinic data for the clinic cards
  const formattedClinics = clinicsData.map(clinic => {
    let category;
    switch(clinic.tier) {
      case 'premium':
        category = 'Luxury Experience';
        break;
      case 'standard':
        category = 'Premium Clinic';
        break;
      case 'affordable':
        category = 'Affordable Care';
        break;
      default:
        category = 'Quality Dental Care';
    }
    
    // Assign real clinic images
    let imagePath = "";
    if (clinic.id === "dentgroup-istanbul") {
      imagePath = "/images/clinics/dentalesk-clinic.png"; // DENTALESK
    } else if (clinic.id === "istanbul-dental-care") {
      imagePath = "/images/clinics/kstada-clinic.png"; // KSTADA
    } else if (clinic.id === "maltepe-dental-clinic") {
      imagePath = "/images/clinics/dentalclinic-clinic.png"; // DENTALCLINIC
    } else if (clinic.id === "dentakay-istanbul") {
      imagePath = "/images/clinics/dentid-clinic.png"; // DENTID
    }
    
    return {
      id: clinic.id,
      name: clinic.name,
      image: imagePath,
      rating: clinic.ratings.overall,
      reviewCount: clinic.ratings.reviews,
      location: `${clinic.location.area}, ${clinic.location.city}`,
      category: category,
      featured: clinic.tier === 'premium',
      tier: clinic.tier
    };
  });
  
  // Filter clinics for different sections
  const popularClinics = formattedClinics;
  
  // Trending clinics - for demo we'll mark premium and clinics with high ratings as trending
  const trendingClinics = formattedClinics
    .filter(clinic => clinic.tier === 'premium' || clinic.rating >= 4.7)
    .map(clinic => ({
      ...clinic,
      category: clinic.category + ' (Trending)'
    }))
    .slice(0, 3); // Show 3 trending clinics
  
  // Set page title
  useEffect(() => {
    document.title = "MyDentalFly - Compare Dental Clinics. Book With Confidence. Fly With a Smile.";
  }, []);
  
  return (
    <>
      <Navbar />
      <HeroSimple />
      
      {/* Premium Offers Carousel */}
      <EnhancedOffersCarousel className="px-4" />
      
      {/* Popular Clinics Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Clinics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularClinics.map((clinic, index) => (
              <ClinicCard 
                key={index}
                id={clinic.id}
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
      
      {/* Trending Packages Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Packages</h2>
            <div className="ml-3 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
              Health Vacation Experience
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 max-w-3xl">
              Experience the ultimate health vacation with our all-inclusive packages. Combine top-quality dental treatments with luxurious accommodations, convenient transfers, and exciting Istanbul excursions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPackages.map((pkg, index) => (
              <TrendingPackageCard 
                key={index}
                package={pkg}
              />
            ))}
            
            {/* Action card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="mx-auto mb-4 bg-white/80 p-3 rounded-full inline-flex">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Design Your Own Package</h3>
                  <p className="text-sm text-gray-600">Create a custom health vacation experience</p>
                </div>
              </div>
              <div className="p-4">
                <Button asChild className="w-full bg-white hover:bg-gray-50 text-primary border-2 border-primary/30 hover:border-primary/50 font-medium">
                  <Link href="/your-quote">
                    Build Custom Package
                  </Link>
                </Button>
              </div>
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

export default HomePage;
