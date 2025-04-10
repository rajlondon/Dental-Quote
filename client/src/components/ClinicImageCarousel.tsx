import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  
  // Get clinic images based on clinicId
  const getClinicImages = (id: string): ClinicImage[] => {
    const baseUrl = `/images/clinics/${id}`;
    return [
      { 
        src: `${baseUrl}/exterior.jpg`, 
        alt: 'Clinic exterior', 
        caption: 'Clinic Building'
      },
      { 
        src: `${baseUrl}/interior.jpg`, 
        alt: 'Clinic interior', 
        caption: 'Treatment Area'
      },
      { 
        src: `${baseUrl}/team.jpg`, 
        alt: 'Clinic team', 
        caption: 'Our Expert Team'
      }
    ];
  };
  
  const images = getClinicImages(clinicId);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn("relative h-full overflow-hidden group", className)}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="flex-[0_0_100%] h-full relative min-w-0"
            >
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                {image.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows */}
      <button 
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button 
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollNext}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      
      {/* Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ClinicImageCarousel;