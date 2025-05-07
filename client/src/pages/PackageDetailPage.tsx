import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trendingPackages, type TrendingPackage, type Excursion } from "@/data/packages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, ChevronRight, Coffee, Crown, Hotel, Info, Landmark, Loader2, MapPin, Plane, Shield, Star, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePackages } from "@/hooks/use-packages";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

// Helper function to format currency
const formatCurrency = (amount: number, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// PackageDetailPage component
const PackageDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [mockedPackageData, setMockedPackageData] = useState<TrendingPackage | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  
  // Convert URL-friendly ID to internal package ID
  // For now, we map 'hollywood-smile-vacation' to our actual ID
  const getInternalPackageId = (urlSlug: string) => {
    const slugToIdMap: Record<string, string> = {
      'hollywood-smile-vacation': 'e53cc92a-596d-4edc-a3f4-b1f31856415e',
      // Add more mappings as needed
    };
    
    return slugToIdMap[urlSlug] || urlSlug;
  };
  
  // Use our packages hook for API data
  const { getPackage, bookPackage } = usePackages();
  const internalPackageId = getInternalPackageId(id || "");
  console.log(`[DEBUG] URL slug: ${id}, mapped to internal ID: ${internalPackageId}`);
  
  const { 
    data: actualPackageData, 
    isLoading, 
    error, 
    refetch 
  } = getPackage(internalPackageId);
  
  // Handle booking a package
  const handleBookPackage = async () => {
    try {
      setIsBooking(true);
  
      // Check if user is logged in
      if (user) {
        // User is logged in, proceed with direct booking
        if (user.role !== "patient") {
          toast({
            title: "Patient Account Required",
            description: "Only patients can book treatment packages",
            variant: "destructive"
          });
          return;
        }
        
        // Call the API to book the package with the internal ID
        const result = await bookPackage.mutateAsync(internalPackageId);
        
        // Redirect to patient portal with the newly booked treatment
        if (result.success) {
          setLocation("/patient/portal");
        }
      } else {
        // If user is not logged in, save package details for later and redirect
        // to the quote flow directly (similar to OfferCard and EnhancedOffersCarousel)
        if (mockedPackageData && actualPackageData) {
          // Prepare package data for session storage
          const packageData = {
            id: internalPackageId,
            title: actualPackageData.name,
            clinicId: actualPackageData.clinicId || "1",
            basePrice: Number(actualPackageData.price) || 0,
            currency: actualPackageData.currency || "USD"
          };
          
          // Save to session storage for later retrieval
          sessionStorage.setItem('pendingPackage', JSON.stringify(packageData));
          sessionStorage.setItem('processingPackage', internalPackageId);
          
          toast({
            title: "Package Selected",
            description: `${actualPackageData.name} will be applied to your quote.`,
            variant: "default",
          });
          
          // Redirect directly to the quote flow without requiring login first
          // Use the same format as PackageCard for consistency
          window.location.href = `/quote?step=start&skipInfo=true&clinicId=${packageData.clinicId}&packageId=${internalPackageId}&source=package`;
          return;
        } else {
          // Fallback to the old redirect method if package data is missing
          toast({
            title: "Package Selected",
            description: "Proceeding to quote creation...",
          });
          
          window.location.href = `/api/public/book-package/${id}`;
          return;
        }
      }
    } catch (error) {
      console.error("Error booking package:", error);
      toast({
        title: "Booking Failed",
        description: (error as Error)?.message || "Failed to book the package",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  // For now, we'll continue to use the mocked data for display formatting,
  // but we fetch the real package data from API for booking
  useEffect(() => {
    // Debug info
    console.log("Package ID from params:", id);
    
    // Find the package by ID from our mocked data for display
    const pkg = trendingPackages.find(p => p.id === id);
    
    if (pkg) {
      setMockedPackageData(pkg);
      document.title = `${pkg.title} - MyDentalFly`;
    } else {
      document.title = "Package Not Found - MyDentalFly";
    }
    
    // Fetch the real data from API
    refetch();
  }, [id, refetch]);
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Loading Package...</h1>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(error as Error)?.message || "Failed to load package data. Please try again later."}
              </AlertDescription>
            </Alert>
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // No package found
  if (!mockedPackageData || !actualPackageData) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
            <p className="mb-8">The package you're looking for doesn't exist or may have been removed.</p>
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
  const complimentaryExcursions = mockedPackageData.excursions.filter(exc => exc.included);
  
  // Tier styles
  const tierStyles = {
    bronze: "bg-amber-100 text-amber-800 border-amber-200",
    silver: "bg-slate-100 text-slate-800 border-slate-200",
    gold: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };
  
  return (
    <>
      <Navbar />
      
      <div className="container mx-auto py-8 px-4 bg-white min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <a href="/#packages" className="hover:text-primary">Packages</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-700">{mockedPackageData.title}</span>
        </div>
      
        {/* Package header section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-lg overflow-hidden h-[300px] shadow-md">
              <img src={`/images/packages/${mockedPackageData.id}.png`} alt={mockedPackageData.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${tierStyles[mockedPackageData.tier]} flex items-center gap-1`}>
                <Crown className="h-3 w-3" />
                {mockedPackageData.tier.charAt(0).toUpperCase() + mockedPackageData.tier.slice(1)} Package
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {mockedPackageData.duration}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{mockedPackageData.title}</h1>
            
            <p className="text-gray-700 mb-6">{mockedPackageData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-primary mr-2" />
                    Clinic Details
                  </h3>
                  
                  <div className="mb-2">
                    <div className="font-medium">{mockedPackageData.clinic.name}</div>
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {mockedPackageData.clinic.location}
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
                    <div className="font-medium">{mockedPackageData.hotel.name}</div>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-2">
                        {[...Array(mockedPackageData.hotel.stars)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {mockedPackageData.hotel.area}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-8">
              <h3 className="font-medium mb-3">Treatments Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockedPackageData.treatments.map((treatment, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{treatment.count}x {treatment.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg mb-8">
              <h3 className="font-medium mb-4">What's Included in Your Package</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="flex flex-col items-center">
                  <Hotel className={`h-6 w-6 ${mockedPackageData.includedServices.hotel ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${mockedPackageData.includedServices.hotel ? 'text-gray-700' : 'text-gray-400'}`}>Hotel</span>
                </div>
                <div className="flex flex-col items-center">
                  <Plane className={`h-6 w-6 ${mockedPackageData.includedServices.transfers ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${mockedPackageData.includedServices.transfers ? 'text-gray-700' : 'text-gray-400'}`}>Transfers</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className={`h-6 w-6 ${mockedPackageData.includedServices.consultation ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${mockedPackageData.includedServices.consultation ? 'text-gray-700' : 'text-gray-400'}`}>Consultation</span>
                </div>
                <div className="flex flex-col items-center">
                  <Landmark className={`h-6 w-6 ${mockedPackageData.includedServices.cityTour ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${mockedPackageData.includedServices.cityTour ? 'text-gray-700' : 'text-gray-400'}`}>City Tour</span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className={`h-6 w-6 ${mockedPackageData.includedServices.excursions ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`text-sm mt-1 ${mockedPackageData.includedServices.excursions ? 'text-gray-700' : 'text-gray-400'}`}>Excursions</span>
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
                    <span className="text-3xl font-bold text-primary">£{mockedPackageData.totalPrice}</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Save £{mockedPackageData.savings}
                    </Badge>
                  </div>
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
                    onClick={handleBookPackage}
                    disabled={isBooking || !actualPackageData}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Book This Package"
                    )}
                  </Button>
                  <Button variant="outline" className="w-full">Request More Information</Button>
                  
                  {/* Real package info from API */}
                  {actualPackageData && (
                    <div className="mt-3 p-3 border border-blue-100 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-800 mb-1">API Package Information:</p>
                      <p className="text-xs text-blue-600 font-medium">{actualPackageData.name}</p>
                      <p className="text-xs text-blue-600">Price: {formatCurrency(Number(actualPackageData.price), actualPackageData.currency || 'GBP')}</p>
                      <p className="text-xs text-blue-600">Clinic: {actualPackageData.clinic?.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Tabs for detailed information */}
        <Tabs defaultValue="excursions" className="mb-16">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto">
            <TabsTrigger value="excursions">Excursions</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="details">Package Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="excursions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockedPackageData.excursions.map((excursion) => (
                <Card key={excursion.id} className={excursion.included ? 'border-green-200' : ''}>
                  <div className="relative h-48 bg-gray-100">
                    {excursion.included && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Included
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {React.cloneElement(excursion.icon as React.ReactElement, {
                        className: "h-12 w-12 text-gray-400"
                      })}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{excursion.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{excursion.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{excursion.duration}</span>
                      {!excursion.included && (
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
                    You'll be transferred to {mockedPackageData.hotel.name} for check-in and rest.
                  </p>
                </div>
                
                <div className="mb-8 relative">
                  <div className="absolute -left-[25px] bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-lg">Initial Consultation</h4>
                  <p className="text-gray-600 mt-2">
                    Visit {mockedPackageData.clinic.name} for your comprehensive dental assessment.
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
          
          <TabsContent value="details" className="mt-6">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Package Includes</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>All dental treatments listed</span>
                    </li>
                    {mockedPackageData.includedServices.hotel && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{mockedPackageData.duration} accommodation at {mockedPackageData.hotel.name}</span>
                      </li>
                    )}
                    {mockedPackageData.includedServices.transfers && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Airport transfers and clinic transportation</span>
                      </li>
                    )}
                    {mockedPackageData.includedServices.consultation && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Initial consultation and follow-up appointments</span>
                      </li>
                    )}
                    {mockedPackageData.includedServices.cityTour && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Guided city tour of Istanbul</span>
                      </li>
                    )}
                    {complimentaryExcursions.length > 0 && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{complimentaryExcursions.length} complimentary excursion{complimentaryExcursions.length > 1 ? 's' : ''}</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Personal treatment coordinator</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>24/7 customer support during your stay</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                  <ul className="space-y-3">
                    <li className="text-sm text-gray-700">
                      <strong className="block mb-1">Payment Terms:</strong>
                      £200 deposit to secure your booking, with the balance payable before treatment begins.
                    </li>
                    <li className="text-sm text-gray-700">
                      <strong className="block mb-1">Cancellation Policy:</strong>
                      Full refund if cancelled more than 14 days before arrival. 50% refund if cancelled 7-14 days before arrival.
                    </li>
                    <li className="text-sm text-gray-700">
                      <strong className="block mb-1">Treatment Warranty:</strong>
                      All dental treatments come with a warranty period provided by the clinic.
                    </li>
                    <li className="text-sm text-gray-700">
                      <strong className="block mb-1">Optional Add-ons:</strong>
                      Additional excursions, room upgrades, and extended stays available upon request.
                    </li>
                  </ul>
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