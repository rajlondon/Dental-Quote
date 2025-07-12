import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, CheckCircle, Heart, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock clinic data
const clinics = [
  {
    id: 'maltepe-dental-clinic',
    name: 'Maltepe Dental Clinic',
    location: 'Maltepe, Istanbul',
    rating: 4.8,
    reviews: 342,
    price: 3250,
    originalPrice: 8500,
    savings: 5250,
    image: '/images/clinics/maltepe-dental-clinic/exterior.jpg',
    tier: 'premium',
    specialties: ['Hollywood Smile', 'Dental Implants', 'Veneers'],
    features: ['5-star accommodation', 'VIP transfers', 'English-speaking staff'],
    waitTime: '2-3 weeks'
  },
  {
    id: 'dentgroup-istanbul',
    name: 'DentGroup Istanbul',
    location: 'Şişli, Istanbul',
    rating: 4.7,
    reviews: 289,
    price: 2850,
    originalPrice: 7200,
    savings: 4350,
    image: '/images/clinics/dentgroup-istanbul/exterior.jpg',
    tier: 'standard',
    specialties: ['Cosmetic Dentistry', 'Implants', 'Orthodontics'],
    features: ['4-star hotel', 'Airport pickup', 'Treatment guarantee'],
    waitTime: '1-2 weeks'
  },
  {
    id: 'istanbul-dental-care',
    name: 'Istanbul Dental Care',
    location: 'Beyoğlu, Istanbul',
    rating: 4.6,
    reviews: 156,
    price: 2450,
    originalPrice: 6800,
    savings: 4350,
    image: '/images/clinics/istanbul-dental-care/exterior.jpg',
    tier: 'value',
    specialties: ['General Dentistry', 'Cosmetic Procedures'],
    features: ['3-star hotel', 'City transfers', 'Flexible scheduling'],
    waitTime: '1 week'
  }
];

const MatchedClinicsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSelectClinic = (clinic: any) => {
    // Store selected clinic data
    sessionStorage.setItem('selectedClinic', JSON.stringify(clinic));

    // Show success message
    toast({
      title: "Quote Generated!",
      description: `Getting your quote from ${clinic.name}...`,
      duration: 3000,
    });

    // Navigate to booking or payment page
    setTimeout(() => {
      setLocation('/booking');
    }, 1500);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'value':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Matched Clinics
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've found {clinics.length} clinics that match your treatment requirements and preferences.
          </p>
        </div>

        {/* Clinics Grid */}
        <div className="grid gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Clinic Image */}
                  <div className="relative h-48 md:h-auto">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/clinics/premium-clinic.jpg';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getTierColor(clinic.tier)}>
                        {clinic.tier.charAt(0).toUpperCase() + clinic.tier.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Clinic Details */}
                  <div className="p-6 md:col-span-2">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{clinic.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {clinic.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {clinic.rating} ({clinic.reviews} reviews)
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {clinic.waitTime}
                            </div>
                          </div>

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {clinic.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            £{clinic.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            £{clinic.originalPrice.toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            Save £{clinic.savings.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex-1 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Package Includes:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {clinic.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setLocation(`/clinic/${clinic.id}`);
                          }}
                        >
                          View Details
                        </Button>

                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            toast({
                              title: "Quote Downloaded",
                              description: "Your quote has been downloaded successfully.",
                            });
                          }}
                        >
                          Download Quote
                        </Button>

                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleSelectClinic(clinic)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Get Quote Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No clinics found */}
        {clinics.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clinics Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any clinics that match your specific requirements. Please try adjusting your criteria or contact our support team.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setLocation('/')}>
                  Back to Home
                </Button>
                <Button onClick={() => setLocation('/your-quote')}>
                  Modify Requirements
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedClinicsPage;