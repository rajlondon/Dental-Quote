import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, loadEmailJSConfig } from './config';

export interface QuoteEmailData {
  items: Array<{
    treatment: string;
    priceGBP: number;
    priceUSD: number;
    quantity: number;
    subtotalGBP: number;
    subtotalUSD: number;
    guarantee: string;
  }>;
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  flightCostGBP?: number;
  hasXrays?: boolean;
  xrayCount?: number;
  quoteNumber: string;
  date: string;
}

/**
 * Initializes EmailJS with the public key
 */
export const initEmailJS = async () => {
  await loadEmailJSConfig();
  
  if (!EMAILJS_CONFIG.publicKey) {
    console.error('EmailJS public key is not available');
    throw new Error('EmailJS public key is not available');
  }
  
  try {
    // Initialize EmailJS with the public key
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    console.log('EmailJS initialized successfully');
  } catch (error) {
    console.error('Error initializing EmailJS:', error);
    throw error;
  }
};

/**
 * Sends a friendly customer quote email via EmailJS
 */
export const sendCustomerQuoteEmail = async (quoteData: QuoteEmailData): Promise<boolean> => {
  try {
    // Make sure EmailJS is initialized
    await initEmailJS();
    
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId) {
      console.error('EmailJS service ID or template ID is missing');
      return false;
    }
    
    if (!quoteData.patientEmail) {
      console.warn('Patient email is missing, cannot send customer quote email');
      return false;
    }
    
    // Format treatments for the email in a user-friendly way
    const formattedTreatments = quoteData.items.map(item => ({
      treatment: item.treatment,
      quantity: item.quantity,
      price: `£${item.subtotalGBP.toLocaleString()}`
    }));
    
    // Calculate UK savings compared to local prices
    const ukPrice = Math.round(quoteData.totalGBP * 2.5);
    const savings = ukPrice - quoteData.totalGBP;
    const savingsPercentage = Math.round((savings / ukPrice) * 100);
    
    // Simplified parameters using standard EmailJS default template
    const totalAmount = quoteData.totalGBP.toLocaleString();
    const treatmentSummary = formattedTreatments.map(t => `${t.treatment} (x${t.quantity})`).join(', ');
    
    const templateParams = {
      // Standard EmailJS fields
      to_name: quoteData.patientName || 'Valued Patient',
      to_email: quoteData.patientEmail,
      from_name: 'Raj Singh, Istanbul Dental Smile',
      reply_to: 'info@istanbuldentalsmile.co.uk',
      
      // Custom template fields (using standard message for now)
      message: `Thank you for requesting a quote for your dental treatment in Istanbul!

TREATMENT DETAILS:
${treatmentSummary}
Total: £${totalAmount}
Travel Month: ${quoteData.travelMonth || 'Flexible'}
Departure: ${quoteData.departureCity || 'UK'}

NEXT STEPS:
1. Book a free consultation: https://calendly.com/istanbuldentalsmile/consultation
2. Pay your £200 deposit (deducted from treatment): https://payment.istanbuldentalsmile.com/deposit
3. Contact us with questions: +44 7572 445856

We look forward to welcoming you to Istanbul!`
    };
    
    // Log the template parameters for debugging
    console.log('Sending customer email with template params:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: EMAILJS_CONFIG.templateId,
      recipientEmail: quoteData.patientEmail,
      params: templateParams
    });
    
    // Send the email using EmailJS
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );
    
    console.log('Customer quote email sent successfully:', result);
    return true;
    
  } catch (error) {
    console.error('Error sending customer quote email:', error);
    return false;
  }
};