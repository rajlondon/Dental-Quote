// Define TreatmentItem interface
interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee?: string;
  clinicVariant?: {
    name: string;
    description: string;
    priceGBP: number;
  };
}

// A client service for clinic operations
export const clinicService = {
  // Generate a clinic-specific quote PDF
  async generateQuote(
    clinicId: string, 
    clinicName: string, 
    treatments: TreatmentItem[], 
    totalPrice: number,
    patientDetails: {
      name: string;
      email: string;
      phone: string;
    }
  ) {
    try {
      const response = await fetch('/api/generate-clinic-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId,
          clinicName,
          treatments,
          totalPrice,
          patientDetails
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate clinic quote');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in clinicService.generateQuote:', error);
      throw error;
    }
  },
  
  // Select a clinic to establish a patient-clinic connection
  async selectClinic(
    clinicId: string,
    patientDetails: {
      name: string;
      email: string;
      phone: string;
    },
    options?: {
      quoteId?: string;
      treatments?: TreatmentItem[];
    }
  ) {
    try {
      const response = await fetch('/api/select-clinic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId,
          patientDetails,
          quoteId: options?.quoteId,
          treatments: options?.treatments
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect with clinic');
      }
      
      const data = await response.json();
      return data.connection;
    } catch (error) {
      console.error('Error in clinicService.selectClinic:', error);
      throw error;
    }
  }
};