import { toast } from '@/components/ui/use-toast';

export interface Quote {
  id: string;
  createdAt: string;
  patientName: string;
  patientEmail: string;
  treatments: any[];
  selectedPackage: any | null;
  appliedOffer: any | null;
  promoCode: string | null;
  subtotal: number;
  savings: number;
  total: number;
  status: 'pending' | 'approved' | 'completed';
  clinicId?: number;
}

class QuoteService {
  private quotes: Quote[] = [];
  
  constructor() {
    // Load quotes from localStorage
    const storedQuotes = localStorage.getItem('dental_quotes');
    if (storedQuotes) {
      try {
        this.quotes = JSON.parse(storedQuotes);
      } catch (e) {
        console.error('Failed to parse stored quotes', e);
      }
    }
  }
  
  private saveToStorage() {
    localStorage.setItem('dental_quotes', JSON.stringify(this.quotes));
  }
  
  saveQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>): Quote {
    // Create new quote object
    const newQuote: Quote = {
      ...quoteData,
      id: `quote_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Save to local array
    this.quotes.push(newQuote);
    this.saveToStorage();
    
    toast({
      title: "Quote Saved",
      description: "Your quote has been successfully saved.",
    });
    
    return newQuote;
  }
  
  getAllQuotes(): Quote[] {
    return [...this.quotes];
  }
  
  getQuotesByClinic(clinicId: number): Quote[] {
    return this.quotes.filter(q => q.clinicId === clinicId);
  }
  
  getQuotesByPatient(email: string): Quote[] {
    return this.quotes.filter(q => 
      q.patientEmail.toLowerCase() === email.toLowerCase()
    );
  }
  
  getQuoteById(id: string): Quote | null {
    return this.quotes.find(q => q.id === id) || null;
  }
  
  updateQuoteStatus(id: string, status: 'pending' | 'approved' | 'completed'): boolean {
    const index = this.quotes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.quotes[index].status = status;
      this.saveToStorage();
      
      toast({
        title: "Quote Updated",
        description: `Quote status changed to ${status}.`,
      });
      
      return true;
    }
    
    return false;
  }
  
  assignClinic(id: string, clinicId: number): boolean {
    const index = this.quotes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.quotes[index].clinicId = clinicId;
      this.saveToStorage();
      
      toast({
        title: "Clinic Assigned",
        description: "Quote has been assigned to the clinic.",
      });
      
      return true;
    }
    
    return false;
  }
}

// Create a singleton instance
export const quoteService = new QuoteService();