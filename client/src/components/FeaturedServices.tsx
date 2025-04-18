import React from "react";
import { useTranslation } from "react-i18next";
import istanbulImage from "@assets/image_1743447461115.png";
import veneersSvg from "../assets/dental-veneers.svg";
import implantsSvg from "../assets/dental-implants.svg";
import crownsSvg from "../assets/dental-crowns.svg";
import hollywoodSvg from "../assets/hollywood-smile.svg";
import orthodonticsSvg from "../assets/orthodontics.svg";
import packageSvg from "../assets/dental-package.svg";

interface Service {
  id: string;
  translationKey: string;
  image: string;
}

// City image for packages
const cityImage = istanbulImage;

const services: Service[] = [
  {
    id: "veneers",
    translationKey: "veneers",
    image: veneersSvg
  },
  {
    id: "implants",
    translationKey: "implants",
    image: implantsSvg
  },
  {
    id: "crowns",
    translationKey: "crowns",
    image: crownsSvg
  },
  {
    id: "hollywood",
    translationKey: "hollywood",
    image: hollywoodSvg
  },
  {
    id: "orthodontics",
    translationKey: "orthodontics",
    image: orthodonticsSvg
  },
  {
    id: "package",
    translationKey: "package",
    image: packageSvg
  }
];

const FeaturedServices: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-sky-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">
            {t('services.title')}
          </h2>
          <div className="h-1 w-20 bg-primary-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-neutral-600">{t('services.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-full h-52 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="bg-white/80 p-3 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 z-10 group-hover:scale-105">
                  <img 
                    src={service.image} 
                    alt={t(`services.${service.translationKey}.title`)} 
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-xl mb-3 text-primary-600 group-hover:text-primary-700 transition-colors">
                  {t(`services.${service.translationKey}.title`)}
                </h3>
                <p className="text-neutral-600 mb-5 text-sm lg:text-base">
                  {t(`services.${service.translationKey}.description`)}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`services.${service.translationKey}.feature1`)}
                  </span>
                  <span className="flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.879A10 10 0 1110.999 8.505l8.5 8.5" />
                    </svg>
                    {t(`services.${service.translationKey}.feature2`)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
