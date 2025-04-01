import React, { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-primary text-3xl">
            <i className="fas fa-tooth"></i>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl md:text-2xl text-primary">DentalMatch Istanbul</h1>
            <p className="text-xs text-neutral-500 hidden md:block">Your Trusted Dental Treatment Concierge</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#services" className="text-neutral-600 hover:text-primary transition-colors">{t('navbar.services')}</a>
          <a href="#how-it-works" className="text-neutral-600 hover:text-primary transition-colors">{t('navbar.howItWorks')}</a>
          <a href="#testimonials" className="text-neutral-600 hover:text-primary transition-colors">{t('navbar.testimonials')}</a>
          <a href="#faqs" className="text-neutral-600 hover:text-primary transition-colors">{t('navbar.faq')}</a>
          <a href="#contact" className="text-neutral-600 hover:text-primary transition-colors">{t('navbar.contact')}</a>
          <LanguageSwitcher />
        </div>
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button 
            className="text-primary text-xl" 
            id="mobileMenuButton" 
            onClick={toggleMobileMenu}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <div className={`md:hidden bg-white ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobileMenu">
        <div className="px-4 py-3 space-y-3 border-t">
          <a href="#services" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.services')}</a>
          <a href="#how-it-works" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.howItWorks')}</a>
          <a href="#testimonials" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.testimonials')}</a>
          <a href="#faqs" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.faq')}</a>
          <a href="#contact" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.contact')}</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
