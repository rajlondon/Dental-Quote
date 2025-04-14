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
    window.location.href = `/your-quote?country=${country}&city=${city}&treatment=${treatmentType}&travelMonth=${travelMonth}&budget=${budgetRange}`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-2 w-full max-w-full mx-auto">
      <h2 className="text-xs font-semibold text-gray-800 mb-1">Start Building Your Personalised Dental Quote</h2>
      <p className="text-gray-600 text-[10px] mb-1">Tell us what dental treatment you're interested in.</p>
      
      <form onSubmit={handleSubmit} className="space-y-1">
        {/* Location Selection (Country & City) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          {/* Country Selection */}
          <div className="space-y-0">
            <label htmlFor="country" className="block text-[10px] font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <Select 
              value={country} 
              onValueChange={(value) => {
                setCountry(value);
                setCity(""); // Reset city when country changes
              }}
            >
              <SelectTrigger id="country" className="w-full h-7 text-xs">
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
          <div className="space-y-0">
            <label htmlFor="city" className="block text-[10px] font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <Select 
              value={city} 
              onValueChange={setCity}
              disabled={!country}
            >
              <SelectTrigger id="city" className="w-full h-7 text-xs">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Main Treatment Type */}
          <div className="space-y-0">
            <label htmlFor="treatment-type" className="block text-[10px] font-medium text-gray-700">
              Main Treatment Type <span className="text-red-500">*</span>
            </label>
            <Select value={treatmentType} onValueChange={setTreatmentType}>
              <SelectTrigger id="treatment-type" className="w-full h-7 text-xs">
                <SelectValue placeholder="Choose treatment" />
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
          <div className="space-y-0">
            <label htmlFor="travel-month" className="block text-[10px] font-medium text-gray-700">
              Preferred Travel Month
            </label>
            <Select value={travelMonth} onValueChange={setTravelMonth}>
              <SelectTrigger id="travel-month" className="w-full h-7 text-xs">
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
        </div>
        
        {/* Budget Range */}
        <div className="space-y-0">
          <label htmlFor="budget-range" className="block text-[10px] font-medium text-gray-700">
            Estimated Budget (Optional)
          </label>
          <Select value={budgetRange} onValueChange={setBudgetRange}>
            <SelectTrigger id="budget-range" className="w-full h-7 text-xs">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white h-8 text-sm py-0 font-medium rounded-lg mt-2 flex items-center justify-center"
          disabled={!country || !city || !treatmentType}
        >
          Calculate My Quote
          <ArrowRightIcon className="ml-1 h-3 w-3" />
        </Button>
      </form>
    </div>
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-sky-100 py-2 flex items-center min-h-0">
      <div className="w-full max-w-[99%] mx-auto px-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 items-center">
          {/* Hero Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left lg:pl-2">
            <div className="mb-1 inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <PlaneIcon className="h-3 w-3 mr-1" />
              Dental Tourism Excellence
            </div>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              Quality Dental Care <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Without the Premium</span>
            </h1>
            
            <h2 className="text-sm md:text-base text-primary font-medium mb-1 tracking-wide">
              Compare Clinics. Book With Confidence. Fly With a Smile.
            </h2>
            <p className="text-xs text-gray-700 mb-2 leading-relaxed">
              MyDentalFly connects patients with trusted dental clinics in Turkey — offering up to 70% savings compared to UK prices.
            </p>
            
            <div className="flex sm:flex-row gap-2 justify-center lg:justify-start mb-2">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white h-7 text-xs px-2 py-0">
                <Link href="/how-it-works">
                  How It Works
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 h-7 text-xs px-2 py-0">
                <Link href="/your-quote">
                  See All Treatments
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 items-center text-xs text-gray-600">
              <div className="flex items-center text-[10px]">
                <span className="font-semibold mr-1">100%</span> Satisfaction
              </div>
              <div className="flex items-center text-[10px]">
                <span className="font-semibold mr-1">24/7</span> Support
              </div>
              <div className="flex items-center text-[10px]">
                <span className="font-semibold mr-1">£200</span> Deposit
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
