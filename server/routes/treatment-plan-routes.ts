import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth-middleware";
import { ensureRole } from "../middleware/auth";

const router = Router();

// Schema for treatment plan items
const treatmentItemSchema = z.object({
  id: z.string().optional(), // Will be generated if not provided
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  currency: z.string().default('GBP'),
  status: z.enum(['pending', 'scheduled', 'completed', 'cancelled']).default('pending'),
  scheduled: z.string().optional(),
  completed: z.string().optional(),
  notes: z.string().optional()
});

// Schema for treatment plan creation
const createTreatmentPlanSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  clinicId: z.number(),
  patientId: z.number(),
  status: z.enum(['draft', 'proposed', 'approved', 'in_treatment', 'completed', 'cancelled']).default('draft'),
  paymentStatus: z.enum(['unpaid', 'deposit_paid', 'partially_paid', 'fully_paid', 'refunded']).default('unpaid'),
  totalAmount: z.number().min(0),
  currency: z.string().default('GBP'),
  deposit: z.number().optional(),
  depositPaid: z.boolean().default(false),
  items: z.array(treatmentItemSchema),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  nextAppointment: z.string().optional(),
  treatmentProgress: z.number().min(0).max(100).optional(),
  additionalNotes: z.string().optional(),
  financingAvailable: z.boolean().default(true),
  documentIds: z.array(z.string()).optional(),
  pendingApproval: z.boolean().default(true),
  quoteId: z.string().or(z.number()).optional(),
  fromQuote: z.boolean().optional(),
  promoApplied: z.boolean().optional(),
  promoDetails: z.object({
    code: z.string(),
    discount: z.number(),
    type: z.string()
  }).optional()
});

// Schema for treatment plan updates
const updateTreatmentPlanSchema = createTreatmentPlanSchema.partial();

// Get all treatment plans for a patient
router.get(
  "/patient/treatment-plans",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      
      // Get all treatment plans for this patient
      const treatmentPlans = await storage.getPatientTreatmentPlans(userId);
      
      return res.json({
        success: true,
        treatmentPlans
      });
    } catch (error) {
      console.error("Error fetching patient treatment plans:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch treatment plans"
      });
    }
  }
);

// Get a specific treatment plan
router.get(
  "/treatment-plans/:planId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      
      // Get the treatment plan
      const treatmentPlan = await storage.getTreatmentPlan(planId);
      
      if (!treatmentPlan) {
        return res.status(404).json({
          success: false,
          message: "Treatment plan not found"
        });
      }
      
      // Check access permissions
      if (
        req.user?.role !== "admin" &&
        (req.user?.role === "clinic_staff" && req.user?.clinicId !== treatmentPlan.clinicId) &&
        userId !== treatmentPlan.patientId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this treatment plan"
        });
      }
      
      return res.json({
        success: true,
        treatmentPlan
      });
    } catch (error) {
      console.error("Error fetching treatment plan:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch treatment plan"
      });
    }
  }
);

// Create a new treatment plan
router.post(
  "/treatment-plans",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const treatmentPlanData = createTreatmentPlanSchema.parse(req.body);
      
      // If clinic staff, ensure they can only create plans for their own clinic
      if (
        req.user?.role === "clinic_staff" && 
        req.user?.clinicId !== treatmentPlanData.clinicId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create treatment plans for this clinic"
        });
      }
      
      // Create the treatment plan
      const treatmentPlan = await storage.createTreatmentPlan({
        ...treatmentPlanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.id
      });
      
      return res.status(201).json({
        success: true,
        treatmentPlan
      });
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid treatment plan data",
          errors: error.errors
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to create treatment plan"
      });
    }
  }
);

// Create a treatment plan from a quote
router.post(
  "/quotes/:quoteId/treatment-plan",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const quoteId = req.params.quoteId;
      
      // Get the quote
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({
          success: false,
          message: "Quote not found"
        });
      }
      
      // Check access permissions
      if (
        req.user?.role !== "admin" &&
        (req.user?.role === "clinic_staff" && req.user?.clinicId !== quote.clinicId) &&
        req.user?.id !== quote.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create a treatment plan from this quote"
        });
      }
      
      // Create treatment items from quote treatments
      const treatmentItems = (quote.treatments || []).map((treatment: any) => ({
        name: treatment.name,
        description: treatment.description,
        quantity: treatment.quantity || 1,
        unitPrice: treatment.price,
        totalPrice: treatment.price * (treatment.quantity || 1),
        currency: quote.currency || 'GBP',
        status: 'pending'
      }));
      
      // Calculate total from treatments if not provided
      const totalAmount = treatmentItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Create a new treatment plan
      const treatmentPlanData = {
        title: `Treatment Plan from Quote #${quote.quoteNumber || quoteId}`,
        description: quote.notes || 'Treatment plan based on your quote request',
        clinicId: quote.clinicId,
        patientId: quote.userId,
        status: 'proposed' as const,
        paymentStatus: 'unpaid' as const,
        totalAmount,
        currency: quote.currency || 'GBP',
        deposit: quote.deposit || Math.round(totalAmount * 0.2),
        depositPaid: false,
        items: treatmentItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        financingAvailable: true,
        pendingApproval: true,
        quoteId,
        fromQuote: true
      };
      
      const treatmentPlan = await storage.createTreatmentPlan(treatmentPlanData);
      
      return res.status(201).json({
        success: true,
        treatmentPlan
      });
    } catch (error) {
      console.error("Error creating treatment plan from quote:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create treatment plan from quote"
      });
    }
  }
);

