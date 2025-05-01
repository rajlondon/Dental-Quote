import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// List of available languages
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }, // Arabic with UAE flag
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
  // Find the current language object
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  const changeLanguage = async (code: string) => {
    try {
      // Change language
      await i18n.changeLanguage(code);
      
      // Persist language selection
      localStorage.setItem('i18nextLng', code);
      
      // Trigger page refresh to ensure all components re-render with new language
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-flex">
            {currentLang.flag} {currentLang.name}
          </span>
          <span className="inline-flex md:hidden">
            {currentLang.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}