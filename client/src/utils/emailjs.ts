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
    throw new Error('EmailJS public key is not available');
  }
  
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
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
    
    // Format data for the email template
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
      xray_status: quoteData.hasXrays ? `Yes (${quoteData.xrayCount} files received)` : 'No'
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