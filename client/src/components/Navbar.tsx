import React, { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { UserCircle2, Menu, X, Calculator } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to handle navigation to home page (force full page refresh)
  const goToHomePage = () => {
    window.location.href = "/"; // Force a full page refresh
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div onClick={goToHomePage} className="flex items-center cursor-pointer">
          <img 
            src="/images/my-dental-fly-logo.png" 
            alt="MyDentalFly Logo" 
            className="h-10 w-auto"
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/your-quote" className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            {t('navbar.get_quote', 'Get a Quote')}
          </Link>
          
          <Link href="/portal" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.patient_portal', 'Patient Portal')}
          </Link>
          
          <Link href="/clinic-portal" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.clinic_login', 'Clinic Login')}
          </Link>
          
          <Link href="/how-it-works" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.howItWorks', 'How It Works')}
          </Link>
          
          <a href="#contact" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.contact', 'Contact')}
          </a>
          
          <LanguageSwitcher />
        </div>
        
        <div className="md:hidden flex items-center gap-3">
          <Link href="/your-quote" className="bg-primary hover:bg-primary/90 text-white font-medium px-3 py-1.5 rounded-md flex items-center text-sm">
            <Calculator className="h-3 w-3 mr-1" />
            {t('navbar.get_quote', 'Quote')}
          </Link>
          
          <LanguageSwitcher />
          
          <button 
            className="text-primary p-1" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        }`} 
        id="mobileMenu"
      >
        <div className="px-4 py-3 space-y-4">
          <Link href="/your-quote" className="block text-primary font-medium hover:text-primary/80 transition-colors">
            {t('navbar.get_quote', 'Get a Quote')}
          </Link>
          
          <Link href="/portal" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.patient_portal', 'Patient Portal')}
          </Link>
          
          <Link href="/clinic-portal" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.clinic_login', 'Clinic Login')}
          </Link>
          
          <Link href="/how-it-works" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.howItWorks', 'How It Works')}
          </Link>
          
          <Link href="/about" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.about', 'About Us')}
          </Link>
          
          <a href="#contact" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.contact', 'Contact')}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
