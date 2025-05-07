import React from 'react';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Info, 
  Plane, 
  Hotel, 
  Car,
  CalendarCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface QuoteSummaryPanelProps {
  treatments: {
    name: string;
    priceGBP: number;
    quantity: number;
    subtotalGBP: number;
    isPackage?: boolean;
    isSpecialOffer?: boolean; // Flag to easily identify special offers
    packageId?: string;
    specialOffer?: {
      id: string;
      title: string;
      discountType: 'percentage' | 'fixed_amount';
      discountValue: number;
      clinicId: string;
    };
  }[];
  onContinue: () => void;
  onBack?: () => void;
  specialOfferTitle?: string;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed_amount';
  clinicName?: string;
}

const QuoteSummaryPanel: React.FC<QuoteSummaryPanelProps> = ({
  treatments,
  onContinue,
  onBack,
  specialOfferTitle,
  discountValue,
  discountType,
  clinicName
}) => {
  const { source, isSpecialOfferFlow, isPackageFlow } = useQuoteFlow();
  
  // Calculate total
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const ukEquivalentCost = totalGBP * 2.5; // Example calculation, can be adjusted
  const savingsAmount = ukEquivalentCost - totalGBP;
  const savingsPercentage = Math.round((savingsAmount / ukEquivalentCost) * 100);
  
  // Calculate total USD (conversion rate example)
  const totalUSD = Math.round(totalGBP * 1.28);

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-GB');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      {/* Special offer or package badge - only show if applicable */}
      {(isSpecialOfferFlow || isPackageFlow) && (
        <div className="mb-4 inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {isSpecialOfferFlow ? 'Special Offer' : 'Treatment Package'}
        </div>
      )}
      
      {/* Title section */}
      <h2 className="text-xl font-bold mb-4">Treatment Summary</h2>
      
      {/* Treatments section - simplified for special offers */}
      {treatments.length > 0 && (
        <div className="mb-4">
          {treatments.map((treatment, index) => (
            <div key={index} className={`flex justify-between items-start py-2 border-b ${(treatment.isSpecialOffer || treatment.specialOffer) ? 'border-primary/20 bg-primary/5' : treatment.isPackage ? 'border-blue-100 bg-blue-50' : 'border-gray-100'}`}>
              <div className="flex-1">
                <div className="flex flex-col">
                  {(treatment.isSpecialOffer || treatment.specialOffer) && (
                    <div className="mb-1">
                      <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10 flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="10" 
                          height="10" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="mr-1"
                        >
                          <path d="M12 3l1.2 2.8 2.8.3-2 2 .5 2.9-2.5-1.3-2.5 1.3.5-2.9-2-2 2.8-.3z"/>
                          <path d="M5 9l.4 1 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1z"/>
                          <path d="M19 9l.4 1 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1z"/>
                        </svg>
                        Special Offer
                      </span>
                    </div>
                  )}
                  {treatment.isPackage && (
                    <div className="mb-1">
                      <span className="text-xs text-blue-700 font-medium px-2 py-0.5 rounded-full bg-blue-100">Treatment Package</span>
                    </div>
                  )}
                  <span className={`font-medium ${(treatment.isSpecialOffer || treatment.specialOffer) ? 'text-primary' : treatment.isPackage ? 'text-blue-700' : ''}`}>
                    {treatment.name}
                  </span>
                  {treatment.quantity > 1 && (
                    <span className="text-gray-500 text-sm">x{treatment.quantity}</span>
                  )}
                  {treatment.specialOffer && (
                    <span className="text-xs text-primary mt-1">
                      {treatment.specialOffer.title}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {treatment.specialOffer ? (
                  <>
                    <div className="flex items-center justify-end gap-2">
                      <span className="line-through text-sm text-gray-500">
                        £{formatCurrency(Math.round(treatment.priceGBP * (100 / (100 - (treatment.specialOffer.discountType === 'percentage' ? treatment.specialOffer.discountValue : 0)))))}
                      </span>
                      <span className="font-bold text-primary">£{formatCurrency(treatment.priceGBP)}</span>
                    </div>
                    <span className="block text-xs text-primary mt-1">
                      {treatment.specialOffer.discountType === 'percentage' 
                        ? `Save ${treatment.specialOffer.discountValue}%` 
                        : `Save £${formatCurrency(treatment.specialOffer.discountValue)}`}
                    </span>
                  </>
                ) : treatment.isSpecialOffer ? (
                  <span className="font-bold text-primary">£{formatCurrency(treatment.priceGBP)}</span>
                ) : (
                  <span className="font-medium">£{formatCurrency(treatment.subtotalGBP)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Price breakdown */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>USD Equivalent:</span>
          <span>${formatCurrency(totalUSD)}</span>
        </div>
        <div className="flex justify-between">
          <span>Equivalent UK Cost:</span>
          <span>£{formatCurrency(ukEquivalentCost)}</span>
        </div>
        <div className="flex justify-between font-medium text-green-600 bg-green-50 p-2 rounded">
          <span>You Save:</span>
          <span>£{formatCurrency(savingsAmount)} ({savingsPercentage}% of UK costs)</span>
        </div>
      </div>
      
      {/* Important notes - customize based on flow type */}
      <div className="bg-gray-50 p-3 rounded-md text-sm mb-6">
        <p className="mb-2 font-medium">IMPORTANT:</p>
        <p className="mb-2">
          These prices are estimates based on average Istanbul clinic rates. You 
          will receive clinic-specific quotes in the next step.
        </p>
        <p className="mb-2">
          Your final treatment quote will be confirmed by your chosen clinic after they've received
          your dental information — including any x-rays or CT scans if needed.
        </p>
        <p>
          Payment for treatment is only made in-person at the clinic, ensuring the treatment
          plan is accurate and agreed by you.
        </p>
      </div>

      {/* Special offer or package specific content */}
      {isSpecialOfferFlow && specialOfferTitle && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 p-4 rounded-md shadow-sm">
          <div className="flex items-start">
            <div className="bg-white rounded-full p-1 border border-blue-200 shadow-sm mr-3 mt-1">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 text-md">{specialOfferTitle}</h3>
              <p className="text-blue-700 text-sm mt-1 flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-1"
                >
                  <path d="M12 3l1.2 2.8 2.8.3-2 2 .5 2.9-2.5-1.3-2.5 1.3.5-2.9-2-2 2.8-.3z"/>
                </svg>
                <span className="font-medium">
                  {discountType === 'percentage' 
                    ? `Save ${discountValue}% off your treatment price`
                    : `Save £${discountValue} off your treatment price`
                  }
                  {clinicName && ` at ${clinicName}`}
                </span>
              </p>
              <p className="text-blue-600 text-xs mt-2 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Limited time offer - applied to your quote</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isPackageFlow && (
        <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">Your All-Inclusive Package Includes:</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Hotel className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm">Hotel accommodation</span>
            </div>
            <div className="flex items-center">
              <Car className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm">Airport transfers</span>
            </div>
            <div className="flex items-center">
              <CalendarCheck className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm">Free consultation</span>
            </div>
          </div>
        </div>
      )}

      {/* Travel information */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-800 mb-2">Travel Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
            <span>All-inclusive packages available! Clinics offer packages that include hotel accommodation and airport transfers.</span>
          </div>
          <div className="flex items-start">
            <Plane className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
            <span>Typical flights: £150-£300 return from the UK</span>
          </div>
          <div className="flex items-start">
            <Hotel className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
            <span>Hotel stays often included in treatment packages</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="px-4"
          >
            Back
          </Button>
        )}
        
        <Button 
          onClick={onContinue}
          className="flex items-center gap-2 ml-auto"
        >
          {isSpecialOfferFlow || isPackageFlow ? (
            <>
              Get My Personalised Quote
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {/* Footer text */}
      {(isSpecialOfferFlow || isPackageFlow) && (
        <p className="text-center text-gray-500 text-xs mt-4">
          See clinics, packages, and complete your booking with a refundable £200 deposit.
        </p>
      )}
    </div>
  );
};

export default QuoteSummaryPanel;