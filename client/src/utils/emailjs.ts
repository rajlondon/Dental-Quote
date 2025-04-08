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
    
    // Format data for the email template based on the Python example
    const templateParams = {
      // Email routing information
      to_email: quoteData.patientEmail,
      reply_to: 'info@istanbuldentalsmile.co.uk',
      from_name: 'Istanbul Dental Smile',
      
      // Patient details
      name: quoteData.patientName || 'Valued Patient',
      email: quoteData.patientEmail,
      phone: quoteData.patientPhone || 'Not provided',
      
      // Quote information
      quote_number: quoteData.quoteNumber,
      date: quoteData.date,
      
      // Financial details
      total: `£${quoteData.totalGBP.toLocaleString()}`,
      uk_price: `£${ukPrice.toLocaleString()}`,
      savings: `£${savings.toLocaleString()} (${savingsPercentage}%)`,
      
      // Treatment details
      treatments: formattedTreatments,
      treatment_list: formattedTreatments.map(t => `${t.treatment} (x${t.quantity}) - ${t.price}`).join(', '),
      
      // Travel information
      travel_month: quoteData.travelMonth || 'flexible dates',
      departure_city: quoteData.departureCity || 'your location',
      flight_cost: quoteData.flightCostGBP ? `£${quoteData.flightCostGBP.toLocaleString()}` : 'Not included',
      
      // X-ray status
      xray_status: quoteData.hasXrays ? `Yes (${quoteData.xrayCount} files received)` : 'No',
      
      // Links
      consultation_link: 'https://calendly.com/istanbuldentalsmile/consultation',
      deposit_link: 'https://payment.istanbuldentalsmile.com/deposit',
      
      // Personalized message content
      greeting: `Hi ${quoteData.patientName || 'there'},`,
      intro_message: "Thanks for requesting your personalized quote. We're excited to guide you through your smile journey.",
      quote_intro: "Here's a breakdown of your selected treatment and estimated costs.",
      savings_message: `By choosing Istanbul Dental Smile, you'll save approximately £${savings.toLocaleString()} (${savingsPercentage}%) compared to UK prices while receiving the same or better quality treatment.`,
      next_steps: "Secure your booking with a £200 deposit and we'll schedule your in-person consultation with X-rays.",
      contact_message: "If you have any questions, reply to this email or message us on WhatsApp at +44 7572 445856.",
      closing: "Looking forward to welcoming you to Istanbul!",
      signature: "Raj Singh, Istanbul Dental Smile"
    };
    
    // Log the template parameters for debugging
    console.log('Sending customer email with template params:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateIdAvailable: !!EMAILJS_CONFIG.templateId,
      recipientEmail: quoteData.patientEmail
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