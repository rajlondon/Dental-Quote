import React from "react";
import { useTranslation } from "react-i18next";
import { Check, Shield, PiggyBank, Headset, GraduationCap, Building, Clock } from "lucide-react";
import SatisfactionChecks from "./SatisfactionChecks";

interface Feature {
  id: string;
  icon: React.ReactNode;
  translationKey: string;
  benefits?: { id: string; text: string; description?: string }[];
}

const features: Feature[] = [
  {
    id: "quality",
    icon: <Shield className="w-6 h-6 text-primary" />,
    translationKey: "quality",
    benefits: [
      { id: "accredited", text: "100% Accredited Clinics", description: "All clinics meet international quality standards" },
      { id: "specialized", text: "Specialized Dentists", description: "Experienced doctors with international training" },
      { id: "technology", text: "Latest Technology", description: "State-of-the-art equipment and materials" }
    ]
  },
  {
    id: "savings",
    icon: <PiggyBank className="w-6 h-6 text-primary" />,
    translationKey: "savings",
    benefits: [
      { id: "cost", text: "Up to 70% Cost Savings", description: "Significant savings compared to UK and EU prices" },
      { id: "transparent", text: "Transparent Pricing", description: "No hidden fees or surprise costs" },
      { id: "guarantee", text: "Treatment Guarantee", description: "Written warranty on dental work" }
    ]
  },
  {
    id: "support",
    icon: <Headset className="w-6 h-6 text-primary" />,
    translationKey: "support",
    benefits: [
      { id: "concierge", text: "Dedicated Concierge", description: "Personal assistance throughout your journey" },
      { id: "multilingual", text: "English-Speaking Staff", description: "No language barriers during your treatment" },
      { id: "aftercare", text: "Comprehensive Aftercare", description: "Support continues after you return home" }
    ]
  },
  {
    id: "convenience",
    icon: <Clock className="w-6 h-6 text-primary" />,
    translationKey: "convenience",
    benefits: [
      { id: "hotel", text: "Hotel Arrangements", description: "Comfortable accommodation options near your clinic" },
      { id: "transfer", text: "Airport & Clinic Transfers", description: "Hassle-free transportation" },
      { id: "tourism", text: "Tourism Opportunities", description: "Enjoy Istanbul between appointments" }
    ]
  }
];

const WhyChooseUs: React.FC = () => {
  const { t } = useTranslation();
  
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
            <div key={feature.id} className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50" tabIndex={0}>
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800">
                {t(`whyUs.${feature.translationKey}.title`, feature.translationKey.charAt(0).toUpperCase() + feature.translationKey.slice(1))}
              </h3>
              <p className="text-neutral-600 mb-4">
                {t(`whyUs.${feature.translationKey}.description`, 'We provide the highest standard of service in this area.')}
              </p>
              
              {feature.benefits && <SatisfactionChecks items={feature.benefits} />}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="#testimonials" 
            className="inline-block bg-transparent border-2 border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="View patient testimonials and success stories"
            tabIndex={0}
          >
            {t('navbar.testimonials', 'Read Testimonials')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
