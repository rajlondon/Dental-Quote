import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  Plane as PlaneIcon, 
  Search
} from "lucide-react";
import { format, addDays } from "date-fns";

// Simple Hero component with minimal interaction
const HeroSimple: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Simple state for only city and departure date
  const [city, setCity] = useState("Istanbul");
  const [departureDate, setDepartureDate] = useState(new Date());
  
  // Default values we'll use but not show to the user
  const defaultTreatment = "dental-implants";
  const defaultOrigin = "uk";
  const returnDate = addDays(departureDate, 14);
  
  // City options - currently only Istanbul
  const cities = ["Istanbul"];
  
  // City select handler
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
  };
  
  // Date change handler
  const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartureDate(new Date(e.target.value));
  };
  
  // Handle search with minimal parameters
  const handleSearch = () => {
    // Format dates for URL
    const outDateFormatted = format(departureDate, "yyyy-MM-dd");
    const returnDateFormatted = format(returnDate, "yyyy-MM-dd");
    
    // Navigate to quote page with parameters
    setLocation(`/your-quote?city=${city}&treatment=${defaultTreatment}&origin=${defaultOrigin}&departureDate=${outDateFormatted}&returnDate=${returnDateFormatted}`);
  };
  
  return (
    <section className="relative pb-12 overflow-hidden">
      {/* Gradient background header - lightened 10% */}
      <div className="bg-gradient-to-r from-primary/90 to-blue-500/90 pb-8 pt-8">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
              Find high-quality dental care abroad for up to 70% less
            </h1>
            <p className="text-white text-sm mb-6">
              Compare vetted Dental clinics & ready-made treatment packages in seconds.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="max-w-5xl mx-auto">
            {/* Desktop: Horizontal form */}
            <div className="hidden md:flex bg-white rounded-lg border-2 border-yellow-400 p-4">
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* City select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Treatment city</label>
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
                
                {/* Departure date */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">When?</label>
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
              </div>
              
              {/* Search button */}
              <div className="ml-4 flex items-center">
                <button 
                  onClick={handleSearch}
                  className="h-full px-6 bg-primary hover:bg-primary/90 text-white font-medium rounded flex items-center justify-center"
                >
                  <span>Search</span>
                </button>
              </div>
            </div>
            
            {/* Mobile: Stacked form */}
            <div className="md:hidden bg-white rounded-lg border-2 border-yellow-400 p-4">
              {/* City select */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Treatment city</label>
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
              
              {/* Departure date */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">When?</label>
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
      
      {/* Trust bar */}
      <div className="container mx-auto px-4 mt-3">
        <div className="max-w-5xl mx-auto text-center text-[11px] text-gray-500 flex flex-wrap items-center justify-center">
          <span className="flex items-center">17k quotes generated</span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            4.9<svg className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500 ml-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg> average clinic rating
          </span>
          <span className="mx-2">•</span>
          <span>Save up to 70%</span>
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