import React, { useEffect } from 'react';
import { Sparkles, Package, Percent } from 'lucide-react';

interface OfferImagePlaceholderProps {
  title: string;
  className?: string;
  type?: 'offer' | 'package';
}

/**
 * A placeholder component for use when a special offer or treatment package doesn't have an image
 * This creates a gradient background with the offer title and an appropriate icon
 */
const OfferImagePlaceholder: React.FC<OfferImagePlaceholderProps> = ({ 
  title, 
  className = '',
  type = 'offer'
}) => {
  // Log to confirm the component is being rendered
  useEffect(() => {
    console.log('OfferImagePlaceholder rendered for:', title, 'type:', type);
  }, [title, type]);

  // Select icon based on type
  const Icon = type === 'package' ? Package : type === 'offer' ? Percent : Sparkles;

  return (
    <div 
      className={`w-full h-full bg-gradient-to-r from-amber-100 to-amber-300 flex items-center justify-center ${className}`}
      style={{ minHeight: '120px' }} // Ensure minimum height for visibility
      data-testid="offer-placeholder"
    >
      <div className="text-center p-4">
        <Icon className="h-10 w-10 mx-auto mb-2 text-amber-600" />
        <p className="font-semibold text-lg text-amber-800">{title}</p>
      </div>
    </div>
  );
};

export default OfferImagePlaceholder;