import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClinicImageCarouselProps {
  clinicId: string;
  className?: string;
}

interface ClinicImage {
  src: string;
  alt: string;
  caption: string;
}

const ClinicImageCarousel: React.FC<ClinicImageCarouselProps> = ({ clinicId, className }) => {
  // Define clinic images for each clinic (exterior, interior, team photos)
  const clinicImages: Record<string, ClinicImage[]> = {
    'istanbul-dental-care': [
      {
        src: '/images/clinics/istanbul-dental-care/exterior.jpg',
        alt: 'Istanbul Dental Care Clinic Exterior',
        caption: 'Clinic Exterior'
      },
      {
        src: '/images/clinics/istanbul-dental-care/interior.jpg',
        alt: 'Istanbul Dental Care Clinic Interior',
        caption: 'Reception Area'
      },
      {
        src: '/images/clinics/istanbul-dental-care/team.jpg',
        alt: 'Istanbul Dental Care Team',
        caption: 'Our Dental Team'
      }
    ],
    'dentgroup-istanbul': [
      {
        src: '/images/clinics/dentgroup-istanbul/exterior.jpg',
        alt: 'DentGroup Istanbul Exterior',
        caption: 'Clinic Exterior'
      },
      {
        src: '/images/clinics/dentgroup-istanbul/interior.jpg',
        alt: 'DentGroup Istanbul Interior',
        caption: 'Modern Treatment Room'
      },
      {
        src: '/images/clinics/dentgroup-istanbul/team.jpg',
        alt: 'DentGroup Istanbul Team',
        caption: 'Our Specialists'
      }
    ],
    'maltepe-dental-clinic': [
      {
        src: '/images/clinics/maltepe-dental-clinic/exterior.jpg',
        alt: 'Maltepe Dental Clinic Exterior',
        caption: 'Clinic Exterior'
      },
      {
        src: '/images/clinics/maltepe-dental-clinic/interior.jpg',
        alt: 'Maltepe Dental Clinic Interior',
        caption: 'Premium Waiting Area'
      },
      {
        src: '/images/clinics/maltepe-dental-clinic/team.jpg',
        alt: 'Maltepe Dental Clinic Team',
        caption: 'Our Expert Team'
      }
    ]
  };

  const images = clinicImages[clinicId] || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // If no images are available, show a placeholder
  if (images.length === 0) {
    return (
      <div className={`h-full w-full bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Clinic Images Not Available</span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full group ${className}`}>
      {/* Main image */}
      <div className="w-full h-full overflow-hidden">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="w-full h-full object-cover transition-all duration-300"
        />
        
        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm">
          {images[currentIndex].caption}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute inset-0 flex items-center justify-between p-2">
        <Button
          onClick={prevSlide}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white bg-opacity-80 text-gray-800 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={nextSlide}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white bg-opacity-80 text-gray-800 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full ${
              currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ClinicImageCarousel;