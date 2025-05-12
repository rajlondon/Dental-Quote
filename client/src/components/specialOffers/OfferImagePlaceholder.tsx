import React from 'react';
import { Sparkles } from 'lucide-react';

interface OfferImagePlaceholderProps {
  title: string;
  className?: string;
}

/**
 * A placeholder component for use when a special offer or treatment package doesn't have an image
 * This creates a gradient background with the offer title and a sparkle icon
 */
const OfferImagePlaceholder: React.FC<OfferImagePlaceholderProps> = ({ title, className = '' }) => {
  return (
    <div 
      className={`w-full h-full bg-gradient-to-r from-amber-100 to-amber-300 flex items-center justify-center ${className}`}
    >
      <div className="text-center p-4">
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-600" />
        <p className="font-semibold text-lg text-amber-800">{title}</p>
      </div>
    </div>
  );
};

export default OfferImagePlaceholder;