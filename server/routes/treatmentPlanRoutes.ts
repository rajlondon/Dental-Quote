import express from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  next();
};

// Middleware to check for admin or clinic_staff roles
const hasAdminOrClinicAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  
  const user = req.user as any;
  if (user.role !== 'admin' && user.role !== 'clinic_staff') {
    return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
  }
  
  next();
};

// Get all treatment plans for a patient
router.get('/patient/:patientId', isAuthenticated, async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const user = req.user as any;
    
    // Check permissions - only allow the patient themself, admins, or relevant clinic staff
    if (user.id !== patientId && user.role !== 'admin' && 
        !(user.role === 'clinic_staff' && user.clinicId)) {
      return res.status(403).json({ error: 'Forbidden - You do not have permission to access these treatment plans' });
    }
    
    const treatmentPlans = await storage.getTreatmentPlansByPatientId(patientId);
    res.json(treatmentPlans);
  } catch (error: any) {
    console.error('Error fetching patient treatment plans:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve treatment plans' });
  }
});

// Get all treatment plans for a clinic
router.get('/clinic/:clinicId', hasAdminOrClinicAccess, async (req, res) => {
  try {
    const clinicId = parseInt(req.params.clinicId);
    const user = req.user as any;
    
    // Only allow access to staff of this clinic or admins
    if (user.role === 'clinic_staff' && user.clinicId !== clinicId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - You can only view treatment plans for your clinic' });
    }
    
    const treatmentPlans = await storage.getTreatmentPlansByClinicId(clinicId);
    res.json(treatmentPlans);
  } catch (error: any) {
    console.error('Error fetching clinic treatment plans:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve treatment plans' });
  }
});

// Get a treatment plan by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const treatmentPlanId = parseInt(req.params.id);
    const treatmentPlan = await storage.getTreatmentPlan(treatmentPlanId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Check if the user has permission to view this treatment plan
    const user = req.user as any;
    
    if (user.role === 'patient' && user.id !== treatmentPlan.patientId) {
      return res.status(403).json({ error: 'Forbidden - You do not have permission to view this treatment plan' });
    }
    
    if (user.role === 'clinic_staff' && user.clinicId !== treatmentPlan.clinicId) {
      return res.status(403).json({ error: 'Forbidden - This treatment plan is not associated with your clinic' });
    }
    
    res.json(treatmentPlan);
  } catch (error: any) {
    console.error('Error fetching treatment plan:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve treatment plan' });
  }
});

// Get a treatment plan by quote request ID
router.get('/quote-request/:quoteRequestId', isAuthenticated, async (req, res) => {
  try {
    const quoteRequestId = parseInt(req.params.quoteRequestId);
    const treatmentPlan = await storage.getTreatmentPlanByQuoteRequestId(quoteRequestId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ error: 'No treatment plan found for this quote request' });
    }
    
    // Check if the user has permission to view this treatment plan
    const user = req.user as any;
    
    if (user.role === 'patient' && user.id !== treatmentPlan.patientId) {
      return res.status(403).json({ error: 'Forbidden - You do not have permission to view this treatment plan' });
    }
    
    if (user.role === 'clinic_staff' && user.clinicId !== treatmentPlan.clinicId) {
      return res.status(403).json({ error: 'Forbidden - This treatment plan is not associated with your clinic' });
    }
    
    res.json(treatmentPlan);
  } catch (error: any) {
    console.error('Error fetching treatment plan by quote request:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve treatment plan' });
  }
});

// Create a new treatment plan
router.post('/', hasAdminOrClinicAccess, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Validate request body
    const schema = z.object({
      patientId: z.number(),
      clinicId: z.number(),
      status: z.enum(['draft', 'finalized', 'in_treatment', 'completed']).default('draft'),
      treatmentDetails: z.any(),
      estimatedTotalCost: z.number().optional(),
      currency: z.string().default('GBP'),
      notes: z.string().optional(),
      portalStatus: z.string().optional(),
      quoteRequestId: z.number().optional()
    });
    
    const treatmentPlanData = schema.parse(req.body);
    
    // Clinic staff can only create treatment plans for their clinic
    if (user.role === 'clinic_staff' && user.clinicId !== treatmentPlanData.clinicId) {
      return res.status(403).json({ error: 'Forbidden - You can only create treatment plans for your clinic' });
    }
    
    // Prepare the treatment plan data with the required fields
    const treatmentPlanToCreate: InsertTreatmentPlan = {
      patientId: treatmentPlanData.patientId,
      clinicId: treatmentPlanData.clinicId,
      createdById: user.id,
      status: treatmentPlanData.status,
      treatmentDetails: treatmentPlanData.treatmentDetails || {}, // Ensure we have an object even if null was passed
      currency: treatmentPlanData.currency,
      notes: treatmentPlanData.notes,
      quoteRequestId: treatmentPlanData.quoteRequestId,
      estimatedTotalCost: treatmentPlanData.estimatedTotalCost ? 
        treatmentPlanData.estimatedTotalCost.toString() : null, // Convert to string to match schema
      portalStatus: treatmentPlanData.portalStatus
    };
    
    // Create the treatment plan
    const newTreatmentPlan = await storage.createTreatmentPlan(treatmentPlanToCreate);
    
    // If this treatment plan is for a quote request, update the quote request status
    if (treatmentPlanData.quoteRequestId) {
      await storage.updateQuoteRequest(treatmentPlanData.quoteRequestId, {
        status: 'converted',
        // Add clinicId if not already selected
        selectedClinicId: treatmentPlanData.clinicId
      });
    }
    
    res.status(201).json(newTreatmentPlan);
  } catch (error: any) {
    console.error('Error creating treatment plan:', error);
    res.status(500).json({ error: error.message || 'Failed to create treatment plan' });
  }
});

// Update a treatment plan
router.patch('/:id', hasAdminOrClinicAccess, async (req, res) => {
  try {
    const treatmentPlanId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Get the existing treatment plan
    const existingPlan = await storage.getTreatmentPlan(treatmentPlanId);
    
    if (!existingPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Clinic staff can only update treatment plans for their clinic
    if (user.role === 'clinic_staff' && user.clinicId !== existingPlan.clinicId) {
      return res.status(403).json({ error: 'Forbidden - You can only update treatment plans for your clinic' });
    }
    
    // Validate request body
    const schema = z.object({
      status: z.enum(['draft', 'finalized', 'in_treatment', 'completed']).optional(),
      treatmentDetails: z.any().optional(),
      estimatedTotalCost: z.number().optional(),
      currency: z.string().optional(),
      notes: z.string().optional(),
      portalStatus: z.string().optional()
    });
    
    const updateData = schema.parse(req.body);
    
    // Convert estimatedTotalCost to string if it exists (to match schema)
    const finalUpdateData: Partial<TreatmentPlan> = {
      ...updateData,
      estimatedTotalCost: updateData.estimatedTotalCost !== undefined ? 
        updateData.estimatedTotalCost.toString() : undefined
    };

    // Update the treatment plan
    const updatedPlan = await storage.updateTreatmentPlan(treatmentPlanId, finalUpdateData);
    
    if (!updatedPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    res.json(updatedPlan);
  } catch (error: any) {
    console.error('Error updating treatment plan:', error);
    res.status(500).json({ error: error.message || 'Failed to update treatment plan' });
  }
});

export default router;