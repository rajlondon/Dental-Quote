import React from 'react';
import { ComprehensiveQuoteBuilder } from '../components/quotes/ComprehensiveQuoteBuilder';
import { Layout } from '../components/Layout';

export default function ComprehensiveQuotePage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Build Your Dental Treatment Quote</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create a customized dental treatment plan with our comprehensive quote builder.
              Add individual treatments, explore special offers, or select pre-packaged treatment bundles.
            </p>
          </div>
          
          <ComprehensiveQuoteBuilder />
        </div>
      </div>
    </Layout>
  );
}