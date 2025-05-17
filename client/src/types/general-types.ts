export type CurrencyCode = 'USD' | 'GBP' | 'EUR';

export interface QuoteResponse {
  success: boolean;
  quoteId?: string;
  message?: string;
}