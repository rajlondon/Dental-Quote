import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { SpecialOffer } from '../../../shared/schema';

interface OfferSelectionUIProps {
  treatmentId: string;
  clinicId: number;
  currentPrice: number;
  onOfferSelected: (offerId: string | null, discountAmount: number) => void;
  selectedOfferId?: string | null;
}

export const OfferSelectionUI: React.FC<OfferSelectionUIProps> = ({
  treatmentId,
  clinicId,
  currentPrice,
  onOfferSelected,
  selectedOfferId = null
}) => {
  const { getApplicableOffers, applyOfferToTreatment } = useSpecialOffers();
  const [applicableOffers, setApplicableOffers] = useState<SpecialOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(selectedOfferId);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Load applicable offers on component mount
  useEffect(() => {
    const offers = getApplicableOffers(treatmentId, clinicId);
    setApplicableOffers(offers);
    
    // Initialize discount amount if an offer is already selected
    if (selectedOfferId) {
      const discount = applyOfferToTreatment(treatmentId, selectedOfferId);
      setDiscountAmount(discount);
    }
  }, [treatmentId, clinicId, getApplicableOffers, selectedOfferId]);

  const handleOfferChange = (offerId: string) => {
    // Handle "no offer" selection
    if (offerId === "none") {
      setSelectedOffer(null);
      setDiscountAmount(0);
      onOfferSelected(null, 0);
      return;
    }
    
    const discount = applyOfferToTreatment(treatmentId, offerId);
    setSelectedOffer(offerId);
    setDiscountAmount(discount);
    onOfferSelected(offerId, discount);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  // Calculate discount percentage for display
  const calculateDiscountPercentage = (originalPrice: number, discountAmt: number) => {
    if (originalPrice === 0) return 0;
    return Math.round((discountAmt / originalPrice) * 100);
  };

  // Don't render anything if no offers are available
  if (applicableOffers.length === 0) {
    return null;
  }

  return (
    <div className="offer-selection-container space-y-3">
      <Label>Available Special Offers</Label>
      <Select
        value={selectedOffer || "none"}
        onValueChange={handleOfferChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a special offer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No offer</SelectItem>
          {applicableOffers.map((offer) => (
            <SelectItem key={offer.id} value={offer.id}>
              {offer.title} 
              {offer.discountType === 'percentage' 
                ? ` (${offer.discountValue}% off)` 
                : ` (Save ${formatCurrency(Number(offer.discountValue))})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOffer && discountAmount > 0 && (
        <Card className="mt-3 bg-muted/40 border-primary/20">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm font-medium flex justify-between items-center">
              <span>Offer Applied</span>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Save {calculateDiscountPercentage(currentPrice, discountAmount)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex justify-between text-sm">
              <span>Original Price:</span>
              <span className="line-through opacity-70">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold mt-1">
              <span>Discounted Price:</span>
              <span className="text-primary">{formatCurrency(currentPrice - discountAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfferSelectionUI;