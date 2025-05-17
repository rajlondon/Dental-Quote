import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Timer, Star } from "lucide-react";
import { Link } from 'wouter';
import { CurrencyCode, formatPriceInCurrency } from '@/utils/format-utils';
import TreatmentPackageService, { TreatmentPackage } from '@/services/treatment-package-service';

const SpecialOffersSection: React.FC = () => {
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Fetch featured packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const allPackages = await TreatmentPackageService.getAllPackages();
        // Filter for featured packages
        const featuredPackages = allPackages.filter(pkg => pkg.featured);
        setPackages(featuredPackages.slice(0, 3)); // Show at most 3 packages
      } catch (error) {
        console.error('Error fetching featured packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // For testing when no packages are returned from the API
  useEffect(() => {
    if (!loading && packages.length === 0) {
      // If no real packages were loaded, use these mock packages
      setPackages([
        {
          id: 'pkg-001',
          name: 'Premium Implant Package',
          description: 'Complete implant solution with premium porcelain crown',
          treatments: [
            { id: 'treat-001', name: 'Dental Implant', description: 'Titanium implant placement', price: 850, category: 'implants', quantity: 1 },
            { id: 'treat-002', name: 'Porcelain Crown', description: 'Premium porcelain crown', price: 450, category: 'crowns', quantity: 1 },
            { id: 'treat-003', name: 'Initial Consultation', description: 'Comprehensive examination', price: 100, category: 'consultation', quantity: 1 }
          ],
          additionalServices: [
            { id: 'serv-001', name: 'Airport Transfer', description: 'Round-trip airport transfer', price: 50, included: true, type: 'transport' },
            { id: 'serv-002', name: 'Hotel Booking Assistance', description: 'Help with accommodation booking', price: 0, included: true, type: 'accommodation' }
          ],
          promoCode: 'IMPLANTCROWN30',
          regularPrice: 1500,
          discountedPrice: 1050,
          currency: 'USD',
          featured: true,
          clinicId: 'clinic-001'
        },
        {
          id: 'pkg-002',
          name: 'Smile Makeover Package',
          description: 'Complete smile transformation with veneers and teeth whitening',
          treatments: [
            { id: 'treat-005', name: 'Porcelain Veneer', description: 'Premium porcelain veneer', price: 550, category: 'cosmetic', quantity: 4 },
            { id: 'treat-004', name: 'Professional Teeth Whitening', description: 'In-office laser teeth whitening', price: 400, category: 'cosmetic', quantity: 1 }
          ],
          additionalServices: [
            { id: 'serv-001', name: 'Airport Transfer', description: 'Round-trip airport transfer', price: 50, included: true, type: 'transport' },
            { id: 'serv-003', name: 'Luxury Hotel Stay', description: '3 nights at 5-star hotel', price: 300, included: true, type: 'accommodation' }
          ],
          promoCode: 'LUXHOTEL20',
          regularPrice: 2900,
          discountedPrice: 2320,
          currency: 'USD',
          featured: true,
          clinicId: 'clinic-002'
        },
        {
          id: 'pkg-003',
          name: 'Travel & Treatment Bundle',
          description: 'All-inclusive dental vacation with sightseeing and premium care',
          treatments: [
            { id: 'treat-001', name: 'Dental Implant', description: 'Titanium implant placement', price: 850, category: 'implants', quantity: 2 },
            { id: 'treat-002', name: 'Porcelain Crown', description: 'Premium porcelain crown', price: 450, category: 'crowns', quantity: 2 },
            { id: 'treat-004', name: 'Professional Teeth Whitening', description: 'In-office laser teeth whitening', price: 400, category: 'cosmetic', quantity: 1 }
          ],
          additionalServices: [
            { id: 'serv-004', name: 'VIP Airport Service', description: 'Premium airport transfer and fast-track', price: 100, included: true, type: 'transport' },
            { id: 'serv-005', name: 'Deluxe Hotel Package', description: '5 nights at luxury hotel with spa access', price: 500, included: true, type: 'accommodation' },
            { id: 'serv-006', name: 'Istanbul City Tour', description: 'Guided tour of Istanbul highlights', price: 150, included: true, type: 'tourism' }
          ],
          promoCode: 'LUXTRAVEL',
          regularPrice: 4200,
          discountedPrice: 3360,
          currency: 'USD',
          featured: true,
          clinicId: 'clinic-003'
        }
      ]);
    }
  }, [loading, packages]);

  // Calculate percentage discount
  const calculateDiscount = (regularPrice: number, discountedPrice: number): number => {
    return Math.round(((regularPrice - discountedPrice) / regularPrice) * 100);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-primary/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Special Offers</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Exclusive packages with accommodation, transport, and premium dental care
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] bg-muted rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const discount = calculateDiscount(pkg.regularPrice, pkg.discountedPrice);
              const treatmentCount = pkg.treatments.reduce((count, treatment) => count + (treatment.quantity || 1), 0);
              
              return (
                <Card key={pkg.id} className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <CardHeader className="bg-primary/5 pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Save {discount}%
                      </Badge>
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">Limited time</span>
                      </div>
                    </div>
                    <CardTitle className="mt-2">{pkg.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                      </div>
                      
                      <div className="flex items-center text-2xl font-bold">
                        {formatPriceInCurrency(pkg.discountedPrice, pkg.currency)}
                        <span className="ml-2 text-sm font-normal line-through text-muted-foreground">
                          {formatPriceInCurrency(pkg.regularPrice, pkg.currency)}
                        </span>
                      </div>
                      
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="text-sm">{treatmentCount} treatments included</span>
                        </div>
                        
                        <ul className="space-y-1">
                          {pkg.treatments.map((treatment, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <span className="text-primary mr-1">•</span>
                              <span>
                                {treatment.name}
                                {treatment.quantity && treatment.quantity > 1 ? ` (x${treatment.quantity})` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                        
                        {pkg.additionalServices.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm font-medium mb-1">Included services:</p>
                            <ul className="space-y-1">
                              {pkg.additionalServices
                                .filter(service => service.included)
                                .map((service, index) => (
                                  <li key={index} className="text-sm flex items-start">
                                    <span className="text-green-600 mr-1">✓</span>
                                    <span>{service.name}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/quote-builder?promo=${pkg.promoCode}`} className="w-full">
                      <Button className="w-full">
                        Get This Offer <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecialOffersSection;