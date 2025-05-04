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
      // Generate the new image with OpenAI DALL-E
      const response = await apiRequest('POST', '/api/openai/special-offer-image', {
        offerId: offer.id,
        offerTitle: offer.title,
        offerType: offer.promotion_level || 'premium',
        // Request that the generated image be automatically cached server-side
        enableImageCache: true
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }
      
      const responseData = await response.json();
      
      // If we got a new image URL but it's not already cached, try to cache it client-side
      if (responseData.success && 
          responseData.data && 
          responseData.data.url && 
          !responseData.data.cached && 
          !responseData.data.fromFallback) {
        
        try {
          // Additional client-side cache attempt as a backup
          const cacheResponse = await apiRequest('POST', '/api/images/cache', {
            url: responseData.data.url
          });
          
          if (cacheResponse.ok) {
            const cacheData = await cacheResponse.json();
            console.log('🔒 Additional client-side cache response:', cacheData);
            
            // If the cache was successful, update the response with the cached URL
            if (cacheData.cached && cacheData.cachedUrl) {
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
        onSuccess(data.data.url);
      }
      
      // Attempt direct DOM updates first (for faster visual feedback)
      try {
        // Find and update all matching images in DOM immediately
        const offerImages = document.querySelectorAll(`img[data-offer-id="${offer.id}"]`);
        if (offerImages.length > 0) {
          console.log(`🖼️ Found ${offerImages.length} images to update with fresh AI image`);
          const timestamp = Date.now();
          const forcedUrl = `${data.data.url}${data.data.url.includes('?') ? '&' : '?'}ai_generated=true&t=${timestamp}`;
          
          offerImages.forEach((element) => {
            const imgElement = element as HTMLImageElement;
            imgElement.src = forcedUrl;
            console.log('✅ Updated image element directly in DOM with AI image');
          });
        }
      } catch (err) {
        console.error('Error updating DOM with new AI image:', err);
      }
      
      // Schedule a page reload after a brief delay to ensure the server has processed the change
      // and all WebSocket notifications have been sent
      setTimeout(() => {
        console.log('🔄 Reloading page to show new AI-generated image');
        window.location.reload();
      }, 3000);
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
      // First try the specialized image cache API
      if (offer.banner_image) {
        try {
          // Call our new image caching API to permanently store the image
          const cacheResponse = await apiRequest('POST', '/api/images/cache', {
            url: offer.banner_image
          });
          
          if (cacheResponse.ok) {
            const cacheData = await cacheResponse.json();
            console.log('🔄 Image cache API response:', cacheData);
            
            // If the image was cached successfully, use the permanent URL
            if (cacheData.cached && cacheData.cachedUrl) {
              // Also call the regular offer refresh API
              const offerResponse = await apiRequest('POST', `/api/special-offers/refresh-image/${offer.id}`, {
                cachedImageUrl: cacheData.cachedUrl
              });
              
              if (offerResponse.ok) {
                const offerData = await offerResponse.json();
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
      const response = await apiRequest('POST', `/api/special-offers/refresh-image/${offer.id}`);
      
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
      
      if (onSuccess && imageUrlToUse) {
        onSuccess(imageUrlToUse);
      }
      
      // Aggressive approach to force image refresh
      try {
        // 1. Create a new image element with unique cache-busting URL
        const randomStr = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now();
        const forcedUrl = `${imageUrlToUse}${imageUrlToUse.includes('?') ? '&' : '?'}forced=true&t=${timestamp}&r=${randomStr}`;
        const img = createFreshImage(forcedUrl);
        
        // 2. Find and update all matching images in DOM immediately
        const offerImages = document.querySelectorAll(`img[data-offer-id="${offer.id}"]`);
        if (offerImages.length > 0) {
          console.log(`🖼️ Found ${offerImages.length} images to update with force refresh`);
          offerImages.forEach((element) => {
            const imgElement = element as HTMLImageElement;
            imgElement.src = forcedUrl;
            console.log('✅ Updated image element directly in DOM');
          });
        }
      } catch (err) {
        console.error('Error during direct DOM update:', err);
      }
      
      // 3. Force invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/special-offers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/special-offers/homepage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
      
      // 4. Reload page as final fallback, but with a longer delay
      // to allow WebSocket notifications to arrive first
      setTimeout(() => {
        console.log('🔄 Reloading page to show refreshed image');
        window.location.reload();
      }, 3000);
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
      if (message.type === 'special_offer_image_refresh' && 
          message.payload && 
          message.payload.offerId === offer.id) {
        
        console.log(`📡 WebSocket notification received for image refresh: ${offer.id}`);
        
        // Extract the updated image URL from the message
        const refreshedImageUrl = message.payload.imageUrl;
        
        if (refreshedImageUrl) {
          // Notify parent component if callback provided
          if (onSuccess) {
            onSuccess(refreshedImageUrl);
          }
          
          // Update all the matching image elements on the page
          setTimeout(() => {
            try {
              // Target all images with data-offer-id attribute matching this offer
              const offerImages = document.querySelectorAll(`img[data-offer-id="${offer.id}"]`);
              
              if (offerImages.length > 0) {
                console.log(`🖼️ Found ${offerImages.length} image elements to update`);
                
                offerImages.forEach((element) => {
                  const imgElement = element as HTMLImageElement;
                  // Force browser to reload the image by appending a timestamp
                  imgElement.src = `${refreshedImageUrl}&dom_update=true&t=${Date.now()}`;
                });
                
                // Invalidate queries to refresh any react components
                queryClient.invalidateQueries({ queryKey: ['/api/special-offers'] });
                queryClient.invalidateQueries({ queryKey: ['/api/special-offers/homepage'] });
                queryClient.invalidateQueries({ queryKey: ['/api/portal/clinic/special-offers'] });
                
                toast({
                  title: 'Image Updated',
                  description: 'The special offer image has been refreshed automatically.',
                });
              } else {
                console.log('⚠️ No matching image elements found on page for direct DOM update');
              }
            } catch (err) {
              console.error('Error updating image elements:', err);
            }
          }, 500); // Small delay to ensure DOM is ready
        }
      }
    };
    
    // Register the message handler with the correct message type
    registerMessageHandler('special_offer_image_refresh', handleOfferImageRefresh);
    
    // Cleanup on unmount
    return () => {
      unregisterMessageHandler('special_offer_image_refresh');
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