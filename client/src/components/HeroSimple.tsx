import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Plane as PlaneIcon, 
  Search
} from "lucide-react";
import { format, addDays } from "date-fns";

// Simple Hero component with minimal interaction
const HeroSimple: React.FC = () => {
  const [, navigate] = useLocation();

  // Simple state for only city and departure date
  const [city, setCity] = useState("Istanbul");
  const [departureDate, setDepartureDate] = useState(new Date());

  // Default values we'll use but not show to the user
  const defaultTreatment = "dental-implants";
  const defaultOrigin = "uk";
  const returnDate = addDays(departureDate, 14);

  // City options with coming soon locations
  const cities = ["Istanbul"];
  const comingSoonCities = ["Antalya (Coming Soon)", "Izmir (Coming Soon)", "Budapest (Coming Soon)", "Dubai (Coming Soon)"];
  const allCities = [...cities, ...comingSoonCities];

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

    // Prevent searching for disabled cities
    if (comingSoonCities.some(c => c === city)) {
      alert("This location is coming soon. Please select Istanbul for now.");
      return;
    }

    // Navigate to quote page with parameters
    navigate(`/your-quote?city=${city}&treatment=${defaultTreatment}&origin=${defaultOrigin}&departureDate=${outDateFormatted}&returnDate=${returnDateFormatted}&travelDate=${outDateFormatted}`);
  };

  return (
    <section className="relative pb-12 overflow-hidden">
      {/* Booking.com style dark blue background */}
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

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
              Get your World-Class Smile at Local Prices.
            </h1>
            <p className="text-white text-sm md:text-base">
              Book and compare accredited clinics abroad, save up to 70%, and manage every detail in one secure portal.
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
                      {/* Active cities */}
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}

                      {/* Add a divider */}
                      <option disabled>──────────</option>

                      {/* Coming soon cities */}
                      {comingSoonCities.map(c => (
                        <option key={c} value={c} disabled className="text-gray-400">{c}</option>
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

              {/* Search button - Booking.com style */}
              <div className="ml-4 flex items-center">
                <button 
                  onClick={handleSearch}
                  className="h-full px-6 bg-[#0071c2] hover:bg-[#00487a] text-white font-bold rounded flex items-center justify-center"
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
                    {/* Active cities */}
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}

                    {/* Add a divider */}
                    <option disabled>──────────</option>

                    {/* Coming soon cities */}
                    {comingSoonCities.map(c => (
                      <option key={c} value={c} disabled className="text-gray-400">{c}</option>
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

              {/* Search button - Booking.com style */}
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

      {/* Trust bar */}
      <div className="container mx-auto px-4 mt-3">
        <div className="max-w-5xl mx-auto text-center text-[11px] text-gray-500 flex flex-wrap items-center justify-center">
          <span className="flex items-center">17k quotes generated</span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            4.5<svg className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500 ml-0.5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg> average clinic rating
          </span>
          <span className="mx-2">•</span>
          <span>Save up to 70%</span>
          <span className="mx-2">•</span>
          <span>Data fully encrypted</span>
        </div>


      </div>
    </section>
  );
};

export default HeroSimple;