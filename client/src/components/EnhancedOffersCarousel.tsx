import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from "wouter";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ChevronLeft, ChevronRight, Clock, Tag, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';

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
    isLoading, 
    error 
  } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers/homepage'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Register WebSocket handler for special offer updates
  useEffect(() => {
    const handleOfferUpdate = (message: any) => {
      if (message.type === 'special_offer_updated') {
        console.log('🔄 Received special offer update via WebSocket:', message);
        
        // Extract important info if available
        const offerId = message.offerId || '';
        const timestamp = message.timestamp || Date.now();
        
        // Clear image cache immediately and force refresh
        setImageCache({}); // Clear all cached image URLs
        setImageRefreshKey(timestamp); // Use server timestamp for better synchronization
        
        // Refetch data from server
        queryClient.invalidateQueries({ queryKey: ['/api/special-offers/homepage'] });
        
        // Add a toast notification that also helps user know something happened
        toast({
          title: 'Special Offer Updating',
          description: 'Loading new promotional images...',
          variant: 'default',
        });
        
        // Schedule multiple refreshes with staggered timing
        // This helps overcome browser cache issues by trying multiple times
        const refreshTimes = [500, 1500, 3000]; // Milliseconds
        
        refreshTimes.forEach(delay => {
          setTimeout(() => {
            // Generate a unique refresh key each time
            const newRefreshKey = Date.now() + Math.random();
            setImageRefreshKey(newRefreshKey);
            setImageCache({}); // Clear cache again to be extra sure
            
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
    
    // Register our enhanced handler
    console.log('🔌 Registering enhanced WebSocket handler for special offer updates');
    registerMessageHandler('special_offer_updated', handleOfferUpdate);
    
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

  // Memoize the image URLs to prevent rendering loops
  const getImageUrlsMemo = useMemo(() => {
    const urls: Record<string, string> = {};
  
    if (!offers) return urls;
    
    // Process all offers at once in a single batch
    offers.forEach(offer => {
      // Ultra-aggressive cache busting parameters with high entropy
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      const cacheKey = `t=${timestamp}&r=${randomString}&v=${imageRefreshKey}&u=${uuid}&nocache=true`;
      
      let finalUrl = '';
      
      // Process the banner image URL
      if (offer.banner_image) {
        // We need to properly handle Azure Blob Storage URLs from OpenAI
        const isAzureBlobUrl = offer.banner_image.includes('oaidalleapiprodscus.blob.core.windows.net');
        const isOpenAIUrl = offer.banner_image.includes('openai.com');
        
        // Debug information about the blob URL - only log once when detected
        if (isAzureBlobUrl && typeof window !== 'undefined' && !window.blobUrlsLogged) {
          // Initialize the tracking object if it doesn't exist
          if (!window.blobUrlsLogged) {
            window.blobUrlsLogged = {};
          }
          
          if (!window.blobUrlsLogged[offer.id]) {
            window.blobUrlsLogged[offer.id] = true;
            
            // Log debugging info but only once per offer
            console.error(`🔵 DEBUGGING AZURE BLOB URL: ${offer.banner_image}`);
            console.error(`🔵 Azure Blob URL characteristics:`);
            console.error(`   - Starts with https://:`, offer.banner_image.startsWith('https://'));
            console.error(`   - Contains query parameters:`, offer.banner_image.includes('?'));
            console.error(`   - URL length:`, offer.banner_image.length);
          }
        }
        
        // Check if this is an OpenAI URL (they don't need aggressive cache busting)
        if (isOpenAIUrl || isAzureBlobUrl) {
          // Add minimal cache busting for OpenAI URLs
          // We need to ensure we're using the raw URL without cutting it off or modifying it
          finalUrl = offer.banner_image;
          
          // Only add timestamp if there isn't already a query parameter
          if (!finalUrl.includes('?')) {
            finalUrl = `${finalUrl}?t=${timestamp}`;
          }
        } else {
          // Strip existing query parameters for all other URLs and apply aggressive cache busting
          const baseUrl = offer.banner_image.split('?')[0];
          finalUrl = `${baseUrl}?${cacheKey}`;
        }
      } else {
        // Fallback images based on title with cache busting
        let basePath = '/images/offers/premium-hotel-deal.jpg';
        
        if (offer.title.toLowerCase().includes('consultation')) {
          basePath = '/images/offers/free-consultation.jpg';
        } else if (offer.title.toLowerCase().includes('implant')) {
          basePath = '/images/offers/dental-implant-crown-bundle.jpg';
        } else if (offer.title.toLowerCase().includes('airport') || offer.title.toLowerCase().includes('transfer')) {
          basePath = '/images/offers/luxury-airport-transfer.jpg';
        }
        
        finalUrl = `${basePath}?${cacheKey}`;
      }
      
      urls[offer.id] = finalUrl;
    });
    
    return urls;
  }, [offers, imageRefreshKey]);
  
  // Get image URL for a specific offer (using the memoized map)
  const getImageUrl = useCallback((offer: SpecialOffer) => {
    const url = getImageUrlsMemo[offer.id];
    // If URL is missing from memo somehow, don't try to update state during render
    return url || (offer.banner_image || '/images/offers/default.jpg');
  }, [getImageUrlsMemo]);

  // Get styling for promotion level badges
  const getBadgeStyle = (level?: string) => {
    switch(level) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-300 text-amber-950 hover:from-amber-400 hover:to-yellow-200';
      case 'featured':
        return 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:from-blue-400 hover:to-blue-300';
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-400 text-white hover:from-slate-400 hover:to-slate-300';
    }
  };

  // Handle quote request
  const handleRequestQuote = (offer: SpecialOffer) => {
    toast({
      title: "Special Offer Selected",
      description: `Your quote will include: ${offer.title}`,
      variant: "default",
    });
    
    // Build query parameters
    const params = new URLSearchParams({
      specialOffer: offer.id,
      offerTitle: offer.title,
      offerClinic: offer.clinic_id || '',
      offerDiscount: offer.discount_value?.toString() || '0',
      offerDiscountType: offer.discount_type || 'percentage',
      treatment: offer.applicable_treatments?.[0] || 'Dental Implants'
    });
    
    // Navigate to quote page
    window.location.href = `/your-quote?${params.toString()}`;
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
                {/* Debug information about the OpenAI URL */}
                {offer.banner_image?.includes('oaidalleapiprodscus.blob.core.windows.net') && (
                  <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs p-1 z-50 flex flex-col">
                    <span>OpenAI URL detected!</span>
                    <a 
                      href={offer.banner_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:text-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Opening URL directly:", offer.banner_image);
                      }}
                    >
                      Open URL Directly
                    </a>
                  </div>
                )}
                
                <img 
                  src={getImageUrl(offer)}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                  onLoad={(e) => {
                    console.log(`✅ Successfully loaded image for offer ${offer.id}`);
                    // Check if this is an OpenAI image
                    if (offer.banner_image?.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                      console.log('👍 Successfully loaded OpenAI DALL-E image from Azure Blob Storage');
                    }
                  }}
                  onError={(e) => {
                    console.error(`❌ Error loading image for offer ${offer.id}:`, e);
                    console.log('🔍 Image URL that failed:', e.currentTarget.src);
                    
                    // Additional debugging information for OpenAI URLs
                    if (offer.banner_image?.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                      console.error('❌ Failed to load OpenAI DALL-E image from Azure Blob Storage');
                    }
                    
                    // Fallback to a default image if loading fails
                    e.currentTarget.src = '/images/offers/premium-hotel-deal.jpg';
                  }}
                  crossOrigin="anonymous" // Try with CrossOrigin attribute for CORS issues
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