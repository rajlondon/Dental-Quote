import React from "react";
import { useTranslation } from "react-i18next";
import istanbulImage from "@assets/image_1743447461115.png";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative text-white min-h-[90vh] flex items-center">
      {/* Background image with enhanced styling */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: `url(${istanbulImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.1) saturate(1.2)',
        }}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-black/40 to-black/20 z-0"></div>
      
      {/* Content with improved layout */}
      <div className="container mx-auto px-6 md:px-8 relative z-10 py-20 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight text-white drop-shadow-xl">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-white drop-shadow-md leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-10">
            <a 
              href="#quote-form" 
              className="group inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-neutral-100 font-semibold px-8 py-4 rounded-lg shadow-xl transition-all duration-300 text-center text-lg transform hover:-translate-y-1"
            >
              {t('hero.cta')}
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </a>
            <a 
              href="#how-it-works" 
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-center shadow-lg"
            >
              {t('navbar.howItWorks')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          
          {/* Add floating arrow pointing to the form */}
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
