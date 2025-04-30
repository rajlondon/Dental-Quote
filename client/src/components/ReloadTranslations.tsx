import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '../i18n';
import { useToast } from "@/hooks/use-toast";

/**
 * This component monitors for language changes and provides visual feedback
 * when translations are reloaded. It doesn't render anything visible.
 */
const ReloadTranslations: React.FC = () => {
  const { i18n } = useTranslation();
  const [previousLang, setPreviousLang] = useState(i18n.language || 'en');
  const { toast } = useToast();

  useEffect(() => {
    // Skip translation reload events on clinic portal
    const isClinicPortal = typeof window !== 'undefined' && 
      window.location.pathname.includes('clinic-portal');
      
    if (isClinicPortal) {
      console.log('🛡️ ReloadTranslations component disabled on clinic portal');
      return; // Early return to prevent setting up listeners
    }
    
    // Monitor for language changes
    const handleLanguageChanged = (lng: string) => {
      // Prevent handling on clinic portal to avoid refreshes
      if (window.location.pathname.includes('clinic-portal')) {
        console.log('🛡️ Blocked translation event on clinic portal');
        return;
      }
      
      if (lng !== previousLang) {
        // Get language names for display
        const prevLangData = languages[previousLang as keyof typeof languages] || languages.en;
        const newLangData = languages[lng as keyof typeof languages] || languages.en;
        
        // Show toast notification when language changes
        toast({
          title: `${newLangData.flag} Language Changed`,
          description: `Switched from ${prevLangData.nativeName} to ${newLangData.nativeName}`,
          duration: 3000,
        });
        
        // Update the previous language
        setPreviousLang(lng);
      }
    };

    // Add language changed event listener
    i18n.on('languageChanged', handleLanguageChanged);
    
    // Clean up event listener
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, previousLang, toast]);

  return null; // This component doesn't render anything visible
};

export default ReloadTranslations;