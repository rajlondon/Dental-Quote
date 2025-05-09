import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MapPin } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  tier: 'affordable' | 'mid' | 'premium';
  priceGBP: number;
  priceUSD: number;
  location: string;
  rating: number;
  reviewCount: number;
  guarantee: string;
  materials: string[];
  conciergeType: 'mydentalfly' | 'clinic';
  features: string[];
  description: string;
  packages: {
    hotel?: boolean;
    transfers?: boolean;
    consultation?: boolean;
    cityTour?: boolean;
  };
  images: string[];
  hasSpecialOffer?: boolean;
  specialOfferDetails?: {
    id: string;
    title: string;
    discountValue: number;
    discountType: 'percentage' | 'fixed_amount';
  };
}

interface ClinicCardProps {
  clinic: Clinic;
  onSelect?: (clinic: Clinic) => void;
  isSelected?: boolean;
  className?: string;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ 
  clinic, 
  onSelect,
  isSelected = false, 
  className = ''
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(clinic);
    }
  };

  return (
    <Card className={`overflow-hidden ${isSelected ? 'border-primary border-2' : ''} ${className}`}>
      <CardHeader className="p-0">
        <AspectRatio ratio={16/9}>
          <img 
            src={clinic.images[0] || `/images/clinics/${clinic.tier}-clinic-1.jpg`}
            alt={clinic.name} 
            className="object-cover w-full h-full"
          />
          {clinic.hasSpecialOffer && (
            <div className="absolute top-0 right-0 bg-primary text-white px-2 py-1 text-xs font-semibold">
              Special Offer
            </div>
          )}
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{clinic.name}</h3>
          <Badge>{clinic.tier === 'premium' ? 'Premium' : clinic.tier === 'mid' ? 'Standard' : 'Affordable'}</Badge>
        </div>
        <div className="flex items-center mb-2 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{clinic.location}</span>
        </div>
        <div className="flex items-center mb-4 text-sm">
          <span className="flex items-center mr-2">
            <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {clinic.rating}
          </span>
          <span>({clinic.reviewCount} reviews)</span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{clinic.description}</p>
        <div className="flex justify-between">
          <Button onClick={handleSelect} variant={isSelected ? "secondary" : "default"}>
            {isSelected ? 'Selected' : 'Select Clinic'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicCard;