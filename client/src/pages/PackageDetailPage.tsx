
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getEducationContent } from "@/data/treatmentEducation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, Coffee, Crown, Hotel, Info, Landmark, MapPin, Plane, Shield, Star, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScrollToTop from "@/components/ScrollToTop";
import axios from "axios";

interface PackageData {
  id: string;
  title: string;
  description: string;
  clinic: {
    id: string;
    name: string;
    location: string;
    image: string;
  };
  hotel: {
    name: string;
    stars: number;
    area: string;
    image: string;
  };
  accommodation: {
    nights: number;
    days: number;
    stars: number;
    description: string;
  };
  treatments: {
    id: string;
    name: string;
    quantity: number;
  }[];
  price: number;
  originalPrice?: number;
  savings?: number;
  duration: string;
  includedServices: {
    hotel: boolean;
    transfers: boolean;
    consultation: boolean;
    cityTour: boolean;
    excursions: boolean;
  };
  excursions: {
    id: string;
    name: string;
    description: string;
    included: boolean;
    duration: string;
    price?: number;
  }[];
  tier: 'bronze' | 'silver' | 'gold';
  promoCode?: string;
  imageUrl?: string;
}

const PackageDetailPage = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        console.log("Fetching package data for ID:", id);
        
        // Try to fetch from treatment packages API first
        const response = await axios.get(`/api/treatment-packages/${id}`);
        
        if (response.data.success && response.data.data) {
          const pkg = response.data.data;
          console.log("Found package data:", pkg);
          
          // Transform the data to match our interface if needed
          const transformedPackage: PackageData = {
            id: pkg.id,
            title: pkg.title,
            description: pkg.description,
            clinic: pkg.clinic || {
              id: pkg.clinicId,
              name: `${pkg.clinicId} Clinic`,
              location: 'Istanbul, Turkey',
              image: '/images/carousel/clinic.png'
            },
            hotel: pkg.hotel || {
              name: 'Premium Hotel',
              stars: 4,
              area: 'Istanbul',
              image: '/images/hotels/standard-hotel.jpg'
            },
            accommodation: pkg.accommodation || {
              nights: 5,
              days: 6,
              stars: 4,
              description: '4-star hotel accommodation'
            },
            treatments: pkg.treatments || [],
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            savings: pkg.savings,
            duration: pkg.duration || '5 days',
            includedServices: pkg.includedServices || {
              hotel: true,
              transfers: true,
              consultation: true,
              cityTour: true,
              excursions: false
            },
            excursions: pkg.excursions || [],
            tier: pkg.tier || 'silver',
            promoCode: pkg.promoCode,
            imageUrl: pkg.imageUrl
          };
          
          setPackageData(transformedPackage);
          document.title = `${pkg.title} - MyDentalFly`;
        } else {
          setError("Package not found");
          document.title = "Package Not Found - MyDentalFly";
        }
      } catch (err) {
        console.error("Error fetching package data:", err);
        setError("Failed to load package data");
        document.title = "Error - MyDentalFly";
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackageData();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Loading Package Details...</h1>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !packageData) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
            <p className="mb-8">{error || "The package you're looking for doesn't exist or may have been removed."}</p>
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Count complimentary excursions
  const complimentaryExcursions = packageData.excursions.filter(exc => exc.included);

  // Tier styles
  const tierStyles = {
    bronze: "bg-amber-100 text-amber-800 border-amber-200",
    silver: "bg-slate-100 text-slate-800 border-slate-200",
    gold: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  return (
    <>
      <ScrollToTop />
      <Navbar />

      <div className="container mx-auto py-8 px-4 bg-white min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <a href="/#packages" className="hover:text-primary">Packages</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-700">{packageData.title}</span>
        </div>

        {/* Package header section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-lg overflow-hidden h-[300px] shadow-md">
              <img 
                src={packageData.imageUrl || `/images/packages/${packageData.id}.png`} 
                alt={packageData.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${tierStyles[packageData.tier]} flex items-center gap-1`}>
                <Crown className="h-3 w-3" />
                {packageData.tier.charAt(0).toUpperCase() + packageData.tier.slice(1)} Package
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {packageData.duration}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-4">{packageData.title}</h1>

            <p className="text-gray-700 mb-6">{packageData.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-primary mr-2" />
                    Clinic Details
                  </h3>

                  <div className="mb-2">
                    <div className="font-medium">{packageData.clinic.name}</div>
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {packageData.clinic.location}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Hotel className="h-5 w-5 text-primary mr-2" />
                    Hotel Accommodation
                  </h3>

                  <div className="mb-2">
                    <div className="font-medium">{packageData.hotel.name}</div>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-2">
                        {[...Array(packageData.hotel.stars)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {packageData.hotel.area}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <h3 className="font-medium mb-3">Treatments Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packageData.treatments.map((treatment, i) => {
                  const educationContent = getEducationContent(treatment.id);
                  return (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <div>
                        <span className="font-medium">{treatment.quantity}x {treatment.name}</span>
                        {educationContent && (
                          <div className="text-sm text-gray-600 mt-1">
                            {educationContent.materials}
                            <div className="text-xs text-green-600 font-medium mt-1">
                              {educationContent.warranty}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg mb-8">
              <h3 className="font-medium mb-4">What's Included in Your Package</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="flex flex-col items-center">
                  <Hotel className={`h-6 w-6 ${packageData.includedServices.hotel ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${packageData.includedServices.hotel ? 'text-gray-700' : 'text-gray-400'}`}>Hotel</span>
                </div>
                <div className="flex flex-col items-center">
                  <Plane className={`h-6 w-6 ${packageData.includedServices.transfers ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${packageData.includedServices.transfers ? 'text-gray-700' : 'text-gray-400'}`}>Transfers</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className={`h-6 w-6 ${packageData.includedServices.consultation ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${packageData.includedServices.consultation ? 'text-gray-700' : 'text-gray-400'}`}>Consultation</span>
                </div>
                <div className="flex flex-col items-center">
                  <Landmark className={`h-6 w-6 ${packageData.includedServices.cityTour ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${packageData.includedServices.cityTour ? 'text-gray-700' : 'text-gray-400'}`}>City Tour</span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className={`h-6 w-6 ${packageData.includedServices.excursions ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${packageData.includedServices.excursions ? 'text-gray-700' : 'text-gray-400'}`}>Excursions</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Complete Package</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-primary">£{packageData.price}</span>
                    {packageData.savings && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Save £{packageData.savings}
                      </Badge>
                    )}
                  </div>
                  {packageData.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mt-1">
                      UK Equivalent: £{packageData.originalPrice}
                    </div>
                  )}
                </div>

                <div className="border-t border-b py-4 mb-4">
                  {complimentaryExcursions.length > 0 ? (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-1 text-blue-500" />
                        {complimentaryExcursions.length} Complimentary Excursion{complimentaryExcursions.length > 1 ? 's' : ''}
                      </div>
                      <ul className="space-y-1">
                        {complimentaryExcursions.map(exc => (
                          <li key={exc.id} className="text-sm flex items-center">
                            <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                            <span>{exc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-3">
                      Optional excursions available for additional fees
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="h-4 w-4 mr-1.5 text-gray-500" />
                    <span>Includes all dental treatments and consultations</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      // Store package data in session storage
                      if (packageData.promoCode) {
                        sessionStorage.setItem('pendingPromoCode', packageData.promoCode);
                      }
                      
                      // Store complete package data
                      sessionStorage.setItem('pendingPackageData', JSON.stringify(packageData));
                      
                      // Store clinic ID for filtering
                      if (packageData.clinic?.id) {
                        sessionStorage.setItem('pendingPromoCodeClinicId', packageData.clinic.id);
                      }
                      
                      // Convert package treatments to treatment plan format with proper structure
                      const treatmentPlanData = packageData.treatments.map(treatment => ({
                        id: treatment.id,
                        treatmentName: treatment.name,
                        name: treatment.name, // Add name field for compatibility
                        quantity: treatment.quantity,
                        priceGBP: 100, // Temporary price for display
                        subtotalGBP: 100 * treatment.quantity, // Calculate subtotal
                        category: 'cosmetic' // Default category
                      }));
                      
                      // Store treatment plan data with proper structure
                      localStorage.setItem('treatmentPlanData', JSON.stringify({
                        treatments: treatmentPlanData,
                        totalGBP: treatmentPlanData.reduce((sum, t) => sum + t.subtotalGBP, 0),
                        timestamp: new Date().toISOString()
                      }));

                      // Navigate directly to matched clinics page
                      setLocation('/matched-clinics');
                    }}
                  >
                    Select This Package
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Store package data for quote request
                      if (packageData.promoCode) {
                        sessionStorage.setItem('pendingPromoCode', packageData.promoCode);
                      }
                      
                      sessionStorage.setItem('pendingPackageData', JSON.stringify(packageData));
                      
                      if (packageData.clinic?.id) {
                        sessionStorage.setItem('pendingPromoCodeClinicId', packageData.clinic.id);
                      }
                      
                      // Convert treatments for quote with proper structure
                      const treatmentPlanData = packageData.treatments.map(treatment => ({
                        id: treatment.id,
                        treatmentName: treatment.name,
                        name: treatment.name, // Add name field for compatibility
                        quantity: treatment.quantity,
                        priceGBP: 100, // Temporary price for display
                        subtotalGBP: 100 * treatment.quantity, // Calculate subtotal
                        category: 'cosmetic' // Default category
                      }));
                      
                      localStorage.setItem('treatmentPlanData', JSON.stringify({
                        treatments: treatmentPlanData,
                        totalGBP: treatmentPlanData.reduce((sum, t) => sum + t.subtotalGBP, 0),
                        timestamp: new Date().toISOString()
                      }));

                      // Navigate directly to matched clinics for quote
                      setLocation('/matched-clinics');
                    }}
                  >
                    Get Quote Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="treatments" className="mb-16">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto">
            <TabsTrigger value="treatments">Treatment Details</TabsTrigger>
            <TabsTrigger value="excursions">Excursions</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          </TabsList>

          <TabsContent value="treatments" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-medium mb-6">Treatment Education & Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packageData.treatments.map((treatment) => {
                  const educationContent = getEducationContent(treatment.id);
                  return (
                    <Card key={treatment.id} className="p-6">
                      <h4 className="text-lg font-semibold mb-2">{treatment.quantity}x {treatment.name}</h4>
                      {educationContent ? (
                        <div className="space-y-3">
                          <p className="text-gray-700">{educationContent.description}</p>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">Materials & Technology:</h5>
                            <p className="text-sm text-gray-600">{educationContent.materials}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">Process:</h5>
                            <p className="text-sm text-gray-600">{educationContent.process}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">Key Benefits:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {educationContent.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start">
                                  <Check className="h-3.5 w-3.5 text-green-500 mr-1 mt-0.5 shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm font-medium text-green-600">{educationContent.warranty}</span>
                            {educationContent.ukEquivalentPrice && (
                              <span className="text-sm text-gray-500">
                                UK Price: £{educationContent.ukEquivalentPrice * treatment.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">Professional dental treatment with high-quality materials and expert care.</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="excursions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packageData.excursions.map((excursion) => (
                <Card key={excursion.id} className={excursion.included ? 'border-green-200' : ''}>
                  <div className="relative h-48 bg-gray-100">
                    {excursion.included && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Included
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{excursion.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{excursion.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{excursion.duration}</span>
                      {!excursion.included && excursion.price && (
                        <span className="font-medium text-primary">£{excursion.price}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-medium mb-6">Your Treatment Journey</h3>

              <div className="relative pl-8 pb-8 border-l-2 border-gray-200">
                <div className="mb-8 relative">
                  <div className="absolute -left-[25px] bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-lg">Arrival Day</h4>
                  <p className="text-gray-600 mt-2">
                    Arrive at Istanbul Airport where you'll be greeted by our representative. 
                    You'll be transferred to {packageData.hotel.name} for check-in and rest.
                  </p>
                </div>

                <div className="mb-8 relative">
                  <div className="absolute -left-[25px] bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-lg">Initial Consultation</h4>
                  <p className="text-gray-600 mt-2">
                    Visit {packageData.clinic.name} for your comprehensive dental assessment.
                    The dentist will confirm your treatment plan and prepare for the procedures.
                  </p>
                </div>

                <div className="mb-8 relative">
                  <div className="absolute -left-[25px] bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-lg">Treatment Days</h4>
                  <p className="text-gray-600 mt-2">
                    Your dental procedures will be performed over several appointments.
                    Between appointments, enjoy your included excursions and explore Istanbul.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <h4 className="font-medium text-lg">Final Day & Departure</h4>
                  <p className="text-gray-600 mt-2">
                    Final check-up with your dentist to ensure everything is perfect.
                    Transfer to Istanbul Airport for your departure flight.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </>
  );
};

export default PackageDetailPage;
