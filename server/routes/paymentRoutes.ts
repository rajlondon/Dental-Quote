import express, { Request, Response } from "express";
import { csrfProtection } from "../middleware/security";
import { ensureAuthenticated, ensureRole } from "../middleware/auth";
import { storage } from "../storage";
import { stripeClient, createPaymentIntent, createTreatmentPaymentIntent, getPaymentIntent } from "../stripe-service";
import { z } from "zod";

const router = express.Router();

// Get payments by user or booking
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId, bookingId, limit } = req.query;
    
    // Check permissions - users can only see their own payments unless admin/clinic
    if (req.user?.role !== "admin" && req.user?.role !== "clinic_staff") {
      if (userId && parseInt(userId as string) !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view these payments"
        });
      }
    }
    
    let payments = [];
    if (bookingId) {
      payments = await storage.getPaymentsByBookingId(parseInt(bookingId as string));
    } else if (userId) {
      payments = await storage.getPaymentsByUserId(parseInt(userId as string));
    } else if (req.user?.role === "admin") {
      // Admin can get all payments with limit
      // TODO: Implement getAllPayments in storage.ts with pagination
      payments = []; // Placeholder for now
    } else {
      // Default to current user's payments
      payments = await storage.getPaymentsByUserId(req.user!.id);
    }
    
    // Apply limit if specified
    if (limit && parseInt(limit as string) > 0) {
      payments = payments.slice(0, parseInt(limit as string));
    }
    
    // If payment has a Stripe ID but no receipt URL, try to fetch it
    const updatedPayments = await Promise.all(
      payments.map(async (payment) => {
        if (payment.stripePaymentIntentId && !payment.receiptUrl && payment.status === "completed") {
          try {
            // Get payment intent from Stripe
            const paymentIntent = await getPaymentIntent(payment.stripePaymentIntentId);
            
            // If payment intent has charges, get receipt URL from the latest charge
            if (paymentIntent.latest_charge) {
              const charge = await stripeClient!.charges.retrieve(
                typeof paymentIntent.latest_charge === "string" 
                  ? paymentIntent.latest_charge 
                  : paymentIntent.latest_charge.id
              );
              
              if (charge.receipt_url) {
                // Update payment with receipt URL
                await storage.updatePayment(payment.id, { 
                  receiptUrl: charge.receipt_url 
                });
                
                // Return updated payment
                return {
                  ...payment,
                  receiptUrl: charge.receipt_url
                };
              }
            }
          } catch (error) {
            console.error(`Failed to fetch receipt URL for payment ${payment.id}:`, error);
            // Continue with the original payment
          }
        }
        
        return payment;
      })
    );
    
    // Return payments
    res.json({
      success: true,
      payments: updatedPayments
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching payments"
    });
  }
});

// Create a treatment payment intent
router.post("/create-treatment-payment-intent", csrfProtection, ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const schema = z.object({
      email: z.string().email(),
      amount: z.number().positive(),
      currency: z.string().length(3).optional().default("gbp"),
      description: z.string().optional(),
      bookingId: z.number().optional(),
      treatmentPlanId: z.number().optional(),
      metadata: z.record(z.string(), z.string()).optional().default({})
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: result.error.errors
      });
    }
    
    const { email, amount, currency, description, bookingId, treatmentPlanId, metadata } = result.data;
    
    console.log('Creating treatment payment intent with email:', email);
    
    // Create payment intent
    const paymentIntentData = await createTreatmentPaymentIntent(
      email, 
      amount, 
      currency, 
      {
        ...metadata,
        description: description || "Treatment Payment",
        bookingId: bookingId ? bookingId.toString() : undefined,
        treatmentPlanId: treatmentPlanId ? treatmentPlanId.toString() : undefined
      }
    );
    
    // Return client secret
    res.json({
      success: true,
      clientSecret: paymentIntentData.clientSecret,
      paymentIntentId: paymentIntentData.id
    });
  } catch (error) {
    console.error("Error creating treatment payment intent:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the payment intent",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get payment by ID 
router.get("/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    // TODO: Implement getPaymentById in storage.ts
    res.status(501).json({
      success: false,
      message: "Not implemented yet"
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the payment"
    });
  }
});

export default router;