import React from "react";

interface Feature {
  id: string;
  icon: string;
  translationKey: string;
}

const features: Feature[] = [
  {
    id: "quality",
    icon: "fas fa-check-circle",
    translationKey: "quality"
  },
  {
    id: "savings",
    icon: "fas fa-euro-sign",
    translationKey: "savings"
  },
  {
    id: "support",
    icon: "fas fa-comments",
    translationKey: "support"
  },
  {
    id: "convenience",
    icon: "fas fa-concierge-bell",
    translationKey: "convenience"
  }
];

const WhyChooseUs: React.FC = () => {
  // Translation removed
  
  return (
    <section id="why-us" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">
            {t('whyUs.title')}
          </h2>
          <p className="text-neutral-600">{t('whyUs.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className={`${feature.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800">
                {t(`whyUs.${feature.translationKey}.title`)}
              </h3>
              <p className="text-neutral-600">
                {t(`whyUs.${feature.translationKey}.description`)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#testimonials" className="inline-block bg-transparent border-2 border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors">
            {t('navbar.testimonials')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
