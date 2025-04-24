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
  
  // Simple cartoon otter mascot with toothbrush based on provided image
  const OtterMascot = () => (
    <svg className="w-44 h-44 md:w-52 md:h-52 absolute right-4 top-12 hidden lg:block" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="#F9E8B8" />
        
        {/* Otter head */}
        <path d="M325 190c0 55-55 100-125 100S75 245 75 190c0-55 55-100 125-100s125 45 125 100z" fill="#8B572A" stroke="#222" strokeWidth="8" />
        
        {/* Otter ears */}
        <path d="M135 125c-10-25-30-25-30-10 0 15 15 25 30 10z" fill="#8B572A" stroke="#222" strokeWidth="8" />
        <path d="M265 125c10-25 30-25 30-10 0 15-15 25-30 10z" fill="#8B572A" stroke="#222" strokeWidth="8" />
        
        {/* Otter face - light area */}
        <path d="M200 290c45 0 80-35 80-70 0-35-35-60-80-60s-80 25-80 60c0 35 35 70 80 70z" fill="#E2C799" />
        
        {/* Otter eyes - closed happy */}
        <path d="M140 170c5-10 20-10 25 0" stroke="#222" strokeWidth="8" strokeLinecap="round" />
        <path d="M235 170c5-10 20-10 25 0" stroke="#222" strokeWidth="8" strokeLinecap="round" />
        
        {/* Nose */}
        <ellipse cx="200" cy="190" rx="15" ry="10" fill="#222" />
        
        {/* Whiskers */}
        <path d="M130 200h-30M130 210h-25M130 220h-30" stroke="#222" strokeWidth="4" />
        <path d="M270 200h30M270 210h25M270 220h30" stroke="#222" strokeWidth="4" />
        
        {/* Smiling mouth with teeth */}
        <path d="M140 230c20 30 100 30 120 0" stroke="#222" strokeWidth="8" fill="#222" />
        <path d="M165 228h70v15a35 35 0 01-70 0v-15z" fill="white" />
        <path d="M200 228v15M180 228v12M220 228v12" stroke="#222" strokeWidth="2" />
        
        {/* Toothbrush */}
        <rect x="240" y="215" width="10" height="70" rx="5" fill="#3B82F6" stroke="#222" strokeWidth="4" />
        <rect x="230" y="210" width="30" height="15" rx="2" fill="white" stroke="#222" strokeWidth="3" />
        <path d="M230 215c0-15 5-15 30-15" stroke="#222" strokeWidth="2" />
        <path d="M232 198v12M237 198v12M242 198v12M247 198v12M252 198v12M257 198v12" stroke="#80BFFF" strokeWidth="3" />
        
        {/* Toothpaste foam */}
        <path d="M170 235c5 0 10-5 15-5s10 5 15 5 10-5 15-5 10 5 15 5" fill="white" stroke="#80BFFF" strokeWidth="3" />
        
        {/* Paw holding toothbrush */}
        <path d="M265 280c20 0 40-10 40-25s-20-15-40-15" fill="#8B572A" stroke="#222" strokeWidth="8" />
        
        {/* Second paw */}
        <ellipse cx="140" cy="290" rx="25" ry="15" fill="#8B572A" stroke="#222" strokeWidth="8" />
      </g>
    </svg>
  );
  
  return (
    <section className="relative py-8 md:py-12 overflow-hidden bg-[#F8FAFC]">
      {/* Simple light background */}
      <div className="container mx-auto px-4 relative">
        {/* Header with nav space */}
        <div className="flex items-center justify-center md:justify-start mb-6">
          <div className="text-primary font-bold text-lg md:text-xl">MyDentalFly</div>
        </div>
        
        {/* Main content with heading and form */}
        <div className="max-w-4xl mx-auto relative">
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
        
        {/* Otter mascot positioned to the right */}
        <div className="hidden lg:block absolute right-10 top-1/3 transform -translate-y-1/4">
          <OtterMascot />
        </div>
      </div>
    </section>
  );
};

export default Hero;
