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

  // Function to handle navigation to home page (force full page refresh)
  const goToHomePage = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/"; // Force a full page refresh
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" onClick={goToHomePage} className="flex items-center">
          <div className="bg-white p-2 rounded-md shadow-sm mr-2">
            <img 
              src="/logo.png" 
              alt="Istanbul Dental Smile Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-neutral-700">Your Trusted Dental Treatment Concierge</p>
          </div>
        </a>
        <div className="hidden md:flex items-center space-x-6">
          <a href="/" onClick={goToHomePage} className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.home')}
          </a>
          <a href="#services" className="text-neutral-600 hover:text-primary transition-colors">{t('navbar.services')}</a>
          <Link href="/how-it-works" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.howItWorks')}
          </Link>
          <Link href="/blog" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.blog')}
          </Link>
          <Link href="/pricing" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.pricing')}
          </Link>
          <Link href="/team" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.team')}
          </Link>
          <Link href="/faq" className="text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.faq')}
          </Link>
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
          <a href="/" onClick={goToHomePage} className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.home')}
          </a>
          <a href="#services" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.services')}</a>
          <Link href="/how-it-works" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.howItWorks')}
          </Link>
          <Link href="/blog" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.blog')}
          </Link>
          <Link href="/pricing" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.pricing')}
          </Link>
          <Link href="/team" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.team')}
          </Link>
          <Link href="/faq" className="block text-neutral-600 hover:text-primary transition-colors">
            {t('navbar.faq')}
          </Link>
          <a href="#contact" className="block text-neutral-600 hover:text-primary transition-colors">{t('navbar.contact')}</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
