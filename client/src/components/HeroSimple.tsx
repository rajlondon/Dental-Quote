import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  Plane as PlaneIcon, 
  MapPin, 
  Search,
  Home,
  Stethoscope
} from "lucide-react";
import { format, addDays } from "date-fns";

// Simple Hero component with minimal interaction
const HeroSimple: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Simple state without dropdowns
  const [city, setCity] = useState("Istanbul");
  const [origin, setOrigin] = useState("United Kingdom");
  const [treatment, setTreatment] = useState("Dental Implants");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 14));
  
  // Minimal city options
  const cities = ["Istanbul"];
  const treatments = ["Dental Implants", "Veneers & Crowns", "Hollywood Smile", "Full Mouth Reconstruction"];
  const origins = ["United Kingdom", "United States", "Canada", "Europe", "Australia"];
  
  // Use direct select elements instead of custom dropdowns
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
  };
  
  const handleTreatmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTreatment(e.target.value);
  };
  
  const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrigin(e.target.value);
  };
  
  const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartureDate(new Date(e.target.value));
    // Set return date 14 days after new departure date
    setReturnDate(addDays(new Date(e.target.value), 14));
  };
  
  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReturnDate(new Date(e.target.value));
  };
  
  // Handle search with treatment value mapping
  const handleSearch = () => {
    // Map treatment display names to URL values
    const treatmentMap: Record<string, string> = {
      "Dental Implants": "dental-implants",
      "Veneers & Crowns": "veneers",
      "Hollywood Smile": "hollywood-smile",
      "Full Mouth Reconstruction": "full-mouth"
    };
    
    // Map origin display names to URL values
    const originMap: Record<string, string> = {
      "United Kingdom": "uk",
      "United States": "us",
      "Canada": "ca",
      "Europe": "eu",
      "Australia": "au"
    };
    
    const treatmentValue = treatmentMap[treatment] || "dental-implants";
    const originValue = originMap[origin] || "uk";
    
    // Format dates for URL
    const outDateFormatted = format(departureDate, "yyyy-MM-dd");
    const returnDateFormatted = format(returnDate, "yyyy-MM-dd");
    
    // Navigate to quote page with parameters
    setLocation(`/your-quote?city=${city}&treatment=${treatmentValue}&origin=${originValue}&departureDate=${outDateFormatted}&returnDate=${returnDateFormatted}`);
  };
  
  return (
    <section className="relative pb-12 overflow-hidden">
      {/* Blue background header */}
      <div className="bg-primary pb-8 pt-8">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
              Find your cheaper dental treatment abroad
            </h1>
            <p className="text-white text-sm mb-6">
              Search for quality, experienced dental clinics and all-inclusive dental packages
            </p>
          </div>
          
          {/* Search Box */}
          <div className="max-w-5xl mx-auto">
            {/* Desktop: Horizontal form */}
            <div className="hidden md:block bg-white rounded-lg border-2 border-yellow-400 p-4">
              <div className="grid grid-cols-5 gap-3">
                {/* City select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Where are you going?</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                      value={city}
                      onChange={handleCityChange}
                      className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Treatment select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Treatment type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                      value={treatment}
                      onChange={handleTreatmentChange}
                      className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {treatments.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Departure date */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fly out date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <PlaneIcon className="h-4 w-4 text-gray-500 transform rotate-45" />
                    </div>
                    <input 
                      type="date"
                      value={format(departureDate, "yyyy-MM-dd")}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={handleDepartureDateChange}
                      className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Return date */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Return date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <PlaneIcon className="h-4 w-4 text-gray-500 transform -rotate-45" />
                    </div>
                    <input 
                      type="date"
                      value={format(returnDate, "yyyy-MM-dd")}
                      min={format(departureDate, "yyyy-MM-dd")}
                      onChange={handleReturnDateChange}
                      className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Origin select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Flying from</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <Home className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                      value={origin}
                      onChange={handleOriginChange}
                      className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {origins.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Search button */}
              <div className="mt-4">
                <button 
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded flex items-center justify-center"
                >
                  <span>Search</span>
                </button>
              </div>
            </div>
            
            {/* Mobile: Stacked form */}
            <div className="md:hidden bg-white rounded-lg border-2 border-yellow-400 p-4">
              {/* City select */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Where are you going?</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <select 
                    value={city}
                    onChange={handleCityChange}
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Treatment select */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Treatment type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                  </div>
                  <select 
                    value={treatment}
                    onChange={handleTreatmentChange}
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {treatments.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Departure date */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Fly out date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <PlaneIcon className="h-4 w-4 text-gray-500 transform rotate-45" />
                  </div>
                  <input 
                    type="date"
                    value={format(departureDate, "yyyy-MM-dd")}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={handleDepartureDateChange}
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Return date */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Return date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <PlaneIcon className="h-4 w-4 text-gray-500 transform -rotate-45" />
                  </div>
                  <input 
                    type="date"
                    value={format(returnDate, "yyyy-MM-dd")}
                    min={format(departureDate, "yyyy-MM-dd")}
                    onChange={handleReturnDateChange}
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Origin select */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Flying from</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Home className="h-4 w-4 text-gray-500" />
                  </div>
                  <select 
                    value={origin}
                    onChange={handleOriginChange}
                    className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {origins.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Search button */}
              <button 
                onClick={handleSearch}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded flex items-center justify-center"
              >
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="container mx-auto px-4 mt-3">
        <div className="max-w-5xl mx-auto text-center text-[11px] text-gray-500 flex flex-wrap items-center justify-center">
          <span>✓ Avg. 67% saving</span>
          <span className="mx-2">•</span>
          <span>17,842 quotes generated</span>
          <span className="mx-2">•</span>
          <span>Data fully encrypted</span>
        </div>
        
        {/* Popular Clinics Section */}
        <div className="mt-12 max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Popular Clinics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Clinic cards would go here */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
              <h3 className="font-medium">Istanbul Dental Clinic</h3>
              <p className="text-sm text-gray-500">Top-rated facility in Istanbul</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
              <h3 className="font-medium">DentSpa Turkey</h3>
              <p className="text-sm text-gray-500">Luxury dental experience</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
              <h3 className="font-medium">Beyaz Ada Clinic</h3>
              <p className="text-sm text-gray-500">Specialized implant procedures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSimple;