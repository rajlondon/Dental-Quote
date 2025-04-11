import Stripe from 'stripe';
import { QuoteData } from './mailjet-service';

// Initialize Stripe with the API key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // Cast to any to avoid TypeScript error with API version
});

export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Check if Stripe is configured with an API key
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Create a payment intent for the deposit amount
 * @param quoteData The quote data
 * @param customerEmail Customer email for receipts
 * @returns The payment intent data
 */
export async function createDepositPaymentIntent(
  customerEmail: string,
  currency: string = 'gbp'
): Promise<PaymentIntentData | null> {
  if (!isStripeConfigured()) {
    console.error('Stripe is not configured. Cannot create payment intent.');
    return null;
  }

  try {
    // Fixed deposit amount of £200
    const depositAmount = 20000; // Amount in pennies (£200.00)
    
    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: currency.toLowerCase(),
      receipt_email: customerEmail,
      metadata: {
        paymentType: 'deposit',
        depositAmount: '200.00',
      },
      description: 'Istanbul Dental Smile - £200 Consultation Deposit',
    });

    // Return the client secret and payment intent ID
    return {
      clientSecret: paymentIntent.client_secret as string,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    return null;
  }
}

/**
 * Retrieve a payment intent by ID
 * @param paymentIntentId The payment intent ID
 * @returns The payment intent or null if not found
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  if (!isStripeConfigured()) {
    console.error('Stripe is not configured. Cannot retrieve payment intent.');
    return null;
  }

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving Stripe payment intent:', error);
    return null;
  }
}

/**
 * Create or retrieve a Stripe customer
 * @param email Customer email
 * @param name Customer name
 * @returns The Stripe customer ID
 */
export async function createOrRetrieveCustomer(email: string, name?: string): Promise<string | null> {
  if (!isStripeConfigured()) {
    console.error('Stripe is not configured. Cannot create/retrieve customer.');
    return null;
  }

  try {
    // Search for existing customer
    const customers = await stripe.customers.list({ email });
    
    if (customers.data.length > 0) {
      return customers.data[0].id;
    }
    
    // Create new customer if not found
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
    });
    
    return customer.id;
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error);
    return null;
  }
}

/**
 * Process a successful payment webhook event
 * @param event The Stripe webhook event
 * @returns Success status
 */
export async function processSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<boolean> {
  try {
    // Here you would update your database with the payment status
    // This is handled in routes.ts when using the Stripe webhook
    console.log('Processing successful payment:', paymentIntent.id);
    return true;
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return false;
  }
}