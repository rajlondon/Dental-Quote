// Quote Data Manager - Handles saving and retrieving patient quote responses

export interface PatientQuoteData {
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    dateOfBirth?: string;
    medicalHistory?: string;
    concerns?: string;
    expectations?: string;
  };
  treatments: Array<{
    id: string;
    category: string;
    name: string;
    quantity: number;
    priceGBP: number;
    priceUSD: number;
    subtotalGBP: number;
    subtotalUSD: number;
    guarantee?: string;
    fromPackage?: boolean;
  }>;
  dentalChart?: {
    selectedConditions: Array<{
      toothNumber: string;
      condition: string;
      severity?: string;
      notes?: string;
    }>;
    painLevel?: number;
    lastDentalVisit?: string;
  };
  promoCode?: {
    code: string;
    type: string;
    discountType?: string;
    discountValue?: number;
    title?: string;
    benefits?: Array<{
      type: string;
      description: string;
      value: string;
      details: string;
    }>;
  };
  selectedClinic?: {
    clinicId: string;
    clinicName: string;
    estimatedTotal: number;
    currency: string;
  };
  totalEstimate: {
    gbp: number;
    usd: number;
    originalGbp?: number;
    originalUsd?: number;
    savings?: number;
  };
}

export class QuoteDataManager {
  private static STORAGE_KEY = 'patient_quote_data';
  
  // Save quote data to localStorage (for immediate access)
  static saveQuoteData(data: PatientQuoteData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString(),
        sessionId: this.getOrCreateSessionId()
      }));
      
      // Also save to browser storage for persistence
      this.saveToSessionStorage(data);
    } catch (error) {
      console.error('Failed to save quote data:', error);
    }
  }
  
  // Get quote data from storage
  static getQuoteData(): PatientQuoteData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to retrieve quote data:', error);
      return null;
    }
  }
  
  // Save to session storage as backup
  private static saveToSessionStorage(data: PatientQuoteData): void {
    try {
      sessionStorage.setItem('quote_backup', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save quote backup:', error);
    }
  }
  
  // Get or create session ID for anonymous users
  private static getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('quote_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('quote_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Submit quote data to server
  static async submitQuoteData(data: PatientQuoteData): Promise<{ success: boolean; quoteId?: number; error?: string }> {
    try {
      const response = await fetch('/api/quote-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.getOrCreateSessionId(),
          patientInfo: data.patientInfo,
          treatments: data.treatments,
          dentalChart: data.dentalChart || { selectedConditions: [] },
          promoCode: data.promoCode,
          selectedClinic: data.selectedClinic,
          totalEstimate: data.totalEstimate,
          status: 'submitted',
          submittedToClinic: true,
          clinicId: data.selectedClinic?.clinicId ? parseInt(data.selectedClinic.clinicId) : null,
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Clear local storage after successful submission
        this.clearQuoteData();
        return { success: true, quoteId: result.data.id };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      console.error('Failed to submit quote data:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
  
  // Clear quote data from storage
  static clearQuoteData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem('quote_backup');
    } catch (error) {
      console.error('Failed to clear quote data:', error);
    }
  }
  
  // Update specific sections of quote data
  static updatePatientInfo(patientInfo: PatientQuoteData['patientInfo']): void {
    const existing = this.getQuoteData() || {} as PatientQuoteData;
    this.saveQuoteData({
      ...existing,
      patientInfo,
      totalEstimate: existing.totalEstimate || { gbp: 0, usd: 0 }
    });
  }
  
  static updateTreatments(treatments: PatientQuoteData['treatments']): void {
    const existing = this.getQuoteData() || {} as PatientQuoteData;
    const totalGBP = treatments.reduce((sum, t) => sum + t.subtotalGBP, 0);
    const totalUSD = treatments.reduce((sum, t) => sum + t.subtotalUSD, 0);
    
    this.saveQuoteData({
      ...existing,
      treatments,
      totalEstimate: {
        gbp: totalGBP,
        usd: totalUSD,
        originalGbp: existing.totalEstimate?.originalGbp,
        originalUsd: existing.totalEstimate?.originalUsd,
        savings: existing.totalEstimate?.savings
      }
    });
  }
  
  static updateDentalChart(dentalChart: PatientQuoteData['dentalChart']): void {
    const existing = this.getQuoteData() || {} as PatientQuoteData;
    this.saveQuoteData({
      ...existing,
      dentalChart,
      totalEstimate: existing.totalEstimate || { gbp: 0, usd: 0 }
    });
  }
  
  static updatePromoCode(promoCode: PatientQuoteData['promoCode']): void {
    const existing = this.getQuoteData() || {} as PatientQuoteData;
    this.saveQuoteData({
      ...existing,
      promoCode,
      totalEstimate: existing.totalEstimate || { gbp: 0, usd: 0 }
    });
  }
  
  static updateSelectedClinic(selectedClinic: PatientQuoteData['selectedClinic']): void {
    const existing = this.getQuoteData() || {} as PatientQuoteData;
    this.saveQuoteData({
      ...existing,
      selectedClinic,
      totalEstimate: existing.totalEstimate || { gbp: 0, usd: 0 }
    });
  }
}