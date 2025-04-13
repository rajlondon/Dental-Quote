import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { PlaneIcon, ArrowRightIcon } from "lucide-react";
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
    window.location.href = `/your-quote?country=${country}&city=${city}&treatment=${treatmentType}&month=${travelMonth}&budget=${budgetRange}`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-3xl mx-auto">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">Find Your Perfect Dental Treatment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Selection (Country & City) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Country Selection */}
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <Select 
              value={country} 
              onValueChange={(value) => {
                setCountry(value);
                setCity(""); // Reset city when country changes
              }}
            >
              <SelectTrigger id="country" className="w-full">
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
          
          {/* City Selection - Only shown when country is selected */}
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <Select 
              value={city} 
              onValueChange={setCity}
              disabled={!country}
            >
              <SelectTrigger id="city" className="w-full">
                <SelectValue placeholder={country ? "Select city" : "Select country first"} />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Treatment Type */}
          <div className="space-y-2">
            <label htmlFor="treatment-type" className="block text-sm font-medium text-gray-700">
              Treatment Type
            </label>
            <Select value={treatmentType} onValueChange={setTreatmentType}>
              <SelectTrigger id="treatment-type" className="w-full">
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
          <div className="space-y-2">
            <label htmlFor="travel-month" className="block text-sm font-medium text-gray-700">
              Preferred Travel Month
            </label>
            <Select value={travelMonth} onValueChange={setTravelMonth}>
              <SelectTrigger id="travel-month" className="w-full">
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
          
          {/* Budget Range (Optional) */}
          <div className="space-y-2">
            <label htmlFor="budget-range" className="block text-sm font-medium text-gray-700">
              Budget Range (Optional)
            </label>
            <Select value={budgetRange} onValueChange={setBudgetRange}>
              <SelectTrigger id="budget-range" className="w-full">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((budget) => (
                  <SelectItem key={budget.value} value={budget.value}>
                    {budget.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-semibold text-lg rounded-lg mt-4 flex items-center justify-center"
          disabled={!country || !city}
        >
          Calculate My Quote
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-sky-100 min-h-[80vh] flex items-center pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Hero Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <PlaneIcon className="h-4 w-4 mr-2" />
              Dental Tourism Excellence
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Quality Dental Care <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Without the Premium</span>
            </h1>
            
            <h2 className="text-xl md:text-2xl text-primary font-medium mb-3 tracking-wide">
              Compare Dental Clinics. Book With Confidence. Fly With a Smile.
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-xl lg:mx-0 mx-auto">
              Compare verified Turkish dental clinics. Save up to 70% on UK prices with transparent quotes and personalized service.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/how-it-works">
                  How It Works
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Link href="/your-quote">
                  See All Treatments
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 items-center text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-semibold mr-2">100%</span> Satisfaction Guarantee
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">24/7</span> Support
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">£200</span> Deposit Only
              </div>
            </div>
          </div>
          
          {/* Quote Form */}
          <div className="order-1 lg:order-2">
            <QuoteForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
