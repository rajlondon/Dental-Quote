import React from "react";

interface Step {
  number: number;
  translationKey: string;
}

const steps: Step[] = [
  {
    number: 1,
    translationKey: "step1"
  },
  {
    number: 2,
    translationKey: "step2"
  },
  {
    number: 3,
    translationKey: "step3"
  },
  {
    number: 4,
    translationKey: "step4"
  }
];

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section id="how-it-works" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-neutral-600">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-8 shadow-md relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xl">
                {step.number}
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-primary pt-2">
                {t(`howItWorks.${step.translationKey}.title`)}
              </h3>
              <p className="text-neutral-600">
                {t(`howItWorks.${step.translationKey}.description`)}
              </p>
              <ul className="mt-4 space-y-2 text-neutral-600">
                {(() => {
                  try {
                    const features = t(`howItWorks.${step.translationKey}.features`, { returnObjects: true });
                    if (Array.isArray(features)) {
                      return features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                          <span>{feature}</span>
                        </li>
                      ));
                    }
                    return null;
                  } catch (error) {
                    console.error(`Error rendering features for ${step.translationKey}:`, error);
                    return null;
                  }
                })()}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#quote-form" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-primary-dark transition-colors">
            {t('hero.cta')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
