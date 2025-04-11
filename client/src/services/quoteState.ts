import { hookstate } from '@hookstate/core';

export interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

export interface QuoteData {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  flightCostGBP?: number;
  flightCostUSD?: number;
  hasLondonConsult?: boolean;
  londonConsultCostGBP?: number;
  londonConsultCostUSD?: number;
  selectedClinicIndex?: number;
  hasXrays?: boolean;
  xrayCount?: number;
  xrayFiles?: Array<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
  }>;
}

// Create a global state for the quote data
export const globalQuoteState = hookstate<QuoteData | null>(null);

// Helper functions to manage the quote data
export const setQuoteData = (data: QuoteData) => {
  globalQuoteState.set(data);
};

export const clearQuoteData = () => {
  globalQuoteState.set(null);
};

export const updateQuoteData = (partialData: Partial<QuoteData>) => {
  if (globalQuoteState.value) {
    globalQuoteState.set({
      ...globalQuoteState.value,
      ...partialData,
    });
  } else {
    console.error('Cannot update quote data: no quote data exists');
  }
};

// Functions to manage items in the quote
export const addQuoteItem = (item: QuoteItem) => {
  if (globalQuoteState.value) {
    const updatedItems = [...globalQuoteState.value.items, item];
    // Recalculate totals
    const totalGBP = updatedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
    const totalUSD = updatedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
    
    globalQuoteState.set({
      ...globalQuoteState.value,
      items: updatedItems,
      totalGBP,
      totalUSD,
    });
  } else {
    console.error('Cannot add item: no quote data exists');
  }
};

export const removeQuoteItem = (index: number) => {
  if (globalQuoteState.value) {
    const updatedItems = [...globalQuoteState.value.items];
    updatedItems.splice(index, 1);
    
    // Recalculate totals
    const totalGBP = updatedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
    const totalUSD = updatedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
    
    globalQuoteState.set({
      ...globalQuoteState.value,
      items: updatedItems,
      totalGBP,
      totalUSD,
    });
  } else {
    console.error('Cannot remove item: no quote data exists');
  }
};

export const updateQuoteItem = (index: number, item: Partial<QuoteItem>) => {
  if (globalQuoteState.value) {
    const updatedItems = [...globalQuoteState.value.items];
    updatedItems[index] = {
      ...updatedItems[index],
      ...item,
    };
    
    // Recalculate totals
    const totalGBP = updatedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
    const totalUSD = updatedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
    
    globalQuoteState.set({
      ...globalQuoteState.value,
      items: updatedItems,
      totalGBP,
      totalUSD,
    });
  } else {
    console.error('Cannot update item: no quote data exists');
  }
};