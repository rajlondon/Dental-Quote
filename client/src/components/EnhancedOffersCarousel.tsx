import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Clock, ChevronRight, ChevronLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SpecialOffer, Tier } from '@shared/specialOffers';
import { useToast } from '@/hooks/use-toast';

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
  
  // Function to get image URL based on offer ID
  const getImageUrl = (offer: SpecialOffer) => {
    // Add version parameter to force refresh and prevent caching
    const version = new Date().getTime();
    
    switch(offer.id) {
      case 'free-consultation':
        return `/images/offers/free-consultation.jpg?v=${version}`;
      case 'dental-implant-crown-bundle':
        return `/images/offers/dental-implant-crown-bundle.jpg?v=${version}`;
      case 'luxury-airport-transfer':
        return `/images/offers/luxury-airport-transfer.jpg?v=${version}`;
      case 'premium-hotel-deal':
        return `/images/offers/premium-hotel-deal.jpg?v=${version}`;
      default:
        // Use a fallback image if needed
        return `/images/offers/premium-hotel-deal.jpg?v=${version}`;
    }
  };
  
  // Get badge style based on offer tier
  const getBadgeStyle = (tier: Tier) => {
    switch(tier) {
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
    
    // Navigate to quote form
    window.location.href = '/your-quote?specialOffer=' + offer.id;
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
                  <Badge className={cn("py-1.5 px-3", getBadgeStyle(offer.tier || 'standard'))}>
                    {offer.tier === 'premium' && <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                    {(offer.tier || 'standard').charAt(0).toUpperCase() + (offer.tier || 'standard').slice(1)}
                  </Badge>
                </div>
                
                {offer.expiresAt && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {new Date(offer.expiresAt) > new Date() 
                        ? `Expires in ${Math.ceil((new Date(offer.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                        : 'Limited time offer'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="mb-2">
                  {offer.discount && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
                      <Tag className="w-3.5 h-3.5 mr-1" />
                      {typeof offer.discount === 'number'
                        ? `${offer.discount}% OFF`
                        : offer.discount}
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                <div className="mt-auto space-y-4">
                  {offer.clinic && (
                    <div className="flex items-center">
                      <img 
                        src={offer.clinic.logo || '/images/generic-clinic-logo.svg'} 
                        alt={offer.clinic.name}
                        className="w-8 h-8 rounded-full mr-3 object-cover" 
                      />
                      <div>
                        <span className="text-sm text-gray-500">Offered by</span>
                        <p className="font-medium">{offer.clinic.name}</p>
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
                      <Link href={`/clinics/${offer.clinic?.id || 1}`}>
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