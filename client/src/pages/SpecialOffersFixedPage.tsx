import React, { useEffect } from 'react';
import FixedHomePageOffers from '@/components/specialOffers/FixedHomePageOffers';

const SpecialOffersFixedPage: React.FC = () => {
  useEffect(() => {
    console.log('SpecialOffersFixedPage mounted at', new Date().toISOString());
    document.title = 'Special Offers Fixed Test Page';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Special Offers Test Page (Fixed Version)</h1>
        <p className="text-sm">This page tests the fixed version of the special offers components</p>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">About This Test Page</h2>
          <p className="mb-4">
            This page is designed to test the fixed version of the special offers components.
            It directly connects to the API and properly handles field name differences.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="font-bold">Development Notes:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>Using new component: TroubleShootedOfferCard</li>
              <li>Directly connects to /api/special-offers endpoint</li>
              <li>Handles both naming conventions (snake_case and camelCase)</li>
              <li>Simplifies data handling</li>
              <li>Provides proper fallbacks for missing data</li>
            </ul>
          </div>
        </div>
        
        {/* The fixed special offers component */}
        <FixedHomePageOffers />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Implementation Notes</h3>
          <p>
            This component directly works with the database field structure instead of trying to transform it. 
            It accepts both snake_case field names (from DB) and camelCase field names (from UI conventions).
          </p>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>Debug Timestamp: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
};

export default SpecialOffersFixedPage;