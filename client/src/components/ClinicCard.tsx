import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Award, Stethoscope } from 'lucide-react';

interface ClinicCardProps {
  clinic: {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    yearsExperience?: number;
    imageUrl?: string;
    isPromoted?: boolean;
    isPartner?: boolean;
    waitTime?: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * A card component for displaying clinic information
 */
const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  const {
    id,
    name,
    location,
    rating,
    reviewCount,
    specialties,
    yearsExperience,
    imageUrl,
    isPromoted,
    isPartner,
    waitTime,
  } = clinic;

  const handleClick = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  // Convert rating to stars
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half-star"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Card 
      className={`
        w-full transition-all duration-200 hover:shadow-md 
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
              <CardDescription>{location}</CardDescription>
            </div>
          </div>
          
          {imageUrl && (
            <div className="h-16 w-16 rounded-md overflow-hidden">
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
        
        {(isPromoted || isPartner) && (
          <div className="absolute top-3 right-3">
            {isPromoted && <Badge variant="default">Featured</Badge>}
            {isPartner && <Badge variant="outline" className="ml-2">Partner</Badge>}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center mb-2">
          <div className="flex mr-2">
            {renderStars()}
          </div>
          <span className="text-sm">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="flex items-center">
              <Stethoscope className="h-3 w-3 mr-1" />
              {specialty}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Badge variant="outline">+{specialties.length - 3} more</Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center text-sm">
          {yearsExperience && (
            <div className="flex items-center mr-4">
              <Award className="h-4 w-4 text-muted-foreground mr-1" />
              <span>{yearsExperience}+ years exp.</span>
            </div>
          )}
          
          {waitTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              <span>{waitTime} wait time</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClinicCard;