import React from 'react';

/**
 * Simple test page to demonstrate how promo codes appear in quote displays
 */
const QuoteDisplayTestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quote Display with Promo Codes</h1>
      <p className="text-gray-600 mb-8">This page demonstrates how promo codes and discounts appear in the quote display.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Example 1: Quote with Promo Code */}
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Quote with 10% Promo Code</h2>
          
          {/* Promo code display box */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start mb-6">
            <div className="text-green-600 mr-3 flex-shrink-0 mt-0.5">🏷️</div>
            <div>
              <h3 className="font-medium text-green-800">Promo Code Applied: WELCOME10</h3>
              <p className="text-green-700 text-sm mt-1">10% off your first dental treatment</p>
            </div>
          </div>
          
          {/* Price summary */}
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>$4,000.00</span>
            </div>
            <div className="flex justify-between mb-2 text-green-600">
              <span className="flex items-center">
                % Discount (WELCOME10):
              </span>
              <span>-$400.00</span>
            </div>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg">$3,600.00</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Treatments Included</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Dental Implant - $1,200</li>
              <li>Porcelain Crown (x2) - $1,600</li>
              <li>X-Ray Full Mouth - $300</li>
              <li>Consultation - $150</li>
            </ul>
          </div>
        </div>
        
        {/* Example 2: Quote with Package Discount */}
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Quote with Package Promo</h2>
          
          {/* Promo code display box */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start mb-6">
            <div className="text-green-600 mr-3 flex-shrink-0 mt-0.5">🏷️</div>
            <div>
              <h3 className="font-medium text-green-800">Promo Code Applied: IMPLANTCROWN30</h3>
              <p className="text-green-700 text-sm mt-1">30% off on our premium implant and crown package</p>
            </div>
          </div>
          
          {/* Price summary */}
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>$6,000.00</span>
            </div>
            <div className="flex justify-between mb-2 text-green-600">
              <span className="flex items-center">
                % Discount (IMPLANTCROWN30):
              </span>
              <span>-$1,800.00</span>
            </div>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg">$4,200.00</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Treatments Included</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Premium Dental Implant (x2) - $3,000</li>
              <li>Ceramic Crown (x2) - $3,000</li>
            </ul>
          </div>
        </div>
        
        {/* Example 3: Quote without Promo Code */}
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Quote without Promo Code</h2>
          
          {/* No promo code display for this example */}
          
          {/* Price summary */}
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>$5,000.00</span>
            </div>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg">$5,000.00</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Treatments Included</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Full Mouth Veneers - $4,000</li>
              <li>Professional Whitening - $600</li>
              <li>Dental Consultation - $400</li>
            </ul>
          </div>
        </div>
        
        {/* Design Notes */}
        <div className="border rounded-lg p-6 shadow-sm bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Design Elements</h2>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-green-50 border border-green-200 h-6 w-6 rounded mr-2 flex-shrink-0"></div>
              <span>Green background for promo code highlight boxes</span>
            </li>
            <li className="flex items-start">
              <div className="text-green-600 mr-2">%</div>
              <span>Green discount text with percentage symbol</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-50 border border-blue-200 h-6 w-6 rounded mr-2 flex-shrink-0"></div>
              <span>Blue treatment section for visual separation</span>
            </li>
            <li className="flex items-start">
              <div className="text-lg font-bold mr-2">$</div>
              <span>Larger font size for final total amount</span>
            </li>
          </ul>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              This simplified display shows how promo codes are highlighted in a green box at the top of the quote, 
              with discounts clearly shown in the pricing breakdown. The green color visually connects the promo code with 
              the discount amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplayTestPage;