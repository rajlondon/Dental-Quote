import React from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ConsistentPageHeaderProps {
  title: string;
  subtitle?: string;
  backButtonHref?: string;
  backButtonText?: string;
  showHomeButton?: boolean;
}

const ConsistentPageHeader: React.FC<ConsistentPageHeaderProps> = ({
  title,
  subtitle,
  backButtonHref = "/",
  backButtonText = "Back to Home",
  showHomeButton = true
}) => {
  const [location] = useLocation();

  // Check if we're in a portal (clinic, patient, or admin)
  const isInPortal = location.includes('-portal');

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
      {/* Only show main website navigation if NOT in a portal */}
      {!isInPortal && (
        <nav className="border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <img 
                    src="/images/mydentalfly-logo.png" 
                    alt="MyDentalFly" 
                    className="h-8 w-auto"
                  />
                  <span className="text-xl font-bold">MyDentalFly</span>
                </Link>

                <div className="hidden md:flex space-x-6">
                  <Link href="/" className="hover:text-primary-foreground/80">Home</Link>
                  <Link href="/your-quote" className="hover:text-primary-foreground/80">Quote Builder</Link>
                  <Link href="/patient-portal" className="hover:text-primary-foreground/80">Patient Portal</Link>
                  <Link href="/blog" className="hover:text-primary-foreground/80">Blog</Link>
                  <Link href="/contact" className="hover:text-primary-foreground/80">Contact</Link>
                  <Link href="/patient-portal" className="hover:text-primary-foreground/80">Patient Portal</Link>
                  <Link href="/clinic-portal" className="hover:text-primary-foreground/80">Clinic Portal</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-primary-foreground/80">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {showHomeButton && (
              <Button 
                variant="secondary" 
                asChild
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
            )}

            {backButtonHref && backButtonHref !== "/" && (
              <Button 
                variant="outline" 
                asChild
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href={backButtonHref}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backButtonText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ConsistentPageHeader;