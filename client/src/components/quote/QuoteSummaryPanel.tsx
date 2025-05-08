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
  Sparkles,
  Tag
} from 'lucide-react';
import { useLocation } from 'wouter';

interface QuoteSummaryPanelProps {
  treatments: {
    name: string;
    priceGBP: number;
    quantity: number;
    subtotalGBP: number;
    isPackage?: boolean;
    isSpecialOffer?: boolean; // Flag to easily identify special offers
    packageId?: string;
    promoToken?: string; // Added for promo token support
    promoType?: 'special_offer' | 'package'; // Added for promo token support
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
  const { source, isSpecialOfferFlow, isPackageFlow, isPromoTokenFlow, promoType, quoteId, promoToken } = useQuoteFlow();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const promoTitle = searchParams.get('promoTitle') || 'Special Promotion';
  
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
      {/* Special offer, package, or promo token badge - only show if applicable */}
      {(isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow) && (
        <div className="mb-4 inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {isSpecialOfferFlow && 'Special Offer'}
          {isPackageFlow && 'Treatment Package'}
          {isPromoTokenFlow && promoType === 'special_offer' && 'Special Offer'}
          {isPromoTokenFlow && promoType === 'package' && 'Treatment Package'}
          {isPromoTokenFlow && !promoType && 'Promotional Offer'}
        </div>
      )}
      
      {/* Title section */}
      <h2 className="text-xl font-bold mb-4">Treatment Summary</h2>
      
      {/* Treatments section - simplified for special offers */}
      {treatments.length > 0 && (
        <div className="mb-4">
          {/* Display a promo token banner before treatments if applicable */}
          {(promoToken || isPromoTokenFlow) && (
            <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-center">
                <Tag className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-700 text-sm font-medium">
                  Promotion: {promoTitle}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1 ml-6">
                Special pricing applied to your treatment plan
              </p>
            </div>
          )}
          
          {treatments.map((treatment, index) => (
            <div key={index} className={`flex justify-between items-start py-2 border-b ${(treatment.isSpecialOffer || treatment.specialOffer || treatment.promoToken) ? 'border-primary/20 bg-primary/5' : treatment.isPackage ? 'border-blue-100 bg-blue-50' : 'border-gray-100'}`}>
              <div className="flex-1">
                <div className="flex flex-col">
                  {(treatment.isSpecialOffer || treatment.specialOffer) && (
                    <div className="mb-1">
                      <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {treatment.specialOffer ? treatment.specialOffer.title : "Special Offer"}
                      </span>
                      {treatment.specialOffer && (
                        <span className="text-xs text-primary mt-1 block">
                          {treatment.specialOffer.discountType === 'percentage' 
                            ? `${treatment.specialOffer.discountValue}% discount applied` 
                            : `£${treatment.specialOffer.discountValue} discount applied`}
                        </span>
                      )}
                    </div>
                  )}
                  {treatment.isPackage && (
                    <div className="mb-1">
                      <span className="text-xs text-blue-700 font-medium px-2 py-0.5 rounded-full bg-blue-100">Treatment Package</span>
                    </div>
                  )}
                  {/* Show promo token badge on treatment if present */}
                  {treatment.promoToken && (
                    <div className="mb-1">
                      <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10 flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {treatment.promoType === 'special_offer' ? 'Special Offer' : 
                         treatment.promoType === 'package' ? 'Package' : 'Promotion'}
                      </span>
                    </div>
                  )}
                  <span className={`font-medium ${(treatment.isSpecialOffer || treatment.specialOffer || treatment.promoToken) ? 'text-primary' : treatment.isPackage ? 'text-blue-700' : ''}`}>
                    {treatment.name}
                  </span>
                  {treatment.quantity > 1 && (
                    <span className="text-gray-500 text-sm">x{treatment.quantity}</span>
                  )}
                  {/* Removed duplicate special offer title */}
                  {/* Show promo title on treatment if present */}
                  {treatment.promoToken && !treatment.specialOffer && (
                    <span className="text-xs text-primary mt-1">
                      {promoTitle}
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
                ) : treatment.isSpecialOffer || treatment.promoToken ? (
                  <>
                    <span className="font-bold text-primary">£{formatCurrency(treatment.priceGBP)}</span>
                    {/* For promo token treatments, show a discount label */}
                    {treatment.promoToken && (
                      <span className="block text-xs text-primary mt-1">
                        Special price applied
                      </span>
                    )}
                  </>
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

      {/* Special offer specific content */}
      {(isSpecialOfferFlow || (isPromoTokenFlow && promoType === 'special_offer')) && specialOfferTitle && (
        <div 
          className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-md shadow-sm" 
          data-special-offer-summary
          data-offer-id={offerId}
        >
          <div className="flex items-start">
            <div className="bg-white rounded-full p-1 border border-green-200 shadow-sm mr-3 mt-1">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-green-800 text-md">{specialOfferTitle}</h3>
                {discountValue && (
                  <div className="bg-green-600 text-white text-xs py-1 px-2 rounded-md font-medium">
                    {discountType === 'percentage' 
                      ? `${discountValue}% OFF` 
                      : `£${discountValue} OFF`}
                  </div>
                )}
              </div>
              <p className="text-green-700 text-sm mt-2 flex items-center">
                <Tag className="h-4 w-4 mr-1 text-green-600" />
                <span className="font-medium">
                  {discountType === 'percentage' 
                    ? `Save ${discountValue}% off eligible treatments` 
                    : `Save £${discountValue} off eligible treatments`}
                  {clinicName && ` at ${clinicName}`}
                </span>
              </p>
              <p className="text-green-700 text-xs mt-2 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Limited time offer - automatically applied to your quote</span>
              </p>
              {quoteId && (
                <p className="text-blue-600 text-xs mt-2 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Quote ID: {quoteId.substring(0, 8)}... is linked to this offer</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Package specific content */}
      {(isPackageFlow || (isPromoTokenFlow && promoType === 'package')) && (
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
          {quoteId && (
            <p className="text-blue-600 text-xs mt-3 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Quote ID: {quoteId.substring(0, 8)}... is linked to this package</span>
            </p>
          )}
        </div>
      )}
      
      {/* Generic promo token content - if not special offer or package */}
      {isPromoTokenFlow && !promoType && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 p-4 rounded-md shadow-sm">
          <div className="flex items-start">
            <div className="bg-white rounded-full p-1 border border-blue-200 shadow-sm mr-3 mt-1">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 text-md">Promotional Offer Applied</h3>
              <p className="text-blue-700 text-sm mt-1">
                This quote includes promotional pricing and benefits.
              </p>
              {quoteId && (
                <p className="text-blue-600 text-xs mt-2 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Quote ID: {quoteId.substring(0, 8)}... is linked to this promotion</span>
                </p>
              )}
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
          {isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow ? (
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
      {(isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow) && (
        <p className="text-center text-gray-500 text-xs mt-4">
          {quoteId ? 
            'Your quote is already saved and ready for review.' :
            'See clinics, packages, and complete your booking with a refundable £200 deposit.'}
        </p>
      )}
    </div>
  );
};

export default QuoteSummaryPanel;