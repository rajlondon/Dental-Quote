import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface Quote {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  createdAt: string;
  treatments: Treatment[];
  selectedPackage?: TreatmentPackage | null;
  promoCode?: string | null;
  appliedOffer?: SpecialOffer | null;
  subtotal: number;
  savings: number;
  total: number;
  status: 'pending' | 'approved' | 'completed';
  notes?: string;
}

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  savings: number;
  treatments: Treatment[];
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  clinicId: string;
  expiryDate: string;
  imageUrl?: string;
}

// Default storage key
const STORAGE_KEY = 'mydentalfly_quotes';

// Quote service implementation
class QuoteService {
  // Save a new quote
  saveQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>): Quote {
    try {
      const newQuote: Quote = {
        ...quoteData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Get existing quotes
      const quotes = this.getAllQuotes();
      
      // Add new quote
      quotes.push(newQuote);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      
      toast({
        title: 'Quote Saved',
        description: 'Your dental quote has been saved successfully.',
      });
      
      return newQuote;
    } catch (error) {
      console.error('Failed to save quote:', error);
      toast({
        title: 'Error Saving Quote',
        description: 'There was an error saving your quote. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }
  
  // Get all saved quotes
  getAllQuotes(): Quote[] {
    try {
      const quotesJson = localStorage.getItem(STORAGE_KEY);
      return quotesJson ? JSON.parse(quotesJson) : [];
    } catch (error) {
      console.error('Failed to retrieve quotes:', error);
      toast({
        title: 'Error Loading Quotes',
        description: 'There was an error loading your saved quotes.',
        variant: 'destructive',
      });
      return [];
    }
  }
  
  // Get a specific quote by ID
  getQuoteById(id: string): Quote | null {
    try {
      const quotes = this.getAllQuotes();
      return quotes.find(quote => quote.id === id) || null;
    } catch (error) {
      console.error(`Failed to retrieve quote ${id}:`, error);
      toast({
        title: 'Error Loading Quote',
        description: 'There was an error loading the quote details.',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  // Update an existing quote
  updateQuote(id: string, updates: Partial<Quote>): Quote | null {
    try {
      const quotes = this.getAllQuotes();
      const quoteIndex = quotes.findIndex(quote => quote.id === id);
      
      if (quoteIndex === -1) {
        toast({
          title: 'Quote Not Found',
          description: 'The quote you are trying to update could not be found.',
          variant: 'destructive',
        });
        return null;
      }
      
      // Update quote
      const updatedQuote = { ...quotes[quoteIndex], ...updates };
      quotes[quoteIndex] = updatedQuote;
      
      // Save updated quotes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      
      toast({
        title: 'Quote Updated',
        description: 'Your quote has been updated successfully.',
      });
      
      return updatedQuote;
    } catch (error) {
      console.error(`Failed to update quote ${id}:`, error);
      toast({
        title: 'Error Updating Quote',
        description: 'There was an error updating your quote. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  // Delete a quote
  deleteQuote(id: string): boolean {
    try {
      const quotes = this.getAllQuotes();
      const filteredQuotes = quotes.filter(quote => quote.id !== id);
      
      if (filteredQuotes.length === quotes.length) {
        toast({
          title: 'Quote Not Found',
          description: 'The quote you are trying to delete could not be found.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Save updated quotes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQuotes));
      
      toast({
        title: 'Quote Deleted',
        description: 'Your quote has been deleted successfully.',
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to delete quote ${id}:`, error);
      toast({
        title: 'Error Deleting Quote',
        description: 'There was an error deleting your quote. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }
  
  // Calculate quote totals
  calculateQuoteTotals(treatments: Treatment[], promoDiscount = 0, packageDiscount = 0): { subtotal: number, savings: number, total: number } {
    const subtotal = treatments.reduce((sum, treatment) => sum + (treatment.price * treatment.quantity), 0);
    const savings = promoDiscount + packageDiscount;
    const total = Math.max(0, subtotal - savings);
    
    return { subtotal, savings, total };
  }
}

// Export a singleton instance
export const quoteService = new QuoteService();