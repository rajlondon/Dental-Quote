import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Tag, Gift, FileText } from 'lucide-react';
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
      
      <div className="text-xs text-gray-500 mt-2">
        Click any of the options above to test different quote scenarios
      </div>
    </div>
  );
};

export default QuoteNavigation;