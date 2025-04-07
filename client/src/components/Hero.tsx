import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight, Calculator, FileText } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import carousel images
import istanbulImage from "@assets/image_1743447461115.png";
import smileImage from "../../../public/images/carousel/Screenshot 2025-04-07 at 01.05.52.png";
import clinicImage from "../../../public/images/carousel/Screenshot 2025-04-07 at 01.15.14.png";

// Define the carousel slides
const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: istanbulImage,
    alt: "Istanbul city view"
  },
  {
    id: 2,
    image: clinicImage,
    alt: "Professional dental clinic"
  },
  {
    id: 3,
    image: smileImage,
    alt: "Happy dental patient smiling"
  },
];

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Initialize Embla Carousel with autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false }, [
    Autoplay({ delay: 6000, stopOnInteraction: false })
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);
  
  const scrollToCalculator = () => {
    // Find the PriceCalculator section and scroll to it
    const calculator = document.querySelector('.price-calculator-section');
    if (calculator) {
      calculator.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="relative text-white min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        <div className="embla overflow-hidden h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {CAROUSEL_SLIDES.map((slide) => (
              <div 
                key={slide.id} 
                className="embla__slide flex-[0_0_100%] h-full relative"
              >
                <div 
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat',
                    filter: 'brightness(1.1) saturate(1.2)',
                  }}
                  aria-label={slide.alt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-black/40 to-black/20 z-0"></div>
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-32 left-0 right-0 z-20 flex justify-center gap-2">
        {CAROUSEL_SLIDES.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "bg-white scale-110" : "bg-white/40"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Content with improved layout */}
      <div className="container mx-auto px-6 md:px-8 relative z-10 py-20 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight text-white drop-shadow-xl">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-white drop-shadow-md leading-relaxed max-w-2xl mx-auto">
            Save up to 70% on your dental treatment in Istanbul. Instant quotes, transparent pricing, and downloadable treatment plans.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-10">
            <Button 
              onClick={scrollToCalculator}
              className="group inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-neutral-100 font-semibold px-8 py-6 rounded-lg shadow-xl transition-all duration-300 text-center text-lg transform hover:-translate-y-1"
              size="lg"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Get Your Free Quote
              <ArrowDown className="w-5 h-5 group-hover:animate-bounce" />
            </Button>
            <Button 
              onClick={scrollToCalculator}
              variant="outline" 
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-6 rounded-lg hover:bg-white/10 transition-colors text-center shadow-lg"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Price List
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          {/* Key benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">70%</div>
              <p className="text-sm text-white/90">Savings vs UK prices</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <p className="text-sm text-white/90">Patient support</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <p className="text-sm text-white/90">Treatment guarantee</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">PDF</div>
              <p className="text-sm text-white/90">Instant quotes</p>
            </div>
          </div>
          
          {/* Add floating arrow pointing to the calculator */}
          <div className="hidden md:block absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
      
      {/* Curved separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white z-10" style={{ clipPath: 'ellipse(70% 50% at 50% 120%)' }}></div>
    </section>
  );
};

export default Hero;
