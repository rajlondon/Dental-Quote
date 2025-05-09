import React from 'react';
import { Link } from 'wouter';
import { useNavigate } from 'wouter';
import { DiscountType, PromoType } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Percent, Clock, ArrowRight } from 'lucide-react';
import { usePromoStore } from '@/features/promo/usePromoStore';
import { formatCurrency } from '@/lib/utils';

interface PromoCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  promoType: PromoType;
  discountType: DiscountType;
  discountValue: number;
  heroImageUrl?: string;
  endDate: string;
  className?: string;
}

export function PromoCard({
  id,
  slug,
  title,
  description,
  promoType,
  discountType,
  discountValue,
  heroImageUrl,
  endDate,
  className = '',
}: PromoCardProps) {
  const [location, navigate] = useLocation();
  const { setPromoSlug } = usePromoStore();
  
  const handlePromoClick = () => {
    setPromoSlug(slug);
    navigate('/your-quote?promo=' + slug);
  };
  
  const formatTimeRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return 'Expired';
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return `${Math.floor(diffDays / 30)} months left`;
    }
    
    if (diffDays > 1) {
      return `${diffDays} days left`;
    }
    
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${diffHours} hours left`;
  };
  
  const discountLabel = discountType === DiscountType.PERCENT
    ? `${discountValue}%`
    : formatCurrency(discountValue);
    
  const promoIcon = promoType === PromoType.PACKAGE
    ? <Tag className="h-4 w-4" />
    : <Percent className="h-4 w-4" />;
    
  const badgeLabel = promoType === PromoType.PACKAGE
    ? 'Package Deal'
    : 'Special Offer';
    
  const imageSrc = heroImageUrl || 'https://via.placeholder.com/400x200?text=Special+Offer';
  
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all ${className}`}>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {heroImageUrl ? (
          <img 
            src={heroImageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 bg-white/80 p-3 rounded-full inline-flex">
                {promoType === PromoType.PACKAGE
                  ? <Tag className="h-8 w-8 text-primary" />
                  : <Percent className="h-8 w-8 text-primary" />
                }
              </div>
              <h3 className="font-semibold text-gray-800 px-6">
                {title}
              </h3>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-white hover:bg-primary/90">
            <span className="flex items-center gap-1">
              {promoIcon}
              {badgeLabel}
            </span>
          </Badge>
        </div>
        
        {endDate && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-white/80 text-gray-800 border-none">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeRemaining(endDate)}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-base font-semibold bg-primary/10 text-primary hover:bg-primary/20">
            Save {discountLabel}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handlePromoClick} 
          className="w-full group"
        >
          Get Your Quote
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}