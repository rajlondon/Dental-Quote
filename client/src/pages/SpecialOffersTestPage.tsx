import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpecialOffersSelector } from '@/components/offers/SpecialOffersSelector';
import { TreatmentPackageSelector } from '@/components/packages/TreatmentPackageSelector';
import { SpecialOffer, TreatmentPackage } from '@shared/offer-types';
import { useToast } from '@/hooks/use-toast';

export default function SpecialOffersTestPage() {
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [availableOffers, setAvailableOffers] = useState<SpecialOffer[]>([]);
  const [availablePackages, setAvailablePackages] = useState<TreatmentPackage[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Fetch test treatments
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        // Use mock data directly instead of fetching from API to avoid issues
        const mockTreatments = [
          { id: 'tr-001', name: 'Dental Implant', price: 700, quantity: 1 },
          { id: 'tr-002', name: 'Crown', price: 350, quantity: 1 },
          { id: 'tr-003', name: 'Veneer', price: 300, quantity: 1 },
          { id: 'tr-004', name: 'Root Canal', price: 400, quantity: 1 },
          { id: 'tr-005', name: 'Teeth Whitening', price: 250, quantity: 1 },
        ];
        
        setTreatments(mockTreatments);
      } catch (error) {
        console.error("Error setting treatments:", error);
        toast({
          title: "Error",
          description: "Failed to load treatments",
          variant: "destructive"
        });
      }
    };

    fetchTreatments();
  }, [toast]);

  // Fetch available offers and packages when treatments change
  useEffect(() => {
    if (treatments.length === 0) return;

    const loadMockData = async () => {
      try {
        setIsLoadingOffers(true);
        setIsLoadingPackages(true);
        
        // Mock special offers data
        const mockOffers: SpecialOffer[] = [
          {
            id: 'offer-001',
            title: 'Welcome Discount',
            description: '20% off your first treatment',
            clinicId: 'clinic-001',
            discountType: 'percentage',
            discountValue: 20,
            applicableTreatments: ['tr-001', 'tr-002', 'tr-003'],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featuredImage: '/images/offers/welcome-discount.jpg',
            terms: 'Valid for new patients only.'
          },
          {
            id: 'offer-002',
            title: 'Implant Package',
            description: '15% off implant + crown combination',
            clinicId: 'clinic-001',
            discountType: 'percentage',
            discountValue: 15,
            applicableTreatments: ['tr-001', 'tr-002'],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featuredImage: '/images/offers/implant-package.jpg',
            terms: 'Minimum purchase of £1000 required.'
          },
          {
            id: 'offer-003',
            title: 'Smile Makeover',
            description: 'Free teeth whitening with 4+ veneers',
            clinicId: 'clinic-001',
            discountType: 'fixed',
            discountValue: 250, // Fixed discount equal to price of teeth whitening
            applicableTreatments: ['tr-003', 'tr-005'],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featuredImage: '/images/offers/smile-makeover.jpg',
            terms: 'Must purchase 4 or more veneers.'
          }
        ];
        
        // Mock treatment packages data
        const mockPackages: TreatmentPackage[] = [
          {
            id: 'pkg-001',
            title: 'Complete Implant Solution',
            description: 'Dental implant with crown at a bundle price',
            clinicId: 'clinic-001',
            price: 950, // Discounted package price
            savings: 100,
            includedTreatments: [
              { id: 'tr-001', name: 'Dental Implant', quantity: 1, price: 700 },
              { id: 'tr-002', name: 'Porcelain Crown', quantity: 1, price: 350 }
            ],
            additionalPerks: ['Free consultation'],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featuredImage: '/images/packages/implant-solution.jpg'
          },
          {
            id: 'pkg-002',
            title: 'Smile Transformation',
            description: '4 veneers and teeth whitening for a complete smile makeover',
            clinicId: 'clinic-001',
            price: 1250, // Discounted package price
            savings: 200,
            includedTreatments: [
              { id: 'tr-003', name: 'Porcelain Veneer', quantity: 4, price: 300 },
              { id: 'tr-005', name: 'Teeth Whitening', quantity: 1, price: 250 }
            ],
            additionalPerks: ['Free whitening touch-up kit'],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featuredImage: '/images/packages/smile-transformation.jpg'
          },
          {
            id: 'pkg-003',
            title: 'Full Mouth Rehabilitation',
            description: 'Comprehensive treatment package for full mouth restoration',
            clinicId: 'clinic-001',
            price: 2500, // Discounted package price
            savings: 500,
            includedTreatments: [
              { id: 'tr-001', name: 'Dental Implant', quantity: 2, price: 700 },
              { id: 'tr-002', name: 'Porcelain Crown', quantity: 2, price: 350 },
              { id: 'tr-004', name: 'Dental Bridge', quantity: 2, price: 400 }
            ],
            additionalPerks: ['Free hotel stay', 'Airport transfer'],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featuredImage: '/images/packages/full-mouth-rehab.jpg'
          }
        ];
        
        setAvailableOffers(mockOffers);
        setAvailablePackages(mockPackages);
      } catch (error) {
        console.error("Error loading mock data:", error);
        toast({
          title: "Error",
          description: "Failed to load offers and packages",
          variant: "destructive"
        });
      } finally {
        setIsLoadingOffers(false);
        setIsLoadingPackages(false);
      }
    };

    loadMockData();
  }, [treatments, toast]);

  // Handle special offer selection
  const handleSelectOffer = async (offerId: string) => {
    try {
      const selectedOffer = availableOffers.find(offer => offer.id === offerId);
      if (!selectedOffer) {
        throw new Error('Selected offer not found');
      }
      
      setSelectedOfferId(offerId);
      
      // Calculate mock discount based on the selected offer
      const subtotal = treatments.reduce((sum, t) => sum + t.price, 0);
      let discountAmount = 0;
      
      if (selectedOffer.discountType === 'percentage') {
        discountAmount = (subtotal * selectedOffer.discountValue) / 100;
        // Apply a reasonable max discount
        const maxDiscount = 500;
        if (discountAmount > maxDiscount) {
          discountAmount = maxDiscount;
        }
      } else if (selectedOffer.discountType === 'fixed') {
        discountAmount = selectedOffer.discountValue;
      }
      
      toast({
        title: "Special Offer Applied",
        description: `Discount amount: £${discountAmount.toFixed(2)}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error applying offer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply special offer",
        variant: "destructive"
      });
    }
  };

  // Handle treatment package selection
  const handleSelectPackage = async (packageId: string) => {
    try {
      // Find selected package
      const selectedPackage = availablePackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error('Selected package not found');
      }
      
      setSelectedPackageId(packageId);
      
      // Create new treatments array based on the package
      const packagedTreatments = selectedPackage.includedTreatments.map(item => ({
        id: item.treatmentId,
        name: treatments.find(t => t.id === item.treatmentId)?.name || 'Unknown Treatment',
        price: item.standardPrice,
        quantity: item.quantity,
        type: 'treatment' as const
      }));
      
      // Filter out treatments that are part of the package
      const packageTreatmentIds = packagedTreatments.map(t => t.id);
      const nonPackageTreatments = treatments.filter(t => !packageTreatmentIds.includes(t.id));
      
      // Combine both arrays
      setTreatments([...packagedTreatments, ...nonPackageTreatments]);
      
      toast({
        title: "Package Applied",
        description: `You saved £${selectedPackage.savings.toFixed(2)}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error applying package:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply treatment package",
        variant: "destructive"
      });
    }
  };

  // Format treatments for display
  const formatTreatmentList = () => {
    return treatments.map(t => (
      <div key={t.id} className="flex justify-between py-1 border-b">
        <span>{t.name}</span>
        <span>£{t.price.toFixed(2)}</span>
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Special Offers & Treatment Packages Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Treatments</CardTitle>
          </CardHeader>
          <CardContent>
            {treatments.length === 0 ? (
              <p className="text-gray-500">Loading treatments...</p>
            ) : (
              <>
                {formatTreatmentList()}
                <div className="flex justify-between font-bold mt-4 pt-2 border-t">
                  <span>Total</span>
                  <span>£{treatments.reduce((sum, t) => sum + t.price, 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Selected Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedOfferId && (
              <div className="mb-4">
                <h3 className="font-medium">Applied Offer:</h3>
                <p className="text-primary">{availableOffers.find(o => o.id === selectedOfferId)?.title}</p>
              </div>
            )}
            
            {selectedPackageId && (
              <div>
                <h3 className="font-medium">Applied Package:</h3>
                <p className="text-primary">{availablePackages.find(p => p.id === selectedPackageId)?.title}</p>
                <p className="text-sm text-gray-600">
                  {availablePackages.find(p => p.id === selectedPackageId)?.description}
                </p>
              </div>
            )}
            
            {!selectedOfferId && !selectedPackageId && (
              <p className="text-gray-500">No benefits selected yet</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Special Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <SpecialOffersSelector
              offers={availableOffers}
              onChange={(offerId) => handleSelectOffer(offerId || '')}
              selectedOfferId={selectedOfferId}
              isLoading={isLoadingOffers}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommended Treatment Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <TreatmentPackageSelector
              packages={availablePackages}
              onChange={(packageId) => handleSelectPackage(packageId || '')}
              selectedPackageId={selectedPackageId}
              isLoading={isLoadingPackages}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}