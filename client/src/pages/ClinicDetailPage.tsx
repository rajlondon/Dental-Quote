import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  Award, 
  Star, 
  MapPin, 
  User, 
  Check, 
  Clock, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Shield, 
  Plane, 
  Hotel, 
  Car, 
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import WhatsAppButton from "@/components/WhatsAppButton";
import ClinicImageCarousel from "@/components/ClinicImageCarousel";
import { Link } from "wouter";

// Import clinic data
import clinics from "@/data/clinics.json";
import { Sparkles } from "lucide-react";

// Mock treatment categories and pricing for demo purposes
const treatmentCategories = [
  {
    name: "Veneers & Crowns",
    treatments: [
      { name: "Porcelain Veneer", priceRange: "£180 - £250" },
      { name: "Zirconium Crown", priceRange: "£150 - £220" },
      { name: "E-Max Crown", priceRange: "£190 - £260" }
    ]
  },
  {
    name: "Implants",
    treatments: [
      { name: "Dental Implant", priceRange: "£450 - £650" },
      { name: "Sinus Lift", priceRange: "£350 - £500" },
      { name: "Bone Graft", priceRange: "£200 - £400" }
    ]
  },
  {
    name: "Root Canals",
    treatments: [
      { name: "Root Canal Treatment", priceRange: "£90 - £150" },
      { name: "Apicoectomy", priceRange: "£150 - £250" }
    ]
  }
];

const ClinicDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [clinic, setClinic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Fetch clinic data
  useEffect(() => {
    // In a real app, this would be an API call using the clinic ID
    const foundClinic = clinics.find(c => 
      c.id === params.id || 
      c.name.toLowerCase().replace(/\s+/g, '-') === params.id
    );
    
    if (foundClinic) {
      setClinic(foundClinic);
      document.title = `${foundClinic.name} - MyDentalFly`;
    }
    setLoading(false);
  }, [params.id]);

  // Fetch special offers for this clinic
  useEffect(() => {
    if (!clinic) return;
    
    setLoadingOffers(true);
    // Use the clinic ID to fetch special offers
    fetch(`/api/special-offers/clinic/${clinic.id}`)
      .then(response => response.json())
      .then(data => {
        console.log("Clinic special offers:", data);
        setSpecialOffers(data);
      })
      .catch(error => {
        console.error("Error fetching special offers:", error);
        setSpecialOffers([]);
      })
      .finally(() => {
        setLoadingOffers(false);
      });
  }, [clinic]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  if (!clinic) {
    return <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Clinic Not Found</h1>
      <p className="mb-8">Sorry, we couldn't find the clinic you're looking for.</p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>;
  }

  // Determine tier info for styling
  const getTierInfo = (tier: string) => {
    switch(tier) {
      case 'premium':
        return { 
          label: 'Premium Clinic',
          color: 'border-purple-300 text-purple-700 bg-purple-50',
          badge: 'bg-purple-100 text-purple-800'
        };
      case 'standard':
        return { 
          label: 'Standard Clinic', 
          color: 'border-blue-300 text-blue-700 bg-blue-50',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return { 
          label: 'Affordable Clinic', 
          color: 'border-green-300 text-green-700 bg-green-50',
          badge: 'bg-green-100 text-green-800'
        };
    }
  };

  const tierInfo = getTierInfo(clinic.tier);

  return (
    <>
      <Navbar />
      
      <div className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clinics
          </Button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Clinic Header */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{clinic.name}</h1>
                    <Badge className={tierInfo.badge}>{tierInfo.label}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-medium">{clinic.ratings.overall}</span>
                      <span className="ml-1 text-sm text-gray-500">({clinic.ratings.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{clinic.location.area}, {clinic.location.city}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setLocation('/your-quote')}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700 shadow-md px-5 py-6 text-base font-semibold"
                  >
                    Get a Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  

                </div>
              </div>
            </div>
            
            {/* Clinic Showcase */}
            <div className="h-80 bg-gray-200 relative overflow-hidden">
              {/* Using ClinicImageCarousel component for multiple clinic images */}
              <ClinicImageCarousel 
                clinicId={clinic.id} 
                className="h-full w-full"
              />
              
              {/* Overlay with clinic tier badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge 
                  variant="outline" 
                  className={`
                    ${clinic.tier === 'premium' 
                      ? 'bg-amber-500/90 text-white border-amber-400' 
                      : clinic.tier === 'standard' 
                        ? 'bg-blue-500/90 text-white border-blue-400' 
                        : 'bg-green-500/90 text-white border-green-400'
                    } text-sm py-1.5 px-3 font-medium
                  `}
                >
                  {tierInfo.label} Clinic
                </Badge>
              </div>
            </div>
            
            {/* Clinic Details */}
            <div className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="treatments">Treatments</TabsTrigger>
                  <TabsTrigger value="doctors">Doctors</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="facilities">Facilities</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <h2 className="text-xl font-semibold mb-4">About {clinic.name}</h2>
                      <p className="text-gray-700 mb-6">
                        {clinic.description}
                      </p>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-3">Key Highlights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {clinic.features.slice(0, 6).map((feature: string, i: number) => (
                              <div key={i} className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-3">Certifications</h3>
                          <div className="flex flex-wrap gap-2">
                            {clinic.certifications?.map((cert: any, i: number) => (
                              <Badge key={i} variant="outline" className="font-normal">
                                {cert.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-50 rounded-lg p-4 border mb-6">
                        <h3 className="font-medium mb-3">Contact Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-500 mr-2 shrink-0" />
                            <div>
                              <div className="font-medium">Address</div>
                              <div className="text-sm text-gray-600">{clinic.location.address || `${clinic.location.area}, ${clinic.location.city}, Turkey`}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Phone className="h-5 w-5 text-gray-500 mr-2 shrink-0" />
                            <div>
                              <div className="font-medium">Phone</div>
                              <div className="text-sm text-gray-600">{clinic.contact?.phone || "+90 501 234 5678"}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Mail className="h-5 w-5 text-gray-500 mr-2 shrink-0" />
                            <div>
                              <div className="font-medium">Email</div>
                              <div className="text-sm text-gray-600">{clinic.contact?.email || "info@mydentalfly.com"}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Globe className="h-5 w-5 text-gray-500 mr-2 shrink-0" />
                            <div>
                              <div className="font-medium">Website</div>
                              <div className="text-sm text-gray-600">{clinic.contact?.website || "www.mydentalfly.com"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Special Offers Section */}
                      {specialOffers.length > 0 && (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-6">
                          <h3 className="font-medium mb-3 flex items-center">
                            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
                            Special Offers
                          </h3>
                          <div className="space-y-3">
                            {specialOffers.map((offer, index) => (
                              <div key={index} className="bg-white rounded p-3 border border-amber-200">
                                <h4 className="font-medium text-amber-700">{offer.title}</h4>
                                <p className="text-sm text-gray-600 mt-1 mb-2">{offer.description.substring(0, 100)}...</p>
                                <div className="flex justify-between items-center">
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                    {offer.discount_type === 'percentage' ? 
                                      `${offer.discount_value}% Off` : 
                                      `£${offer.discount_value} Off`}
                                  </Badge>
                                  <Button 
                                    variant="link"
                                    size="sm"
                                    className="text-primary p-0"
                                    onClick={() => {
                                      // Store offer data in session storage
                                      sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offer));
                                      // Navigate to quote page
                                      setLocation('/your-quote');
                                    }}
                                  >
                                    Get Quote
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="font-medium mb-3">Opening Hours</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Monday - Friday</span>
                            <span>09:00 - 18:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday</span>
                            <span>10:00 - 16:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>Closed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Services & Packages</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-3">
                          <Plane className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-medium">Airport Transfer</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          Complimentary airport pick-up and drop-off service for all international patients.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-3">
                          <Hotel className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-medium">Hotel Arrangements</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          Assistance with booking accommodations at partner hotels with special rates.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-3">
                          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-medium">Online Consultation</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          Free virtual consultation with our dentists before your visit.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Special Offers Section */}
                  {specialOffers.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        Special Offers
                        <Badge variant="secondary" className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200">
                          {specialOffers.length} Available
                        </Badge>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specialOffers.map((offer) => (
                          <div key={offer.id} className="bg-gradient-to-br from-white to-primary/5 rounded-lg border border-primary/20 overflow-hidden shadow-sm">
                            {offer.banner_image && (
                              <div className="h-40 overflow-hidden relative">
                                <img 
                                  src={offer.banner_image} 
                                  alt={offer.title} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <Badge className="bg-amber-500 text-white border-0">
                                    {offer.discount_type === 'percentage' 
                                      ? `${offer.discount_value}% OFF` 
                                      : `£${offer.discount_value} OFF`}
                                  </Badge>
                                </div>
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="font-semibold text-lg">{offer.title}</h3>
                              <p className="text-sm text-gray-700 mt-1 mb-4">{offer.description}</p>
                              
                              <div className="space-y-3">
                                {offer.applicable_treatments && offer.applicable_treatments.length > 0 && (
                                  <div className="text-sm">
                                    <span className="font-medium">Applicable for: </span>
                                    {offer.applicable_treatments.join(', ')}
                                  </div>
                                )}
                                
                                <div className="text-sm flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>Valid until: {new Date(offer.end_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <Button 
                                  className="w-full"
                                  onClick={() => {
                                    // Save the special offer to session storage for use in quote page
                                    const offerData = {
                                      id: offer.id,
                                      title: offer.title,
                                      clinicId: offer.clinic_id,
                                      discountValue: offer.discount_value,
                                      discountType: offer.discount_type,
                                      applicableTreatment: offer.applicable_treatments?.[0] || ''
                                    };
                                    
                                    sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offerData));
                                    console.log('Saved special offer to session storage:', offerData);
                                    
                                    // Redirect to the quote page
                                    setLocation('/your-quote');
                                  }}
                                >
                                  Use This Offer
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Quote CTA */}
                  <div className="mt-8 bg-primary/5 rounded-lg p-6 border border-primary/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Ready to Get Your Free Quote?</h3>
                        <p className="text-gray-600">
                          Get a personalized treatment plan and pricing from {clinic.name}.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setLocation('/your-quote')}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700 shadow-md px-6 py-6 text-base font-semibold"
                      >
                        Request a Quote
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="treatments">
                  <h2 className="text-xl font-semibold mb-6">Treatments & Pricing</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {treatmentCategories.map((category, i) => (
                      <div key={i} className="bg-white rounded-lg overflow-hidden border">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            {category.treatments.map((treatment, j) => (
                              <div key={j} className="flex justify-between items-center">
                                <span>{treatment.name}</span>
                                <span className="font-medium">{treatment.priceRange}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 md:col-span-2">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Price Guarantee</h3>
                          <p className="text-sm text-gray-700 mt-1">
                            All prices are guaranteed for 3 months from the date of your quote. Prices include all materials, laboratory work, and follow-up appointments.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                      Want to see a complete price list and get a personalized quote?
                    </p>
                    <Button 
                      onClick={() => setLocation('/your-quote')}
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700 shadow-md px-6 py-6 text-base font-semibold"
                    >
                      Get Your Personalized Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="doctors">
                  <h2 className="text-xl font-semibold mb-6">Our Dental Team</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {clinic.doctors?.map((doctor: any, i: number) => (
                      <div key={i} className="bg-white rounded-lg overflow-hidden border">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <User className="h-20 w-20 text-gray-300" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">{doctor.name}</h3>
                          <p className="text-gray-600">{doctor.specialty}</p>
                          
                          <Separator className="my-3" />
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Experience</span>
                              <span className="font-medium">{doctor.experience} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Languages</span>
                              <span className="font-medium">English, Turkish</span>
                            </div>
                            {doctor.education && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Education</span>
                                <span className="font-medium">{doctor.education}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <h2 className="text-xl font-semibold mb-6">Patient Reviews</h2>
                  
                  <div className="bg-white rounded-lg overflow-hidden border p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Overall Rating</h3>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                          <span className="ml-2 font-bold text-lg">{clinic.ratings.overall}</span>
                          <span className="ml-1 text-gray-600">({clinic.ratings.reviews} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Breakdown</div>
                        <div className="space-y-1 mt-1">
                          {Object.entries(clinic.ratings.categories || {
                            "Service": 4.8,
                            "Quality": 4.9,
                            "Value": 4.7
                          }).map(([category, rating]: [string, any]) => (
                            <div key={category} className="flex items-center justify-end">
                              <span className="text-xs mr-2">{category}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {clinic.featuredReviews?.map((review: any, i: number) => (
                      <div key={i} className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">{review.author}</div>
                              <div className="text-xs text-gray-500">{review.date || "March 2025"}</div>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        </div>
                        {review.treatment && (
                          <div className="mb-2">
                            <Badge variant="outline">{review.treatment}</Badge>
                          </div>
                        )}
                        <p className="text-gray-700">{review.text}</p>
                      </div>
                    ))}
                    
                    {(!clinic.featuredReviews || clinic.featuredReviews.length === 0) && (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No reviews available yet</div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="facilities">
                  <h2 className="text-xl font-semibold mb-6">Facilities & Amenities</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-medium mb-4">Clinic Features</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {clinic.features.map((feature: string, i: number) => (
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
                        ]).map((tech: string, i: number) => (
                          <div key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span>{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Patient Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-2">
                          <Globe className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Multilingual Staff</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Our staff speaks English, German, and Turkish to ensure clear communication.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-2">
                          <Plane className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Travel Assistance</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Help with transportation, accommodation and sightseeing arrangements.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-2">
                          <Shield className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Treatment Guarantee</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          All treatments come with a written guarantee for your peace of mind.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ClinicDetailPage;