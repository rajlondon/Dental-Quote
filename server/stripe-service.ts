import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isProduction = process.env.NODE_ENV === 'production';

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

// Enhanced Stripe configuration with proper error handling
let stripeClient: Stripe | null = null;

try {
  if (stripeSecretKey) {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
      appInfo: {
        name: 'MyDentalFly',
        version: '1.0.0',
        url: 'https://mydentalfly.com'
      },
      // In production, enable proper telemetry and error monitoring
      telemetry: isProduction
    });
    console.log('Stripe client initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Stripe client:', error);
}

// Enhanced helper to check Stripe availability with detailed error message
function ensureStripeConfigured() {
  if (!stripeClient) {
    throw new Error(
      'Stripe is not configured properly. Please ensure STRIPE_SECRET_KEY environment variable is set with a valid Stripe API key.'
    );
  }
  return stripeClient;
}

// Export the Stripe instance for use in other modules
export const stripe = stripeClient;

/**
 * Create a payment intent for the given amount
 * @param amount Amount in smallest currency unit (e.g., cents/pennies)
 * @param currency Currency code (e.g., 'gbp', 'usd')
 * @param metadata Optional metadata to attach to the payment intent
 * @returns The client secret for the payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string> = {},
): Promise<{ clientSecret: string; id: string }> {
  try {
    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await ensureStripeConfigured().paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata,
      payment_method_types: ['card'],
      // In a production environment, you might want to configure additional options
      // such as receipt_email, statement_descriptor, etc.
    });

    // Return the client secret, which is used to complete the payment on the client
    return {
      clientSecret: paymentIntent.client_secret as string,
      id: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Create a deposit payment intent (£200 deposit)
 * @param email Customer email for the payment
 * @param currency Currency code (e.g., 'gbp', 'usd') 
 * @param metadata Additional metadata to include with the payment
 * @returns The client secret for the payment intent
 */
export async function createDepositPaymentIntent(
  email: string,
  currency: string = 'gbp',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string; id: string }> {
  try {
    console.log('Creating deposit payment intent for email:', email);
    
    // Standard deposit amount is £200 in pennies
    const DEPOSIT_AMOUNT = 20000; // £200 in pennies
    
    // Create or retrieve a customer
    const customer = await createOrRetrieveCustomer(email);
    
    // Merge default metadata with provided metadata
    const paymentMetadata = {
      type: 'deposit',
      customerEmail: email,
      ...metadata
    };
    
    console.log('Using payment metadata:', paymentMetadata);
    
    // Create a PaymentIntent with the deposit amount
    const paymentIntent = await ensureStripeConfigured().paymentIntents.create({
      amount: DEPOSIT_AMOUNT,
      currency: currency.toLowerCase(),
      customer: customer.id,
      metadata: paymentMetadata,
      payment_method_types: ['card'],
      receipt_email: email,
      description: 'MyDentalFly - Treatment Deposit',
    });

    // Return the client secret, which is used to complete the payment on the client
    return {
      clientSecret: paymentIntent.client_secret as string,
      id: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating deposit payment intent:', error);
    throw error;
  }
}

/**
 * Create or retrieve a Stripe customer by email
 * @param email Customer email
 * @returns The Stripe customer object
 */
export async function createOrRetrieveCustomer(email: string): Promise<Stripe.Customer> {
  try {
    const stripeInstance = ensureStripeConfigured();
    
    // First check if the customer already exists
    const customers = await stripeInstance.customers.list({ email });
    
    if (customers.data.length > 0) {
      // Return the first matching customer
      return customers.data[0];
    }
    
    // Create a new customer if none exists
    const customer = await stripeInstance.customers.create({
      email,
      description: 'MyDentalFly Customer',
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw error;
  }
}

/**
 * Retrieve a payment intent by ID
 * @param paymentIntentId The ID of the payment intent to retrieve
 * @returns The payment intent object
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await ensureStripeConfigured().paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

/**
 * Cancel a payment intent by ID
 * @param paymentIntentId The ID of the payment intent to cancel
 * @returns The cancelled payment intent object
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await ensureStripeConfigured().paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw error;
  }
}

/**
 * Update a payment intent by ID
 * @param paymentIntentId The ID of the payment intent to update
 * @param updateData The data to update on the payment intent
 * @returns The updated payment intent object
 */
export async function updatePaymentIntent(
  paymentIntentId: string,
  updateData: Stripe.PaymentIntentUpdateParams,
): Promise<Stripe.PaymentIntent> {
  try {
    return await ensureStripeConfigured().paymentIntents.update(paymentIntentId, updateData);
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw error;
  }
}

/**
 * Check if Stripe is configured with a valid API key
 * @returns A boolean indicating whether Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!stripeSecretKey;
}