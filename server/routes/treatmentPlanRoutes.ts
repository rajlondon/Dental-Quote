import express, { Request, Response } from "express";
import { csrfProtection } from "../middleware/security";
import { ensureAuthenticated, ensureRole } from "../middleware/auth";
import { storage } from "../storage";
import { catchAsync } from "../middleware/error-handler";
import { NotificationService } from "../services/notificationService";

const router = express.Router();

/**
 * Get all treatment plans
 * This route is accessible to admins and returns all treatment plans
 */
router.get("/", ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const clinicId = req.user?.clinicId;
  
  // Default pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const search = req.query.search as string;
  
  let treatmentPlans;
  
  if (userRole === 'admin') {
    // Admin can see all treatment plans
    treatmentPlans = await storage.getAllTreatmentPlans(status, search);
  } else if (userRole === 'clinic_staff' && clinicId) {
    // Clinic staff can only see treatment plans for their clinic
    treatmentPlans = await storage.getTreatmentPlansByClinicId(clinicId);
  } else if (userRole === 'patient') {
    // Patients can only see their own treatment plans
    treatmentPlans = await storage.getTreatmentPlansByPatientId(userId!);
  } else {
    // Unauthorized role
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view treatment plans"
    });
  }
  
  // Apply status filter if provided
  if (status && treatmentPlans.length > 0) {
    treatmentPlans = treatmentPlans.filter(plan => plan.status.toLowerCase() === status.toLowerCase());
  }
  
  // Apply search filter if provided
  if (search && treatmentPlans.length > 0) {
    const searchLower = search.toLowerCase();
    treatmentPlans = treatmentPlans.filter(plan => {
      // Check various fields for the search term
      if (plan.treatmentDetails) {
        const treatmentStr = typeof plan.treatmentDetails === 'string' 
          ? plan.treatmentDetails 
          : JSON.stringify(plan.treatmentDetails);
          
        if (treatmentStr.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      
      // Search by notes
      if (plan.notes && plan.notes.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by status
      if (plan.status && plan.status.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Calculate pagination
  const total = treatmentPlans.length;
  const skip = (page - 1) * limit;
  const paginatedPlans = treatmentPlans.slice(skip, skip + limit);
  
  res.json({
    success: true,
    message: "Treatment plans retrieved successfully",
    data: {
      treatmentPlans: paginatedPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

/**
 * Get a specific treatment plan by ID
 */
router.get("/:id", ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const treatmentPlanId = parseInt(req.params.id);
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const clinicId = req.user?.clinicId;
  
  if (!treatmentPlanId) {
    return res.status(400).json({
      success: false,
      message: "Invalid treatment plan ID"
    });
  }
  
  // Fetch the treatment plan
  const treatmentPlan = await storage.getTreatmentPlanById(treatmentPlanId);
  
  if (!treatmentPlan) {
    return res.status(404).json({
      success: false,
      message: "Treatment plan not found"
    });
  }
  
  // Check permission to access this treatment plan
  const hasPermission = 
    userRole === 'admin' || // Admins can access all treatment plans
    (userRole === 'clinic_staff' && treatmentPlan.clinicId === clinicId) || // Clinic staff can access their clinic's plans
    (userRole === 'patient' && treatmentPlan.patientId === userId); // Patients can access their own plans
  
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to access this treatment plan"
    });
  }
  
  res.json({
    success: true,
    message: "Treatment plan retrieved successfully",
    data: {
      treatmentPlan
    }
  });
}));

/**
 * Create a new treatment plan
 * This route is accessible to clinic staff
 */
router.post("/", ensureRole('clinic_staff'), catchAsync(async (req: Request, res: Response) => {
  const { patientId, treatmentDetails, estimatedTotalCost, currency, notes, quoteRequestId } = req.body;
  const clinicId = req.user?.clinicId;
  const createdById = req.user?.id;
  
  if (!patientId || !treatmentDetails) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: patientId and treatmentDetails are required"
    });
  }
  
  // Create the treatment plan
  const treatmentPlan = await storage.createTreatmentPlan({
    patientId,
    clinicId: clinicId!,
    createdById: createdById!,
    status: "draft",
    treatmentDetails,
    estimatedTotalCost: estimatedTotalCost?.toString(),
    currency: currency || "GBP",
    notes,
    quoteRequestId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Send notification to the patient
  try {
    // Get the notification service from app locals (initialized in routes.ts)
    const notificationService = req.app.locals.notificationService;
    
    if (notificationService) {
      await notificationService.createNotification({
        title: 'New Treatment Plan',
        message: 'A new treatment plan has been created for you',
        category: 'treatment',
        priority: 'medium',
        target_type: 'patient',
        target_id: patientId.toString(),
        source_type: 'clinic',
        source_id: clinicId ? clinicId.toString() : undefined,
        action_url: `/treatment-plans/${treatmentPlan.id}`,
        metadata: {
          treatmentPlanId: treatmentPlan.id,
          status: treatmentPlan.status
        }
      });
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Continue even if notification fails
  }
  
  res.status(201).json({
    success: true,
    message: "Treatment plan created successfully",
    data: {
      treatmentPlan
    }
  });
}));

/**
 * Update an existing treatment plan
 * This route is accessible to clinic staff for their clinic's treatment plans
 */
router.patch("/:id", ensureRole('clinic_staff'), catchAsync(async (req: Request, res: Response) => {
  const treatmentPlanId = parseInt(req.params.id);
  const clinicId = req.user?.clinicId;
  const updateData = req.body;
  
  if (!treatmentPlanId) {
    return res.status(400).json({
      success: false,
      message: "Invalid treatment plan ID"
    });
  }
  
  // Fetch the treatment plan to check permissions
  const existingPlan = await storage.getTreatmentPlanById(treatmentPlanId);
  
  if (!existingPlan) {
    return res.status(404).json({
      success: false,
      message: "Treatment plan not found"
    });
  }
  
  // Check if the clinic staff has permission to update this treatment plan
  if (existingPlan.clinicId !== clinicId) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to update this treatment plan"
    });
  }
  
  // Update the treatment plan
  const updatedPlan = await storage.updateTreatmentPlan(treatmentPlanId, {
    ...updateData,
    updatedAt: new Date()
  });
  
  // Send notification to the patient if status changed to 'finalized'
  if (updateData.status === 'finalized' && existingPlan.status !== 'finalized') {
    try {
      // Get the notification service from app locals (initialized in routes.ts)
      const notificationService = req.app.locals.notificationService;
      
      if (notificationService) {
        await notificationService.createNotification({
          title: 'Treatment Plan Finalized',
          message: 'Your treatment plan has been finalized',
          category: 'treatment',
          priority: 'high',
          target_type: 'patient',
          target_id: existingPlan.patientId.toString(),
          source_type: 'clinic',
          source_id: clinicId ? clinicId.toString() : undefined,
          action_url: `/treatment-plans/${treatmentPlanId}`,
          metadata: {
            treatmentPlanId: treatmentPlanId,
            status: 'finalized'
          }
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Continue even if notification fails
    }
  }
  
  res.json({
    success: true,
    message: "Treatment plan updated successfully",
    data: {
      treatmentPlan: updatedPlan
    }
  });
}));

/**
 * Delete a treatment plan
 * This route is accessible to clinic staff for their clinic's treatment plans
 */
router.delete("/:id", ensureRole('clinic_staff'), catchAsync(async (req: Request, res: Response) => {
  const treatmentPlanId = parseInt(req.params.id);
  const clinicId = req.user?.clinicId;
  
  if (!treatmentPlanId) {
    return res.status(400).json({
      success: false,
      message: "Invalid treatment plan ID"
    });
  }
  
  // Fetch the treatment plan to check permissions
  const existingPlan = await storage.getTreatmentPlanById(treatmentPlanId);
  
  if (!existingPlan) {
    return res.status(404).json({
      success: false,
      message: "Treatment plan not found"
    });
  }
  
  // Check if the clinic staff has permission to delete this treatment plan
  if (existingPlan.clinicId !== clinicId) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to delete this treatment plan"
    });
  }
  
  // Delete the treatment plan
  await storage.deleteTreatmentPlan(treatmentPlanId);
  
  res.json({
    success: true,
    message: "Treatment plan deleted successfully"
  });
}));

/**
 * List treatment plans for a specific clinic
 * This route is accessible to admin and clinic staff
 */
router.get("/clinic/:clinicId", ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const clinicId = parseInt(req.params.clinicId);
  const userRole = req.user?.role;
  const userClinicId = req.user?.clinicId;
  
  // Check permissions: only admin or staff of the specified clinic can access
  if (userRole !== 'admin' && userClinicId !== clinicId) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view treatment plans for this clinic"
    });
  }
  
  const treatmentPlans = await storage.getTreatmentPlansByClinicId(clinicId);
  
  res.json({
    success: true,
    message: "Clinic treatment plans retrieved successfully",
    data: {
      treatmentPlans
    }
  });
}));

/**
 * List treatment plans for a specific patient
 * This route is accessible to admin, the patient themselves, and the patient's clinics
 */
router.get("/patient/:patientId", ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const patientId = parseInt(req.params.patientId);
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const clinicId = req.user?.clinicId;
  
  // Get patient's treatment plans
  const treatmentPlans = await storage.getTreatmentPlansByPatientId(patientId);
  
  // Check permissions
  const isAdmin = userRole === 'admin';
  const isPatient = userRole === 'patient' && userId === patientId;
  const isClinicWithPatientPlans = userRole === 'clinic_staff' && clinicId && 
    treatmentPlans.some(plan => plan.clinicId === clinicId);
  
  if (!isAdmin && !isPatient && !isClinicWithPatientPlans) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view treatment plans for this patient"
    });
  }
  
  res.json({
    success: true,
    message: "Patient treatment plans retrieved successfully",
    data: {
      treatmentPlans
    }
  });
}));

/**
 * Get treatment plan associated with a specific quote request
 */
router.get("/quote/:quoteRequestId", ensureAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const quoteRequestId = parseInt(req.params.quoteRequestId);
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const clinicId = req.user?.clinicId;
  
  // Get the treatment plan
  const treatmentPlan = await storage.getTreatmentPlanByQuoteRequestId(quoteRequestId);
  
  if (!treatmentPlan) {
    return res.status(404).json({
      success: false,
      message: "No treatment plan found for this quote request"
    });
  }
  
  // Check permissions
  const isAdmin = userRole === 'admin';
  const isPatient = userRole === 'patient' && userId === treatmentPlan.patientId;
  const isClinicStaff = userRole === 'clinic_staff' && clinicId === treatmentPlan.clinicId;
  
  if (!isAdmin && !isPatient && !isClinicStaff) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view this treatment plan"
    });
  }
  
  res.json({
    success: true,
    message: "Treatment plan retrieved successfully",
    data: {
      treatmentPlan
    }
  });
}));

export default router;