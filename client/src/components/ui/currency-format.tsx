import React from 'react';

export interface CurrencyFormatProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
}

/**
 * Component to format currency values consistently across the application
 * Supports USD, EUR, GBP and other currency codes
 */
export const CurrencyFormat: React.FC<CurrencyFormatProps> = ({ 
  amount, 
  currency = 'USD',
  locale = 'en-US',
  className = ''
}) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return <span className={className}>{formatter.format(amount)}</span>;
};

export default CurrencyFormat;