import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
}

export default function StarRating({ rating, onChange, size = 'medium', readonly = false }: StarRatingProps) {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      onChange(starRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}