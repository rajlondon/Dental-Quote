import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  Plane as PlaneIcon, 
  ArrowRight, 
  MapPin,
  Calendar,
  Search,
  Home,
  Stethoscope
} from "lucide-react";
import { format, addDays } from "date-fns";

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  // Search form state
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isTreatmentsOpen, setIsTreatmentsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isReturnDatePickerOpen, setIsReturnDatePickerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Istanbul");
  const [selectedOrigin, setSelectedOrigin] = useState("United Kingdom");
  const [selectedTreatment, setSelectedTreatment] = useState("Dental Implants");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 14));
  
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
  
  // Treatment dropdown options
  const treatmentOptions = [
    { value: "dental-implants", label: "Dental Implants" },
    { value: "veneers", label: "Veneers & Crowns" },
    { value: "hollywood-smile", label: "Hollywood Smile" },
    { value: "full-mouth", label: "Full Mouth Reconstruction" },
    { value: "whitening", label: "Teeth Whitening" },
    { value: "root-canal", label: "Root Canal Treatment" },
    { value: "dentures", label: "Dentures" },
    { value: "general", label: "General Dentistry" }
  ];
  
  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsDestinationOpen(false);
    setIsFromOpen(false);
    setIsTreatmentsOpen(false);
    setIsDatePickerOpen(false);
    setIsReturnDatePickerOpen(false);
  };
  
  // Handle search action
  const handleSearch = () => {
    const selectedTreatmentObj = treatmentOptions.find(t => t.label === selectedTreatment);
    const treatmentValue = selectedTreatmentObj ? selectedTreatmentObj.value : "dental-implants";
    const originObj = originOptions.find(o => o.label === selectedOrigin);
    const originValue = originObj ? originObj.value : "uk";
    
    // Format dates for URL parameters
    const outDateFormatted = format(selectedDate, "yyyy-MM-dd");
    const returnDateFormatted = format(returnDate, "yyyy-MM-dd");
    
    // Use the your-quote page (which exists in our routes) with search parameters
    setLocation(`/your-quote?city=${selectedCity}&treatment=${treatmentValue}&origin=${originValue}&departureDate=${outDateFormatted}&returnDate=${returnDateFormatted}`);
    
    console.log(`Navigating to quote builder with parameters:
      City: ${selectedCity}
      Treatment: ${treatmentValue}
      Origin: ${originValue}
      Departure: ${outDateFormatted}
      Return: ${returnDateFormatted}
    `);
  };
  
  return (
    <section className="relative pb-12 overflow-hidden">
      {/* Main content with blue background - exactly like Booking.com */}
      <div className="bg-primary pb-8 pt-8">
        <div className="container mx-auto px-4">
          {/* Heading Section - Booking.com style */}
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
              Find your cheaper dental treatment abroad
            </h1>
            <p className="text-white text-sm mb-6">
              Search for quality, experienced dental clinics and all-inclusive dental packages
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
              
              {/* Treatment field */}
              <div className="relative flex-1 border-r border-gray-200">
                <div 
                  className="flex items-center w-full h-full px-3 py-3 cursor-pointer"
                  onClick={() => {
                    setIsTreatmentsOpen(!isTreatmentsOpen);
                    setIsFromOpen(false);
                    setIsDestinationOpen(false);
                  }}
                >
                  <Stethoscope className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Treatment type</div>
                    <div className="text-base truncate">{selectedTreatment}</div>
                  </div>
                </div>
                
                {/* Dropdown for treatments */}
                {isTreatmentsOpen && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 border border-gray-200 rounded-b-lg">
                    <div className="p-2">
                      {treatmentOptions.map((treatment) => (
                        <div 
                          key={treatment.value} 
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                          onClick={() => {
                            setSelectedTreatment(treatment.label);
                            setIsTreatmentsOpen(false);
                          }}
                        >
                          <Stethoscope className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{treatment.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fly out date field */}
              <div className="relative flex-1 border-r border-gray-200">
                <div 
                  className="flex items-center w-full h-full px-3 py-3 cursor-pointer"
                  onClick={() => {
                    setIsDatePickerOpen(!isDatePickerOpen);
                    setIsFromOpen(false);
                    setIsDestinationOpen(false);
                    setIsTreatmentsOpen(false);
                    setIsReturnDatePickerOpen(false);
                  }}
                >
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 transform rotate-45" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Fly out date</div>
                    <div className="text-base">{format(selectedDate, "EEE dd MMM yyyy")}</div>
                  </div>
                </div>
                
                {/* Date picker dropdown */}
                {isDatePickerOpen && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 border border-gray-200 rounded-b-lg">
                    <div className="p-3">
                      <h4 className="text-sm font-medium mb-2">Select departure date:</h4>
                      <div className="grid grid-cols-4 gap-1">
                        {[...Array(12)].map((_, index) => {
                          const date = addDays(new Date(), index * 7);
                          return (
                            <div 
                              key={index}
                              className="p-1 hover:bg-blue-50 rounded cursor-pointer text-center border"
                              onClick={() => {
                                setSelectedDate(date);
                                setReturnDate(addDays(date, 14));
                                setIsDatePickerOpen(false);
                              }}
                            >
                              <div className="text-xs text-gray-500">{format(date, "EEE")}</div>
                              <div className="text-xs font-medium">{format(date, "dd MMM")}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Return date field */}
              <div className="relative flex-1 border-r border-gray-200">
                <div 
                  className="flex items-center w-full h-full px-3 py-3 cursor-pointer"
                  onClick={() => {
                    setIsReturnDatePickerOpen(!isReturnDatePickerOpen);
                    setIsDatePickerOpen(false);
                    setIsFromOpen(false);
                    setIsDestinationOpen(false);
                    setIsTreatmentsOpen(false);
                  }}
                >
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 transform -rotate-45" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Return date</div>
                    <div className="text-base">{format(returnDate, "EEE dd MMM yyyy")}</div>
                  </div>
                </div>
                
                {/* Return date picker dropdown */}
                {isReturnDatePickerOpen && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 border border-gray-200 rounded-b-lg">
                    <div className="p-3">
                      <h4 className="text-sm font-medium mb-2">Select return date:</h4>
                      <div className="grid grid-cols-4 gap-1">
                        {[...Array(12)].map((_, index) => {
                          const date = addDays(selectedDate, index * 3 + 1);
                          return (
                            <div 
                              key={index}
                              className="p-1 hover:bg-blue-50 rounded cursor-pointer text-center border"
                              onClick={() => {
                                setReturnDate(date);
                                setIsReturnDatePickerOpen(false);
                              }}
                            >
                              <div className="text-xs text-gray-500">{format(date, "EEE")}</div>
                              <div className="text-xs font-medium">{format(date, "dd MMM")}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
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
                <button 
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-5 py-3 h-full rounded flex items-center justify-center whitespace-nowrap"
                >
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
                {/* Treatment type */}
                <div 
                  className="flex items-center px-3 py-3 border-b border-gray-200 cursor-pointer"
                  onClick={() => {
                    setIsTreatmentsOpen(!isTreatmentsOpen);
                    setIsFromOpen(false);
                    setIsDestinationOpen(false);
                  }}
                >
                  <Stethoscope className="h-5 w-5 text-gray-500 mr-3" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Treatment type</div>
                    <div className="text-base">{selectedTreatment}</div>
                  </div>
                </div>
                
                {/* Dropdown for treatments */}
                {isTreatmentsOpen && (
                  <div className="border-b border-gray-200 bg-gray-50">
                    <div className="p-2">
                      {treatmentOptions.map((treatment) => (
                        <div 
                          key={treatment.value} 
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                          onClick={() => {
                            setSelectedTreatment(treatment.label);
                            setIsTreatmentsOpen(false);
                          }}
                        >
                          <Stethoscope className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{treatment.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fly out date */}
                <div 
                  className="flex items-center px-3 py-3 border-b border-gray-200 cursor-pointer"
                  onClick={() => {
                    setIsDatePickerOpen(!isDatePickerOpen);
                    setIsFromOpen(false);
                    setIsDestinationOpen(false);
                    setIsTreatmentsOpen(false);
                    setIsReturnDatePickerOpen(false);
                  }}
                >
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 transform rotate-45" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Fly out date</div>
                    <div className="text-base">{format(selectedDate, "EEE dd MMM yyyy")}</div>
                  </div>
                </div>
                
                {/* Date picker for mobile */}
                {isDatePickerOpen && (
                  <div className="border-b border-gray-200 bg-gray-50">
                    <div className="p-3">
                      <h4 className="text-sm font-medium mb-2">Select departure date:</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {[...Array(9)].map((_, index) => {
                          const date = addDays(new Date(), index * 7);
                          return (
                            <div 
                              key={index}
                              className="p-1 hover:bg-blue-50 rounded cursor-pointer text-center border"
                              onClick={() => {
                                setSelectedDate(date);
                                setReturnDate(addDays(date, 14));
                                setIsDatePickerOpen(false);
                              }}
                            >
                              <div className="text-xs text-gray-500">{format(date, "EEE")}</div>
                              <div className="text-xs font-medium">{format(date, "dd MMM")}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Fly home date */}
                <div 
                  className="flex items-center px-3 py-3 border-b border-gray-200 cursor-pointer"
                  onClick={() => {
                    setIsReturnDatePickerOpen(!isReturnDatePickerOpen);
                    setIsDatePickerOpen(false);
                    setIsFromOpen(false);
                    setIsDestinationOpen(false);
                    setIsTreatmentsOpen(false);
                  }}
                >
                  <PlaneIcon className="h-5 w-5 text-gray-500 mr-3 transform -rotate-45" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Fly home date</div>
                    <div className="text-base">{format(returnDate, "EEE dd MMM yyyy")}</div>
                  </div>
                </div>
                
                {/* Return date picker for mobile */}
                {isReturnDatePickerOpen && (
                  <div className="border-b border-gray-200 bg-gray-50">
                    <div className="p-3">
                      <h4 className="text-sm font-medium mb-2">Select return date:</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {[...Array(9)].map((_, index) => {
                          const date = addDays(selectedDate, index * 3 + 1);
                          return (
                            <div 
                              key={index}
                              className="p-1 hover:bg-blue-50 rounded cursor-pointer text-center border"
                              onClick={() => {
                                setReturnDate(date);
                                setIsReturnDatePickerOpen(false);
                              }}
                            >
                              <div className="text-xs text-gray-500">{format(date, "EEE")}</div>
                              <div className="text-xs font-medium">{format(date, "dd MMM")}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
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