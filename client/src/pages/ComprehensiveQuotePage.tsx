import React from 'react';
import { ComprehensiveQuoteBuilder } from '../components/quotes/ComprehensiveQuoteBuilder';

export default function ComprehensiveQuotePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Build Your Custom Dental Treatment Quote</h1>
      <p className="text-muted-foreground mb-8">
        Create a personalized quote by selecting treatments, packages, or special offers. 
        Our comprehensive quote builder helps you plan your dental care with transparent pricing.
      </p>
      
      <ComprehensiveQuoteBuilder />
    </div>
  );
}