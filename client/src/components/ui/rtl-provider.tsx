import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

// List of right-to-left languages
const RTL_LANGUAGES = ["ar"];

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTLProvider - Handles RTL text direction for languages like Arabic
 * 
 * This component automatically sets the correct text direction (RTL or LTR)
 * based on the currently selected language.
 */
export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || "en";
  
  // Determine if current language is RTL
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);
  
  // Update document direction when language changes
  useEffect(() => {
    // Set direction on html and body elements
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.body.dir = isRTL ? "rtl" : "ltr";
    
    // Add or remove RTL class to enable tailwind RTL styles
    if (isRTL) {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.classList.remove("rtl");
    };
  }, [isRTL, currentLanguage]);
  
  return <>{children}</>;
}