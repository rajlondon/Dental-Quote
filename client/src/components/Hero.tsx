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
  
  return (
    <section className="relative py-8 md:py-12 overflow-hidden bg-[#F8FAFC]">
      {/* Simple light background */}
      <div className="container mx-auto px-4 relative">
        {/* Header with nav space */}
        <div className="flex items-center justify-center md:justify-start mb-6">
          <div className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold text-xl md:text-2xl">MyDentalFly</div>
        </div>
        
        {/* Main content with heading and form */}
        <div className="max-w-4xl mx-auto relative">
          {/* Heading Section - Simplified */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              <span className="block mb-2">Compare Dental Clinics</span>
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Abroad in Seconds</span>
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
