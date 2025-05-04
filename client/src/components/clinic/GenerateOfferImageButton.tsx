import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpecialOffer } from '@shared/specialOffers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
        description: 'The image cache has been refreshed. The page will update to show the current image.',
      });
      
      if (onSuccess && data.imageUrl) {
        onSuccess(data.imageUrl);
      }
      
      // Force clear browser cache for this image
      if (offer.banner_image) {
        // Create a new image element to force the browser to reload the image
        const img = new Image();
        img.src = data.imageUrl + '&forced=true';
      }
      
      // Force reload the page after a short delay
      setTimeout(() => {
        console.log('🔄 Reloading page to show refreshed image');
        window.location.reload();
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Image Refresh Failed',
        description: error.message || 'Could not refresh image at this time',
        variant: 'destructive',
      });
    },
  });

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