import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Define available languages
export const languages = {
  en: { nativeName: 'English', flag: '🇬🇧' },
  de: { nativeName: 'Deutsch', flag: '🇩🇪' },
  fr: { nativeName: 'Français', flag: '🇫🇷' },
  es: { nativeName: 'Español', flag: '🇪🇸' },
  nl: { nativeName: 'Nederlands', flag: '🇳🇱' },
  it: { nativeName: 'Italiano', flag: '🇮🇹' },
};

i18n
  // Load translation using http
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    supportedLngs: Object.keys(languages),
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Options for language detection
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    // React settings
    react: {
      useSuspense: true,
    },
    
    backend: {
      // Path where language resources will be stored
      loadPath: '/locales/{{lng}}/{{ns}}.json', 
    },
  });

export default i18n;