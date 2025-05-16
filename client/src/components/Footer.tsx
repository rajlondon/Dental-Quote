import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MyDentalFly</h3>
            <p className="text-muted-foreground mb-4">
              Your trusted partner for high-quality dental treatments in Turkey at affordable prices.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-base mb-3">Treatments</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dental-implants">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Dental Implants
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/veneers">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Veneers
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/crowns">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Crowns
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/treatments">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    All Treatments
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-base mb-3">Get a Quote</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/quote-builder">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Build Your Quote
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/special-offers">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Special Offers
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Pricing Guide
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-base mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:info@mydentalfly.com" className="text-sm text-muted-foreground hover:text-primary">
                  info@mydentalfly.com
                </a>
              </li>
              <li>
                <a href="tel:+902125551234" className="text-sm text-muted-foreground hover:text-primary">
                  +90 212 555 1234
                </a>
              </li>
              <li className="text-sm text-muted-foreground">
                Istanbul, Turkey
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MyDentalFly. All rights reserved.
          </p>
          
          <div className="flex mt-4 sm:mt-0 gap-4">
            <Link href="/privacy-policy">
              <a className="text-xs text-muted-foreground hover:text-primary">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-xs text-muted-foreground hover:text-primary">
                Terms of Service
              </a>
            </Link>
            <Link href="/sitemap">
              <a className="text-xs text-muted-foreground hover:text-primary">
                Sitemap
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;