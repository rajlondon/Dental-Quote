/**
 * Treatment Plan Routes
 * 
 * Handles the API routes for treatment plans in the patient portal,
 * including fetching treatment plans from quotes.
 */

import express from 'express';
import { storage } from '../storage';
import { getPatientTreatmentPlans } from '../services/treatment-plan-service';
import { json } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Helper function to convert quote to treatment plan format
function transformQuoteToTreatmentPlan(quote: any) {
  if (!quote) return null;
  
  return {
    id: quote.id,
    patientName: quote.name,
    email: quote.email,
    phone: quote.phone,
    treatment: quote.treatment,
    specificTreatment: quote.specificTreatment,
    status: quote.status,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    quoteData: quote.quoteData,
    selectedClinicId: quote.selectedClinicId,
    departureCity: quote.departureCity,
    travelMonth: quote.travelMonth,
    budget: quote.budget,
    notes: quote.notes
  };
}

/**
 * Get all treatment plans for a patient
 * 
 * This endpoint fetches treatment plans from both:
 * - Existing treatment plans in the database
 * - Quotes that can be converted into treatment plans
 */
router.get('/patient/treatment-plans', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    
    // Get quotes and convert them to treatment plans
    const quotes = await storage.getQuoteRequestsByUserId(userId);
    
    // Collect treatment plans converted from quotes
    const treatmentPlans = await Promise.all(
      quotes.map(async (quote) => {
        return transformQuoteToTreatmentPlan(quote);
      })
    );
    
    return res.json({
      success: true,
      treatmentPlans: treatmentPlans.filter(plan => plan !== null)
    });
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment plans',
      error: error.message
    });
  }
});

/**
 * Get patient quotes that can be converted to treatment plans
 */
router.get('/patient/quotes', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    
    // Get quotes for this user
    const quotes = await storage.getQuoteRequestsByUserId(userId);
    
    // Return the quotes as is
    return res.json({
      success: true,
      quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
});

/**
 * Get a specific treatment plan by ID
 */
router.get('/patient/treatment-plans/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const planId = req.params.id;
    const userId = req.user.id;
    
    // If this is a quote-based plan (id starts with "quote-")
    if (planId.startsWith('quote-')) {
      const quoteId = parseInt(planId.replace('quote-', ''), 10);
      const quote = await storage.getQuoteRequest(quoteId);
      
      if (!quote || quote.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Treatment plan not found or unauthorized'
        });
      }
      
      // Transform the quote into a treatment plan
      const plan = await transformQuoteToTreatmentPlan(quote);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Failed to create treatment plan from quote'
        });
      }
      
      return res.json({
        success: true,
        treatmentPlan: plan
      });
    }
    
    // Otherwise try to get it from the database directly
    const planIdNumber = parseInt(planId, 10);
    if (isNaN(planIdNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid treatment plan ID'
      });
    }
    
    // Make sure the treatment plan belongs to this user
    const plan = await storage.getTreatmentPlanById(planIdNumber);
    
    if (!plan || plan.patientId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found or unauthorized'
      });
    }
    
    return res.json({
      success: true,
      treatmentPlan: plan
    });
  } catch (error) {
    console.error(`Error fetching treatment plan:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment plan',
      error: error.message
    });
  }
});

/**
 * Approve a treatment plan
 */
router.post('/patient/treatment-plans/:id/approve', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const { notes } = req.body;
    const planId = req.params.id;
    const userId = req.user.id;
    
    // For quote-based plans, create a real treatment plan in the database
    if (planId.startsWith('quote-')) {
      const quoteId = parseInt(planId.replace('quote-', ''), 10);
      const quote = await storage.getQuoteRequest(quoteId);
      
      if (!quote || quote.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Quote not found or unauthorized'
        });
      }
      
      // Extract treatments from quote
      let treatmentDetails = {};
      let totalCost = 0;
      
      try {
        if (quote.treatmentDetails) {
          const details = typeof quote.treatmentDetails === 'string' 
            ? JSON.parse(quote.treatmentDetails) 
            : quote.treatmentDetails;
          
          treatmentDetails = details;
          
          if (typeof details === 'object') {
            // Calculate total cost from treatments
            totalCost = Object.values(details).reduce((sum, item: any) => {
              const price = item.price || 0;
              const quantity = item.quantity || 1;
              return sum + (price * quantity);
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error parsing treatment details:', error);
      }
      
      // Create a new treatment plan
      const newTreatmentPlan = {
        patientId: userId,
        treatmentDetails: treatmentDetails as Json,
        status: 'approved',
        clinicId: quote.clinicId,
        estimatedTotalCost: String(totalCost),
        currency: quote.currency || 'GBP',
        quoteRequestId: quote.id,
        notes: notes || quote.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        portalStatus: 'visible'
      };
      
      const treatmentPlan = await storage.createTreatmentPlan(newTreatmentPlan);
      
      return res.json({
        success: true,
        message: 'Treatment plan approved and created',
        treatmentPlan
      });
    } else {
      // For existing treatment plans, update the status
      const planIdNumber = parseInt(planId, 10);
      if (isNaN(planIdNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid treatment plan ID'
        });
      }
      
      // Make sure the treatment plan belongs to this user
      const plan = await storage.getTreatmentPlanById(planIdNumber);
      
      if (!plan || plan.patientId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Treatment plan not found or unauthorized'
        });
      }
      
      // Update the plan status
      const updatedPlan = await storage.updateTreatmentPlan(planIdNumber, {
        status: 'approved',
        notes: notes || plan.notes,
        updatedAt: new Date()
      });
      
      return res.json({
        success: true,
        message: 'Treatment plan approved',
        treatmentPlan: updatedPlan
      });
    }
  } catch (error) {
    console.error('Error approving treatment plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve treatment plan',
      error: error.message
    });
  }
});

/**
 * Get payment options for a treatment plan
 */
router.get('/patient/treatment-plans/:id/payment-options', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const planId = req.params.id;
    const userId = req.user.id;
    
    // Get the treatment plan
    let treatmentPlan = null;
    let totalAmount = 0;
    let currency = 'GBP';
    
    // Handle quote-based plans
    if (planId.startsWith('quote-')) {
      const quoteId = parseInt(planId.replace('quote-', ''), 10);
      const quote = await storage.getQuoteRequest(quoteId);
      
      if (!quote || quote.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Treatment plan not found or unauthorized'
        });
      }
      
      // Get total from quote
      if (quote.totalAmount) {
        totalAmount = typeof quote.totalAmount === 'string' 
          ? parseFloat(quote.totalAmount) 
          : quote.totalAmount;
      } else if (quote.treatmentDetails) {
        // Calculate from treatments
        try {
          const details = typeof quote.treatmentDetails === 'string' 
            ? JSON.parse(quote.treatmentDetails) 
            : quote.treatmentDetails;
          
          totalAmount = Object.values(details).reduce((sum, item: any) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
          }, 0);
        } catch (error) {
          console.error('Error calculating total from treatments:', error);
        }
      }
      
      currency = quote.currency || 'GBP';
    } else {
      // Get from storage for normal treatment plans
      const planIdNumber = parseInt(planId, 10);
      if (!isNaN(planIdNumber)) {
        const plan = await storage.getTreatmentPlanById(planIdNumber);
        
        if (!plan || plan.patientId !== userId) {
          return res.status(404).json({
            success: false,
            message: 'Treatment plan not found or unauthorized'
          });
        }
        
        totalAmount = parseFloat(plan.estimatedTotalCost || '0');
        currency = plan.currency || 'GBP';
      }
    }
    
    // Create payment options based on the total amount
    const depositAmount = Math.round(totalAmount * 0.2); // 20% deposit
    
    const paymentOptions = [
      {
        id: 'full-payment',
        name: 'Full Payment',
        description: 'Pay the entire amount upfront and receive a 5% discount',
        type: 'full',
        amount: Math.round(totalAmount * 0.95),
        discount: 5,
      },
      {
        id: 'deposit',
        name: 'Pay Deposit Now',
        description: 'Pay the deposit now and the remainder at the clinic',
        type: 'deposit',
        amount: depositAmount,
        depositAmount,
      },
      {
        id: 'installment-3',
        name: '3-Month Payment Plan',
        description: 'Split your payment into 3 monthly installments',
        type: 'installment',
        amount: totalAmount,
        installments: 3,
        installmentAmount: Math.round(totalAmount / 3)
      },
      {
        id: 'installment-6',
        name: '6-Month Payment Plan',
        description: 'Split your payment into 6 monthly installments',
        type: 'installment',
        amount: totalAmount,
        installments: 6,
        installmentAmount: Math.round(totalAmount / 6)
      }
    ];
    
    return res.json({
      success: true,
      paymentOptions,
      currency
    });
  } catch (error) {
    console.error('Error fetching payment options:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment options',
      error: error.message
    });
  }
});

/**
 * Process payment for a treatment plan
 */
router.post('/patient/treatment-plans/:id/process-payment', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const { paymentOptionId } = req.body;
    const planId = req.params.id;
    const userId = req.user.id;
    
    // Verify the payment option and plan
    // In a real app, this would handle payment processing
    
    // For now, just return a success response
    return res.json({
      success: true,
      message: 'Payment processed successfully',
      redirectUrl: '/payment-success',
      paymentReference: `PAY-${uuidv4().substring(0, 8)}`
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

/**
 * Get treatment plans for a clinic
 */
router.get('/clinic/treatment-plans', async (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'clinic') {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated or not authorized' 
    });
  }

  try {
    const clinicId = req.user.clinicId;
    
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: 'No clinic ID associated with this account'
      });
    }
    
    // Get treatment plans for this clinic
    const plans = await storage.getAllTreatmentPlans();
    
    // Filter for this clinic
    const clinicPlans = plans.filter(plan => plan.clinicId === clinicId);
    
    return res.json({
      success: true,
      treatmentPlans: clinicPlans
    });
  } catch (error) {
    console.error('Error fetching clinic treatment plans:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinic treatment plans',
      error: error.message
    });
  }
});

export default router;