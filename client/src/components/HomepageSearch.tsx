
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Calendar, MapPin, Search } from 'lucide-react';

const HomepageSearch = () => {
  const [, setLocation] = useLocation();
  const [searchData, setSearchData] = useState({
    city: 'London',
    date: ''
  });

  const cities = [
    'London',
    'Manchester', 
    'Birmingham',
    'Edinburgh',
    'Dublin',
    'Amsterdam',
    'Paris',
    'Berlin',
    'Rome',
    'Madrid'
  ];

  const handleSearch = () => {
    // Navigate to PriceCalculator with pre-filled data
    const params = new URLSearchParams({
      departureCity: searchData.city,
      travelMonth: searchData.date ? new Date(searchData.date).toLocaleString('default', { month: 'long' }) : ''
    });
    
    setLocation(`/pricing?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* City Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Departure City
          </label>
          <select 
            value={searchData.city}
            onChange={(e) => setSearchData({...searchData, city: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Travel Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Travel Date
          </label>
          <input
            type="date"
            value={searchData.date}
            onChange={(e) => setSearchData({...searchData, date: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 opacity-0">Search</label>
          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            Find Treatments
          </button>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
          <span>✅ Save up to 70%</span>
          <span>✅ 500+ verified clinics</span>
          <span>✅ Full support included</span>
          <span>✅ 10-year guarantees</span>
        </div>
      </div>
    </div>
  );
};

export default HomepageSearch;
