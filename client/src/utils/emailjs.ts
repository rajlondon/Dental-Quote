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
    
    // Format the treatment list for the email
    const treatmentList = quoteData.items.map(item => 
      `${item.treatment} (x${item.quantity}) - £${item.subtotalGBP.toLocaleString()}`
    ).join(', ');
    
    // Calculate UK savings compared to local prices
    const ukPrice = Math.round(quoteData.totalGBP * 2.5);
    const savings = ukPrice - quoteData.totalGBP;
    const savingsPercentage = Math.round((savings / ukPrice) * 100);
    
    // Format data for the email template with a personalized, customer-friendly approach
    const templateParams = {
      to_email: quoteData.patientEmail,
      to_name: quoteData.patientName || 'Valued Patient',
      quote_number: quoteData.quoteNumber,
      quote_date: quoteData.date,
      treatment_list: treatmentList,
      total_gbp: `£${quoteData.totalGBP.toLocaleString()}`,
      total_usd: `$${quoteData.totalUSD.toLocaleString()}`,
      uk_price: `£${ukPrice.toLocaleString()}`,
      savings: `£${savings.toLocaleString()}`,
      savings_percentage: `${savingsPercentage}%`,
      travel_month: quoteData.travelMonth || 'flexible dates',
      departure_city: quoteData.departureCity || 'your location',
      flight_cost: quoteData.flightCostGBP ? `£${quoteData.flightCostGBP.toLocaleString()}` : 'Not included',
      reply_to: 'info@istanbuldentalsmile.co.uk',
      from_name: 'Istanbul Dental Smile',
      xray_status: quoteData.hasXrays ? `Yes (${quoteData.xrayCount} files received)` : 'No',
      
      // Customer-specific personalized content
      subject: 'Your Istanbul Dental Smile Quote - Transform Your Smile & Save',
      greeting: `Dear ${quoteData.patientName || 'Valued Patient'},`,
      intro_message: `Thank you for requesting a quote from Istanbul Dental Smile! We're excited to help you transform your smile while saving substantially on your dental care.`,
      quote_intro: `Please find your personalized quote details below, along with the attached PDF that contains comprehensive information about your treatment options, our partner clinics, and the complete 5-star experience we offer.`,
      savings_message: `By choosing Istanbul Dental Smile, you'll save approximately £${savings.toLocaleString()} (${savingsPercentage}%) compared to UK prices while receiving the same or better quality treatment.`,
      next_steps: `Our team will contact you shortly to discuss your quote and answer any questions you may have. If you'd like to proceed sooner, you can secure your treatment dates with just a £200 deposit.`,
      contact_message: `Feel free to reach out to us directly at +44 7572 445856 or reply to this email if you have any questions or would like to discuss your treatment options further.`,
      closing: `We look forward to welcoming you to Istanbul and helping you achieve the smile you deserve!`,
      signature: `Warm regards,\nThe Istanbul Dental Smile Team`
    };
    
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