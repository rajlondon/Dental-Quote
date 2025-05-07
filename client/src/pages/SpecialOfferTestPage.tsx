import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreatmentItem } from '@/services/specialOfferService';
import SpecialOfferPanel from '@/components/specialOffers/SpecialOfferPanel';
import { useToast } from "@/hooks/use-toast";

// Mock treatment data for testing
const mockTreatments: TreatmentItem[] = [
  { id: '1', name: 'Dental Implant', category: 'Implants', quantity: 1, priceGBP: 450 },
  { id: '2', name: 'Porcelain Crown', category: 'Crowns', quantity: 1, priceGBP: 180 },
  { id: '3', name: 'Teeth Whitening', category: 'Cosmetic', quantity: 1, priceGBP: 120 }
];

export default function SpecialOfferTestPage() {
  const [clinicId, setClinicId] = useState<number>(1); // Default to clinic ID 1
  const [treatments, setTreatments] = useState<TreatmentItem[]>(mockTreatments);
  const [discountedTreatments, setDiscountedTreatments] = useState<TreatmentItem[] | null>(null);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const { toast } = useToast();

  // Calculate totals
  const calculateTotal = (items: TreatmentItem[]) => {
    return items.reduce((sum, item) => sum + item.priceGBP, 0);
  };

  const originalTotal = calculateTotal(treatments);
  const discountedTotal = discountedTreatments ? calculateTotal(discountedTreatments) : originalTotal;

  // Handle applying an offer
  const handleApplyOffer = (updatedTreatments: TreatmentItem[], savings: number) => {
    setDiscountedTreatments(updatedTreatments);
    setTotalSavings(savings);
    
    toast({
      title: "Special Offer Applied",
      description: `You've saved £${savings.toFixed(2)}!`,
    });
  };

  // Reset discounts
  const handleResetOffer = () => {
    setDiscountedTreatments(null);
    setTotalSavings(0);
    
    toast({
      title: "Offer Reset",
      description: "Special offer has been removed",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Special Offers Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Adjust settings to test special offers functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clinicId">Clinic ID</Label>
                <Input 
                  id="clinicId" 
                  type="number" 
                  value={clinicId}
                  onChange={(e) => setClinicId(parseInt(e.target.value))}
                  min={1}
                />
              </div>
              
              <div>
                <Label>Current Treatments</Label>
                <div className="border rounded-md p-4 mt-2 space-y-2">
                  {treatments.map((treatment, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>
                        {treatment.name} 
                        {treatment.quantity && treatment.quantity > 1 && ` (x${treatment.quantity})`}
                      </span>
                      <span>£{treatment.priceGBP.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Total:</span>
                    <span>£{originalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {discountedTreatments && (
                <div>
                  <Label>Discounted Treatments</Label>
                  <div className="border rounded-md p-4 mt-2 space-y-2 bg-green-50">
                    {discountedTreatments.map((treatment, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>
                          {treatment.name} 
                          {treatment.quantity && treatment.quantity > 1 && ` (x${treatment.quantity})`}
                        </span>
                        <span>£{treatment.priceGBP.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                      <span>Total:</span>
                      <span>£{discountedTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-green-600 font-bold flex justify-between">
                      <span>You Save:</span>
                      <span>£{totalSavings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {discountedTreatments && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResetOffer}
                >
                  Reset Offer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <SpecialOfferPanel 
          clinicId={clinicId}
          treatments={treatments}
          onApplyOffer={handleApplyOffer}
        />
      </div>
    </div>
  );
}