import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "wouter";
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
  const [selectedCity, setSelectedCity] = useState("Istanbul");
  const [selectedOrigin, setSelectedOrigin] = useState("United Kingdom");
  const [selectedTreatment, setSelectedTreatment] = useState("Dental Implants");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 14));
  
  // Dropdown visibility states
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isTreatmentsOpen, setIsTreatmentsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isReturnDatePickerOpen, setIsReturnDatePickerOpen] = useState(false);
  
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
      {/* Main content with dark blue background - exactly like Booking.com */}
      <div className="bg-[#003b95] pb-8 pt-8">
        <div className="container mx-auto px-4">
          {/* Service navigation tabs - Booking.com style */}
          <div className="flex items-center space-x-6 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0">
            <Link href="/dental-implants" className="flex items-center text-white opacity-90 hover:opacity-100 whitespace-nowrap border-b-2 border-white pb-2 px-1 text-sm font-medium">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 20.668v-6.667M17 20.668v-6.667M7 14.001h10M12 7.334v6.667M9.5 3.334C9.5 2.597 10.12 2 10.888 2h2.224c.768 0 1.388.597 1.388 1.334 0 .736-.62 1.333-1.388 1.333h-2.224c-.768 0-1.388-.597-1.388-1.333z" />
              </svg>
              Dental Implants
            </Link>
            <Link href="/veneers" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12c0-3.771 0-5.657 1.172-6.828C4.343 4 6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172C22 6.343 22 8.229 22 12c0 3.771 0 5.657-1.172 6.828C19.657 20 17.771 20 14 20h-4c-3.771 0-5.657 0-6.828-1.172C2 17.657 2 15.771 2 12z" />
                <path d="M12 4v16" />
              </svg>
              Veneers & Crowns
            </Link>
            <Link href="/hollywood-smile" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7.5 12c0 1-1.795 2-4 2-1 0-1.5-.5-1.5-1.5S2 9.962 2 8.5C2 4.962 4.5 3 7.5 3s4.5 2 4.5 4.5M16.5 12c0 1 1.795 2 4 2 1 0 1.5-.5 1.5-1.5s0-2.538 0-4C22 4.962 19.5 3 16.5 3s-4.5 2-4.5 4.5M21 16c-.5 1.5-2.477 3-5.5 3-2.5 0-4.5-1.105-5.5-3-1 1.895-3 3-5.5 3-3.023 0-5-1.5-5.5-3" />
              </svg>
              Hollywood Smile
            </Link>
            <Link href="/full-mouth" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19v-1a4 4 0 00-4-4h-1M2 19v-1a4 4 0 014-4h1M13 5a4 4 0 11-8 0 4 4 0 018 0zm9 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Full Mouth Reconstruction
            </Link>
          </div>
          
          {/* Heading Section */}
          <div className="mb-8">
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
              Get your World-Class Smile at Local Prices.
            </h1>
            <p className="text-white text-sm md:text-base">
              Book and compare accredited clinics abroad, save up to 70%, and manage every detail in one secure portal.
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
              
              {/* Search Button - Booking.com style */}
              <div className="flex items-center px-2">
                <button 
                  onClick={handleSearch}
                  className="bg-[#0071c2] hover:bg-[#00487a] text-white font-bold px-6 py-3 h-full rounded flex items-center justify-center whitespace-nowrap"
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
              
              {/* Search Button - Booking.com style */}
              <div className="p-3">
                <button 
                  onClick={handleSearch}
                  className="w-full bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-3 rounded flex items-center justify-center"
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
        
        {/* Special Offers Section - Booking.com style */}
        <div className="max-w-5xl mx-auto mt-8">
          <h2 className="text-xl font-bold mb-4">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-2/5 bg-blue-50 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Free Consultation Package</h3>
                  <p className="text-sm text-gray-600 mt-1">Book a dental treatment and get free pre-consultation and aftercare support</p>
                </div>
                <a href="/offers/free-consultation" className="mt-4 text-[#0071c2] font-medium text-sm hover:underline">Learn more</a>
              </div>
              <div className="md:w-3/5 p-0">
                <img src="/images/clinics/dentgroup.jpg" alt="Free consultation" className="w-full h-full object-cover" style={{ minHeight: "160px" }} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-2/5 bg-blue-50 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Premium Hotel Deal</h3>
                  <p className="text-sm text-gray-600 mt-1">Save up to 20% on premium hotels with your dental treatment booking</p>
                </div>
                <a href="/offers/hotel-deal" className="mt-4 text-[#0071c2] font-medium text-sm hover:underline">See details</a>
              </div>
              <div className="md:w-3/5 p-0">
                <img src="/images/clinics/premium-clinic.jpg" alt="Hotel deals" className="w-full h-full object-cover" style={{ minHeight: "160px" }} />
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </section>
  );
};

export default Hero;