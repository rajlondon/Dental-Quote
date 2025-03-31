import React from "react";
import istanbulImage from "@assets/image_1743447461115.png";

const Hero: React.FC = () => {
  return (
    <section className="relative text-white py-24 md:py-32">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${istanbulImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      />
      <div className="absolute inset-0 bg-black/45 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-6 drop-shadow-lg">Your Personal Health & Beauty Concierge in Istanbul</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-md">Skip the stress of researching clinics. Tell us what you need, and we'll match you with 3 top-rated providers in Istanbul—within your budget and preferred dates.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#quote-form" className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-neutral-100 transition-colors text-center">Get Your Free Quote</a>
            <a href="#how-it-works" className="inline-block bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors text-center">How It Works</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
