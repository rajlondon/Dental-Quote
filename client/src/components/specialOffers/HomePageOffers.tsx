import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import SpecialOfferCard from './SpecialOfferCard';
import { apiRequest } from '@/lib/queryClient';
import { useNavigate } from 'wouter';

interface HomePageOffersProps {
  className?: string;
}

const HomePageOffers: React.FC<HomePageOffersProps> = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, navigate] = useNavigate();
  const [autoPlay, setAutoPlay] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Fetch special offers
  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['/api/special-offers/homepage'],
    // Default queryFn is already set up in the app
  });

  // Handle applying a promo code
  const handleApplyPromoCode = async (promoCode: string) => {
    try {
      const response = await apiRequest('POST', '/api/v1/quotes/from-promo', {
        promoCode
      });
      
      const data = await response.json();
      
      if (data.success && data.quoteId) {
        // Redirect to the quote wizard or detail page
        navigate(data.quoteUrl || `/quote/wizard?quoteId=${data.quoteId}`);
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
    }
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!autoPlay || isHovering || offers.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [autoPlay, isHovering, offers.length]);

  // Calculate items to display based on available width (3 on desktop, 1 on mobile)
  const itemsPerPage = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : 1;
  
  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  if (isLoading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offers || offers.length === 0) {
    return null; // Don't show anything if no offers
  }

  const visibleOffers = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const index = (currentIndex + i) % offers.length;
    visibleOffers.push(offers[index]);
  }

  return (
    <section 
      className={`py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block mb-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-indigo-700 font-medium text-sm flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Exclusive Savings
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-transparent mb-4">
            Special Offers
          </h2>
          <p className="text-gray-600 mx-auto max-w-2xl">
            Exclusive deals from our premium partner clinics to make your dental journey more affordable. 
            Limited time offers with significant savings on premium treatments.
          </p>
        </div>
        
        <div className="relative">
          {offers.length > itemsPerPage && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow-md hover:bg-white hidden md:flex"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow-md hover:bg-white hidden md:flex"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleOffers.map((offer, index) => (
              <SpecialOfferCard 
                key={`${offer.id}-${index}`}
                offer={offer}
                onClick={handleApplyPromoCode}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation dots for mobile */}
        {offers.length > 1 && (
          <div className="flex justify-center mt-6 md:hidden">
            {offers.map((_, index) => (
              <Button 
                key={index}
                variant="ghost" 
                size="icon" 
                className={`w-2 h-2 rounded-full p-0 mx-1 ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePageOffers;