import React, { useState } from "react";
// Removed react-i18next
import { UserCircle2, Menu, X, Calculator } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const SimpleNavbar: React.FC = () => {
  // Translation removed
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="w-full px-2 py-2 flex items-center justify-between">
        <div className="flex items-center cursor-pointer">
          <a href="/">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly Logo" 
              className="h-14 w-auto shadow-sm border border-gray-100 rounded-md p-1"
            />
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <a href="/your-quote" className="bg-[#0071c2] hover:bg-[#00487a] text-white font-bold px-4 py-1.5 rounded-md flex items-center text-sm">
            <Calculator className="h-4 w-4 mr-1.5" />
            Get a Quote
          </a>

          <div className="relative group">
            <a href="/dental-chart" className="text-neutral-600 hover:text-primary transition-colors text-xs flex items-center">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-9-9l-3 3m12 12l-3-3M3 3l3 3m12 12l3 3M3 21l3-3m12-12l3-3" />
              </svg>
              Dental Services
            </a>
            <div className="absolute hidden group-hover:block w-48 bg-white shadow-lg rounded-lg mt-1 py-1 z-50">
              <a href="/dental-chart" className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50">
                Interactive Dental Chart
              </a>
              <a href="/my-dental-chart" className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50">
                My Saved Dental Charts
              </a>
              <a href="/dental-advice" className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50">
                AI Dental Treatment Advice
              </a>
            </div>
          </div>

          <a href="/portal-login" className="text-neutral-600 hover:text-primary transition-colors text-xs">
            Patient Portal
          </a>

          <a href="/portal-login?type=clinic" className="text-neutral-600 hover:text-primary transition-colors text-xs">
            Clinic Login
          </a>

          <a href="/blog" className="text-neutral-600 hover:text-primary transition-colors text-xs">
            Blog
          </a>

          <a href="#contact" className="text-neutral-600 hover:text-primary transition-colors text-xs">
            Contact
          </a>

          <LanguageSwitcher />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <a href="/your-quote" className="bg-[#0071c2] hover:bg-[#00487a] text-white font-bold px-2 py-1 rounded-md flex items-center text-xs">
            <Calculator className="h-3 w-3 mr-1" />
            Quote
          </a>

          <a href="/dental-chart" className="text-neutral-600 hover:text-primary transition-colors flex items-center text-xs">
            <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-9-9l-3 3m12 12l-3-3M3 3l3 3m12 12l3 3M3 21l3-3m12-12l3-3" />
            </svg>
            Services
          </a>

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
          <a href="/your-quote" className="block py-1.5 bg-[#0071c2] text-white font-bold hover:bg-[#00487a] text-xs rounded px-3 mb-2">
            Get a Quote
          </a>

          <a href="/dental-chart" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            Interactive Dental Chart
          </a>

          <a href="/my-dental-chart" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            My Saved Dental Charts
          </a>

          <a href="/dental-advice" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            AI Dental Treatment Advice
          </a>

          <a href="/portal-login" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            Patient Portal
          </a>

          <a href="/portal-login?type=clinic" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            Clinic Login
          </a>

          <a href="/blog" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            Blog
          </a>

          <a href="/about" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            About Us
          </a>

          <a href="#contact" className="block text-neutral-600 hover:text-primary transition-colors text-xs">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;