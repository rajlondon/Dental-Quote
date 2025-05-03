import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Clock, ChevronRight, ChevronLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// API response type matching the actual data structure
interface SpecialOffer {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  applicable_treatments?: string[];
  start_date?: string;
  end_date?: string;
  promo_code?: string;
  terms_conditions?: string;
  banner_image?: string;
  is_active?: boolean;
  admin_approved?: boolean;
  commission_percentage?: number;
  promotion_level?: string;
  homepage_display?: boolean;
  created_at?: string;
  updated_at?: string;
  admin_reviewed_at?: string;
}

interface EnhancedOffersCarouselProps {
  className?: string;
}

export default function EnhancedOffersCarousel({ className }: EnhancedOffersCarouselProps) {
  const { data: offers, isLoading, error } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers/homepage'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { toast } = useToast();
  
  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || !offers || offers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === (offers.length - 1) ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [offers, isAutoPlaying]);
  
  // Pause auto-play when hovering
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);
  
  // Handle navigation
  const goToPrevious = () => {
    if (!offers) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? offers.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    if (!offers) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === (offers.length - 1) ? 0 : prevIndex + 1
    );
  };
  
  // Generate dots for navigation
  const renderDots = () => {
    if (!offers) return null;
    
    return (
      <div className="flex justify-center mt-4 space-x-2">
        {offers.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };
  
  // Function to get image URL from the API response
  const getImageUrl = (offer: SpecialOffer) => {
    // Add version parameter to force refresh and prevent caching
    const version = new Date().getTime();
    
    // Use the banner_image from the API if available
    if (offer.banner_image) {
      return `${offer.banner_image}?v=${version}`;
    }
    
    // Fallback image mapping based on offer title
    if (offer.title.toLowerCase().includes('consultation')) {
      return `/images/offers/free-consultation.jpg?v=${version}`;
    } else if (offer.title.toLowerCase().includes('implant')) {
      return `/images/offers/dental-implant-crown-bundle.jpg?v=${version}`;
    } else if (offer.title.toLowerCase().includes('airport') || offer.title.toLowerCase().includes('transfer')) {
      return `/images/offers/luxury-airport-transfer.jpg?v=${version}`;
    } else if (offer.title.toLowerCase().includes('hotel')) {
      return `/images/offers/premium-hotel-deal.jpg?v=${version}`;
    }
    
    // Default fallback
    return `/images/offers/premium-hotel-deal.jpg?v=${version}`;
  };
  
  // Get badge style based on offer promotion level
  const getBadgeStyle = (promotionLevel: string | undefined) => {
    if (!promotionLevel) return 'bg-gradient-to-r from-slate-500 to-slate-400 text-white hover:from-slate-400 hover:to-slate-300';
    
    switch(promotionLevel) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-300 text-amber-950 hover:from-amber-400 hover:to-yellow-200';
      case 'featured':
        return 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:from-blue-400 hover:to-blue-300';
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-400 text-white hover:from-slate-400 hover:to-slate-300';
    }
  };
  
  // Handle booking or quote request
  const handleRequestQuote = (offer: SpecialOffer) => {
    toast({
      title: "Special Offer Selected",
      description: `Your quote will include: ${offer.title}`,
      variant: "default",
    });
    
    // Create searchParams with special offer information
    const offerParams = new URLSearchParams({
      specialOffer: offer.id,
      offerTitle: offer.title,
      offerClinic: offer.clinic_id || '',
      offerDiscount: offer.discount_value ? offer.discount_value.toString() : '0',
      offerDiscountType: offer.discount_type || 'percentage',
      treatment: offer.applicable_treatments && offer.applicable_treatments.length > 0 
        ? offer.applicable_treatments[0] 
        : 'Dental Implants'
    });
    
    // Navigate to quote form with offer details
    window.location.href = `/your-quote?${offerParams.toString()}`;
  };
  
  if (isLoading) {
    return (
      <div className={cn("my-12 py-8 px-4", className)}>
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !offers || offers.length === 0) {
    return (
      <div className={cn("my-12 py-8", className)}>
        <div className="container mx-auto">
          <div className="text-center p-8 bg-slate-50 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Special Offers</h3>
            <p className="text-gray-600">
              Check back soon for exclusive special offers from our partner clinics!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <section 
      className={cn("py-12 bg-gradient-to-br from-slate-100 via-white to-blue-50", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold bg-gradient-to-br from-primary to-blue-700 bg-clip-text text-transparent">
              Special Offers
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Exclusive deals from our premium partner clinics to make your dental journey more affordable.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={goToPrevious}
              aria-label="Previous offer"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={goToNext}
              aria-label="Next offer"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              className={`flex flex-col md:flex-row ${
                index === currentIndex ? 'block' : 'hidden'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={getImageUrl(offer)}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={cn("py-1.5 px-3", getBadgeStyle(offer.promotion_level))}>
                    {offer.promotion_level === 'premium' && <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                    {(offer.promotion_level || 'standard').charAt(0).toUpperCase() + (offer.promotion_level || 'standard').slice(1)}
                  </Badge>
                </div>
                
                {offer.end_date && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {new Date(offer.end_date) > new Date() 
                        ? `Expires in ${Math.ceil((new Date(offer.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                        : 'Limited time offer'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="mb-2">
                  {offer.discount_value && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
                      <Tag className="w-3.5 h-3.5 mr-1" />
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}% OFF`
                        : `$${offer.discount_value} OFF`}
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                <div className="mt-auto space-y-4">
                  {offer.clinic_id && (
                    <div className="flex items-center">
                      <img 
                        src={`/images/clinics/clinic-${offer.clinic_id}.jpg`} 
                        alt="Partner Clinic"
                        className="w-8 h-8 rounded-full mr-3 object-cover" 
                        onError={(e) => {
                          // Fallback image on error
                          e.currentTarget.src = '/images/generic-clinic-logo.svg';
                        }}
                      />
                      <div>
                        <span className="text-sm text-gray-500">Offered by</span>
                        <p className="font-medium">Partner Clinic #{offer.clinic_id}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button 
                      className="px-6" 
                      onClick={() => handleRequestQuote(offer)}
                    >
                      Request Quote
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/clinics/${offer.clinic_id || 1}`}>
                        View Clinic
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {renderDots()}
      </div>
    </section>
  );
}