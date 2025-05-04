import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, RefreshCw, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpecialOffer } from '@shared/specialOffers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWebSocket } from '@/hooks/use-websocket';

interface GenerateOfferImageButtonProps {
  offer: SpecialOffer;
  onSuccess?: (imageUrl: string) => void;
}

export function GenerateOfferImageButton({ 
  offer, 
  onSuccess 
}: GenerateOfferImageButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { registerMessageHandler, unregisterMessageHandler } = useWebSocket();

  // Mutation for generating a completely new image via OpenAI
  const generateImageMutation = useMutation({
    mutationFn: async () => {
      console.log(`Generating new AI image for offer: ${offer.id} - ${offer.title}`);
      
      // Generate the new image with OpenAI DALL-E
      const response = await apiRequest('POST', '/api/openai/special-offer-image', {
        offerId: offer.id,
        offerTitle: offer.title,
        offerType: offer.promotion_level || 'premium',
        // Request that the generated image be automatically cached server-side
        enableImageCache: true,
        // Add timestamp to ensure we're not getting cached response
        timestamp: Date.now()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }
      
      const responseData = await response.json();
      console.log('AI image generation response:', responseData);
      
      // If we got a new image URL but it's not already cached, try to cache it client-side
      if (responseData.success && 
          responseData.data && 
          responseData.data.url && 
          !responseData.data.cached && 
          !responseData.data.fromFallback) {
        
        try {
          // Additional client-side cache attempt as a backup
          console.log('Attempting client-side cache for image URL:', responseData.data.url);
          const cacheResponse = await apiRequest('POST', '/api/images/cache', {
            url: responseData.data.url,
            timestamp: Date.now() // Add timestamp to prevent cached responses
          });
          
          if (cacheResponse.ok) {
            const cacheData = await cacheResponse.json();
            console.log('🔒 Additional client-side cache response:', cacheData);
            
            // If the cache was successful, update the response with the cached URL
            if (cacheData.cached && cacheData.cachedUrl) {
              console.log('Successfully cached image URL:', cacheData.cachedUrl);
              return {
                ...responseData,
                data: {
                  ...responseData.data,
                  url: cacheData.cachedUrl,
                  originalUrl: responseData.data.url,
                  clientCached: true
                }
              };
            }
          }
        } catch (cacheError) {
          console.error('Error in additional client-side caching:', cacheError);
          // Continue with the original response even if caching failed
        }
      }
      
      return responseData;
    },
    onSuccess: (data) => {
      if (data.data.fromFallback) {
        toast({
          title: 'Using Fallback Image',
          description: 'OpenAI API rate limit reached (15 images per minute). Using a quality fallback image instead.',
          variant: 'default',
        });
      } else if (data.data.cached || data.data.clientCached) {
        toast({
          title: 'AI Image Generated & Cached',
          description: 'The AI has created a new image for your special offer and it has been permanently cached.',
        });
      } else {
        toast({
          title: 'AI Image Generated',
          description: 'The AI has created a new image for your special offer. The page will refresh to show your new image.',
        });
      }
      
      if (onSuccess && data.data && data.data.url) {
        console.log('Calling onSuccess with new image URL:', data.data.url);
        onSuccess(data.data.url);
      }
      
      // Aggressive image update approach:
      
      // 1. Attempt direct DOM updates first (for faster visual feedback)
      try {
        // Find and update all matching images in DOM immediately
        const offerImages = document.querySelectorAll(`img[data-offer-id="${offer.id}"]`);
        if (offerImages.length > 0) {
          console.log(`🖼️ Found ${offerImages.length} images to update with fresh AI image`);
          
          // Add aggressive cache busting for the image URL
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 10);
          const forcedUrl = `${data.data.url}${data.data.url.includes('?') ? '&' : '?'}ai_generated=true&t=${timestamp}&r=${randomStr}&_=${Date.now()}`;
          
          offerImages.forEach((element) => {
            const imgElement = element as HTMLImageElement;
            // Save original src for reference
            const originalSrc = imgElement.src;
            
            // Set new source with cache busting
            imgElement.src = forcedUrl;
            
            // Set onload/onerror handlers
            imgElement.onload = () => {
              console.log('✅ Successfully loaded new AI image in DOM');
            };
            
            imgElement.onerror = () => {
              console.log('❌ Failed to load new AI image, reverting to:', originalSrc);
              // Try to load with proxy if direct failed
              const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(data.data.url)}&t=${Date.now()}`;
              imgElement.src = proxyUrl;
            };
            
            console.log('✅ Updated image element directly in DOM with AI image');
            
            // Also force image reload by briefly removing and re-adding
            const parent = imgElement.parentNode;
            if (parent) {
              const clone = imgElement.cloneNode(true) as HTMLImageElement;
              clone.src = forcedUrl; // Ensure clone has the new URL
              parent.replaceChild(clone, imgElement);
            }
          });
        }
      } catch (err) {
        console.error('Error updating DOM with new AI image:', err);
      }
      
      // 2. Invalidate any cached data in React Query
      try {
        console.log('Invalidating cache for offers data');
        queryClient.invalidateQueries({ queryKey: ['/api/special-offers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/special-offers/homepage'] });
        queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
      } catch (err) {
        console.error('Error invalidating cache:', err);
      }
      
      // 3. Schedule first page reload attempt
      setTimeout(() => {
        // First remove all cached images from browser cache if possible
        try {
          if ('caches' in window) {
            caches.delete('images').then(() => {
              console.log('Cleared image cache before reload');
            });
          }
        } catch (err) {
          console.error('Error clearing cache:', err);
        }
        
        console.log('🔄 First reload attempt to show new AI-generated image');
        window.location.reload();
      }, 1500);
      
      // 4. Schedule a second reload as backup (in case the first one happens before server is ready)
      setTimeout(() => {
        console.log('🔄 Second reload attempt to show new AI-generated image');
        window.location.reload();
      }, 5000);
    },
    onError: (error: Error) => {
      // Check if error is related to API limits
      if (error.message && error.message.includes('quota')) {
        toast({
          title: 'API Rate Limit Reached',
          description: 'OpenAI limits AI image generation to 15 images per minute. Using quality fallback images instead.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Image Generation Failed',
          description: error.message || 'Could not generate image at this time',
          variant: 'destructive',
        });
      }
    },
  });

  // Mutation for refreshing image cache without generating a new image
  const refreshImageMutation = useMutation({
    mutationFn: async () => {
      console.log(`Refreshing image for offer: ${offer.id} - ${offer.title}`);
      
      // First try the specialized image cache API
      if (offer.banner_image) {
        try {
          console.log('Attempting to cache image URL:', offer.banner_image);
          
          // Call our new image caching API to permanently store the image
          const cacheResponse = await apiRequest('POST', '/api/images/cache', {
            url: offer.banner_image,
            timestamp: Date.now() // Add timestamp to prevent cached responses
          });
          
          if (cacheResponse.ok) {
            const cacheData = await cacheResponse.json();
            console.log('🔄 Image cache API response:', cacheData);
            
            // If the image was cached successfully, use the permanent URL
            if (cacheData.cached && cacheData.cachedUrl) {
              console.log('Successfully cached image URL:', cacheData.cachedUrl);
              
              // Also call the regular offer refresh API
              const offerResponse = await apiRequest('POST', `/api/special-offers/refresh-image/${offer.id}`, {
                cachedImageUrl: cacheData.cachedUrl,
                timestamp: Date.now() // Add timestamp to prevent cached responses
              });
              
              if (offerResponse.ok) {
                const offerData = await offerResponse.json();
                console.log('Special offer refresh response:', offerData);
                
                return {
                  ...offerData,
                  cachedUrl: cacheData.cachedUrl,
                  originalUrl: cacheData.originalUrl
                };
              }
            }
          }
        } catch (cacheError) {
          console.error('Error using image cache API, falling back to standard refresh:', cacheError);
        }
      }
      
      // Fallback to the original refresh method
      console.log('Using fallback refresh method');
      const response = await apiRequest('POST', `/api/special-offers/refresh-image/${offer.id}`, {
        timestamp: Date.now() // Add timestamp to prevent cached responses
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh image');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Show different toast based on whether we used the cache API
      if (data.cachedUrl) {
        toast({
          title: 'Image Permanently Cached',
          description: 'The image has been permanently cached to prevent any expiration issues.',
        });
      } else {
        toast({
          title: 'Image Refreshed',
          description: 'The image cache has been refreshed. The page will update shortly.',
        });
      }
      
      // Use the cached URL if available, otherwise fall back to imageUrl
      const imageUrlToUse = data.cachedUrl || data.imageUrl;
      console.log('Using image URL for refresh:', imageUrlToUse);
      
      if (onSuccess && imageUrlToUse) {
        console.log('Calling onSuccess with refreshed image URL:', imageUrlToUse);
        onSuccess(imageUrlToUse);
      }
      
      // Aggressive approach to force image refresh
      try {
        // 1. Generate aggressive cache-busting URL
        const randomStr = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now();
        const forcedUrl = `${imageUrlToUse}${imageUrlToUse.includes('?') ? '&' : '?'}forced=true&t=${timestamp}&r=${randomStr}&_=${Date.now()}`;
        
        // 2. Find and update all matching images in DOM immediately
        const offerImages = document.querySelectorAll(`img[data-offer-id="${offer.id}"]`);
        if (offerImages.length > 0) {
          console.log(`🖼️ Found ${offerImages.length} images to update with force refresh`);
          
          offerImages.forEach((element) => {
            const imgElement = element as HTMLImageElement;
            // Save original src for reference
            const originalSrc = imgElement.src;
            
            // Set new source with cache busting
            imgElement.src = forcedUrl;
            
            // Set onload/onerror handlers
            imgElement.onload = () => {
              console.log('✅ Successfully loaded refreshed image in DOM');
            };
            
            imgElement.onerror = () => {
              console.log('❌ Failed to load refreshed image, reverting to:', originalSrc);
              // Try to load with proxy if direct failed
              const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(imageUrlToUse)}&t=${Date.now()}`;
              imgElement.src = proxyUrl;
            };
            
            console.log('✅ Updated image element directly in DOM with refreshed image');
            
            // Also force image reload by briefly removing and re-adding
            const parent = imgElement.parentNode;
            if (parent) {
              const clone = imgElement.cloneNode(true) as HTMLImageElement;
              clone.src = forcedUrl; // Ensure clone has the new URL
              parent.replaceChild(clone, imgElement);
            }
          });
        }
        
        // 3. Create a fresh image object to preload the image
        const preloadImage = document.createElement('img');
        preloadImage.src = forcedUrl;
        document.body.appendChild(preloadImage);
        setTimeout(() => {
          if (preloadImage.parentNode) {
            preloadImage.parentNode.removeChild(preloadImage);
          }
        }, 2000);
        
      } catch (err) {
        console.error('Error during direct DOM update:', err);
      }
      
      // 4. Force invalidate relevant queries
      try {
        console.log('Invalidating cache for offers data');
        queryClient.invalidateQueries({ queryKey: ['/api/special-offers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/special-offers/homepage'] });
        queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
      } catch (err) {
        console.error('Error invalidating cache:', err);
      }
      
      // 5. Schedule first page reload attempt
      setTimeout(() => {
        // First remove all cached images from browser cache if possible
        try {
          if ('caches' in window) {
            caches.delete('images').then(() => {
              console.log('Cleared image cache before reload');
            });
          }
        } catch (err) {
          console.error('Error clearing cache:', err);
        }
        
        console.log('🔄 First reload attempt to show refreshed image');
        window.location.reload();
      }, 1500);
      
      // 6. Schedule a second reload as backup (in case the first one happens before server is ready)
      setTimeout(() => {
        console.log('🔄 Second reload attempt to show refreshed image');
        window.location.reload();
      }, 5000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Image Refresh Failed',
        description: error.message || 'Could not refresh image at this time',
        variant: 'destructive',
      });
    },
  });

  // Register WebSocket handler for image updates
  useEffect(() => {
    // Handler function for special offer image refresh notifications via WebSocket
    const handleOfferImageRefresh = (message: any) => {
      console.log(`📡 WebSocket message received, type: ${message.type}`);
      console.log('Message data:', message);
      
      // Handle different types of image refresh messages
      if ((message.type === 'special_offer_image_refresh' && 
           message.payload && 
           message.payload.offerId === offer.id) || 
          (message.type === 'special_offer_image_refreshed' && 
           message.offerId === offer.id)) {
        
        console.log(`📡 WebSocket notification received for image refresh: ${offer.id}`);
        
        // Extract the updated image URL from the message (handle different formats)
        const refreshedImageUrl = message.payload?.imageUrl || message.imageUrl;
        
        if (refreshedImageUrl) {
          console.log('Received refreshed image URL via WebSocket:', refreshedImageUrl);
          
          // Notify parent component if callback provided
          if (onSuccess) {
            onSuccess(refreshedImageUrl);
          }
          
          // Update all the matching image elements on the page with super aggressive approach
          setTimeout(() => {
            try {
              // Target all images with data-offer-id attribute matching this offer
              const offerImages = document.querySelectorAll(`img[data-offer-id="${offer.id}"]`);
              
              if (offerImages.length > 0) {
                console.log(`🖼️ Found ${offerImages.length} image elements to update via WebSocket`);
                
                // Generate highly unique cache-busting parameters
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 15);
                const forcedUrl = `${refreshedImageUrl}${refreshedImageUrl.includes('?') ? '&' : '?'}ws_update=true&t=${timestamp}&r=${randomStr}&_=${Date.now()}`;
                
                offerImages.forEach((element) => {
                  const imgElement = element as HTMLImageElement;
                  // Save original src for potential fallback
                  const originalSrc = imgElement.src;
                  
                  // Force browser to reload the image with aggressive cache busting
                  imgElement.src = forcedUrl;
                  
                  // Handle load/error events
                  imgElement.onload = () => {
                    console.log('✅ Successfully loaded WebSocket-refreshed image in DOM');
                  };
                  
                  imgElement.onerror = () => {
                    console.log('❌ Failed to load WebSocket-refreshed image, trying proxy:', refreshedImageUrl);
                    // Try to load with proxy if direct failed
                    const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(refreshedImageUrl)}&t=${Date.now()}`;
                    imgElement.src = proxyUrl;
                    
                    // If proxy also fails, revert to original
                    imgElement.onerror = () => {
                      console.log('❌ Proxy load also failed, reverting to original');
                      imgElement.src = originalSrc;
                    };
                  };
                  
                  // DOM replacement trick for stubborn browsers
                  const parent = imgElement.parentNode;
                  if (parent) {
                    const clone = imgElement.cloneNode(true) as HTMLImageElement;
                    clone.src = forcedUrl;
                    parent.replaceChild(clone, imgElement);
                  }
                });
                
                // Create and preload a fresh image
                const preloadImage = document.createElement('img');
                preloadImage.src = forcedUrl;
                document.body.appendChild(preloadImage);
                setTimeout(() => {
                  if (preloadImage.parentNode) {
                    preloadImage.parentNode.removeChild(preloadImage);
                  }
                }, 2000);
                
                // Invalidate queries to refresh any react components
                queryClient.invalidateQueries({ queryKey: ['/api/special-offers'] });
                queryClient.invalidateQueries({ queryKey: ['/api/special-offers/homepage'] });
                queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
                
                toast({
                  title: 'Image Updated',
                  description: 'The special offer image has been refreshed automatically.',
                });
                
                // Check if force reload is required
                if (message.command === 'force_reload' || message.forceReload) {
                  console.log('Force reload command received, scheduling page reload');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              } else {
                console.log('⚠️ No matching image elements found on page for WebSocket update');
              }
            } catch (err) {
              console.error('Error during WebSocket image update:', err);
            }
          }, 300); // Small delay to ensure DOM is ready
        }
      }
    };
    
    // Register the message handler with both possible message types
    registerMessageHandler('special_offer_image_refresh', handleOfferImageRefresh);
    registerMessageHandler('special_offer_image_refreshed', handleOfferImageRefresh);
    
    // Cleanup on unmount
    return () => {
      unregisterMessageHandler('special_offer_image_refresh');
      unregisterMessageHandler('special_offer_image_refreshed');
    };
  }, [offer.id, onSuccess, queryClient, registerMessageHandler, unregisterMessageHandler, toast]);

  // Fix for Image constructor
  const createFreshImage = (url: string) => {
    const img = document.createElement('img');
    img.src = url;
    return img;
  };

  // Combined mutation status
  const isPending = generateImageMutation.isPending || refreshImageMutation.isPending;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="flex items-center gap-1 text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          {isPending ? 'Processing...' : 'Image Options'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false);
            generateImageMutation.mutate();
          }}
          disabled={isPending}
          className="flex items-center"
        >
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          <span>Generate New AI Image</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false);
            refreshImageMutation.mutate();
          }}
          disabled={isPending || !offer.banner_image}
          className="flex items-center"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          <span>Refresh Current Image</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}