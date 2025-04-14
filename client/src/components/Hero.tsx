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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {/* Responsive layout - stacks on mobile, horizontal on desktop */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-5 md:gap-4 col-span-full">
          {/* Country Selection */}
          <div className="md:col-span-1">
            <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1.5">
              Treatment Country
            </label>
            <div className="relative">
              <Select 
                value={country} 
                onValueChange={(value) => {
                  setCountry(value);
                  setCity(""); 
                }}
              >
                <SelectTrigger id="country" className="w-full bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <PlaneIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* City Selection */}
          <div className="md:col-span-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1.5">
              City
            </label>
            <div className="relative">
              <Select 
                value={city} 
                onValueChange={setCity}
                disabled={!country}
              >
                <SelectTrigger id="city" className="w-full bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Main Treatment Type */}
          <div className="md:col-span-1">
            <label htmlFor="treatment-type" className="block text-sm font-medium text-gray-600 mb-1.5">
              Treatment Type
            </label>
            <div className="relative">
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger id="treatment-type" className="w-full bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <BriefcaseMedical className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Travel Month */}
          <div className="md:col-span-1">
            <label htmlFor="travel-month" className="block text-sm font-medium text-gray-600 mb-1.5">
              Travel Month
            </label>
            <div className="relative">
              <Select value={travelMonth} onValueChange={setTravelMonth}>
                <SelectTrigger id="travel-month" className="w-full bg-gray-50 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="md:col-span-1">
            <label className="invisible block text-sm font-medium text-gray-600 mb-1.5">
              Get Quote
            </label>
            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-[42px] rounded-md flex items-center justify-center shadow-md transition-all"
              disabled={!country || !city || !treatmentType}
            >
              <span className="mr-2">Get My Quote</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Optional hint text */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        Free, no-obligation quote. Receive your personalized treatment plan within 24 hours.
      </p>
    </form>
    
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-gradient-to-b from-white to-blue-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Top Section - Heading and Brief Description */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="h-[6px] w-16 bg-gradient-to-r from-primary/70 to-primary rounded-full mx-auto"></div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
            Quality Dental Care <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Without the Premium</span>
          </h1>
          <p className="text-gray-700 mx-auto max-w-xl font-light text-sm md:text-base">
            Premium clinics in Turkey with up to 70% savings on UK prices
          </p>
        </div>
        
        {/* Bottom Section - Form with Trust Badges */}
        <div className="bg-white rounded-xl shadow-xl p-5 md:p-6 max-w-5xl mx-auto border border-gray-100">
          {/* Medical Indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-md border border-gray-100">
              <HeartPulse className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-3 md:mb-0">
              Request Your Personalised Dental Quote
            </h2>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 md:justify-end">
              <div className="flex items-center px-3 py-1.5 bg-green-50 rounded-full">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs md:text-sm text-gray-700"><span className="font-medium">100%</span> Satisfaction</span>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-full">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-xs md:text-sm text-gray-700"><span className="font-medium">24/7</span> Support</span>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-primary/10 rounded-full">
                <PoundSterling className="h-4 w-4 text-primary mr-2" />
                <span className="text-xs md:text-sm text-gray-700"><span className="font-medium">£200</span> Deposit</span>
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
