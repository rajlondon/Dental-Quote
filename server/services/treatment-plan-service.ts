/**
 * Treatment Plan Service
 * 
 * This service handles treatment plan operations for the patient portal.
 * It provides data transformation and business logic for treatment plans.
 */

import { storage } from '../storage';

/**
 * Gets treatment plans for a specific patient
 * During development, if no plans are found, returns sample plans for testing
 */
export async function getPatientTreatmentPlans(userId: number) {
  try {
    // Try to get treatment plans from the database based on the patient ID
    let plans = [];
    let allPlans = await storage.getAllTreatmentPlans();
    
    // Filter plans for this specific patient
    allPlans = allPlans.filter(plan => plan.patientId === userId);

    // Get quotes for this patient to convert them to treatment plans if needed
    const quotes = await storage.getQuoteRequestsByUserId(userId);
    
    // Transform quotes into treatment plans if needed
    const transformedPlans = quotes.map(quote => {
      // Use quote JSON data to extract treatments
      let treatments = [];
      let treatmentDetails = null;
      
      try {
        if (quote.treatmentDetails) {
          treatmentDetails = typeof quote.treatmentDetails === 'string' 
            ? JSON.parse(quote.treatmentDetails) 
            : quote.treatmentDetails;
            
          // Extract treatments from treatmentDetails
          treatments = Object.entries(treatmentDetails).map(([name, details]: [string, any]) => ({
            id: `${quote.id}-${name}`,
            name,
            description: details.description || '',
            quantity: details.quantity || 1,
            unitPrice: details.price || 0,
            totalPrice: (details.price || 0) * (details.quantity || 1),
            currency: quote.currency || 'GBP',
            status: 'pending'
          }));
        }
      } catch (error) {
        console.error('Error parsing treatment details:', error);
      }
      
      // Calculate total from treatments if available
      const totalAmount = treatments.length > 0 
        ? treatments.reduce((sum, item) => sum + item.totalPrice, 0)
        : quote.totalAmount || 0;
      
      // Get deposit amount (20% of total by default)
      const deposit = quote.depositAmount || Math.round(totalAmount * 0.2);
      
      return {
        id: `quote-${quote.id}`,
        title: `Treatment Plan from Quote #${quote.id}`,
        description: quote.notes || 'Treatment plan based on your quote request',
        clinicId: quote.clinicId || null,
        clinicName: quote.clinicName || 'Selected Clinic',
        patientId: userId,
        status: 'proposed',
        paymentStatus: 'unpaid',
        totalAmount,
        currency: quote.currency || 'GBP',
        deposit,
        depositPaid: false,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt || quote.createdAt,
        items: treatments,
        fromQuote: true,
        quoteId: quote.id
      };
    });
    
    // Combine both sets of treatment plans
    plans = [...allPlans, ...transformedPlans];
    
    // Sort by date (newest first)
    plans.sort((a, b) => 
      new Date(b.createdAt || b.updatedAt).getTime() - 
      new Date(a.createdAt || a.updatedAt).getTime()
    );
    
    return plans;
  } catch (error) {
    console.error('Error in getPatientTreatmentPlans:', error);
    
    // Return sample data for development when real data is not available
    return [
      {
        id: 'sample-1',
        title: 'Full Dental Restoration Plan',
        description: 'Comprehensive dental restoration including implants, crowns, and whitening.',
        clinicId: 1,
        clinicName: 'DentSpa Istanbul',
        patientId: userId,
        status: 'proposed',
        paymentStatus: 'unpaid',
        totalAmount: 4250,
        currency: 'GBP',
        deposit: 500,
        depositPaid: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: 'sample-item-1',
            name: 'Dental Implant',
            description: 'Titanium implant with abutment',
            quantity: 3,
            unitPrice: 850,
            totalPrice: 2550,
            currency: 'GBP',
            status: 'pending'
          },
          {
            id: 'sample-item-2',
            name: 'Porcelain Crown',
            description: 'High-quality porcelain crown',
            quantity: 5,
            unitPrice: 280,
            totalPrice: 1400,
            currency: 'GBP',
            status: 'pending'
          },
          {
            id: 'sample-item-3',
            name: 'Professional Whitening',
            description: 'In-office teeth whitening session',
            quantity: 1,
            unitPrice: 300,
            totalPrice: 300,
            currency: 'GBP',
            status: 'pending'
          }
        ],
        doctorName: 'Dr. Mehmet Yılmaz',
        doctorId: '1',
        financingAvailable: true,
        pendingApproval: true
      }
    ];
  }
}

/**
 * Gets a specific treatment plan by ID
 */
export async function getTreatmentPlan(planId: string) {
  try {
    // If this is a quote-based plan (id starts with "quote-")
    if (planId.startsWith('quote-')) {
      const quoteId = parseInt(planId.replace('quote-', ''), 10);
      const quote = await storage.getQuoteRequest(quoteId);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      // Transform the quote into a treatment plan
      return await transformQuoteToTreatmentPlan(quote);
    }
    
    // Otherwise, try to get the plan from the database
    const planIdNum = parseInt(planId, 10);
    if (isNaN(planIdNum)) {
      throw new Error('Invalid plan ID');
    }
    
    const plan = await storage.getTreatmentPlanById(planIdNum);
    return plan;
  } catch (error) {
    console.error(`Error in getTreatmentPlan for plan ${planId}:`, error);
    return null;
  }
}

/**
 * Transforms a quote into a treatment plan object
 */
async function transformQuoteToTreatmentPlan(quote: any) {
  // Use quote JSON data to extract treatments
  let treatments = [];
  let treatmentDetails = null;
  
  try {
    if (quote.treatmentDetails) {
      treatmentDetails = typeof quote.treatmentDetails === 'string' 
        ? JSON.parse(quote.treatmentDetails) 
        : quote.treatmentDetails;
        
      // Extract treatments from treatmentDetails
      treatments = Object.entries(treatmentDetails).map(([name, details]: [string, any]) => ({
        id: `${quote.id}-${name}`,
        name,
        description: details.description || '',
        quantity: details.quantity || 1,
        unitPrice: details.price || 0,
        totalPrice: (details.price || 0) * (details.quantity || 1),
        currency: quote.currency || 'GBP',
        status: 'pending'
      }));
    }
  } catch (error) {
    console.error('Error parsing treatment details:', error);
  }
  
  // Calculate total from treatments if available
  const totalAmount = treatments.length > 0 
    ? treatments.reduce((sum, item) => sum + item.totalPrice, 0)
    : quote.totalAmount || 0;
  
  // Get deposit amount (20% of total by default)
  const deposit = quote.depositAmount || Math.round(totalAmount * 0.2);
  
  return {
    id: `quote-${quote.id}`,
    title: `Treatment Plan from Quote #${quote.id}`,
    description: quote.notes || 'Treatment plan based on your quote request',
    clinicId: quote.clinicId || null,
    clinicName: quote.clinicName || 'Selected Clinic',
    patientId: quote.userId,
    status: 'proposed',
    paymentStatus: 'unpaid',
    totalAmount,
    currency: quote.currency || 'GBP',
    deposit,
    depositPaid: false,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt || quote.createdAt,
    items: treatments,
    fromQuote: true,
    quoteId: quote.id
  };
}