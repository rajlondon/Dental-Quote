import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ChevronLeft, ChevronRight, Clock, Tag, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';

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

  // Hooks - ALL AT THE TOP LEVEL
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { registerMessageHandler } = useWebSocket();
  const { user, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();

  // Fetch special offers data
  const { 
    data: offers, 
    isLoading: offersLoading, 
    error 
  } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers/homepage'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

  // Handle quote request with authentication check
  const handleRequestQuote = useCallback((offer: SpecialOffer) => {
    console.log("Special Offer Request Quote clicked:", offer);

    // Standardize the offer data format to ensure consistency across the application
    const standardizedOfferData = {
      id: offer.id,
      title: offer.title,
      clinicId: offer.clinic_id,
      discountValue: offer.discount_value || 0,
      discountType: offer.discount_type || 'percentage',
      applicableTreatment: offer.applicable_treatments && offer.applicable_treatments.length > 0 
                           ? offer.applicable_treatments[0] 
                           : 'Dental Implants'
    };

    // Build query parameters for the offer
    const params = new URLSearchParams({
      specialOffer: standardizedOfferData.id,
      offerTitle: standardizedOfferData.title,
      offerClinic: standardizedOfferData.clinicId || '',
      offerDiscount: standardizedOfferData.discountValue.toString(),
      offerDiscountType: standardizedOfferData.discountType,
      treatment: standardizedOfferData.applicableTreatment
    });

    console.log("Generated URL params:", params.toString());
    console.log("Auth state - loading:", authLoading, "user:", user ? "logged in" : "not logged in");

    // Check if user is authenticated
    if (!authLoading && user) {
      console.log("User authenticated, proceeding to quote form with special offer context");

      // Store the special offer in sessionStorage for use by the quote form
      sessionStorage.setItem('activeSpecialOffer', JSON.stringify(standardizedOfferData));
      console.log("Saved activeSpecialOffer to sessionStorage:", standardizedOfferData);

      // User is logged in, proceed with quote and notify
      toast({
        title: "Special Offer Selected",
        description: `${offer.title} will be applied to your quote results.`,
        variant: "default",
      });

      // Redirect to the quote page where user can select treatments and clinics
      // with the special offer clinic highlighted - use navigate for SPA navigation
      console.log("Redirecting to quote page with special offer context");
      navigate('/your-quote');
    } else {
      console.log("User not authenticated, saving offer to sessionStorage");

      // Save the standardized offer data to sessionStorage for retrieval after login
      console.log("Saving pendingSpecialOffer:", standardizedOfferData);
      sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(standardizedOfferData));

      // Notify user they need to login
      toast({
        title: "Login Required",
        description: "Please create an account or login to request this special offer",
        variant: "default",
      });

      // Redirect to login page - use navigate for SPA navigation
      console.log("Redirecting to portal login page");
      navigate('/portal-login');
    }
  }, [authLoading, user, navigate, toast]);

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
              <div className="md:w-1/2 h-64 md:h-[400px] relative overflow-hidden">
                {/* Fixed size container to ensure consistent dimensions */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  {/* Use direct OpenAI URL for OpenAI-generated images */}
                  <img 
                    src={offer.banner_image?.includes('oaidalleapiprodscus.blob.core.windows.net') 
                      ? offer.banner_image // Use the actual OpenAI URL directly without modifications
                      : getImageUrl(offer)} // Use normal URL handling for other images
                    alt={offer.title}
                    className="w-full h-full object-cover object-center"
                    data-offer-id={offer.id}
                    data-refresh-key={imageRefreshKey}
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

                      // Fallback to a default image if loading fails
                      e.currentTarget.src = '/images/offers/premium-hotel-deal.jpg';
                    }}
                    crossOrigin="anonymous" // CrossOrigin attribute for CORS issues
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
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        // Map numeric clinic IDs to proper clinic route strings
                        const clinicIdMap: Record<string, string> = {
                          "1": "dentgroup-istanbul",
                          "2": "dent-istanbul", 
                          "3": "istanbul-aesthetic-center",
                          "4": "dentalpark-turkey",
                          "5": "esta-istanbul"
                        };
                        
                        const clinicId = offer.clinic_id?.toString() || "1";
                        const routeClinicId = clinicIdMap[clinicId] || clinicId;
                        
                        // Use /clinic/ route format to match existing routes
                        navigate(`/clinic/${routeClinicId}`);
                      }}
                    >
                      View Clinic
                    </Button>
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // Store selected offer in session storage for persistence
                        sessionStorage.setItem('selectedOffer', JSON.stringify({
                          id: offer.id,
                          title: offer.title,
                          promo_code: offer.promo_code,
                          clinic_id: offer.clinic_id
                        }));

                        // Navigate to Your Quote page (treatment plan builder) with promo code
                        navigate(`/your-quote?promo=${encodeURIComponent(offer.promo_code || '')}&from=offer`);

                        toast({
                          title: "Package Selected",
                          description: `${offer.title} package selected. Redirecting to quote builder...`,
                        });
                      }}
                    >
                      Select Package
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