import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { 
  Plane as PlaneIcon, 
  ArrowRight as ArrowRightIcon, 
  Check, 
  Clock, 
  PoundSterling,
  MapPin,
  Calendar,
  HeartPulse,
  Shield,
  BriefcaseMedical
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Create a clean, streamlined quote form
const QuoteForm: React.FC = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState<string>("");
  const [treatmentType, setTreatmentType] = useState<string>("");
  const [travelMonth, setTravelMonth] = useState<string>("");
  const [userOrigin, setUserOrigin] = useState<string>("uk");
  
  // Cities/Destinations
  const cities = [
    { value: "istanbul", label: "Istanbul" },
    { value: "antalya", label: "Antalya (Coming Soon)", disabled: true },
  ];
  
  // Treatment types - these will be populated from your database in production
  const treatmentTypes = [
    { value: "dental-implants", label: "Dental Implants" },
    { value: "veneers", label: "Veneers & Crowns" },
    { value: "whitening", label: "Teeth Whitening" },
    { value: "full-mouth", label: "Full Mouth Reconstruction" },
    { value: "implant-supported", label: "Implant Supported Dentures" },
    { value: "hollywood-smile", label: "Hollywood Smile" },
    { value: "general", label: "General Dentistry" }
  ];
  
  // Travel months
  const months = [
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" },
    { value: "flexible", label: "Flexible" },
  ];
  
  // Origin countries
  const origins = [
    { value: "uk", label: "United Kingdom" },
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "eu", label: "Europe" },
    { value: "au", label: "Australia" },
    { value: "other", label: "Other" }
  ];
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to quote results page with query parameters
    window.location.href = `/your-quote?city=${city}&treatment=${treatmentType}&travelMonth=${travelMonth}&origin=${userOrigin}`;
  };
  
  return (
    <div className="relative max-w-[1000px] mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Clean horizontal search bar */}
        <div className="flex flex-col md:flex-row md:items-stretch md:h-14 rounded-lg overflow-hidden shadow-lg">
          {/* City/Destination */}
          <div className="flex-1 flex items-center bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <div className="w-full h-full relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">
                <MapPin className="h-5 w-5" />
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger 
                  id="destination-city" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="Istanbul" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((cityOption) => (
                    <SelectItem 
                      key={cityOption.value} 
                      value={cityOption.value}
                      disabled={cityOption.disabled}
                    >
                      {cityOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Treatment Type */}
          <div className="flex-1 flex items-center bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <div className="w-full h-full relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">
                <BriefcaseMedical className="h-5 w-5" />
              </div>
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger 
                  id="treatment-type" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="Implants" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Travel Month */}
          <div className="flex-1 flex items-center bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <div className="w-full h-full relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">
                <Calendar className="h-5 w-5" />
              </div>
              <Select value={travelMonth} onValueChange={setTravelMonth}>
                <SelectTrigger 
                  id="travel-month" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="July" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem 
                      key={month.value} 
                      value={month.value}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Origin Country */}
          <div className="flex-1 flex items-center bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <div className="w-full h-full relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">
                <PlaneIcon className="h-5 w-5" />
              </div>
              <Select value={userOrigin} onValueChange={setUserOrigin}>
                <SelectTrigger 
                  id="user-origin" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="UK" />
                </SelectTrigger>
                <SelectContent>
                  {origins.map((origin) => (
                    <SelectItem 
                      key={origin.value} 
                      value={origin.value}
                    >
                      {origin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700 text-white font-medium px-6 rounded-none md:rounded-r-lg flex items-center justify-center text-base h-14"
          >
            <span className="mr-2">Get Quote</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
      
      {/* Micro reassurance line */}
      <div className="mt-2 text-center text-[11px] text-gray-500">
        <span>✓ Avg. 67% saving</span>
        <span className="mx-2">•</span>
        <span>17,842 quotes generated</span>
        <span className="mx-2">•</span>
        <span>Data fully encrypted</span>
      </div>
    </div>
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  // The svg of the friendly otter mascot with toothbrush and passport
  const OtterMascot = () => (
    <svg className="w-44 h-44 md:w-52 md:h-52 absolute right-4 top-12 hidden lg:block" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Otter body */}
        <path d="M100 180c30 0 50-20 50-50 0-35-20-60-50-60S50 95 50 130c0 30 20 50 50 50z" fill="#8B572A" />
        <path d="M90 180c20 0 40-15 40-40 0-30-20-50-40-50S50 110 50 140c0 25 20 40 40 40z" fill="#D2B48C" />
        
        {/* Otter face */}
        <path d="M75 118a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" fill="#000" /> {/* Left eye */}
        <path d="M115 118a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" fill="#000" /> {/* Right eye */}
        
        {/* Eye highlights for friendly look */}
        <circle cx="78" cy="116" r="2" fill="#FFF" />
        <circle cx="118" cy="116" r="2" fill="#FFF" />
        
        {/* Nose */}
        <path d="M95 135c3 0 10 0 10 0 2 0 4 5 0 5-4 0-10 0-10 0-4 0-2-5 0-5z" fill="#000" />
        
        {/* Smiling mouth with teeth */}
        <path d="M75 130c10 15 40 15 50 0" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M85 132c10 10 20 10 30 0" fill="#FFF" />
        <path d="M85 132c10 10 20 10 30 0" stroke="#000" strokeWidth="1" fill="none" />
        <path d="M85 132l5 0M95 132l5 0M105 132l5 0" stroke="#000" strokeWidth="0.75" />
        
        {/* Whiskers */}
        <path d="M65 125c0 0 -10 -5 -15 -5" stroke="#8B572A" strokeWidth="1.5" />
        <path d="M65 130c0 0 -10 0 -15 0" stroke="#8B572A" strokeWidth="1.5" />
        <path d="M65 135c0 0 -10 5 -15 5" stroke="#8B572A" strokeWidth="1.5" />
        
        <path d="M135 125c0 0 10 -5 15 -5" stroke="#8B572A" strokeWidth="1.5" />
        <path d="M135 130c0 0 10 0 15 0" stroke="#8B572A" strokeWidth="1.5" />
        <path d="M135 135c0 0 10 5 15 5" stroke="#8B572A" strokeWidth="1.5" />
        
        {/* Ears */}
        <path d="M70 95c-5-10-10-15-15-10-5 5 0 15 10 15" fill="#8B572A" />
        <path d="M130 95c5-10 10-15 15-10 5 5 0 15-10 15" fill="#8B572A" />
        
        {/* Toothbrush */}
        <rect x="140" y="150" width="6" height="25" rx="2" fill="#3B82F6" /> {/* Handle */}
        <rect x="137" y="145" width="12" height="5" rx="1" fill="#F0F9FF" /> {/* Brush base */}
        <path d="M137 145c0-5 2-7 6-7s6 2 6 7" fill="#F0F9FF" /> {/* Bristles */}
        <path d="M139 138v7M141 138v7M143 138v7M145 138v7M147 138v7" stroke="#E5E7EB" strokeWidth="1" />
        
        {/* Passport */}
        <rect x="55" y="155" width="22" height="16" rx="1" fill="#1E40AF" /> {/* Passport cover */}
        <path d="M60 160h12M60 164h10M60 168h8" stroke="#F8FAFC" strokeWidth="1.5" /> {/* Passport lines */}
        <path d="M68 155c0-2 2-4 4-4s4 2 4 4" fill="gold" /> {/* Passport emblem */}
        
        {/* Paws */}
        <path d="M70 165c-5 5-10 10-5 15s15 0 20-5" fill="#8B572A" />
        <path d="M130 165c5 5 10 10 5 15s-15 0-20-5" fill="#8B572A" />
      </g>
    </svg>
  );
  
  return (
    <section className="relative py-8 md:py-12 overflow-hidden bg-[#F8FAFC]">
      {/* Simple light background */}
      <div className="container mx-auto px-4 relative">
        {/* Main content with heading, form, and mascot */}
        <div className="max-w-4xl mx-auto relative">
          {/* Otter Mascot - hidden on mobile */}
          <OtterMascot />
          
          {/* Heading Section - Simplified */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Compare Turkish Dental Clinics in Seconds
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Real prices. Trusted surgeons. One easy portal.
            </p>
          </div>
          
          {/* Quote Form - Booking.com style, full width */}
          <QuoteForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;