// Update a treatment plan
router.patch(
  "/treatment-plans/:planId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      
      // Get the current treatment plan
      const existingPlan = await storage.getTreatmentPlan(planId);
      
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: "Treatment plan not found"
        });
      }
      
      // Check access permissions
      const canUpdate = 
        req.user?.role === "admin" ||
        (req.user?.role === "clinic_staff" && req.user?.clinicId === existingPlan.clinicId) ||
        (req.user?.id === existingPlan.patientId && existingPlan.status === 'proposed');
      
      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this treatment plan"
        });
      }
      
      // Parse the update data
      const updateData = updateTreatmentPlanSchema.parse(req.body);
      
      // Update the treatment plan
      const updatedPlan = await storage.updateTreatmentPlan(planId, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      return res.json({
        success: true,
        treatmentPlan: updatedPlan
      });
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid treatment plan data",
          errors: error.errors
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to update treatment plan"
      });
    }
  }
);

// Approve a treatment plan (patient only)
router.post(
  "/treatment-plans/:planId/approve",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      const { notes } = req.body;
      
      // Get the current treatment plan
      const existingPlan = await storage.getTreatmentPlan(planId);
      
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: "Treatment plan not found"
        });
      }
      
      // Ensure only the patient can approve their own treatment plan
      if (req.user?.id !== existingPlan.patientId) {
        return res.status(403).json({
          success: false,
          message: "Only the patient can approve their treatment plan"
        });
      }
      
      // Update the treatment plan status
      const updatedPlan = await storage.updateTreatmentPlan(planId, {
        status: 'approved',
        pendingApproval: false,
        additionalNotes: notes ? `${existingPlan.additionalNotes || ''}\n\nPatient approval notes: ${notes}` : existingPlan.additionalNotes,
        updatedAt: new Date().toISOString()
      });
      
      return res.json({
        success: true,
        treatmentPlan: updatedPlan
      });
    } catch (error) {
      console.error("Error approving treatment plan:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to approve treatment plan"
      });
    }
  }
);

// Get payment options for a treatment plan
router.get(
  "/treatment-plans/:planId/payment-options",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      
      // Get the treatment plan
      const treatmentPlan = await storage.getTreatmentPlan(planId);
      
      if (!treatmentPlan) {
        return res.status(404).json({
          success: false,
          message: "Treatment plan not found"
        });
      }
      
      // Check access permissions
      if (
        req.user?.role !== "admin" &&
        (req.user?.role === "clinic_staff" && req.user?.clinicId !== treatmentPlan.clinicId) &&
        req.user?.id !== treatmentPlan.patientId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access payment options for this treatment plan"
        });
      }
      
      // Generate payment options based on the treatment plan
      const paymentOptions = [
        {
          id: 'full',
          name: 'Full Payment',
          description: 'Pay the entire amount upfront and receive a 5% discount',
          type: 'full',
          amount: Math.round(treatmentPlan.totalAmount * 0.95),
          discount: 5
        },
        {
          id: 'deposit',
          name: 'Pay Deposit Now',
          description: 'Pay the deposit now and the remainder at the clinic',
          type: 'deposit',
          amount: treatmentPlan.deposit || Math.round(treatmentPlan.totalAmount * 0.2),
          depositAmount: treatmentPlan.deposit || Math.round(treatmentPlan.totalAmount * 0.2)
        }
      ];
      
      // Add installment options if the treatment plan is eligible
      if (treatmentPlan.totalAmount > 500) {
        paymentOptions.push({
          id: 'installment',
          name: '3-Month Payment Plan',
          description: 'Split your payment into 3 monthly installments',
          type: 'installment',
          amount: treatmentPlan.totalAmount,
          installments: 3,
          installmentAmount: Math.round(treatmentPlan.totalAmount / 3)
        });
      }
      
      // Add financing options if available
      if (treatmentPlan.financingAvailable && treatmentPlan.totalAmount > 1000) {
        paymentOptions.push({
          id: 'financing',
          name: 'Dental Financing',
          description: 'Finance your treatment with our partner credit provider',
          type: 'financing',
          amount: treatmentPlan.totalAmount,
          installments: 12,
          installmentAmount: Math.round((treatmentPlan.totalAmount * 1.08) / 12),
          interestRate: 8
        });
      }
      
      return res.json({
        success: true,
        paymentOptions
      });
    } catch (error) {
      console.error("Error fetching payment options:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment options"
      });
    }
  }
);

// Get all treatment plans for a clinic
router.get(
  "/clinic/:clinicId/treatment-plans",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const clinicId = Number(req.params.clinicId);
      
      // If clinic staff, ensure they can only access their own clinic's treatment plans
      if (
        req.user?.role === "clinic_staff" && 
        req.user?.clinicId !== clinicId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access treatment plans for this clinic"
        });
      }
      
      // Get all treatment plans for this clinic
      const treatmentPlans = await storage.getClinicTreatmentPlans(clinicId);
      
      return res.json({
        success: true,
        treatmentPlans
      });
    } catch (error) {
      console.error("Error fetching clinic treatment plans:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch treatment plans"
      });
    }
  }
);

export default router;