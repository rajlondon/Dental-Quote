import React from 'react';
import { X, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PromoRibbonProps {
  title: string | null;
  description: string | null | undefined;
  onClear?: () => void;
}

export const PromoRibbon: React.FC<PromoRibbonProps> = ({
  title,
  description,
  onClear
}) => {
  if (!title) return null;
  
  return (
    <div className="bg-green-600 text-white py-2 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
          <p className="text-sm font-medium">
            {title}: {description || 'Special promotion applied to your quote'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-green-700">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This promotion has been applied to your quote. 
                  You can remove it at any time to see regular pricing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onClear && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-green-700"
              onClick={onClear}
              title="Clear promotion"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoRibbon;