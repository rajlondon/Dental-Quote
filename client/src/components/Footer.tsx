import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-flex font-bold text-xl text-primary">
              MyDentalFly
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Making dental tourism simple, transparent, and affordable for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Treatments</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dental-implants" className="text-sm text-muted-foreground hover:text-primary">
                  Dental Implants
                </Link>
              </li>
              <li>
                <Link href="/veneers" className="text-sm text-muted-foreground hover:text-primary">
                  Veneers
                </Link>
              </li>
              <li>
                <Link href="/hollywood-smile" className="text-sm text-muted-foreground hover:text-primary">
                  Hollywood Smile
                </Link>
              </li>
              <li>
                <Link href="/full-mouth" className="text-sm text-muted-foreground hover:text-primary">
                  Full Mouth Restoration
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/team" className="text-sm text-muted-foreground hover:text-primary">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/quote-builder">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Get a Quote
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Pricing
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:contact@mydentalfly.com" 
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MyDentalFly. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy">
              <a className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms-of-service">
              <a className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;