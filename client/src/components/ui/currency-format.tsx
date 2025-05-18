import React from 'react';

interface CurrencyFormatProps {
  amount: number;
  currency?: string;
  locale?: string;
}

export const CurrencyFormat: React.FC<CurrencyFormatProps> = ({
  amount,
  currency = 'USD',
  locale = 'en-US'
}) => {
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);

  return <span>{formattedAmount}</span>;
};