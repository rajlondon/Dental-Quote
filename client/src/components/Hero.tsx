import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { 
  Plane as PlaneIcon, 
  ArrowRight, 
  Check, 
  Clock, 
  PoundSterling,
  MapPin,
  Calendar,
  HeartPulse,
  Shield,
  BriefcaseMedical,
  CircleUser,
  Menu,
  ChevronDown,
  Search
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
            <ArrowRight className="h-4 w-4" />
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
    <section className="relative pb-12 overflow-hidden">
      {/* Header - Booking.com blue style */}
      <div className="bg-primary py-4 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-white font-bold text-xl">MyDentalFly</div>
            <div className="flex items-center space-x-2">
              {/* Mobile header icons */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <CircleUser className="h-5 w-5 text-white" />
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Menu className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with light background */}
      <div className="bg-[#F8FAFC] pb-4 pt-6">
        <div className="container mx-auto px-4">
          {/* Heading Section - Booking.com style */}
          <div>
            <h1 className="text-primary text-2xl font-bold mb-2">
              Find your dental clinic abroad
            </h1>
            <p className="text-gray-700 text-sm mb-4">
              Search for quality, experienced dental clinics and all-inclusive packages
            </p>
          </div>
        </div>
      </div>
      
      {/* Search box with blue medical border - Booking.com style */}
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto bg-white rounded-lg border-4 border-primary overflow-hidden shadow-lg">
          {/* Search city field */}
          <div className="flex items-center px-3 py-3 border-b border-gray-200">
            <Search className="h-5 w-5 text-gray-500 mr-3" />
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Istanbul, Antalya, Dalaman, Izmir..." 
                className="w-full border-0 focus:ring-0 focus:outline-none text-base"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* Treatment date */}
            <div className="flex items-center px-3 py-3 border-b border-r-0 sm:border-r border-gray-200">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Treatment date</div>
                <div className="text-base">Thu 24 Jun 2025</div>
              </div>
            </div>
            
            {/* Fly home date */}
            <div className="flex items-center px-3 py-3 border-b border-gray-200">
              <PlaneIcon className="h-5 w-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Fly home date</div>
                <div className="text-base">Fri 11 Jul 2025</div>
              </div>
            </div>
          </div>
          
          {/* Flying from */}
          <div className="flex items-center px-3 py-3 border-b border-gray-200">
            <MapPin className="h-5 w-5 text-gray-500 mr-3" />
            <div className="flex-1">
              <div className="text-xs text-gray-500">Flying from</div>
              <div className="text-base">United Kingdom</div>
            </div>
          </div>
          
          {/* Search Button */}
          <div className="p-3">
            <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded flex items-center justify-center">
              <span className="mr-2 font-medium">Search</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Micro reassurance line */}
        <div className="max-w-xl mx-auto mt-2 text-center text-[11px] text-gray-500 flex items-center justify-center">
          <span>✓ Avg. 67% saving</span>
          <span className="mx-2">•</span>
          <span>17,842 quotes generated</span>
          <span className="mx-2">•</span>
          <span>Data fully encrypted</span>
        </div>
        
        {/* Popular Clinics - Similar to booking.com "Offers" section */}
        <div className="mt-12 max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Popular Clinics</h2>
          {/* Additional content would go here */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
