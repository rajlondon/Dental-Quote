import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { languages, changeLanguageWithReload } from "../i18n";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize language from localStorage or browser detection
  useEffect(() => {
    const storedLang = localStorage.getItem('i18nextLng');
    const lang = storedLang || i18n.language || 'en';
    setCurrentLang(lang);
    
    // Ensure i18n is using the correct language
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang).catch(err => console.error('Error setting initial language:', err));
    }

    // Clean up the timeout on component unmount
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  const changeLanguage = async (lng: string) => {
    if (lng === currentLang) return;
    
    try {
      setChangingLanguage(true);
      
      // Show tooltip that language is changing
      setTooltipOpen(true);
      
      // Use the enhanced language change function that automatically reloads translations
      await changeLanguageWithReload(lng);
      
      // Update state after language change
      setCurrentLang(lng);
      
      // Show success tooltip for 2 seconds
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
      
      tooltipTimeout.current = setTimeout(() => {
        setTooltipOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setChangingLanguage(false);
    }
  };

  // Get current language data using our state variable for more reliability
  const currentLanguage = languages[currentLang as keyof typeof languages] || languages.en;

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen}>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-full shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                disabled={changingLanguage}
              >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="hidden sm:inline text-gray-700">{currentLanguage.nativeName}</span>
                {changingLanguage ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
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
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent side="bottom">
            <p className="text-sm">{t('language.changing')}</p>
          </TooltipContent>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t('language.select')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {Object.keys(languages).map((lng) => {
              const langData = languages[lng as keyof typeof languages];
              return (
                <DropdownMenuItem
                  key={lng}
                  className={`flex items-center gap-3 ${
                    currentLang === lng ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                  onClick={() => changeLanguage(lng)}
                  disabled={changingLanguage}
                >
                  <span className="text-lg">{langData.flag}</span>
                  <span>{langData.nativeName}</span>
                  {currentLang === lng && (
                    <svg
                      className="ml-auto h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LanguageSwitcher;