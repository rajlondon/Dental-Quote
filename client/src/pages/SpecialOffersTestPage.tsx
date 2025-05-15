import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SpecialOffersSelector from '@/components/offers/SpecialOffersSelector';
import TreatmentPackageSelector from '@/components/packages/TreatmentPackageSelector';
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
        const response = await fetch('/api/treatments');
        if (response.ok) {
          const data = await response.json();
          setTreatments(data);
        }
      } catch (error) {
        console.error("Error fetching treatments:", error);
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

    const fetchOffers = async () => {
      try {
        setIsLoadingOffers(true);
        const treatmentIds = treatments.map(t => t.id);
        const response = await fetch('/api/quotes-api/available-offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ treatmentIds })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableOffers(data.offers || []);
        } else {
          throw new Error('Failed to fetch special offers');
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        toast({
          title: "Error",
          description: "Failed to load special offers",
          variant: "destructive"
        });
      } finally {
        setIsLoadingOffers(false);
      }
    };

    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const treatmentIds = treatments.map(t => t.id);
        const response = await fetch('/api/quotes-api/available-packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ treatmentIds })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailablePackages(data.packages || []);
        } else {
          throw new Error('Failed to fetch treatment packages');
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast({
          title: "Error",
          description: "Failed to load treatment packages",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchOffers();
    fetchPackages();
  }, [treatments, toast]);

  // Handle special offer selection
  const handleSelectOffer = async (offerId: string) => {
    try {
      const subtotal = treatments.reduce((sum, t) => sum + t.price, 0);
      const response = await fetch(`/api/quotes-api/apply-offer/${offerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          treatments,
          subtotal
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply special offer');
      }
      
      const data = await response.json();
      setSelectedOfferId(offerId);
      
      toast({
        title: "Special Offer Applied",
        description: `Discount amount: £${data.discountAmount.toFixed(2)}`,
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
      const response = await fetch(`/api/quotes-api/apply-package/${packageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTreatments: treatments })
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply treatment package');
      }
      
      const data = await response.json();
      setSelectedPackageId(packageId);
      
      // Update treatments with packaged treatments
      setTreatments(data.packagedTreatments);
      
      toast({
        title: "Package Applied",
        description: `You saved £${data.savings.toFixed(2)}`,
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
              availableOffers={availableOffers}
              onSelectOffer={handleSelectOffer}
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
              availablePackages={availablePackages}
              onSelectPackage={handleSelectPackage}
              selectedPackageId={selectedPackageId}
              isLoading={isLoadingPackages}
              treatmentNames={Object.fromEntries(treatments.map(t => [t.id, t.name]))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}