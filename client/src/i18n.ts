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

// Create a static cache key to prevent browser caching
const cacheKey = `v=${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}${new Date().getHours()}`;

// Force reload translations on startup
const forceReload = () => {
  try {
    if (i18n.isInitialized) {
      i18n.reloadResources();
    }
  } catch (error) {
    console.error('Error reloading translations:', error);
  }
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
    debug: true, // Enable debug to see issues
    
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
      useSuspense: false, // Changed to false to avoid issues with loading
    },
    
    backend: {
      // Path where language resources will be stored
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      queryStringParams: { v: cacheKey }, // Static cache-busting parameter for the session
      allowMultiLoading: false,
      crossDomain: false // Disable CORS for local resources
    },
    
    // Ensure defaults are loaded
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Make sure missing keys don't break the app
    returnNull: false,
    returnEmptyString: false,
    saveMissing: false, // Don't try to save missing translations
    
    load: 'currentOnly', // Only load the current language
    preload: ['en'], // Preload English as fallback
  }, () => {
    // After initialization, force a reload of resources
    setTimeout(forceReload, 500);
  });

// Helper function to explicitly reload translations 
export const reloadTranslations = () => {
  return i18n.reloadResources();
};

// Export language change function with reload for convenience
export const changeLanguageWithReload = (lang: string) => {
  return i18n.changeLanguage(lang).then(() => {
    return i18n.reloadResources();
  });
};

export default i18n;