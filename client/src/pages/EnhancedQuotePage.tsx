import React from 'react';
import { EnhancedQuoteBuilder } from '@/components/quotes/EnhancedQuoteBuilder';

export function EnhancedQuotePage() {
  return (
    <div className="enhanced-quote-page">
      <EnhancedQuoteBuilder />
    </div>
  );
}

// Default export for React.lazy
export default EnhancedQuotePage;