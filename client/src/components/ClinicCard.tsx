import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MapPin, Star } from 'lucide-react';

interface ClinicInfo {
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
  // Special offer fields
  hasSpecialOffer?: boolean;
  specialOfferDetails?: {
    id: string;
    title: string;
    discountValue: number;
    discountType: 'percentage' | 'fixed_amount';
  };
}

interface ClinicCardProps {
  clinic: ClinicInfo;
  isSelected?: boolean;
  onSelect?: () => void;
  onWhatsApp?: () => void;
  className?: string;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  isSelected = false,
  onSelect,
  onWhatsApp,
  className = ''
}) => {
  // Determine tier badge color
  const getTierBadgeVariant = () => {
    switch (clinic.tier) {
      case 'premium': return 'default';
      case 'mid': return 'secondary';
      case 'affordable': return 'outline';
      default: return 'default';
    }
  };
  
  // Get the first image or a placeholder
  const mainImage = clinic.images && clinic.images.length > 0 
    ? clinic.images[0] 
    : '/images/clinics/placeholder.jpg';
  
  return (
    <Card className={`overflow-hidden h-full transition-all ${isSelected ? 'border-primary shadow-md' : ''} ${className}`}>
      <CardHeader className="p-0">
        <AspectRatio ratio={16/9}>
          <img 
            src={mainImage} 
            alt={`${clinic.name} clinic`} 
            className="object-cover w-full h-full"
            onError={(e) => {
              // Fallback image on error
              const target = e.target as HTMLImageElement;
              target.src = '/images/clinics/placeholder.jpg';
            }}
          />
          {clinic.hasSpecialOffer && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600">Special Offer</Badge>
            </div>
          )}
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{clinic.name}</CardTitle>
          <Badge variant={getTierBadgeVariant()}>
            {clinic.tier.charAt(0).toUpperCase() + clinic.tier.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center mb-2 text-sm">
          <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
          <span>{clinic.location}</span>
        </div>
        
        <div className="flex items-center mb-4 text-sm">
          <span className="flex items-center mr-2">
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
            {clinic.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">({clinic.reviewCount} reviews)</span>
        </div>
        
        <CardDescription className="mb-4 line-clamp-3">
          {clinic.description}
        </CardDescription>
        
        {clinic.features && clinic.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {clinic.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 border-t flex justify-between">
        {onSelect && (
          <Button 
            onClick={onSelect} 
            variant={isSelected ? "secondary" : "default"}
            className="mr-2 flex-1"
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : (
              'Select Clinic'
            )}
          </Button>
        )}
        
        {onWhatsApp && (
          <Button 
            onClick={onWhatsApp}
            variant="outline" 
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
          >
            WhatsApp
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClinicCard;