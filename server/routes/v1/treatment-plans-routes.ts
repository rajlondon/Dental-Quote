/**
 * Unified Treatment Plans API Routes (v1)
 * 
 * Provides a single source of truth for treatment plan operations
 * with role-based permissions for all portals
 */
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { ensureAuthenticated, ensureRole } from '../../middleware/auth';
import { AppError, catchAsync } from '../../middleware/error-handler';
import { db } from '../../db';
import { treatmentPlans, treatmentLines, treatments } from '@shared/schema';
import { eq, desc, and, or, like } from 'drizzle-orm';
import { TreatmentPlanStatus } from '@shared/models/treatment-plan';

// Validation schemas
const createTreatmentPlanSchema = z.object({
  patientId: z.number(),
  clinicId: z.number().optional(),
  status: z.string().default("Draft"),
  treatmentDetails: z.array(z.object({
    id: z.number().or(z.string()),
    name: z.string(),
    price: z.number(),
    quantity: z.number().default(1),
    description: z.string().optional(),
  })).optional(),
  estimatedTotalCost: z.string().optional(),
  currency: z.string().default("GBP"),
  includesHotel: z.boolean().optional(),
  hotelDetails: z.any().optional(),
  notes: z.string().optional(),
  quoteRequestId: z.number().optional(),
});

const updateTreatmentPlanSchema = z.object({
  patientId: z.number().optional(),
  clinicId: z.number().optional(),
  status: z.string().optional(),
  treatmentDetails: z.array(z.object({
    id: z.number().or(z.string()),
    name: z.string(),
    price: z.number(),
    quantity: z.number().default(1),
    description: z.string().optional(),
  })).optional(),
  estimatedTotalCost: z.string().optional(),
  currency: z.string().optional(),
  includesHotel: z.boolean().optional(),
  hotelDetails: z.any().optional(),
  notes: z.string().optional(),
  quoteRequestId: z.number().optional(),
});

const addTreatmentSchema = z.object({
  id: z.number().or(z.string()),
  name: z.string(),
  price: z.number(),
  quantity: z.number().default(1),
  description: z.string().optional(),
});

const updateTreatmentSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  description: z.string().optional(),
});

// Helper function to check if user has permission for a specific treatment plan
async function hasPermissionForPlan(req: Request, planId: number, action: 'view' | 'update' | 'delete'): Promise<boolean> {
  // Admin can do anything
  if (req.user?.role === 'admin') {
    return true;
  }
  
  // Get the plan
  const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId));
  
  if (!plan) {
    return false;
  }
  
  // Check permissions based on role
  switch (req.user?.role) {
    case 'clinic_staff':
      // Clinic staff can only access their own clinic's plans
      return plan.clinicId === req.user.clinicId;
      
    case 'patient':
      // Patients can only access their own plans
      return plan.patientId === req.user.id;
      
    default:
      return false;
  }
}

// Create router
const router = express.Router();

/**
 * Create a new treatment plan
 * POST /api/v1/treatment-plans
 */
router.post('/', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  
  // Only admin and clinic staff can create plans
  if (user.role !== 'admin' && user.role !== 'clinic_staff') {
    throw new AppError('You do not have permission to create treatment plans', 403);
  }
  
  try {
    // Validate request body
    const validatedData = createTreatmentPlanSchema.parse(req.body);
    
    // If clinic staff, ensure they can only create plans for their clinic
    if (user.role === 'clinic_staff' && validatedData.clinicId !== user.clinicId) {
      throw new AppError('You can only create treatment plans for your clinic', 403);
    }
    
    // Ensure the clinicId is set for clinic staff
    if (user.role === 'clinic_staff' && !validatedData.clinicId) {
      validatedData.clinicId = user.clinicId;
    }
    
    // Create the plan
    const [plan] = await db.insert(treatmentPlans).values({
      ...validatedData,
      createdById: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    
    if (error instanceof z.ZodError) {
      throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    
    throw new AppError('Failed to create treatment plan', 500);
  }
}));

/**
 * Get all treatment plans (with filtering)
 * GET /api/v1/treatment-plans
 */
router.get('/', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  
  // Parse query parameters
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50); // Max 50 items per page
  const status = req.query.status as string;
  const search = req.query.search as string;
  const quoteId = req.query.quoteId as string;
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  try {
    // Build base query
    let query = db.select().from(treatmentPlans);
    
    // Apply filters based on user role
    if (user.role === 'admin') {
      // Admin can see all plans
    } else if (user.role === 'clinic_staff') {
      // Clinic staff can only see their clinic's plans
      query = query.where(eq(treatmentPlans.clinicId, user.clinicId));
    } else if (user.role === 'patient') {
      // Patients can only see their own plans
      query = query.where(eq(treatmentPlans.patientId, user.id));
    } else {
      // Unauthorized
      throw new AppError('You do not have permission to view treatment plans', 403);
    }
    
    // Apply status filter if provided
    if (status) {
      query = query.where(eq(treatmentPlans.status, status));
    }
    
    // Apply search filter if provided
    if (search && search.length >= 2) {
      // Allow searching by patient name or clinic name
      // In a real implementation, you would join with user and clinic tables
      query = query.where(
        or(
          like(treatmentPlans.patientName, `%${search}%`),
          like(treatmentPlans.clinicName, `%${search}%`)
        )
      );
    }
    
    // Apply quote filter if provided
    if (quoteId) {
      query = query.where(eq(treatmentPlans.quoteRequestId, Number(quoteId)));
    }
    
    // Get total count for pagination
    const countQuery = db.select({ count: db.fn.count() }).from(treatmentPlans);
    // Apply the same filters to count query
    const [{ count }] = await countQuery;
    
    // Apply sorting and pagination
    query = query.orderBy(desc(treatmentPlans.updatedAt)).limit(limit).offset(offset);
    
    // Execute query
    const treatmentPlansList = await query;
    
    res.json({
      success: true,
      data: {
        treatmentPlans: treatmentPlansList,
        pagination: {
          total: Number(count),
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    throw new AppError('Failed to fetch treatment plans', 500);
  }
}));

/**
 * Get a specific treatment plan
 * GET /api/v1/treatment-plans/:id
 */
router.get('/:id', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const planId = Number(id);
  
  if (isNaN(planId)) {
    throw new AppError('Invalid treatment plan ID', 400);
  }
  
  // Check if user has permission
  if (!(await hasPermissionForPlan(req, planId, 'view'))) {
    throw new AppError('You do not have permission to view this treatment plan', 403);
  }
  
  try {
    // Get the plan
    const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId));
    
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    throw new AppError('Failed to fetch treatment plan', 500);
  }
}));

/**
 * Update a treatment plan
 * PATCH /api/v1/treatment-plans/:id
 */
router.patch('/:id', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const planId = Number(id);
  
  if (isNaN(planId)) {
    throw new AppError('Invalid treatment plan ID', 400);
  }
  
  // Check if user has permission
  if (!(await hasPermissionForPlan(req, planId, 'update'))) {
    throw new AppError('You do not have permission to update this treatment plan', 403);
  }
  
  try {
    // Validate request body
    const validatedData = updateTreatmentPlanSchema.parse(req.body);
    
    // Update the plan
    const [updatedPlan] = await db
      .update(treatmentPlans)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString()
      })
      .where(eq(treatmentPlans.id, planId))
      .returning();
    
    if (!updatedPlan) {
      throw new AppError('Treatment plan not found', 404);
    }
    
    res.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    
    if (error instanceof z.ZodError) {
      throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    
    throw new AppError('Failed to update treatment plan', 500);
  }
}));

/**
 * Delete a treatment plan
 * DELETE /api/v1/treatment-plans/:id
 */
router.delete('/:id', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const planId = Number(id);
  
  if (isNaN(planId)) {
    throw new AppError('Invalid treatment plan ID', 400);
  }
  
  // Check if user has permission
  if (!(await hasPermissionForPlan(req, planId, 'delete'))) {
    throw new AppError('You do not have permission to delete this treatment plan', 403);
  }
  
  try {
    // Delete the plan
    const [deletedPlan] = await db
      .delete(treatmentPlans)
      .where(eq(treatmentPlans.id, planId))
      .returning();
    
    if (!deletedPlan) {
      throw new AppError('Treatment plan not found', 404);
    }
    
    res.json({
      success: true,
      data: deletedPlan
    });
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    throw new AppError('Failed to delete treatment plan', 500);
  }
}));

/**
 * Add a treatment to a plan
 * POST /api/v1/treatment-plans/:id/treatments
 */
router.post('/:id/treatments', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const planId = Number(id);
  
  if (isNaN(planId)) {
    throw new AppError('Invalid treatment plan ID', 400);
  }
  
  // Check if user has permission
  if (!(await hasPermissionForPlan(req, planId, 'update'))) {
    throw new AppError('You do not have permission to update this treatment plan', 403);
  }
  
  try {
    // Validate request body
    const treatmentData = addTreatmentSchema.parse(req.body);
    
    // Get the current plan
    const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId));
    
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }
    
    // Parse current treatments
    let treatments = [];
    if (plan.treatmentDetails && typeof plan.treatmentDetails === 'object') {
      treatments = Array.isArray(plan.treatmentDetails) ? plan.treatmentDetails : [];
    }
    
    // Add the new treatment
    treatments.push(treatmentData);
    
    // Update the plan
    const [updatedPlan] = await db
      .update(treatmentPlans)
      .set({
        treatmentDetails: treatments,
        updatedAt: new Date().toISOString()
      })
      .where(eq(treatmentPlans.id, planId))
      .returning();
    
    res.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error adding treatment to plan:', error);
    
    if (error instanceof z.ZodError) {
      throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    
    throw new AppError('Failed to add treatment to plan', 500);
  }
}));

/**
 * Update a treatment in a plan
 * PATCH /api/v1/treatment-plans/:id/treatments/:treatmentIndex
 */
