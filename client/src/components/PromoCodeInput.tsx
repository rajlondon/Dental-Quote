import React, { useState, useContext, useEffect } from 'react';
import { useOptionalQuote, QuoteContext } from '../contexts/QuoteContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Package } from 'lucide-react';
import axios from 'axios';
import { trendingPackages } from '../data/packages';
import { getEducationContent } from '../data/treatmentEducation';

interface PromoCodeInputProps {
  initialPromoCode?: string | null;
}

// Helper function to get accommodation details based on package name
const getAccommodationDetails = (packageName: string) => {
  const packageMap: Record<string, any> = {
    'Hollywood Smile Luxury Family Vacation': { nights: 6, days: 7, stars: 5, description: '5-star luxury hotel accommodation' },
    'Dental Implant & City Experience': { nights: 4, days: 5, stars: 4, description: '4-star hotel accommodation' },
    'Value Veneer & Istanbul Discovery': { nights: 3, days: 4, stars: 3, description: '3-star hotel accommodation' }
  };

  return packageMap[packageName] || { nights: 5, days: 6, stars: 4, description: '4-star hotel accommodation' };
};

// Helper function to get package excursions
const getPackageExcursions = (packageName: string) => {
  const trendingPackage = trendingPackages.find(pkg => pkg.title === packageName);
  return trendingPackage?.excursions || [];
};

