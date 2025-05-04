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
      const response = await apiRequest('POST', '/api/openai/special-offer-image', {
        offerId: offer.id,
        offerTitle: offer.title,
        offerType: offer.promotion_level || 'premium'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.data.fromFallback) {
        toast({
          title: 'Using Fallback Image',
          description: 'OpenAI API rate limit reached (15 images per minute). Using a quality fallback image instead.',
          variant: 'default',
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
      const response = await apiRequest('POST', `/api/special-offers/refresh-image/${offer.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh image');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Image Refreshed',
        description: 'The image cache has been refreshed. The page will update shortly.',
      });
      
      if (onSuccess && data.imageUrl) {
        onSuccess(data.imageUrl);
      }
      
      // Aggressive approach to force image refresh
      try {
        // 1. Create a new image element with unique cache-busting URL
        const randomStr = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now();
        const forcedUrl = `${data.imageUrl}&forced=true&t=${timestamp}&r=${randomStr}`;
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