router.patch('/:id/treatments/:treatmentIndex', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id, treatmentIndex } = req.params;
  const planId = Number(id);
  const index = Number(treatmentIndex);
  
  if (isNaN(planId) || isNaN(index)) {
    throw new AppError('Invalid parameters', 400);
  }
  
  // Check if user has permission
  if (!(await hasPermissionForPlan(req, planId, 'update'))) {
    throw new AppError('You do not have permission to update this treatment plan', 403);
  }
  
  try {
    // Validate request body
    const treatmentData = updateTreatmentSchema.parse(req.body);
    
    // Get the current plan
    const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId));
    
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }
    
    // Parse current treatments
    let treatments = [];
    if (plan.treatmentDetails && typeof plan.treatmentDetails === 'object') {
      treatments = Array.isArray(plan.treatmentDetails) ? plan.treatmentDetails : [];
    }
    
    // Check if treatment exists
    if (index < 0 || index >= treatments.length) {
      throw new AppError('Treatment not found in plan', 404);
    }
    
    // Update the treatment
    treatments[index] = {
      ...treatments[index],
      ...treatmentData
    };
    
    // Update the plan
    const [updatedPlan] = await db
      .update(treatmentPlans)
      .set({
        treatmentDetails: treatments,
        updatedAt: new Date().toISOString()
      })
      .where(eq(treatmentPlans.id, planId))
      .returning();
    
    res.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating treatment in plan:', error);
    
    if (error instanceof z.ZodError) {
      throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    
    throw new AppError('Failed to update treatment in plan', 500);
  }
}));

/**
 * Remove a treatment from a plan
 * DELETE /api/v1/treatment-plans/:id/treatments/:treatmentIndex
 */
router.delete('/:id/treatments/:treatmentIndex', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id, treatmentIndex } = req.params;
  const planId = Number(id);
  const index = Number(treatmentIndex);
  
  if (isNaN(planId) || isNaN(index)) {
    throw new AppError('Invalid parameters', 400);
  }
  
  // Check if user has permission
  if (!(await hasPermissionForPlan(req, planId, 'update'))) {
    throw new AppError('You do not have permission to update this treatment plan', 403);
  }
  
  try {
    // Get the current plan
    const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId));
    
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }
    
    // Parse current treatments
    let treatments = [];
    if (plan.treatmentDetails && typeof plan.treatmentDetails === 'object') {
      treatments = Array.isArray(plan.treatmentDetails) ? plan.treatmentDetails : [];
    }
    
    // Check if treatment exists
    if (index < 0 || index >= treatments.length) {
      throw new AppError('Treatment not found in plan', 404);
    }
    
    // Remove the treatment
    treatments.splice(index, 1);
    
    // Update the plan
    const [updatedPlan] = await db
      .update(treatmentPlans)
      .set({
        treatmentDetails: treatments,
        updatedAt: new Date().toISOString()
      })
      .where(eq(treatmentPlans.id, planId))
      .returning();
    
    res.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error removing treatment from plan:', error);
    throw new AppError('Failed to remove treatment from plan', 500);
  }
}));

/**
 * Get treatment summary for a quote
 * GET /api/v1/treatment-plans/summary/:quoteId
 */
router.get('/summary/:quoteId', ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { quoteId } = req.params;
  const { user } = req;
  
  try {
    // Validate that user has access to this quote
    // (Implementation would depend on your quote model)
    
    // Get all treatment plans for this quote
    const plansList = await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.quoteRequestId, Number(quoteId)));
    
    // Calculate summary statistics
    const totalPlans = plansList.length;
    let totalCost = 0;
    
    // Group by clinic
    const clinicSummary = {};
    
    for (const plan of plansList) {
      // Only include plans the user has permission to view
      if (await hasPermissionForPlan(req, plan.id, 'view')) {
        // Calculate total cost
        if (plan.treatmentDetails && Array.isArray(plan.treatmentDetails)) {
          for (const treatment of plan.treatmentDetails) {
            const price = treatment.price || 0;
            const quantity = treatment.quantity || 1;
            totalCost += price * quantity;
          }
        }
        
        // Group by clinic
        if (plan.clinicId) {
          if (!clinicSummary[plan.clinicId]) {
            clinicSummary[plan.clinicId] = {
              id: plan.clinicId,
              name: plan.clinicName || `Clinic ${plan.clinicId}`,
              planCount: 0,
              totalCost: 0
            };
          }
          
          clinicSummary[plan.clinicId].planCount++;
          
          // Add treatment costs to clinic total
          if (plan.treatmentDetails && Array.isArray(plan.treatmentDetails)) {
            for (const treatment of plan.treatmentDetails) {
              const price = treatment.price || 0;
              const quantity = treatment.quantity || 1;
              clinicSummary[plan.clinicId].totalCost += price * quantity;
            }
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        totalPlans,
        totalCost,
        clinics: Object.values(clinicSummary)
      }
    });
  } catch (error) {
    console.error('Error fetching treatment summary:', error);
    throw new AppError('Failed to fetch treatment summary', 500);
  }
}));

export default router;