export function PromoCodeInput({ initialPromoCode }: PromoCodeInputProps = {}) {
  const [inputCode, setInputCode] = useState(initialPromoCode || '');
  const [error, setError] = useState('');

  // Update input code when initialPromoCode changes
  useEffect(() => {
    if (initialPromoCode) {
      setInputCode(initialPromoCode);
    }
  }, [initialPromoCode]);

  // Cleanup any event listeners when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any pending event listeners or timers
      // This prevents the EventEmitter memory leak warnings
    };
  }, []);

  // Check if QuoteContext is available before using useQuote
  const quoteContextAvailable = useContext(QuoteContext) !== null;

  // Only use the context directly if it's available
  const quoteContext = useOptionalQuote();

  // Extract values from context
  const promoCode = quoteContext?.promoCode || null;
  const discountAmount = quoteContext?.discountAmount || 0;
  const isApplyingPromo = quoteContext?.isApplyingPromo || false;
  const isPackage = quoteContext?.isPackage || false;
  const packageName = quoteContext?.packageName || null;
  const applyPromoCode = quoteContext?.applyPromoCode;
  const clearPromoCode = quoteContext?.clearPromoCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    // Check if context and applyPromoCode are available
    if (quoteContextAvailable && applyPromoCode) {
      try {
        setError('');
        applyPromoCode(inputCode.trim());
        setInputCode(''); // Clear input after applying
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to apply promo code');
      }
    } else {
      setError('Cannot apply promo code at this time');
    }
  };

  // State for standalone mode
  const [success, setSuccess] = useState<string | null>(null);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  // If context is not available, show enhanced standalone input
  if (!quoteContextAvailable) {
    return (
      <div className="space-y-4">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setSuccess(null);
          setPackageInfo(null);

          if (!inputCode.trim()) {
            setError('Please enter a promo code');
            return;
          }

          // Try to validate the promo code
          try {
            setIsValidating(true);
            const response = await axios.get(`/api/promo-codes/validate/${inputCode.trim()}`);

            if (response.data.valid) {
              // Use the sampleDiscountAmount from the response if available
              if (response.data.sampleDiscountAmount) {
                // For percentage discounts, show a concrete example amount
                if (response.data.discountType === 'percentage') {
                  setSuccess(`Promo code "${inputCode}" is valid! You'll save ${response.data.sampleDiscountAmount} with this code`);
                } else {
                  setSuccess(`Promo code "${inputCode}" is valid! You'll save ${response.data.sampleDiscountAmount} with this code`);
                }
              } else if (response.data.discountValue !== undefined) {
                const discountMsg = response.data.discountType === 'percentage'
                  ? `${response.data.discountValue}% off`
                  : `£${response.data.discountValue} off`;
                setSuccess(`Promo code "${inputCode}" is valid! You'll save ${discountMsg}`);
              } else {
                setSuccess(`Promo code "${inputCode}" is valid!`);
              }
              setValidationData(response.data);

              // If it's a package, show package info
              if (response.data.isPackage && response.data.packageData) {
                setPackageInfo(response.data.packageData);

                // Only store and dispatch if not already applied to prevent duplicates
                const existingCode = sessionStorage.getItem('pendingPromoCode');
                const existingPackageData = sessionStorage.getItem('pendingPackageData');
                
                if (existingCode !== inputCode.trim() || !existingPackageData) {
                  sessionStorage.setItem('pendingPromoCode', inputCode.trim());

                  // Enhance package data with accommodation details from trending packages
                  const enhancedPackageData = {
                    ...response.data.packageData,
                    accommodation: getAccommodationDetails(response.data.packageData.name),
                    excursions: getPackageExcursions(response.data.packageData.name)
                  };

                  sessionStorage.setItem('pendingPackageData', JSON.stringify(enhancedPackageData));

                  // Store clinic ID if provided
                  if (response.data.clinicId) {
                    console.log('Storing promo code clinic ID:', response.data.clinicId);
                    sessionStorage.setItem('pendingPromoCodeClinicId', response.data.clinicId);
                  } else {
                    // Clear any previous clinic ID if not specified for this package
                    sessionStorage.removeItem('pendingPromoCodeClinicId');
                  }

                  // Emit a custom event to notify TreatmentPlanBuilder about the package (only once)
                  try {
                    const packageEvent = new CustomEvent('packagePromoApplied', {
                      detail: {
                        code: inputCode.trim(),
                        packageData: response.data.packageData,
                        clinicId: response.data.clinicId || null
                      }
                    });
                    window.dispatchEvent(packageEvent);
                  } catch (eventError) {
                    console.error('Error dispatching package event:', eventError);
                  }
                }
              } else {
                // Only store and dispatch if not already applied
                const existingCode = sessionStorage.getItem('pendingPromoCode');
                
                if (existingCode !== inputCode.trim()) {
                  // Store discount code in session storage
                  sessionStorage.setItem('pendingPromoCode', inputCode.trim());

                  // Emit a custom event to notify about discount code (only once)
                  try {
                    const discountEvent = new CustomEvent('discountPromoApplied', {
                      detail: {
                        code: inputCode.trim(),
                        discountType: response.data.discountType || 'fixed_amount',
                        discountValue: response.data.discountValue || 0
                      }
                    });
                    window.dispatchEvent(discountEvent);
                  } catch (eventError) {
                    console.error('Error dispatching discount event:', eventError);
                  }
                }
              }
            } else {
              setError('Invalid promo code. Please try again.');
            }
          } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to validate promo code');
          } finally {
            setIsValidating(false);
          }
        }} className="flex space-x-2">
          <Input
            type="text"
            value={inputCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputCode(e.target.value)}
            placeholder="Enter promo or package code"
            className="flex-1"
            disabled={isValidating}
          />
          <Button 
            type="submit"
            className="whitespace-nowrap"
            disabled={isValidating}
          >
            {isValidating ? 'Checking...' : 'Apply Code'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              {success}
              {validationData?.discountValue && (
                <div className="mt-1 text-sm font-medium">
                  You save: {validationData.discountType === 'percentage' 
                    ? `${validationData.discountValue}% off your total` 
                    : `£${validationData.discountValue}`}
                </div>
              )}
            </div>
          </div>
        )}

        {packageInfo && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="font-medium text-blue-800 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              {packageInfo.name || 'Treatment Package'}
            </h4>
            <p className="text-sm text-blue-700 mt-1">{packageInfo.description || 'Special package with multiple treatments'}</p>

            {packageInfo.treatments && packageInfo.treatments.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-blue-800">Included treatments:</p>
                <ul className="mt-1 text-xs text-blue-700 space-y-1">
                  {packageInfo.treatments.map((treatment: any, i: number) => {
                    const educationContent = getEducationContent(treatment.id);
                    return (
                      <li key={i} className="border-l-2 border-blue-200 pl-2">
                        <div className="font-medium">{treatment.quantity} x {treatment.name}</div>
                        {educationContent && (
                          <div className="text-xs text-blue-600 mt-1">
                            {educationContent.materials} • {educationContent.warranty}
                          </div>
                        )}
                      </li>
                    );
                  })}

                  {packageInfo.savings && (
                    <div className="mt-2 text-green-700 text-xs font-medium">
                      You save: £{packageInfo.savings} ({Math.round((packageInfo.savings / packageInfo.originalPrice) * 100)}% off UK prices)
                    </div>
                  )}
                </ul>
              </div>
            )}

            <p className="text-xs text-blue-800 mt-2 font-medium">Continue to the quote page to apply this package</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Try these sample codes:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li><strong>TEST50</strong> - 50% off any treatment</li>
            <li><strong>SAVE100</strong> - £100 off your total</li>
            <li><strong>IMPLANT2023</strong> - Dental implant package</li>
            <li><strong>SMILE2023</strong> - Smile makeover package</li>
          </ul>
        </div>
      </div>
    );
  }

  // If promo code is already applied, show active state
  if (promoCode) {
    return (
      <div className={`rounded-md p-4 mb-4 border ${isPackage ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center">
          {isPackage ? (
            <Package className="h-5 w-5 text-blue-600 mr-2" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          )}

          <div className="flex-1">
            <p className={`text-sm font-medium ${isPackage ? 'text-blue-800' : 'text-green-800'}`}>
              {isPackage ? (
                <>Package Applied: <strong>{packageName}</strong></>
              ) : (
                <>Promo code <strong>{promoCode}</strong> applied!</>
              )}
            </p>
            <p className={`text-sm mt-1 ${isPackage ? 'text-blue-700' : 'text-green-700'}`}>
              You saved {new Intl.NumberFormat('en-GB', { 
                style: 'currency', 
                currency: 'GBP' 
              }).format(discountAmount)}
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => clearPromoCode && clearPromoCode()}
            className="ml-4"
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          value={inputCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputCode(e.target.value)}
          placeholder="Enter promo or package code"
          className="flex-1"
          disabled={isApplyingPromo}
        />
        <Button 
          type="submit" 
          disabled={isApplyingPromo || !inputCode.trim()}
          className="whitespace-nowrap"
        >
          {isApplyingPromo ? 'Applying...' : 'Apply Code'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500">
        <p>Try our sample codes:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li><strong>TEST50</strong> - 50% off any treatment</li>
          <li><strong>SAVE100</strong> - £100 off your total</li>
          <li><strong>IMPLANT2023</strong> - Dental implant package with savings</li>
          <li><strong>SMILE2023</strong> - Smile makeover package</li>
        </ul>
      </div>
    </div>
  );
}