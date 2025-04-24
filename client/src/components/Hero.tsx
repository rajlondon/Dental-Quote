import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { 
  Plane as PlaneIcon, 
  ArrowRight, 
  MapPin,
  Calendar,
  Search,
  Home
} from "lucide-react";

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  // Search form state
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Istanbul");
  const [selectedOrigin, setSelectedOrigin] = useState("United Kingdom");
  
  // City dropdown options
  const cityOptions = [
    { name: "Istanbul", available: true },
    { name: "Antalya", available: false },
    { name: "Dalaman", available: false },
    { name: "Izmir", available: false }
  ];
  
  // Origin dropdown options
  const originOptions = [
    { value: "uk", label: "United Kingdom" },
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "eu", label: "Europe" },
    { value: "au", label: "Australia" },
    { value: "other", label: "Other" }
  ];
  
  return (
    <section className="relative pb-12 overflow-hidden">
      {/* Main content with blue background - exactly like Booking.com */}
      <div className="bg-primary pb-8 pt-8">
        <div className="container mx-auto px-4">
          {/* Heading Section - Booking.com style */}
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
              Find your dental clinic abroad
            </h1>
            <p className="text-white text-sm mb-6">
              Search for quality, experienced dental clinics and all-inclusive packages
            </p>
          </div>
          
          {/* Yellow-bordered search box - Booking.com style */}
          <div className="max-w-5xl mx-auto">
            {/* Desktop: Horizontal layout for larger screens */}
            <div className="hidden md:flex bg-white rounded-lg border-2 border-yellow-400 overflow-hidden">
              {/* Where field */}
              <div className="relative flex-1 border-r border-gray-200">
                <div 
                  className="flex items-center w-full h-full px-3 py-3 cursor-pointer"
                  onClick={() => {
                    setIsDestinationOpen(!isDestinationOpen);
                    setIsFromOpen(false);
                  }}
                >
                  <Search className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Where are you going?</div>
                    <div className="text-base truncate">{selectedCity}</div>
                  </div>
                </div>
                
                {/* Dropdown for cities */}
                {isDestinationOpen && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 border border-gray-200 rounded-b-lg">
                    <div className="p-2">
                      {cityOptions.map((city) => (
                        <div 
                          key={city.name} 
                          className={`p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center ${!city.available ? 'opacity-60' : ''}`}
                          onClick={() => {
                            if (city.available) {
                              setSelectedCity(city.name);
                              setIsDestinationOpen(false);
                            }
                          }}
                        >
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{city.name}</span>
                          {!city.available && <span className="text-xs ml-2 text-gray-500">(Coming Soon)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fly out date field */}
              <div className="flex-1 border-r border-gray-200">
                <div className="flex items-center w-full h-full px-3 py-3 cursor-pointer">
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 transform rotate-45" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Fly out date</div>
                    <div className="text-base">Thu 24 Jun 2025</div>
                  </div>
                </div>
              </div>
              
              {/* Fly home date field */}
              <div className="flex-1 border-r border-gray-200">
                <div className="flex items-center w-full h-full px-3 py-3 cursor-pointer">
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 transform -rotate-45" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Fly home date</div>
                    <div className="text-base">Fri 11 Jul 2025</div>
                  </div>
                </div>
              </div>
              
              {/* Flying from field */}
              <div className="relative flex-1 border-r border-gray-200">
                <div 
                  className="flex items-center w-full h-full px-3 py-3 cursor-pointer"
                  onClick={() => {
                    setIsFromOpen(!isFromOpen);
                    setIsDestinationOpen(false);
                  }}
                >
                  <Home className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Flying from</div>
                    <div className="text-base truncate">{selectedOrigin}</div>
                  </div>
                </div>
                
                {/* Dropdown for origin */}
                {isFromOpen && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 border border-gray-200 rounded-b-lg">
                    <div className="p-2">
                      {originOptions.map((origin) => (
                        <div 
                          key={origin.value} 
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                          onClick={() => {
                            setSelectedOrigin(origin.label);
                            setIsFromOpen(false);
                          }}
                        >
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{origin.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <div className="flex items-center px-2">
                <button className="bg-primary hover:bg-primary/90 text-white font-medium px-5 py-3 h-full rounded flex items-center justify-center whitespace-nowrap">
                  <span>Search</span>
                </button>
              </div>
            </div>
            
            {/* Mobile: Stacked layout for small screens */}
            <div className="md:hidden bg-white rounded-lg border-2 border-yellow-400 overflow-hidden">
              {/* Where field */}
              <div 
                className="flex items-center px-3 py-3 border-b border-gray-200 cursor-pointer"
                onClick={() => {
                  setIsDestinationOpen(!isDestinationOpen);
                  setIsFromOpen(false);
                }}
              >
                <Search className="h-5 w-5 text-gray-500 mr-3" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Where are you going?</div>
                  <div className="text-base">{selectedCity}</div>
                </div>
              </div>
              
              {/* Dropdown for cities */}
              {isDestinationOpen && (
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="p-2">
                    {cityOptions.map((city) => (
                      <div 
                        key={city.name} 
                        className={`p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center ${!city.available ? 'opacity-60' : ''}`}
                        onClick={() => {
                          if (city.available) {
                            setSelectedCity(city.name);
                            setIsDestinationOpen(false);
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{city.name}</span>
                        {!city.available && <span className="text-xs ml-2 text-gray-500">(Coming Soon)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-0">
                {/* Fly out date */}
                <div className="flex items-center px-3 py-3 border-b border-gray-200">
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 transform rotate-45" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Fly out date</div>
                    <div className="text-base">Thu 24 Jun 2025</div>
                  </div>
                </div>
                
                {/* Fly home date */}
                <div className="flex items-center px-3 py-3 border-b border-gray-200">
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 transform -rotate-45" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Fly home date</div>
                    <div className="text-base">Fri 11 Jul 2025</div>
                  </div>
                </div>
                
                {/* Flying from */}
                <div 
                  className="flex items-center px-3 py-3 border-b border-gray-200 cursor-pointer"
                  onClick={() => {
                    setIsFromOpen(!isFromOpen);
                    setIsDestinationOpen(false);
                  }}
                >
                  <Home className="h-5 w-5 text-gray-500 mr-3" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Flying from</div>
                    <div className="text-base">{selectedOrigin}</div>
                  </div>
                </div>
                
                {/* Dropdown for origin */}
                {isFromOpen && (
                  <div className="border-b border-gray-200 bg-gray-50">
                    <div className="p-2">
                      {originOptions.map((origin) => (
                        <div 
                          key={origin.value} 
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                          onClick={() => {
                            setSelectedOrigin(origin.label);
                            setIsFromOpen(false);
                          }}
                        >
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{origin.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <div className="p-3">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded flex items-center justify-center">
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Micro reassurance line */}
        <div className="max-w-5xl mx-auto mt-3 text-center text-[11px] text-gray-500 flex flex-wrap items-center justify-center">
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

export default Hero;