import { t } from "@/lib/translate";


import React, { useState, useEffect } from 'react';
// Removed react-i18next
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plane, ExternalLink, Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getFlightEstimateForCity, 
  getCitiesGroupedByCountry, 
  months,
  type CountryWithCities 
} from '@/services/flightEstimatesService';

interface FlightAffiliate {
  name: string;
  logo: string;
  affiliateUrl: string;
  description: string;
  features: string[];
}

const flightAffiliates: FlightAffiliate[] = [
  {
    name: 'Pegasus Airlines',
    logo: '/images/airlines/pegasus-logo.png',
    affiliateUrl: 'https://www.flypgs.com/en?affiliate=mydentalfly',
    description: 'Low-cost airline with excellent connections to Istanbul',
    features: ['Direct flights to Istanbul', 'Competitive prices', 'Good baggage allowance']
  },
  {
    name: 'Turkish Airlines',
    logo: '/images/airlines/turkish-airlines-logo.png', 
    affiliateUrl: 'https://www.turkishairlines.com/?affiliate=mydentalfly',
    description: 'Premium carrier with worldwide connections',
    features: ['Premium service', 'Extensive route network', 'Star Alliance member']
  },
  {
    name: 'Skyscanner',
    logo: '/images/airlines/skyscanner-logo.png',
    affiliateUrl: 'https://www.skyscanner.com/?affiliate=mydentalfly',
    description: 'Compare prices across all airlines',
    features: ['Price comparison', 'Flexible dates', 'Best deals finder']
  }
];

const FlightBookingSection: React.FC = () => {
  // Translation removed
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [citiesData, setCitiesData] = useState<CountryWithCities[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    const data = getCitiesGroupedByCountry();
    setCitiesData(data);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryData = citiesData.find(c => c.country === selectedCountry);
      setAvailableCities(countryData?.cities || []);
      setSelectedCity('');
      setEstimatedPrice(null);
    }
  }, [selectedCountry, citiesData]);

  useEffect(() => {
    if (selectedCity && selectedMonth) {
      const price = getFlightEstimateForCity(selectedCity, selectedMonth);
      setEstimatedPrice(price || null);
    }
  }, [selectedCity, selectedMonth]);

  const handleAffiliateClick = (affiliate: FlightAffiliate) => {
    // Track the click for analytics
    if (window.gtag) {
      window.gtag('event', 'affiliate_click', {
        affiliate_name: affiliate.name,
        source: 'patient_portal_flights',
        departure_city: selectedCity,
        month: selectedMonth
      });
    }
    
    // Open affiliate link in new tab
    window.open(affiliate.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const formatAffiliateUrl = (baseUrl: string) => {
    const params = new URLSearchParams();
    if (selectedCity) params.append('origin', selectedCity);
    if (selectedMonth) params.append('departure_month', selectedMonth);
    params.append('destination', 'Istanbul');
    params.append('utm_source', 'mydentalfly');
    params.append('utm_medium', 'patient_portal');
    params.append('utm_campaign', 'dental_travel');
    
    return `${baseUrl}&${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Plane className="h-6 w-6 mr-2 text-blue-600" />
          {t('portal.flights.title', 'Flight Booking')}
        </h2>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Plane className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          {t('portal.flights.description', 'Find the best flight deals for your dental journey to Istanbul. We partner with trusted airlines to offer you competitive prices.')}
        </AlertDescription>
      </Alert>

      {/* Flight Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {t('portal.flights.search_title', 'Flight Price Estimator')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('portal.flights.departure_country', 'Departure Country')}
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder={t('portal.flights.select_country', 'Select country')} />
                </SelectTrigger>
                <SelectContent>
                  {citiesData.map((country) => (
                    <SelectItem key={country.country} value={country.country}>
                      {country.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('portal.flights.departure_city', 'Departure City')}
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder={t('portal.flights.select_city', 'Select city')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('portal.flights.travel_month', 'Travel Month')}
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder={t('portal.flights.select_month', 'Select month')} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {estimatedPrice && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">
                    {t('portal.flights.estimated_price', 'Estimated Flight Price')}
                  </h3>
                  <p className="text-sm text-green-600">
                    {selectedCity} → Istanbul ({selectedMonth})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    €{estimatedPrice}
                  </div>
                  <div className="text-sm text-green-600">
                    {t('portal.flights.return_flight', 'Return flight')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Airline Partners Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            {t('portal.flights.partners_title', 'Our Flight Partners')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {flightAffiliates.map((affiliate, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Plane className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{affiliate.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {t('portal.flights.partner', 'Partner')}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {affiliate.description}
                </p>
                
                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                  {affiliate.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleAffiliateClick(affiliate)}
                  variant={index === 0 ? 'default' : 'outline'}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('portal.flights.book_now', 'Book Now')}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Travel Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {t('portal.flights.tips_title', 'Flight Booking Tips')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">{t('portal.flights.best_time_title', 'Best Time to Book')}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('portal.flights.tip_1', 'Book 6-8 weeks in advance for best prices')}</li>
                <li>• {t('portal.flights.tip_2', 'Tuesday and Wednesday departures are usually cheaper')}</li>
                <li>• {t('portal.flights.tip_3', 'Avoid peak summer months (July-August) for lower fares')}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">{t('portal.flights.travel_docs_title', 'Travel Documents')}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('portal.flights.tip_4', 'Valid passport required (6+ months validity)')}</li>
                <li>• {t('portal.flights.tip_5', 'EU citizens can stay 90 days visa-free')}</li>
                <li>• {t('portal.flights.tip_6', 'Travel insurance recommended')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightBookingSection;
