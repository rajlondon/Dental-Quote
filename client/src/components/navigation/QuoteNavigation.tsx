import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Tag, Gift, FileText, Package, Percent, BanknoteIcon } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

/**
 * Navigation component for the quote system
 * Provides links to various test scenarios for the quote flow
 */
const QuoteNavigation: React.FC = () => {
  // Track link clicks for analytics
  const trackLinkClick = (scenario: string) => {
    trackEvent('quote_test_navigation', 'testing', scenario);
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <FileText className="h-5 w-5 mr-2 text-blue-500" />
        Quote System Navigation
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link 
          href="/quote-test" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          onClick={() => trackLinkClick('basic_quote')}
        >
          <span className="font-medium">Start New Quote</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        
        <Link 
          href="/quote-test?promoCode=TEST20" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
          onClick={() => trackLinkClick('promo_code_quote')}
        >
          <span className="font-medium flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            With Promo Code
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        
        <Link 
          href="/quote-test?specialOfferId=ac36590b-b0dc-434e-ba74-d42ab2485e81" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
          onClick={() => trackLinkClick('special_offer_quote')}
        >
          <span className="font-medium flex items-center">
            <Gift className="h-4 w-4 mr-2" />
            With Special Offer
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {/* New Treatment Package Testing Links */}
      <h3 className="text-sm font-semibold mt-4 mb-2 text-blue-800">Treatment Package Testing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link 
          href="/quote-test?packageId=pkg-001" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
          onClick={() => trackLinkClick('implant_package')}
        >
          <span className="font-medium flex items-center">
            <Package className="h-4 w-4 mr-2" />
            6 Implants + 6 Crowns
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        
        <Link 
          href="/quote-test?packageId=pkg-003" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
          onClick={() => trackLinkClick('all_on_4_package')}
        >
          <span className="font-medium flex items-center">
            <Package className="h-4 w-4 mr-2" />
            All-on-4 Implant Package
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {/* Treatment Packages with Promo Codes */}
      <h3 className="text-sm font-semibold mt-4 mb-2 text-blue-800">Packages with Promo Codes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link 
          href="/quote-test?packageId=pkg-001&promoCode=IMPLANT30" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
          onClick={() => trackLinkClick('implant_with_percentage_discount')}
        >
          <span className="font-medium flex items-center text-sm">
            <Percent className="h-4 w-4 mr-2" />
            Implants + 30% Off (IMPLANT30)
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        
        <Link 
          href="/quote-test?packageId=pkg-001&promoCode=SUMMER100" 
          className="flex items-center justify-between px-4 py-3 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
          onClick={() => trackLinkClick('implant_with_fixed_discount')}
        >
          <span className="font-medium flex items-center text-sm">
            <BanknoteIcon className="h-4 w-4 mr-2" />
            Implants + £100 Off (SUMMER100)
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        Click any of the options above to test different quote scenarios
      </div>
    </div>
  );
};

export default QuoteNavigation;