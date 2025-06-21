
import React from 'react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Users, Plane, Home } from 'lucide-react';

interface ConsistentPageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  showLocationInfo?: boolean;
  location?: string;
  travelDate?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
  children?: React.ReactNode;
}

const ConsistentPageHeader: React.FC<ConsistentPageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonText = "Back",
  onBackClick,
  showLocationInfo = false,
  location = "Istanbul, Turkey",
  travelDate,
  showProgress = false,
  currentStep = 1,
  totalSteps = 3,
  stepLabels = ["Treatment Plan", "Patient Info", "Matched Clinics"],
  children
}) => {
  const [, setLocation] = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="bg-blue-800 text-white shadow-lg">
      {/* Main Booking.com-style Header Bar */}
      <div className="bg-blue-800 border-b border-blue-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Main Navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <img 
                  src="/images/mydentalfly-logo.png" 
                  alt="MyDentalFly" 
                  className="h-8 w-auto mr-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold">MyDentalFly</span>
              </div>
              
              {/* Quick Navigation */}
              <nav className="hidden md:flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-blue-700"
                  onClick={() => setLocation('/')}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-blue-700"
                  onClick={() => setLocation('/your-quote')}
                >
                  Quote Builder
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-blue-700"
                  onClick={() => setLocation('/patient-portal')}
                >
                  My Account
                </Button>
              </nav>
            </div>

            {/* Right side - User Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white text-white hover:bg-white hover:text-blue-800"
                onClick={() => setLocation('/patient-portal')}
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                className="bg-white text-blue-800 hover:bg-gray-100"
                onClick={() => setLocation('/your-quote')}
              >
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page-specific Content */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 py-6">
        {/* Back Button Row */}
        {showBackButton && (
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackClick}
              className="text-white hover:bg-blue-500 hover:text-white border-white/20 border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButtonText}
            </Button>
          </div>
        )}

        {/* Main Header Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-blue-100 text-lg mb-4">
                {subtitle}
              </p>
            )}

            {/* Location and Travel Info */}
            {showLocationInfo && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{location}</span>
                </div>
                {travelDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{travelDate}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>1 Patient</span>
                </div>
              </div>
            )}
          </div>

          {/* Right side content */}
          {children && (
            <div className="flex-shrink-0">
              {children}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {showProgress && (
          <div className="mt-6 bg-blue-500/30 rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2 md:space-x-8">
                {stepLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className="relative flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isActive 
                            ? 'bg-white text-blue-600' 
                            : isCompleted 
                              ? 'bg-blue-400 text-white' 
                              : 'bg-blue-600 border-2 border-blue-300 text-blue-100'
                        }`}>
                          {stepNumber}
                        </div>
                        <div className="ml-3">
                          <div className="text-xs text-blue-100">Step {stepNumber}</div>
                          <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-blue-100'}`}>
                            {label}
                          </div>
                        </div>
                      </div>
                      
                      {/* Connector line */}
                      {index < stepLabels.length - 1 && (
                        <div className="hidden md:block w-8 h-0.5 bg-blue-300 ml-4"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ConsistentPageHeader;
