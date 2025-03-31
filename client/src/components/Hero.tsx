import React from "react";
import istanbulImage from "@assets/image_1743447461115.png";

const Hero: React.FC = () => {
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
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight text-white drop-shadow-xl">
            Your Personal Dental Treatment Concierge in Istanbul
          </h1>
          
          <p className="text-lg md:text-xl mb-10 text-white drop-shadow-md leading-relaxed max-w-2xl mx-auto">
            Skip the stress of researching dental clinics. Tell us what treatment you need, and we'll match you with 3 top-rated dental providers in Istanbul—offering premium care at up to 70% savings.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <a 
              href="#quote-form" 
              className="inline-block bg-white text-primary font-semibold px-8 py-4 rounded-lg shadow-xl hover:bg-neutral-100 transition-all duration-300 text-center transform hover:-translate-y-1"
            >
              Get Your Free Dental Quote
            </a>
            <a 
              href="#how-it-works" 
              className="inline-block bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-center shadow-lg"
            >
              How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
