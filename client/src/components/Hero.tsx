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
    <div className="bg-white rounded-xl shadow-lg p-2 w-full max-w-full mx-auto ml-2 mr-1">
      <h2 className="text-[10px] font-semibold text-gray-800 mb-0.5">Start Building Your Personalised Dental Quote</h2>
      <p className="text-gray-600 text-[8px] mb-0.5">Tell us what dental treatment you're interested in.</p>
      
      <form onSubmit={handleSubmit} className="space-y-0.5">
        {/* Location Selection (Country & City) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-1">
          {/* Country Selection */}
          <div>
            <label htmlFor="country" className="block text-[8px] font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <Select 
              value={country} 
              onValueChange={(value) => {
                setCountry(value);
                setCity(""); // Reset city when country changes
              }}
            >
              <SelectTrigger id="country" className="w-full h-6 text-[10px] min-h-0 py-0">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                    className="text-xs"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* City Selection - Only shown when country is selected */}
          <div>
            <label htmlFor="city" className="block text-[8px] font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <Select 
              value={city} 
              onValueChange={setCity}
              disabled={!country}
            >
              <SelectTrigger id="city" className="w-full h-6 text-[10px] min-h-0 py-0">
                <SelectValue placeholder={country ? "Select city" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {country && getCitiesForCountry().map((cityOption) => (
                  <SelectItem 
                    key={cityOption.value} 
                    value={cityOption.value}
                    disabled={cityOption.disabled}
                    className="text-xs"
                  >
                    {cityOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {/* Main Treatment Type */}
          <div>
            <label htmlFor="treatment-type" className="block text-[8px] font-medium text-gray-700">
              Main Treatment Type <span className="text-red-500">*</span>
            </label>
            <Select value={treatmentType} onValueChange={setTreatmentType}>
              <SelectTrigger id="treatment-type" className="w-full h-6 text-[10px] min-h-0 py-0">
                <SelectValue placeholder="Choose treatment" />
              </SelectTrigger>
              <SelectContent>
                {treatmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Travel Month */}
          <div>
            <label htmlFor="travel-month" className="block text-[8px] font-medium text-gray-700">
              Preferred Travel Month
            </label>
            <Select value={travelMonth} onValueChange={setTravelMonth}>
              <SelectTrigger id="travel-month" className="w-full h-6 text-[10px] min-h-0 py-0">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value} className="text-xs">
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Budget Range */}
        <div>
          <label htmlFor="budget-range" className="block text-[8px] font-medium text-gray-700">
            Estimated Budget (Optional)
          </label>
          <Select value={budgetRange} onValueChange={setBudgetRange}>
            <SelectTrigger id="budget-range" className="w-full h-6 text-[10px] min-h-0 py-0">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((range) => (
                <SelectItem key={range.value} value={range.value} className="text-xs">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white h-6 text-xs py-0 font-medium rounded-md mt-1.5 flex items-center justify-center"
          disabled={!country || !city || !treatmentType}
        >
          Calculate My Quote
          <ArrowRightIcon className="ml-1 h-2.5 w-2.5" />
        </Button>
      </form>
    </div>
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-sky-100 py-1 flex items-center min-h-0">
      <div className="w-full max-w-full mx-auto px-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-0 items-center">
          {/* Hero Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left lg:pl-4">
            <div className="mb-1 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
              <PlaneIcon className="h-2.5 w-2.5 mr-1" />
              Dental Tourism Excellence
            </div>
            
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">
              Quality Dental Care <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Without the Premium</span>
            </h1>
            
            <h2 className="text-xs md:text-sm text-primary font-medium mb-0.5 tracking-wide">
              Compare Clinics. Book With Confidence. Fly With a Smile.
            </h2>
            <p className="text-[10px] text-gray-700 mb-1.5 leading-relaxed max-w-xs">
              MyDentalFly connects patients with trusted dental clinics in Turkey — offering up to 70% savings compared to UK prices.
            </p>
            
            <div className="flex sm:flex-row gap-1.5 justify-center lg:justify-start mb-1.5">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white h-6 text-[10px] px-2 py-0">
                <Link href="/how-it-works">
                  How It Works
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 h-6 text-[10px] px-2 py-0">
                <Link href="/your-quote">
                  See All Treatments
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 items-center">
              <div className="flex items-center text-[8px] text-gray-600">
                <span className="font-semibold mr-0.5">100%</span> Satisfaction
              </div>
              <div className="flex items-center text-[8px] text-gray-600">
                <span className="font-semibold mr-0.5">24/7</span> Support
              </div>
              <div className="flex items-center text-[8px] text-gray-600">
                <span className="font-semibold mr-0.5">£200</span> Deposit
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
