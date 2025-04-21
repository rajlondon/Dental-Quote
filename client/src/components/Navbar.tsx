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
      <div className="w-full px-2 py-2 flex items-center justify-between">
        <div onClick={goToHomePage} className="flex items-center cursor-pointer">
          <img 
            src="/images/mydentalfly-logo.png" 
            alt="MyDentalFly Logo" 
            className="h-14 w-auto shadow-sm border border-gray-100 rounded-md p-1"
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <Link 
            href="/your-quote" 
            className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow transition-all duration-300 text-white font-medium px-4 py-1.5 rounded-md flex items-center text-xs"
            aria-label="Get My Quote - Build your personalized dental treatment plan"
          >
            <Calculator className="h-3 w-3 mr-1" />
            {t('navbar.get_quote', 'Get a Quote')}
          </Link>
          
          <div className="relative group">
            <Link href="/dental-chart" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-md flex items-center text-xs">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-9-9l-3 3m12 12l-3-3M3 3l3 3m12 12l3 3M3 21l3-3m12-12l3-3" />
              </svg>
              Dental Chart
            </Link>
            <div className="absolute hidden group-hover:block w-48 bg-white shadow-lg rounded-lg mt-1 py-1 z-50">
              <Link href="/dental-chart" className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50">
                Interactive Dental Chart
              </Link>
              <Link href="/my-dental-chart" className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50">
                My Saved Dental Charts
              </Link>
            </div>
          </div>
          
          <div className="relative group">
            <Link 
              href="/portal-login" 
              className="text-neutral-600 hover:text-primary transition-colors text-xs flex items-center"
              aria-label="Patient Portal - Access your treatment plans, appointments, and messages"
            >
              <span className="flex items-center">
                {t('navbar.patient_portal', 'Patient Portal')}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
            </Link>
            <div className="absolute hidden group-hover:block w-64 bg-white shadow-lg rounded-lg mt-1 py-2 px-3 left-0 z-50 text-xs">
              <p className="font-medium text-gray-900 mb-1">Patient Portal</p>
              <p className="text-gray-600 mb-2">Access your dental treatment plans, manage appointments, and communicate with your dental providers.</p>
              <div className="flex items-center text-primary mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"></path>
                </svg>
                <span>No login required for browsing</span>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <span className="text-neutral-600 hover:text-primary transition-colors text-xs cursor-pointer flex items-center">
              {t('navbar.clinic_login', 'Clinic Login')}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <div className="absolute hidden group-hover:block w-64 bg-white shadow-lg rounded-lg mt-1 py-2 px-3 right-0 z-50">
              <p className="font-medium text-gray-900 mb-1">Clinic Portal</p>
              <p className="text-gray-600 mb-2">Secure access for dental clinics to manage patient records, appointments, and treatment plans.</p>
              <div className="flex items-center text-blue-600 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Secure login required</span>
              </div>
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link href="/clinic-portal" className="block px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    Clinic Dashboard
                  </span>
                </Link>
                <Link href="/clinic-dental-charts" className="block px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-9-9l-3 3m12 12l-3-3M3 3l3 3m12 12l3 3M3 21l3-3m12-12l3-3"></path>
                    </svg>
                    Patient Dental Charts
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <Link href="/how-it-works" className="text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.howItWorks', 'How It Works')}
          </Link>
          
          <a href="#contact" className="text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.contact', 'Contact')}
          </a>
          
          <LanguageSwitcher />
        </div>
        
        <div className="md:hidden flex items-center gap-2">
          <Link 
            href="/your-quote" 
            className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow transition-all duration-300 text-white font-medium px-3 py-1.5 rounded-md flex items-center text-xs"
            aria-label="Get My Quote - Build your personalized dental treatment plan"
          >
            <Calculator className="h-3 w-3 mr-1" />
            {t('navbar.get_quote', 'Quote')}
          </Link>
          
          <Link href="/dental-chart" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 rounded-md flex items-center text-xs">
            <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-9-9l-3 3m12 12l-3-3M3 3l3 3m12 12l3 3M3 21l3-3m12-12l3-3" />
            </svg>
            Chart
          </Link>
          
          <LanguageSwitcher />
          
          <button 
            className="text-primary p-1" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-64' : 'max-h-0'
        }`} 
        id="mobileMenu"
      >
        <div className="px-3 py-2 space-y-2">
          <Link href="/your-quote" className="block text-primary font-medium hover:text-primary/80 transition-colors text-xs">
            {t('navbar.get_quote', 'Get a Quote')}
          </Link>
          
          <Link href="/dental-chart" className="block text-blue-600 hover:text-blue-700 transition-colors text-xs font-medium">
            Interactive Dental Chart
          </Link>
          
          <Link href="/my-dental-chart" className="block text-blue-500 hover:text-blue-600 transition-colors text-xs">
            My Saved Dental Charts
          </Link>
          
          <Link href="/portal-login" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.patient_portal', 'Patient Portal')}
          </Link>
          
          <Link href="/clinic-portal" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.clinic_login', 'Clinic Login')}
          </Link>
          
          <Link href="/clinic-dental-charts" className="block pl-4 text-gray-500 hover:text-primary transition-colors text-xs">
            Patient Dental Charts
          </Link>
          
          <Link href="/how-it-works" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.howItWorks', 'How It Works')}
          </Link>
          
          <Link href="/about" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.about', 'About Us')}
          </Link>
          
          <a href="#contact" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            {t('navbar.contact', 'Contact')}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
