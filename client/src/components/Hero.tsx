import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-light text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-6">Your Personal Health & Beauty Concierge in Istanbul</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">Skip the stress of researching clinics. Tell us what you need, and we'll match you with 3 top-rated providers in Istanbul—within your budget and preferred dates.</p>
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
