import { create } from '@hookstate/core';
import { QuoteData } from '@/types/quote';

// Create a global state store for the quote data
const quoteState = create<QuoteData | null>(null);

// Function to set the quote data
export function setQuoteData(data: QuoteData): void {
  quoteState.set(data);
}

// Function to get the quote data
export function getQuoteData(): QuoteData | null {
  return quoteState.value;
}

// Function to update specific properties of the quote data
export function updateQuoteData(partialData: Partial<QuoteData>): void {
  if (quoteState.value === null) {
    console.warn('Cannot update quote data because it is null');
    return;
  }
  
  quoteState.set({
    ...quoteState.value,
    ...partialData
  });
}

// Function to clear the quote data
export function clearQuoteData(): void {
  quoteState.set(null);
}