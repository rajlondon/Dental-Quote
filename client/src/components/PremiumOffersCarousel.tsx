import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { SpecialOffer } from "@shared/specialOffers";

interface PremiumOffersCarouselProps {
  className?: string;
}

const PremiumOffersCarousel: React.FC<PremiumOffersCarouselProps> = ({ className }) => {
  // Fetch special offers from API
  const { data: specialOffers, isLoading } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/special-offers/homepage"],
  });

  const autoplayOptions = {
    delay: 6000,
    rootNode: (emblaRoot: any) => emblaRoot.parentElement,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false
  }, [Autoplay(autoplayOptions)]);

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Return a loading state if offers are still loading
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Tag className="mr-2 h-5 w-5" />
          Special Offers
        </h2>
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // If there are no offers, don't show the section
  if (!specialOffers || specialOffers.length === 0) {
    return null;
  }

  // Custom styling for promotion levels
  const getPromotionStyles = (level: string) => {
    switch (level) {
      case 'premium':
        return {
          badge: "bg-gradient-to-r from-amber-600 to-yellow-500 text-white",
          text: "text-amber-700"
        };
      case 'featured':
        return {
          badge: "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
          text: "text-blue-700"
        };
      default:
        return {
          badge: "bg-gradient-to-r from-slate-600 to-slate-500 text-white",
          text: "text-slate-700"
        };
    }
  };

  return (
    <div className={`mx-auto max-w-5xl mt-12 mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Tag className="mr-2 h-5 w-5" />
        Special Offers
      </h2>
      
      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {specialOffers.map((offer, index) => {
              const styles = getPromotionStyles(offer.promotion_level);
              
              return (
                <div className="flex-[0_0_100%] min-w-0 pl-4 first:pl-0 md:flex-[0_0_50%]" key={offer.id}>
                  <div className="h-full rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative">
                      {/* Offer Image */}
                      <div className="h-48 md:h-56 lg:h-64 w-full overflow-hidden bg-gray-50">
                        <img 
                          src={offer.banner_image || "/images/clinics/offers-placeholder.jpg"} 
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Promotion Level Badge */}
                      <div className={`absolute top-4 left-4 ${styles.badge} px-3 py-1.5 rounded-full text-xs font-semibold`}>
                        {offer.promotion_level.charAt(0).toUpperCase() + offer.promotion_level.slice(1)}
                      </div>
                      
                      {/* Discount Badge */}
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                        {offer.discount_type === 'percentage' 
                          ? `${offer.discount_value}% OFF` 
                          : `$${offer.discount_value} OFF`}
                      </div>
                    </div>
                    
                    {/* Offer Content */}
                    <div className="p-6">
                      <h3 className={`text-xl font-bold mb-2 ${styles.text}`}>{offer.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                      
                      {/* Applicable Treatments */}
                      {offer.applicable_treatments && offer.applicable_treatments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Applicable for:</p>
                          <div className="flex flex-wrap gap-1">
                            {offer.applicable_treatments.map((treatment, i) => (
                              <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {treatment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Date Range & CTA */}
                      <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-gray-100">
                        <div className="text-gray-500">
                          {new Date(offer.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <a 
                          href={`/offers/${offer.id}`} 
                          className="inline-block bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-full px-4 py-1.5 text-sm transition-all duration-200"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <button 
          onClick={scrollPrev} 
          className={`absolute top-1/2 left-3 z-10 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-800 p-2 rounded-full shadow-md transition-all ${!prevBtnEnabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          disabled={!prevBtnEnabled}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button 
          onClick={scrollNext} 
          className={`absolute top-1/2 right-3 z-10 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-800 p-2 rounded-full shadow-md transition-all ${!nextBtnEnabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          disabled={!nextBtnEnabled}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        {/* Dots Indicator */}
        {specialOffers.length > 1 && (
          <div className="flex justify-center mt-4">
            {specialOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 mx-1 rounded-full transition-all ${selectedIndex === index ? 'bg-blue-600 w-4' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumOffersCarousel;