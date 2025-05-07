import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ChevronLeft, ChevronRight, Clock, Tag, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import clinicsData from '@/data/clinics.json';

// Helper function to map numeric clinic IDs to clinic slug IDs
function mapNumericClinicIdToSlug(numericId: string): string {
  // Map of numeric IDs to slugs based on clinics.json data
  const numericToSlugMap: Record<string, string> = {
    "1": "dentgroup-istanbul",
    "2": "istanbul-dental-care",
    "3": "maltepe-dental-clinic",
    "4": "dentakay-istanbul",
    "5": "crown-dental-turkey"
  };
  
  return numericToSlugMap[numericId] || numericId;
}

// Add window interface extension
declare global {
  interface Window {
    blobUrlsLogged?: {
      [key: string]: boolean;
    };
  }
}

// Define the shape of our special offer data
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
  // Added price fields for displaying in the carousel
  treatment_price_gbp?: number;
  treatment_price_usd?: number;
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
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageRefreshKey, setImageRefreshKey] = useState<number>(Date.now());
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  
  // Hooks
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { registerMessageHandler } = useWebSocket();
  
  // Fetch special offers data
  const { 
    data: offers, 
    isLoading: offersLoading, 
    error 
  } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers/homepage'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to get image URL with improved error handling
  const getImageUrl = useCallback((offer: SpecialOffer) => {
    try {
      // Check if we have a cached URL for this offer
      if (imageCache[offer.id]) {
        return imageCache[offer.id];
      }
      
      // If no banner image, use a default
      if (!offer.banner_image) {
        return '/images/offers/default-offer.jpg';
      }
      
      // Special case for "Premium Hotel Deal" which seems to have issues
      if (offer.title === "Premium Hotel Deal") {
        return '/images/offers/premium-hotel-deal.jpg';
      }
      
      // For OpenAI images, use as is
      if (offer.banner_image.includes('oaidalleapiprodscus.blob.core.windows.net') || 
          offer.banner_image.includes('openai.com')) {
        return offer.banner_image;
      }
      
      // For all other images, apply conservative cache busting (less aggressive)
      const baseUrl = offer.banner_image.split('?')[0];
      // Use a simpler method to avoid too many parameters
      return `${baseUrl}?v=${imageRefreshKey}`;
    } catch (error) {
      console.error('Error getting image URL:', error);
      // Return a safe default image in case of any error
      return '/images/offers/default-offer.jpg';
    }
  }, [imageCache, imageRefreshKey]);

  // Helper to get badge styles based on promotion level
  const getBadgeStyle = (level?: string) => {
    switch(level) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 border-amber-300';
      case 'featured':
        return 'bg-gradient-to-r from-blue-200 to-indigo-300 text-blue-800 border-blue-300';
      case 'standard':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Register WebSocket handlers for special offer updates
  useEffect(() => {
    // Handler for general special offer updates
    const handleOfferUpdate = (message: any) => {
      if (message.type === 'special_offer_updated') {
        console.log('🔄 Received special offer update via WebSocket:', message);
        
        // Extract important info if available
        const offerId = message.offerId || '';
        const imageUrl = message.imageUrl || '';
        const timestamp = message.timestamp || Date.now();
        const command = message.command || '';
        const forceReload = message.forceReload === true;
        
        // Check if server is requesting a complete page reload
        if (command === 'force_reload' || forceReload) {
          console.log('🔄🔄 Force reload command received from server');
          
          // Show toast notification
          toast({
            title: 'New Image Generated',
            description: 'Page will reload to display updated offers',
            variant: 'default',
          });
          
          // Reload the entire page for a fresh start
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        }
        
        // Force reload the entire window if we're on the special offers management page
        // This is the most reliable way to get a clean slate with the new image
        if (window.location.pathname.includes('/clinic/special-offers')) {
          console.log('📱 On special offers management page, applying force reload strategy');
          // Wait 2 seconds to ensure server has processed the change
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }
        
        // Handle cache invalidation command
        if (command === 'invalidate_cache') {
          console.log('🧹 Received explicit cache invalidation command from server');
          
          // Clear HTML5 Cache API if available
          if ('caches' in window) {
            try {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                  console.log(`Attempting to delete cache: ${cacheName}`);
                  caches.delete(cacheName);
                });
              });
              console.log('✅ Cleared all available caches');
            } catch (err) {
              console.error('Error clearing caches:', err);
            }
          }
          
          // Try to remove items from browser's internal image cache using trick
          // This creates a dummy image element with each offending URL and explicitly
          // forces cache removal
          if (imageUrl) {
            try {
              const dummyImage = new Image();
              dummyImage.src = `${imageUrl}?forcereload=${Date.now()}`;
              console.log('Created dummy image to force cache invalidation:', dummyImage.src);
            } catch (err) {
              console.error('Error with cache invalidation trick:', err);
            }
          }
        }
        
        // Clear image cache immediately and force refresh
        console.log('🧹 Clearing image cache completely');
        setImageCache({}); // Clear all cached image URLs
        
        // Use server timestamp for better synchronization
        console.log(`⏰ Setting new refresh key: ${timestamp}`);
        setImageRefreshKey(timestamp); 
        
        // If we received a specific image URL, manually update our cache 
        // to force immediate display of the new image
        if (imageUrl && offerId) {
          console.log(`🔐 Manually updating cached image URL for offer ${offerId}`);
          // Add multiple random parameters to prevent any caching
          const randomVal1 = Math.random().toString(36).substring(2, 10);
          const randomVal2 = Math.random().toString(36).substring(2, 10);
          setImageCache(prev => ({
            ...prev,
            [offerId]: `${imageUrl}?t=${Date.now()}&r1=${randomVal1}&r2=${randomVal2}&nocache=true`
          }));
        }
        
        // Refetch data from server with cache busting
        console.log('🔄 Invalidating special offers query cache');
        queryClient.invalidateQueries({ 
          queryKey: ['/api/special-offers/homepage'],
          refetchType: 'all'
        });
        
        // Add a toast notification that also helps user know something happened
        toast({
          title: 'Special Offer Updating',
          description: 'Loading new promotional images...',
          variant: 'default',
        });
        
        // Schedule multiple refreshes with staggered timing
        // This helps overcome browser cache issues by trying multiple times
        const refreshTimes = [500, 1500, 3000, 5000]; // Milliseconds
        
        refreshTimes.forEach(delay => {
          setTimeout(() => {
            // Generate a unique refresh key each time
            const newRefreshKey = Date.now() + Math.random();
            console.log(`⏱️ Scheduled refresh #${delay/500}: new key ${newRefreshKey}`);
            setImageRefreshKey(newRefreshKey);
            setImageCache({}); // Clear cache again to be extra sure
            
            // Force re-query on each refresh attempt
            queryClient.invalidateQueries({ 
              queryKey: ['/api/special-offers/homepage'],
              refetchType: 'all'
            });
            
            // Only show toast on final refresh
            if (delay === refreshTimes[refreshTimes.length - 1]) {
              toast({
                title: 'Special Offer Updated',
                description: 'New promotional images are now available',
                variant: 'default',
              });
            }
          }, delay);
        });
      }
    };
    
    // Dedicated handler for image refresh commands from our new endpoint
    const handleImageRefresh = (message: any) => {
      if (message.type === 'special_offer_image_refreshed') {
        console.log('🖼️ Received specialized image refresh command via WebSocket:', message);
        
        // Extract important info
        const offerId = message.offerId || '';
        const imageUrl = message.imageUrl || '';
        const timestamp = message.timestamp || Date.now();
        
        if (!offerId || !imageUrl) {
          console.error('❌ Missing required offerId or imageUrl in refresh message');
          return;
        }
        
        console.log(`🖼️ Refreshing image for offer ID: ${offerId}`);
        console.log(`🔗 New image URL with cache busting: ${imageUrl}`);
        
        // First approach: Update the React Query cache directly
        queryClient.setQueryData(
          ['/api/special-offers/homepage'],
          (oldData: SpecialOffer[] | undefined) => {
            if (!oldData) return oldData;
            
            // Find and update the specific offer's image URL
            return oldData.map(offer => 
              offer.id === offerId 
                ? { 
                    ...offer, 
                    banner_image: `${imageUrl}&forced=${timestamp}`,
                    updated_at: new Date().toISOString()
                  } 
                : offer
            );
          }
        );
        
        // Second approach: Update our image cache directly
        setImageCache(prev => ({
          ...prev,
          [offerId]: `${imageUrl}&timestamp=${timestamp}&forced=true`
        }));
        
        // Third approach: Create a new image element to force preloading
        const preloadImg = new Image();
        preloadImg.onload = () => console.log('✅ Successfully preloaded refreshed image');
        preloadImg.onerror = (err) => console.error('❌ Failed to preload refreshed image:', err);
        preloadImg.src = `${imageUrl}&preload=true&t=${timestamp}`;
        
        // Fourth approach: Try direct DOM manipulation as a last resort
        setTimeout(() => {
          try {
            // Find all images with this offer ID in data attributes or alt text
            const offerImages = document.querySelectorAll(`img[data-offer-id="${offerId}"], img[alt="${offerId}"]`);
            if (offerImages.length > 0) {
              console.log(`🔍 Found ${offerImages.length} images in DOM to update directly`);
              
              offerImages.forEach((element) => {
                // Cast the element to HTMLImageElement
                const img = element as HTMLImageElement;
                // Replace the src with our new URL plus cache busting
                img.src = `${imageUrl}&direct_update=true&t=${Date.now()}`;
                console.log('✏️ Updated image src directly in DOM');
              });
            }
          } catch (err) {
            console.error('❌ Error during direct DOM update:', err);
          }
        }, 500);
        
        // Finally: Force a refresh key update to trigger component re-render
        setImageRefreshKey(timestamp);
        
        // Add a subtle notification to inform the user
        toast({
          title: 'Image Updated',
          description: 'Special offer image has been refreshed',
          variant: 'default',
        });
      }
    };
    
    // Register both handlers
    console.log('🔌 Registering enhanced WebSocket handlers for special offers');
    registerMessageHandler('special_offer_updated', handleOfferUpdate);
    registerMessageHandler('special_offer_image_refreshed', handleImageRefresh);
    
    // No cleanup needed as useWebSocket handles it
  }, [queryClient, registerMessageHandler, toast]);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || !offers || offers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % offers.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [offers, isAutoPlaying]);

  // Update refresh key when offers data changes
  useEffect(() => {
    if (offers) {
      setImageRefreshKey(Date.now());
      setImageCache({});
    }
  }, [offers]);

  // Event handlers
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);
  const goToPrevious = () => {
    if (!offers?.length) return;
    setCurrentIndex(prev => (prev - 1 + offers.length) % offers.length);
  };
  const goToNext = () => {
    if (!offers?.length) return;
    setCurrentIndex(prev => (prev + 1) % offers.length);
  };

  // Handle user actions when they request a quote for a special offer
  const handleRequestQuote = (offer: SpecialOffer) => {
    // Prepare standardized offer data for handoff to quote flow
    const standardizedOfferData = {
      id: offer.id,
      title: offer.title,
      clinicId: offer.clinic_id,
      discountValue: offer.discount_value || 0,
      discountType: offer.discount_type || 'percentage',
      applicableTreatment: (offer.applicable_treatments && offer.applicable_treatments.length > 0)
        ? offer.applicable_treatments[0]
        : 'dental-implants'
    };
    
    // Always clear any existing offer data first
    sessionStorage.removeItem('pendingSpecialOffer');
    sessionStorage.removeItem('processingSpecialOffer');
    
    // Store the offer data
    console.log("Saving pendingSpecialOffer:", standardizedOfferData);
    sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(standardizedOfferData));
    sessionStorage.setItem('processingSpecialOffer', standardizedOfferData.id);
    
    // Notify user about processing the offer
    toast({
      title: "Special Offer Selected",
      description: `${offer.title} will be applied to your quote.`,
      variant: "default",
    });
    
    // Redirect to the quote flow with parameters
    console.log("Redirecting to quote page with offer details");
    
    // Fix the URL parameters to match what QuoteFlowContext is expecting
    // Use both offerId and specialOffer parameters to ensure compatibility
    window.location.href = `/quote?step=start&skipInfo=true&source=special_offer&clinicId=${offer.clinic_id}&offerId=${offer.id}&specialOffer=${offer.id}&offerTitle=${encodeURIComponent(offer.title)}`;
  };

  // Generate navigation dots
  const renderDots = () => {
    if (!offers?.length) return null;
    
    return (
      <div className="flex justify-center mt-4 space-x-2">
        {offers.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  // Loading state
  if (offersLoading) {
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

  // Error or empty state
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

  // Main carousel view
  return (
    <section 
      className={cn("py-12 bg-gradient-to-br from-slate-100 via-white to-blue-50", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block mb-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-indigo-700 font-medium text-sm flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Exclusive Savings
            </span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-transparent mb-4">
            Special Offers
          </h2>
          <p className="text-gray-600 mx-auto max-w-2xl">
            Exclusive deals from our premium partner clinics to make your dental journey more affordable. 
            Limited time offers with significant savings on premium treatments.
          </p>
        </div>
        
        <div className="flex items-center justify-end gap-2 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={() => {
              // Manual refresh button
              setImageRefreshKey(Date.now());
              setImageCache({});
              queryClient.refetchQueries({ queryKey: ['/api/special-offers/homepage'] });
              
              toast({
                title: 'Refreshing Offers',
                description: 'Loading the latest special offers...',
                variant: 'default',
              });
            }}
            aria-label="Refresh offers"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
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
              <div className="md:w-1/2 h-64 md:h-[400px] relative overflow-hidden">
                {/* Fixed size container to ensure consistent dimensions */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  {/* Improved image handling with better fallbacks */}
                  <img 
                    src={getImageUrl(offer)} // Use our updated getImageUrl function that handles special cases
                    alt={offer.title || "Special Offer"}
                    className="w-full h-full object-cover object-center"
                    data-offer-id={offer.id}
                    data-refresh-key={imageRefreshKey}
                    loading="eager" // Ensure images load eagerly
                    onLoad={(e) => {
                      // Success logging with less verbosity
                      if (offer.title === "Premium Hotel Deal") {
                        console.log(`✅ Successfully loaded image for Premium Hotel Deal`);
                      }
                    }}
                    onError={(e) => {
                      // Don't log the error object to prevent console clutter
                      console.log(`🛑 Image loading failed for "${offer.title}". Using fallback.`);
                      
                      // Use a specific fallback based on offer title
                      if (offer.title === "Premium Hotel Deal") {
                        e.currentTarget.src = '/images/offers/premium-hotel-deal.jpg';
                      } else if (offer.title === "Free Consultation Package") {
                        e.currentTarget.src = '/images/offers/consultation.jpg';
                      } else if (offer.title === "Luxury Airport Transfer") {
                        e.currentTarget.src = '/images/offers/luxury-transport.jpg';
                      } else {
                        // Default fallback for any other offers
                        e.currentTarget.src = '/images/offers/default-offer.jpg';
                      }
                    }}
                    loading="eager" // Eagerly load these important images
                  />
                </div>
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
                    <div className="relative inline-block">
                      <div className="absolute -right-1 -top-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white mb-2 shadow-sm">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="mr-2"
                        >
                          <path d="M12 3l1.2 2.8 2.8.3-2 2 .5 2.9-2.5-1.3-2.5 1.3.5-2.9-2-2 2.8-.3z"/>
                        </svg>
                        {offer.discount_type === 'percentage'
                          ? `SAVE ${offer.discount_value}%`
                          : offer.discount_type === 'fixed_amount' && offer.treatment_price_gbp
                            ? `SAVE £${offer.discount_value}`
                            : `SPECIAL OFFER`}
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                {/* Display price information with discount calculation */}
                {(offer.treatment_price_gbp || offer.treatment_price_usd) && (
                  <div className="mb-4">
                    <span className="font-semibold text-gray-700 mr-2">Price:</span>
                    
                    {/* Handle discount display */}
                    {offer.discount_value && offer.discount_type ? (
                      <div className="mt-2 flex gap-4">
                        {/* GBP Price with discount */}
                        {offer.treatment_price_gbp && (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="line-through text-gray-500 mr-2">£{offer.treatment_price_gbp}</span>
                              <Badge className="bg-green-100 border-green-200 text-green-800 font-medium">
                                £{offer.discount_type === 'percentage'
                                  ? Math.round(offer.treatment_price_gbp * (1 - offer.discount_value / 100))
                                  : Math.max(0, offer.treatment_price_gbp - offer.discount_value)
                                }
                              </Badge>
                            </div>
                            <span className="text-xs text-green-600 mt-1">
                              {offer.discount_type === 'percentage'
                                ? `Save ${offer.discount_value}%`
                                : `Save £${offer.discount_value}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* USD Price with discount */}
                        {offer.treatment_price_usd && (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="line-through text-gray-500 mr-2">${offer.treatment_price_usd}</span>
                              <Badge className="bg-green-100 border-green-200 text-green-800 font-medium">
                                ${offer.discount_type === 'percentage'
                                  ? Math.round(offer.treatment_price_usd * (1 - offer.discount_value / 100))
                                  : Math.max(0, offer.treatment_price_usd - Math.round(offer.discount_value * 1.28))
                                }
                              </Badge>
                            </div>
                            <span className="text-xs text-green-600 mt-1">
                              {offer.discount_type === 'percentage'
                                ? `Save ${offer.discount_value}%`
                                : `Save $${Math.round(offer.discount_value * 1.28)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center">
                        {offer.treatment_price_gbp && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            £{offer.treatment_price_gbp}
                          </Badge>
                        )}
                        {offer.treatment_price_usd && (
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                            ${offer.treatment_price_usd}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-auto space-y-4">
                  {offer.clinic_id && (
                    <div className="flex items-center">
                      <img 
                        src={`/images/clinics/clinic-${offer.clinic_id}.jpg?v=${imageRefreshKey}`} 
                        alt="Partner Clinic"
                        className="w-8 h-8 rounded-full mr-3 object-cover" 
                        onError={(e) => {
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
                      <Link href={`/clinic/${mapNumericClinicIdToSlug(offer.clinic_id || "1")}`}>
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