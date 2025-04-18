// Use a simple module approach for state management without external libraries
import { QuoteData } from '@/types/quote';

// Create a global variable to store the quote data
let quoteData: QuoteData | null = null;

// Function to set the quote data
export function setQuoteData(data: QuoteData): void {
  quoteData = data;
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('quoteData', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save quote data to localStorage:', error);
  }
}

// Function to get the quote data
export function getQuoteData(): QuoteData | null {
  // If we have data in memory, use that
  if (quoteData) {
    return quoteData;
  }
  
  // Try to get from localStorage as fallback
  try {
    const savedData = localStorage.getItem('quoteData');
    if (savedData) {
      quoteData = JSON.parse(savedData);
      return quoteData;
    }
  } catch (error) {
    console.error('Failed to retrieve quote data from localStorage:', error);
  }
  
  return null;
}

// Function to update specific properties of the quote data
export function updateQuoteData(partialData: Partial<QuoteData>): void {
  const currentData = getQuoteData();
  
  if (currentData === null) {
    console.warn('Cannot update quote data because it is null');
    return;
  }
  
  const updatedData = {
    ...currentData,
    ...partialData
  };
  
  setQuoteData(updatedData);
}

// Function to clear the quote data
export function clearQuoteData(): void {
  quoteData = null;
  try {
    localStorage.removeItem('quoteData');
  } catch (error) {
    console.error('Failed to clear quote data from localStorage:', error);
  }
}