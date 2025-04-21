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
  const [budgetRange, setBudgetRange] = useState<string>("");
  
  // Countries - supporting expansion plan
  const countries = [
    { value: "turkey", label: "Turkey" },
    { value: "thailand", label: "Thailand (Coming Soon)", disabled: true },
    { value: "mexico", label: "Mexico (Coming Soon)", disabled: true },
  ];
  
  // Cities by country
  const cities = {
    turkey: [
      { value: "istanbul", label: "Istanbul" },
      { value: "antalya", label: "Antalya (Coming Soon)", disabled: true },
      { value: "izmir", label: "Izmir (Coming Soon)", disabled: true },
      { value: "dalaman", label: "Dalaman (Coming Soon)", disabled: true },
    ]
  };
  
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
    { value: "december", label: "December" }
  ];
  
  // Budget ranges
  const budgetRanges = [
    { value: "budget", label: "Budget-friendly (£1,000-£3,000)" },
    { value: "mid-range", label: "Mid-range (£3,000-£6,000)" },
    { value: "premium", label: "Premium (£6,000+)" },
    { value: "not-sure", label: "I'm not sure yet" }
  ];
  
  // Get cities based on selected country
  const getCitiesForCountry = () => {
    if (country === "turkey") {
      return cities.turkey;
    }
    return [];
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to quote results page with query parameters
    window.location.href = `/your-quote?country=${country}&city=${city}&treatment=${treatmentType}&travelMonth=${travelMonth}&budget=${budgetRange}`;
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Mobile Form with Card-based Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {/* Responsive layout - cards on mobile, horizontal on desktop */}
        <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-5 md:gap-4 col-span-full">
        
          {/* Country Selection */}
          <div className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm md:shadow-none md:p-0 md:bg-transparent border border-gray-100 md:border-0">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mr-2">
                <PlaneIcon className="h-3 w-3 text-primary" />
              </div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Treatment Country
              </label>
            </div>
            <div className="relative">
              <Select 
                value={country} 
                onValueChange={(value) => {
                  setCountry(value);
                  setCity(""); 
                }}
              >
                <SelectTrigger id="country" className="quote-select-trigger w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={option.disabled}
                      className="focus:bg-primary/10"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* City Selection */}
          <div className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm md:shadow-none md:p-0 md:bg-transparent border border-gray-100 md:border-0">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mr-2">
                <MapPin className="h-3 w-3 text-primary" />
              </div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
            </div>
            <div className="relative">
              <Select 
                value={city} 
                onValueChange={setCity}
                disabled={!country}
              >
                <SelectTrigger id="city" className="quote-select-trigger w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
                  <SelectValue placeholder={country ? "Select city" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {country && getCitiesForCountry().map((cityOption) => (
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

          {/* Main Treatment Type */}
          <div className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm md:shadow-none md:p-0 md:bg-transparent border border-gray-100 md:border-0">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mr-2">
                <BriefcaseMedical className="h-3 w-3 text-primary" />
              </div>
              <label htmlFor="treatment-type" className="block text-sm font-medium text-gray-700">
                Treatment Type
              </label>
            </div>
            <div className="relative">
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger id="treatment-type" className="quote-select-trigger w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="focus:bg-primary/10">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Travel Month */}
          <div className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm md:shadow-none md:p-0 md:bg-transparent border border-gray-100 md:border-0">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mr-2">
                <Calendar className="h-3 w-3 text-primary" />
              </div>
              <label htmlFor="travel-month" className="block text-sm font-medium text-gray-700">
                Travel Month
              </label>
            </div>
            <div className="relative">
              <Select value={travelMonth} onValueChange={setTravelMonth}>
                <SelectTrigger id="travel-month" className="quote-select-trigger w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
                  <SelectValue placeholder="When?" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value} className="focus:bg-primary/10">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="md:col-span-1 flex flex-col justify-end">
            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-[42px] md:h-[42px] rounded-md flex items-center justify-center shadow-md transition-all"
              disabled={!country || !city || !treatmentType}
            >
              <span className="mr-2">Get My Quote</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Feature badges */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center justify-center">
          <div className="bg-blue-50 rounded-full px-4 py-1.5 inline-flex items-center border border-blue-100">
            <Shield className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">Free, no-obligation</span> quote
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-green-50 rounded-full px-4 py-1.5 inline-flex items-center border border-green-100">
            <Clock className="h-3.5 w-3.5 text-green-500 mr-1.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">Response within</span> 24 hours
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-primary/5 rounded-full px-4 py-1.5 inline-flex items-center border border-primary/10">
            <BriefcaseMedical className="h-3.5 w-3.5 text-primary mr-1.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">Includes full</span> treatment plan
            </p>
          </div>
        </div>
      </div>
    </form>
    
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative py-6 md:py-10 overflow-hidden">
      {/* Background with pattern and gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 opacity-85"></div>
      
      {/* Large decorative medical cross - bottom right */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcwIDQwdjMwSDQwdjIwaDMwdjMwaDIwdi0zMGgzMHYtMjBoLTMwVjQwSDcweiIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjA2Ii8+PC9zdmc+')] bg-no-repeat opacity-70 transform rotate-12"></div>
      
      {/* Medical themed pattern - more visible */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4xMiI+PHBhdGggZD0iTTM4IDM4aDR2NGgtNHpNMzggMzhoLTR2LTRoNHY0em0wLTh2NGg0di00aC00em0wLTRoNHY0aC00di00em0tOCAwdjRoNHYtNGgtNHptMCAxMmg0di00aC00djR6Ii8+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iNjAiIHI9IjIiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjIwIiByPSIyIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60"></div>
      
      {/* Small decorative medical cross - top left */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwIDMwdjIwSDMwdjIwaDIwdjIwaDIwVjcwaDIwVjUwSDcwVjMwSDUweiIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')] bg-no-repeat opacity-80 transform -rotate-12"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Top Section - Heading and Brief Description */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-1 w-8 bg-gray-200 rounded-full mx-1"></div>
            <div className="h-1 w-20 bg-primary rounded-full mx-1"></div>
            <div className="h-1 w-8 bg-gray-200 rounded-full mx-1"></div>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            <span className="block mb-1">Quality Dental Care</span>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Without the Premium Price</span>
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
        
        {/* Bottom Section - Form with Trust Badges */}
        <div className="bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMyIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iMTUiIHI9IjMiLz48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSI0NSIgcj0iMyIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNDUiIHI9IjMiLz48cGF0aCBkPSJNMjggMTVoNHYtNGgtNHY0em0wIDEwaDR2LTRoLTR2NHptMCAxMGg0di00aC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] rounded-xl shadow-xl p-5 md:p-7 max-w-5xl mx-auto border border-gray-100">
          {/* Medical Indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-lg border-2 border-primary/20">
              <HeartPulse className="h-7 w-7 text-primary" />
            </div>
          </div>
          
          <div className="flex flex-col mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Request Your Personalised Dental Quote
            </h2>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 mb-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-xs text-center text-gray-700 font-medium">100% Satisfaction</span>
                <span className="text-[10px] text-gray-500">Guaranteed</span>
              </div>
              
              <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mb-1">
                  <HeartPulse className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs text-center text-gray-700 font-medium">Premium Care</span>
                <span className="text-[10px] text-gray-500">Best UK Standards</span>
              </div>
              
              <div className="flex flex-col items-center bg-primary/5 rounded-xl p-3 border border-primary/10">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mb-1">
                  <PoundSterling className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-center text-gray-700 font-medium">70% Savings</span>
                <span className="text-[10px] text-gray-500">vs UK Prices</span>
              </div>
            </div>
          </div>
          
          <QuoteForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;
