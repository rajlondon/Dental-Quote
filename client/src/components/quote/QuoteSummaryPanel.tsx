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
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex-1">
                <span className="font-medium">{treatment.name}</span>
                {treatment.quantity > 1 && (
                  <span className="text-gray-500 ml-1">x{treatment.quantity}</span>
                )}
              </div>
              <div className="text-right">
                <span className="font-medium">£{formatCurrency(treatment.subtotalGBP)}</span>
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
        <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-md">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-blue-600 mr-2 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800">{specialOfferTitle}</h3>
              <p className="text-blue-700 text-sm mt-1">
                {discountType === 'percentage' 
                  ? `Includes ${discountValue}% off your treatment price`
                  : `Includes £${discountValue} off your treatment price`
                }
                {clinicName && ` at ${clinicName}`}
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