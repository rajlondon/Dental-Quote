import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedServices from "@/components/FeaturedServices";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import PriceCalculator from "@/components/PriceCalculator";

// Main entry point for the website
export default function Index() {
  // Set page title
  useEffect(() => {
    document.title = "Istanbul Dental Smile - Your Trusted Dental Treatment Concierge";
  }, []);
  
  return (
    <>
      <Navbar />
      <Hero />
      <PriceCalculator />
      <FeaturedServices />
      <HowItWorks />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  );
}