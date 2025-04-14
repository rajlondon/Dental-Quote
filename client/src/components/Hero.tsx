import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Plane as PlaneIcon, ArrowRight as ArrowRightIcon, Check, Clock, PoundSterling } from "lucide-react";
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
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {/* Country Selection */}
        <div className="sm:col-span-1">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <Select 
            value={country} 
            onValueChange={(value) => {
              setCountry(value);
              setCity(""); 
            }}
          >
            <SelectTrigger id="country" className="w-full h-10">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* City Selection */}
        <div className="sm:col-span-1">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <Select 
            value={city} 
            onValueChange={setCity}
            disabled={!country}
          >
            <SelectTrigger id="city" className="w-full h-10">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {country && getCitiesForCountry().map((cityOption) => (
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

        {/* Main Treatment Type */}
        <div className="sm:col-span-1">
          <label htmlFor="treatment-type" className="block text-sm font-medium text-gray-700 mb-1">
            Treatment <span className="text-red-500">*</span>
          </label>
          <Select value={treatmentType} onValueChange={setTreatmentType}>
            <SelectTrigger id="treatment-type" className="w-full h-10">
              <SelectValue placeholder="Select treatment" />
            </SelectTrigger>
            <SelectContent>
              {treatmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Travel Month */}
        <div className="sm:col-span-1">
          <label htmlFor="travel-month" className="block text-sm font-medium text-gray-700 mb-1">
            Travel Month
          </label>
          <Select value={travelMonth} onValueChange={setTravelMonth}>
            <SelectTrigger id="travel-month" className="w-full h-10">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Submit Button */}
        <div className="sm:col-span-1">
          <label className="invisible block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 rounded-md flex items-center justify-center"
            disabled={!country || !city || !treatmentType}
          >
            Get My Quote
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
    
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-sky-100 py-3">
      <div className="container mx-auto px-4">
        {/* Top Section - Heading and Brief Description */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Quality Dental Care <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Without the Premium</span>
          </h1>
          <p className="text-sm text-gray-700 mx-auto max-w-xl">
            Compare dental clinics in Turkey, save up to 70% on UK prices
          </p>
        </div>
        
        {/* Bottom Section - Form with Trust Badges */}
        <div className="bg-white rounded-lg shadow-md p-3 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 mb-2 md:mb-0">
              Find Your Perfect Dental Treatment
            </h2>
            
            {/* Trust Badges */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span className="font-semibold">100%</span> Satisfaction
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                <span className="font-semibold">24/7</span> Support
              </div>
              <div className="flex items-center">
                <PoundSterling className="h-4 w-4 text-primary mr-1" />
                <span className="font-semibold">£200</span> Deposit
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
