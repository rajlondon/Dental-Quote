import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { getMappedTreatmentsForClinic, calculateTotalPriceForMappedTreatments } from '@/utils/treatmentMapperUtils';

/**
 * Service for clinic-related operations including quote generation and consultation booking
 */
export const clinicService = {
  /**
   * Generate a PDF quote for the specified clinic and treatments
   * @param clinicId The ID of the clinic
   * @param clinicName The name of the clinic
   * @param treatments The treatments to include in the quote
   * @returns Promise with the PDF URL or blob
   */
  async generateClinicQuote(clinicId: string, clinicName: string, treatments: TreatmentItem[]): Promise<string> {
    // Get clinic-specific treatments and pricing
    const mappedTreatments = getMappedTreatmentsForClinic(treatments, clinicId);
    const { totalMinPrice, formattedPrice } = calculateTotalPriceForMappedTreatments(mappedTreatments);
    
    try {
      // In a real implementation, this would make an API call to generate a PDF
      const response = await fetch('/api/generate-clinic-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId,
          clinicName,
          treatments: mappedTreatments,
          totalPrice: totalMinPrice, // Use minimum price as the base price
          patientDetails: {
            name: 'John Doe', // In a real app, this would come from user context
            email: 'john.doe@example.com',
            phone: '+44 7123 456789',
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }
      
      const data = await response.json();
      
      // If the API returns a URL to download the PDF, use it
      if (data && data.url) {
        // Trigger download by opening the URL in a new tab
        window.open(data.url, '_blank');
        return data.url;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error generating quote:', error);
      throw error;
    }
  },
  
  /**
   * Book a consultation with the specified clinic
   * @param clinicId The ID of the clinic
   * @param clinicName The name of the clinic 
   * @returns Promise with booking confirmation
   */
  async bookConsultation(clinicId: string, clinicName: string): Promise<{
    consultationId: string;
    dateTime: string;
    meetingLink?: string;
  }> {
    try {
      // In a real implementation, this would make an API call to book a consultation
      const response = await fetch('/api/book-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId,
          patientDetails: {
            name: 'John Doe', // In a real app, this would come from user context
            email: 'john.doe@example.com',
            phone: '+44 7123 456789',
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to book consultation');
      }
      
      // For demo purposes - simulate API response with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock consultation details (in a real app, this would come from the API)
      return {
        consultationId: `consult_${Date.now()}`,
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      };
    } catch (error) {
      console.error('Error booking consultation:', error);
      throw error;
    }
  },
  
  /**
   * Navigate to messages section with the specified clinic
   * @param clinicId The ID of the clinic
   */
  navigateToClinicMessages(clinicId: string): void {
    window.location.href = `#/patient-portal/messages?clinic=${clinicId}`;
  }
};