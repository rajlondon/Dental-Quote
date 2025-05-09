import React, { useEffect } from 'react';
import { useActivePromos } from '@/features/promo/usePromoApi';
import { PromoCard } from './PromoCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface EnhancedOffersCarouselProps {
  className?: string;
  city?: string;
}

const EnhancedOffersCarousel: React.FC<EnhancedOffersCarouselProps> = ({
  className = '',
  city,
}) => {
  const { data, isLoading, error } = useActivePromos(city);

  if (isLoading) {
    return (
      <div className={`py-10 ${className}`}>
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6">Special Offers</h2>
          <Carousel>
            <CarouselContent>
              {Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="p-1">
                    <div className="h-[350px] rounded-md overflow-hidden bg-gray-100 animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-1/2 mb-6" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    );
  }

  if (error || !data || !data.data || data.data.length === 0) {
    return null;
  }

  return (
    <section className={`py-10 ${className}`}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6">Special Offers</h2>
        <Carousel>
          <CarouselContent>
            {data.data.map((promo) => (
              <CarouselItem key={promo.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="p-1">
                  <PromoCard 
                    id={promo.id}
                    slug={promo.slug}
                    title={promo.title}
                    description={promo.description}
                    promoType={promo.promoType}
                    discountType={promo.discountType}
                    discountValue={promo.discountValue}
                    heroImageUrl={promo.heroImageUrl}
                    endDate={promo.endDate}
                    clinicId={promo.clinics && promo.clinics.length > 0 ? promo.clinics[0].clinicId : undefined}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 sm:left-4 bg-white/80 hover:bg-white border border-gray-200" />
          <CarouselNext className="right-2 sm:right-4 bg-white/80 hover:bg-white border border-gray-200" />
        </Carousel>
      </div>
    </section>
  );
};

export default EnhancedOffersCarousel;