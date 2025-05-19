import React, { useEffect, useState } from 'react';
import { useLocation, useSearch, useRoute } from 'wouter';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Heart, MapPin, Star, Info, Plane, Calendar, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Clinic {
  id: string;
  name: string;
  logo?: string;
  city: string;
  country: string;
  ratings?: {
    overall: number;
    cleanliness: number;
    staff: number;
    communication: number;
    value: number;
    location: number;
  };
  features?: string[];
  technology?: string[];
  specialties?: string[];
  description?: string;
  doctors?: {
    name: string;
    title: string;
    photo?: string;
    specialties?: string[];
    qualifications?: string[];
  }[];
  treatments?: Record<string, number>;
}

export default function PackageResultsPage() {
  const [_, setLocation] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const { toast } = useToast();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  // Extract parameters from URL
  const packageName = params.get('package') || '';
  const promoCode = params.get('promo') || '';
  const total = params.get('total') ? Number(params.get('total')) : 0;
  const clinicId = params.get('clinicId') || '';
  
  if (!promoCode || !packageName) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Missing Package Information</h1>
          <p className="mb-6">No package or promo code information provided.</p>
          <Button onClick={() => setLocation('/')}>Return to Home Page</Button>
        </div>
      </div>
    );
  }
  
  // Fetch the specific clinic for this package
  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: async () => {
      const res = await axios.get(`/api/clinics/${clinicId}`);
      return res.data;
    },
    enabled: !!clinicId,
  });
  
  // If loading, show a spinner
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4">Loading clinic information...</p>
        </div>
      </div>
    );
  }
  
  // If error, show an error message
  if (error || !clinic) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Clinic</h1>
          <p className="mb-6">There was an error loading the clinic information. Please try again.</p>
          <Button onClick={() => setLocation('/')}>Return to Home Page</Button>
        </div>
      </div>
    );
  }
  
  // Handle select clinic
  const handleSelectClinic = () => {
    // Save the selected clinic in localStorage
    setSelectedClinic(clinic.id);
    localStorage.setItem('selectedClinicId', clinic.id);
    
    // Save package information for use in the portal
    localStorage.setItem('selectedClinicData', JSON.stringify({
      name: clinic.name,
      packageName: packageName,
      promoCode: promoCode,
      totalPrice: total
    }));
    
    // Redirect to the patient portal
    setLocation('/portal');
    
    toast({
      title: "Package Selected",
      description: "Please log in to your patient portal to continue with your booking.",
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setLocation('/')}
        >
          &larr; Back to Home
        </Button>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{packageName}</h1>
            <p className="text-muted-foreground mt-1">
              Special package offer with promo code: <span className="font-medium">{promoCode}</span>
            </p>
          </div>
          <div>
            <Badge className="text-lg py-1.5 px-3 bg-green-100 text-green-800 hover:bg-green-200">
              Package Price: £{total.toLocaleString()}
            </Badge>
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 p-6 bg-primary/5">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                {clinic.logo ? (
                  <img 
                    src={clinic.logo} 
                    alt={clinic.name} 
                    className="h-24 object-contain mx-auto mb-4" 
                  />
                ) : (
                  <Building className="h-24 w-24 text-primary/20 mx-auto mb-4" />
                )}
                
                <h2 className="text-2xl font-bold text-center">{clinic.name}</h2>
                <div className="flex items-center justify-center mt-1 mb-3">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">{clinic.city}, {clinic.country}</span>
                </div>
                
                {clinic.ratings && (
                  <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.round(clinic.ratings.overall) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-2 font-medium">{clinic.ratings.overall.toFixed(1)}/5</span>
                  </div>
                )}
              </div>
              
              {clinic.specialties && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-1">
                    {clinic.specialties.map((specialty, i) => (
                      <Badge variant="outline" key={i} className="bg-primary/5">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {clinic.description && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">
                    {clinic.description}
                  </p>
                </div>
              )}
              
              <div className="mt-auto">
                <Button 
                  className="w-full" 
                  onClick={handleSelectClinic}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Select This Package
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 p-6">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Package Details</h3>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <div>
                        <p className="font-medium">Treatment Duration</p>
                        <p className="text-sm text-muted-foreground">3-5 days clinic visits</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Plane className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <div>
                        <p className="font-medium">Travel Support</p>
                        <p className="text-sm text-muted-foreground">Airport transfers included</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <div>
                        <p className="font-medium">Package Includes</p>
                        <p className="text-sm text-muted-foreground">All treatment costs, consultations, and follow-ups</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Heart className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <div>
                        <p className="font-medium">Patient Care</p>
                        <p className="text-sm text-muted-foreground">Personal coordinator throughout your stay</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized Treatment Breakdown */}
                <div className="mt-8 border rounded-lg overflow-hidden">
                  <div className="bg-primary/5 p-4 border-b">
                    <h4 className="font-semibold">Itemized Package Breakdown</h4>
                  </div>
                  <div className="p-4">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2">Treatment</th>
                          <th className="text-center py-2">Quantity</th>
                          <th className="text-right py-2">Price Per Unit</th>
                          <th className="text-right py-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {clinic.package_treatments && clinic.package_treatments.length > 0 ? (
                          clinic.package_treatments.map((treatment, index) => (
                            <tr key={index} className="hover:bg-muted/50">
                              <td className="py-3">{treatment.name}</td>
                              <td className="text-center py-3">{treatment.quantity || 1}</td>
                              <td className="text-right py-3">£{treatment.price}</td>
                              <td className="text-right py-3">£{(treatment.price * (treatment.quantity || 1)).toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-muted-foreground">
                              No treatment details available
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="border-t">
                        <tr className="bg-muted/20">
                          <td colSpan={3} className="py-3 font-medium">Original Price:</td>
                          <td className="text-right py-3 font-medium">£{params.get('originalPrice') || (total * 1.2).toFixed(0)}</td>
                        </tr>
                        <tr className="bg-green-50">
                          <td colSpan={3} className="py-3 font-semibold text-green-700">Package Price with Promo: {promoCode}</td>
                          <td className="text-right py-3 font-semibold text-green-700">£{total.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-green-100">
                          <td colSpan={3} className="py-3 font-semibold text-green-800">You Save:</td>
                          <td className="text-right py-3 font-semibold text-green-800">
                            £{((params.get('originalPrice') ? parseInt(params.get('originalPrice')!) : (total * 1.2)) - total).toLocaleString()}
                            {' '}
                            ({Math.round(((params.get('originalPrice') ? parseInt(params.get('originalPrice')!) : (total * 1.2)) - total) / 
                              (params.get('originalPrice') ? parseInt(params.get('originalPrice')!) : (total * 1.2)) * 100)}%)
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Tourist Attractions Section */}
              {params.get('attractions') && (
                <div className="mb-8 border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b">
                    <h4 className="font-semibold text-blue-800">Included Tourist Attractions</h4>
                    <p className="text-sm text-blue-600 mt-1">Experience the best of Istanbul while recovering</p>
                  </div>
                  <div className="p-4 grid gap-4 md:grid-cols-2">
                    {JSON.parse(decodeURIComponent(params.get('attractions') || '[]')).map((attraction, index) => (
                      <div key={index} className="border rounded-md p-4 bg-blue-50/30">
                        <h5 className="font-medium">{attraction.name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{attraction.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Value: £{attraction.value}
                          </Badge>
                          {attraction.included && (
                            <Badge className="bg-green-100 text-green-800">
                              Included
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Services Section */}
              {params.get('additionalServices') && (
                <div className="mb-8 border rounded-lg overflow-hidden">
                  <div className="bg-purple-50 p-4 border-b">
                    <h4 className="font-semibold text-purple-800">Additional Services Included</h4>
                  </div>
                  <div className="p-4 grid gap-2">
                    {JSON.parse(decodeURIComponent(params.get('additionalServices') || '[]')).map((service, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-purple-500 mr-2 shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-medium mb-4">Clinic Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(clinic.features || [
                    "International Patient Department",
                    "Multilingual Staff",
                    "Hotel Arrangements",
                    "Free WiFi",
                    "Airport Pickup Service",
                    "Translation Services"
                  ]).map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Technology</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(clinic.technology || [
                    "Digital X-Rays",
                    "3D CBCT Scanner",
                    "CAD/CAM Technology",
                    "Intraoral Scanners",
                    "Laser Dentistry",
                    "Digital Smile Design"
                  ]).map((tech, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Detailed Info Tabs */}
      {clinic.ratings && clinic.doctors && (
        <div className="p-6 bg-white rounded-lg shadow">
          <Tabs defaultValue="ratings">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="ratings">Clinic Ratings</TabsTrigger>
              <TabsTrigger value="doctors">Doctors & Staff</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="before-after">Before & After</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ratings" className="space-y-4">
              <h3 className="text-xl font-bold">Clinic Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Overall:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(clinic.ratings.overall) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{clinic.ratings.overall.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Cleanliness:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(clinic.ratings.cleanliness) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{clinic.ratings.cleanliness.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Staff:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(clinic.ratings.staff) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{clinic.ratings.staff.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Communication:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(clinic.ratings.communication) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{clinic.ratings.communication.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Value:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(clinic.ratings.value) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{clinic.ratings.value.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Location:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(clinic.ratings.location) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2">{clinic.ratings.location.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Patient Reviews</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on 124 verified patient reviews
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    96% of patients recommend this clinic
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="doctors" className="space-y-4">
              <h3 className="text-xl font-bold">Doctors & Staff</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinic.doctors.map((doctor, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted flex items-center justify-center">
                      {doctor.photo ? (
                        <img 
                          src={doctor.photo} 
                          alt={doctor.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary/30">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>{doctor.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {doctor.specialties && doctor.specialties.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {doctor.specialties.map((specialty, j) => (
                              <Badge key={j} variant="outline" className="bg-primary/5">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {doctor.qualifications && doctor.qualifications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Qualifications:</p>
                          <ul className="text-sm">
                            {doctor.qualifications.map((qualification, j) => (
                              <li key={j} className="mb-1">
                                {qualification}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="amenities" className="space-y-4">
              <h3 className="text-xl font-bold">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <h4 className="font-medium mb-3">Clinic Amenities</h4>
                  <ul className="space-y-2">
                    {[
                      "Comfortable waiting area with refreshments",
                      "Free WiFi throughout the clinic",
                      "Wheelchair accessible facilities",
                      "Private consultation rooms",
                      "State-of-the-art treatment rooms",
                      "Digital entertainment during procedures"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Travel & Accommodation</h4>
                  <ul className="space-y-2">
                    {[
                      "Airport pickup and drop-off service",
                      "Hotel arrangements at partner establishments",
                      "Transportation to/from clinic appointments",
                      "City tour options for companions",
                      "Multilingual patient coordinators",
                      "Emergency contact available 24/7"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="before-after" className="space-y-4">
              <h3 className="text-xl font-bold">Before & After Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-2">
                      <div className="p-2 border-r">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">Before</span>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">After</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30">
                      <h4 className="font-medium mb-1">Patient Case #{i}</h4>
                      <p className="text-sm text-muted-foreground">
                        Treatment: Full Mouth Restoration
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Button 
          size="lg" 
          onClick={handleSelectClinic}
          className="bg-primary hover:bg-primary/90"
        >
          <Heart className="mr-2 h-5 w-5" />
          Select This Package & Continue
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Proceed to login to your patient portal to continue booking this package
        </p>
      </div>
    </div>
  );
}