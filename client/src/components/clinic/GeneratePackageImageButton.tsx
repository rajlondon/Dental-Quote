import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratePackageImageButtonProps {
  onImageGenerated: (url: string) => void;
  title: string;
}

export function GeneratePackageImageButton({ 
  onImageGenerated, 
  title 
}: GeneratePackageImageButtonProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Mutation for generating a completely new image via OpenAI
  const generateImageMutation = useMutation({
    mutationFn: async () => {
      console.log(`Generating new AI image for package: ${title}`);
      
      // Generate the new image with OpenAI DALL-E
      const response = await apiRequest('POST', '/api/openai/treatment-package-image', {
        packageTitle: title,
        enableImageCache: true,
        timestamp: Date.now()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }
      
      const responseData = await response.json();
      console.log('AI image generation response:', responseData);
      
      return responseData;
    },
    onSuccess: (data) => {
      if (data.data.fromFallback) {
        toast({
          title: 'Using Fallback Image',
          description: 'OpenAI API rate limit reached. Using a quality fallback image instead.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'AI Image Generated',
          description: 'The AI has created a new image for your treatment package.',
        });
      }
      
      if (onImageGenerated && data.data && data.data.url) {
        console.log('Calling onImageGenerated with new image URL:', data.data.url);
        onImageGenerated(data.data.url);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Image Generation Failed',
        description: error.message || 'Could not generate image at this time',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerateImage = () => {
    setIsGenerating(true);
    generateImageMutation.mutate();
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isGenerating}
      onClick={handleGenerateImage}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      {isGenerating ? 'Generating...' : 'AI Generate Image'}
    </Button>
  );
}

export default GeneratePackageImageButton;