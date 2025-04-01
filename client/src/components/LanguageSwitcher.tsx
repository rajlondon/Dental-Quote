import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "../i18n";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  // Initialize language from localStorage or browser detection
  useEffect(() => {
    const storedLang = localStorage.getItem('i18nextLng');
    const lang = storedLang || i18n.language || 'en';
    setCurrentLang(lang);
    
    // Ensure i18n is using the correct language
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang).catch(err => console.error('Error setting initial language:', err));
    }
  }, []);

  const changeLanguage = (lng: string) => {
    // Using the correct signature for changeLanguage
    i18n.changeLanguage(lng)
      .then(() => {
        // Update state after language change
        setCurrentLang(lng);
        setIsOpen(false);
        
        // Reload the page to ensure all translations are properly loaded
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error changing language:', error);
      });
  };

  // Get current language data using our state variable for more reliability
  const currentLanguage = languages[currentLang as keyof typeof languages] || languages.en;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-full shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline text-gray-700">{currentLanguage.nativeName}</span>
        <svg
          className="h-4 w-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-10 border border-gray-100">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
            {t('language.select')}
          </div>
          {Object.keys(languages).map((lng) => {
            const langData = languages[lng as keyof typeof languages];
            return (
              <button
                key={lng}
                className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  currentLang === lng ? "bg-primary-50 text-primary-600" : "text-gray-700"
                }`}
                onClick={() => changeLanguage(lng)}
              >
                <span className="text-lg">{langData.flag}</span>
                <span>{langData.nativeName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;