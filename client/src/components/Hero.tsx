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

// Create a booking.com-style quote form
const QuoteForm: React.FC = () => {
  const { t } = useTranslation();
  const [country, setCountry] = useState<string>("");
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
    <div className="relative max-w-4xl mx-auto">
      {/* Main message above form */}
      <div className="text-center mb-4">
        <p className="text-gray-800 font-medium text-lg">
          Get an instant, side-by-side quote from top Turkish dental clinics—save up to 70% and manage everything in one secure portal.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Booking.com style horizontal search bar */}
        <div className="flex flex-col md:flex-row md:items-stretch md:h-14 rounded-lg overflow-hidden shadow-lg">
          {/* City/Destination */}
          <div className="flex-1 flex items-center bg-white border-b md:border-b-0 md:border-r border-gray-200">
            <div className="w-full h-full relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MapPin className="h-5 w-5" />
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger 
                  id="destination-city" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="Destination city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((cityOption) => (
                    <SelectItem 
                      key={cityOption.value} 
                      value={cityOption.value}
                      disabled={cityOption.disabled}
                      className="focus:bg-primary/10"
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <BriefcaseMedical className="h-5 w-5" />
              </div>
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger 
                  id="treatment-type" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="Treatment type" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value} 
                      className="focus:bg-primary/10"
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Calendar className="h-5 w-5" />
              </div>
              <Select value={travelMonth} onValueChange={setTravelMonth}>
                <SelectTrigger 
                  id="travel-month" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="When?" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem 
                      key={month.value} 
                      value={month.value} 
                      className="focus:bg-primary/10"
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <PlaneIcon className="h-5 w-5" />
              </div>
              <Select value={userOrigin} onValueChange={setUserOrigin}>
                <SelectTrigger 
                  id="user-origin" 
                  className="w-full h-full border-0 shadow-none pl-10 focus:ring-0"
                >
                  <SelectValue placeholder="From country" />
                </SelectTrigger>
                <SelectContent>
                  {origins.map((origin) => (
                    <SelectItem 
                      key={origin.value} 
                      value={origin.value} 
                      className="focus:bg-primary/10"
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
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium px-6 rounded-none md:rounded-r-lg flex items-center justify-center text-base h-14"
            disabled={!city || !treatmentType}
          >
            <span className="mr-2">Get My Quote</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
      
      {/* Feature badges/reassurance elements in a thin row */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-full px-4 py-1.5 shadow-sm inline-flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-1.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">100% Satisfaction</span> Guaranteed
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-full px-4 py-1.5 shadow-sm inline-flex items-center">
            <HeartPulse className="h-4 w-4 text-blue-500 mr-1.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">Premium Care</span> - Best UK Standards
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-full px-4 py-1.5 shadow-sm inline-flex items-center">
            <PoundSterling className="h-4 w-4 text-primary mr-1.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">70% Savings</span> vs UK prices
            </p>
          </div>
        </div>
      </div>
      
      {/* Trust line */}
      <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
        <Shield className="h-3 w-3 inline mr-1" />
        <span>Your data is encrypted and secure</span>
        <span className="mx-2">•</span>
        <span>17,842 quotes generated since 2023</span>
      </div>
    </div>
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative py-6 md:py-10 overflow-hidden">
      {/* Enhanced background with pattern and gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-blue-100/20 opacity-90"></div>
      
      {/* Hero subtle background image with dental patterns */}
      <div className="absolute inset-0 bg-[url('/images/dental-bg-pattern.svg')] bg-repeat opacity-8"></div>
      
      {/* Large decorative medical cross - bottom right */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcwIDQwdjMwSDQwdjIwaDMwdjMwaDIwdi0zMGgzMHYtMjBoLTMwVjQwSDcweiIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjA2Ii8+PC9zdmc+')] bg-no-repeat opacity-70 transform rotate-12"></div>
      
      {/* Medical themed pattern - more visible */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4xMiI+PHBhdGggZD0iTTM4IDM4aDR2NGgtNHpNMzggMzhoLTR2LTRoNHY0em0wLTh2NGg0di00aC00em0wLTRoNHY0aC00di00em0tOCAwdjRoNHYtNGgtNHptMCAxMmg0di00aC00djR6Ii8+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iNjAiIHI9IjIiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjIwIiByPSIyIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60"></div>
      
      {/* Small decorative medical cross - top left */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwIDMwdjIwSDMwdjIwaDIwdjIwaDIwVjcwaDIwVjUwSDcwVjMwSDUweiIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')] bg-no-repeat opacity-80 transform -rotate-12"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Top Section - Heading and Brief Description */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-1 w-8 bg-gray-200 rounded-full mx-1"></div>
            <div className="h-1 w-20 bg-primary rounded-full mx-1"></div>
            <div className="h-1 w-8 bg-gray-200 rounded-full mx-1"></div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            <span className="block mb-1">Where's Your New Smile?</span>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Quality Care, Affordable Price</span>
          </h1>
          
          <div className="flex items-center justify-center mb-4">
            <div className="px-4 py-1.5 bg-primary/10 rounded-full inline-flex items-center">
              <PoundSterling className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm text-gray-800 font-medium">Save up to 70% on UK dental costs</span>
            </div>
          </div>
          
          <p className="text-gray-600 mx-auto max-w-2xl font-light text-sm md:text-base leading-relaxed">
            MyDentalFly connects you with premium accredited dental clinics in Turkey, offering 
            the same high-quality treatments available in the UK at a fraction of the cost.
          </p>
        </div>
        
        {/* Quote Form Section - Booking.com style */}
        <div className="max-w-5xl mx-auto">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;
