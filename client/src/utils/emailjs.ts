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
    
    // Using exactly the template parameters expected by template_new
    const templateParams = {
      // Email routing
      to_name: quoteData.patientName || 'Valued Patient',
      to_email: quoteData.patientEmail,
      from_name: 'Istanbul Dental Smile',
      from_email: 'info@istanbuldentalsmile.co.uk',
      reply_to: 'info@istanbuldentalsmile.co.uk',
      
      // Quote details
      message: `Thank you for requesting a quote for your dental treatment in Istanbul. Your custom quote for ${formattedTreatments.map(t => `${t.treatment} (x${t.quantity})`).join(', ')} comes to a total of £${quoteData.totalGBP}.`,
      quote_id: quoteData.quoteNumber,
      quote_date: quoteData.date,
      
      // Patient details
      patient_name: quoteData.patientName || 'Valued Patient',
      patient_email: quoteData.patientEmail,
      patient_phone: quoteData.patientPhone || 'Not provided',
      
      // Treatment details
      treatment_summary: formattedTreatments.map(t => `${t.treatment} (x${t.quantity}) - ${t.price}`).join(', '),
      total_cost: `£${quoteData.totalGBP}`,
      uk_comparison: `£${ukPrice}`,
      savings_amount: `£${savings}`,
      savings_percent: `${savingsPercentage}%`,
      
      // Travel info
      travel_month: quoteData.travelMonth || 'flexible dates',
      departure_city: quoteData.departureCity || 'your location',
      flight_cost: quoteData.flightCostGBP ? `£${quoteData.flightCostGBP}` : 'Not included',
      
      // Additional info
      xray_status: quoteData.hasXrays ? `Yes (${quoteData.xrayCount} files received)` : 'No',
      consultation_link: 'https://calendly.com/istanbuldentalsmile/consultation',
      deposit_link: 'https://payment.istanbuldentalsmile.com/deposit',
      contact_phone: '+44 7572 445856',
      
      // Don't use the prefix/postfix variables as they might be causing issues
      greeting: `Hi ${quoteData.patientName || 'there'}`,
      subject: 'Your Istanbul Dental Smile Quote'
    };
    
    // Log the template parameters for debugging
    console.log('Sending customer email with template params:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: EMAILJS_CONFIG.templateId,
      recipientEmail: quoteData.patientEmail,
      firstFewParams: {
        to_name: templateParams.to_name,
        from_email: templateParams.from_email,
        subject: templateParams.subject
      }
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