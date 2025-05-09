import React from 'react';
import { useNavigate } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Tag, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PromoType, DiscountType } from '@shared/schema';

interface PromoCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  promoType: PromoType;
  discountType: DiscountType;
  discountValue: number;
  heroImageUrl?: string;
  endDate: Date;
  onClick?: () => void;
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
  onClick,
}: PromoCardProps) {
  const navigate = useNavigate();
  const now = new Date();
  const daysRemaining = Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const discountLabel = discountType === DiscountType.PERCENT 
    ? `${discountValue}% off` 
    : `Save ${formatCurrency(discountValue)}`;
    
  const promoTypeLabel = promoType === PromoType.PACKAGE ? 'Package' : 'Special Offer';
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Add promo parameter to URL and navigate to quote builder
      navigate(`/your-quote?promo=${slug}`);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {heroImageUrl && (
        <div 
          className="h-48 bg-cover bg-center relative" 
          style={{ backgroundImage: `url(${heroImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
              {promoTypeLabel}
            </Badge>
            <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-semibold">
              {discountLabel}
            </Badge>
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-amber-600">
          <CalendarClock className="h-4 w-4" />
          {daysRemaining <= 0 ? (
            'Expires today!'
          ) : (
            `${daysRemaining} days remaining`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleClick}>
          Get Your Quote
        </Button>
      </CardFooter>
    </Card>
  );
}