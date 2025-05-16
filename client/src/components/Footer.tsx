import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-transparent bg-clip-text">
                MyDentalFly
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted partner for affordable, high-quality dental care in Turkey.
              Compare clinics, get quotes, and book with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">Patients</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/quote" className="text-sm hover:underline">
                    Get a Quote
                  </Link>
                </li>
                <li>
                  <Link href="/offers" className="text-sm hover:underline">
                    Special Offers
                  </Link>
                </li>
                <li>
                  <Link href="/clinics" className="text-sm hover:underline">
                    Find a Clinic
                  </Link>
                </li>
                <li>
                  <Link href="/treatments" className="text-sm hover:underline">
                    Treatment Options
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Clinics</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/for-clinics" className="text-sm hover:underline">
                    Join Our Network
                  </Link>
                </li>
                <li>
                  <Link href="/clinic-portal" className="text-sm hover:underline">
                    Clinic Portal
                  </Link>
                </li>
                <li>
                  <Link href="/clinic-testimonials" className="text-sm hover:underline">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-sm hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm hover:underline">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm hover:underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-10 border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MyDentalFly. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">Facebook</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">Twitter</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;