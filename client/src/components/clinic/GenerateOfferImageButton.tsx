import React from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpecialOffer } from '@shared/specialOffers';

interface GenerateOfferImageButtonProps {
  offer: SpecialOffer;
  onSuccess?: (imageUrl: string) => void;
}

export function GenerateOfferImageButton({ 
  offer, 
  onSuccess 
}: GenerateOfferImageButtonProps) {
  const { toast } = useToast();

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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateImageMutation.mutate()}
      disabled={generateImageMutation.isPending}
      className="flex items-center gap-1 text-xs"
      title="OpenAI has a rate limit of 15 images per minute. Fallback images will be used if the limit is reached."
    >
      <Sparkles className="h-3 w-3 mr-1" />
      {generateImageMutation.isPending ? 'Generating...' : 'Generate Image'}
    </Button>
  );
}