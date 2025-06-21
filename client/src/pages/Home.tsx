import React from 'react';
import Hero from '@/components/Hero';
import FeaturedServices from '@/components/FeaturedServices';
import HowItWorks from '@/components/HowItWorks';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import TrendingPackageCard from '@/components/TrendingPackageCard';
import { Star, Clock, Award, Users, Sparkles, Calculator, Building2, Target, Zap, MapPin } from "lucide-react";
import { Link } from "wouter";
import clinicsDataImport from "@/data/clinics.json";
import { trendingPackages } from "@/data/packages";
import EnhancedOffersCarousel from '@/components/EnhancedOffersCarousel';
import { ArrowRight } from 'lucide-react';

// Comprehensive safe fallbacks for imported data with multiple checks
const ensureArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && data.length !== undefined) {
    return Array.from(data);
  }
  return [];
};

const clinicsData = ensureArray(clinicsDataImport);
const safePackages = ensureArray(trendingPackages);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Enhanced Offers Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-500 inline-block mr-2" />
              Special Offers This Month
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Limited-time packages combining premium dental care with luxury accommodations and exclusive perks
            </p>
          </div>
          <EnhancedOffersCarousel />
        </div>
      </section>

      {/* Trending Treatment Packages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <Zap className="h-8 w-8 text-blue-500 inline-block mr-2" />
              Most Popular Treatment Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete treatment packages with accommodation, transfers, and premium care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safePackages.map((pkg, index) => (
              <TrendingPackageCard key={pkg?.id || `package-${index}`} package={pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <FeaturedServices />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Top Clinics Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <Award className="h-8 w-8 text-green-500 inline-block mr-2" />
              Our Partner Clinics
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accredited dental clinics in Istanbul with international standards and English-speaking staff
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinicsData.slice(0, 3).map((clinic, index) => (
              <div key={clinic?.id || `clinic-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{clinic?.name || 'Clinic Name'}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    {typeof clinic?.location === 'object' 
                      ? `${clinic.location.city || ''}, ${clinic.location.area || ''}`
                      : clinic?.location || 'Location'}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Specializes in: {
                      Array.isArray(clinic?.specialties) && clinic.specialties.length > 0
                        ? clinic.specialties.slice(0, 2).join(", ")
                        : 'Various treatments'
                    }
                  </div>
                  <Link href="/your-quote" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    Get Quote
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/your-quote">
              <a className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                <Calculator className="h-5 w-5 mr-2" />
                View All Clinics & Get Quote
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;