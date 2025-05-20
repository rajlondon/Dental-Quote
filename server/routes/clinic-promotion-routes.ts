/**
 * Clinic Promotion API Routes
 * Handles clinic-initiated promotions lifecycle
 */
import { Router, Request, Response } from 'express';
import { clinicPromotionService } from '../services/clinic-promotion-service';
import { ExtendedPromoCode } from '../models/promo-code';
import { z } from 'zod';

export const clinicPromotionRouter = Router();

// Authentication middleware for clinic staff
const requireClinicStaff = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'clinic_staff') {
    return res.status(403).json({ 
      success: false, 
      message: 'Clinic staff access required' 
    });
  }
  
  next();
};

// Authentication middleware for admin
const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  
  next();
};

// Validation schemas
const createPromotionSchema = z.object({
  code: z.string().min(4).max(20),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  type: z.enum(['discount', 'package']),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().optional(),
  applicable_treatments: z.array(z.string()),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  max_uses: z.number().int().min(0),
  packageData: z.object({
    name: z.string(),
    description: z.string(),
    treatments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().int().min(1)
    })),
    originalPrice: z.number().min(0),
    packagePrice: z.number().min(0),
    attractions: z.array(z.object({
      name: z.string(),
      description: z.string(),
      value: z.number(),
      included: z.boolean()
    })).optional(),
    additionalServices: z.array(z.string()).optional()
  }).optional()
});

const updatePromotionSchema = createPromotionSchema.partial();

const approvePromotionSchema = z.object({
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  displayOnHomepage: z.boolean().optional(),
  homepagePriority: z.number().min(1).max(10).optional(),
  homepageImageUrl: z.string().optional(),
  homepageShortDescription: z.string().max(200).optional()
});

const rejectPromotionSchema = z.object({
  reason: z.string().min(1)
});

// Clinic API Endpoints

// Get all promotions for the authenticated clinic
clinicPromotionRouter.get('/clinic/promotions', requireClinicStaff, async (req: Request, res: Response) => {
  try {
    const clinicId = req.user.clinicId?.toString();
    if (!clinicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No clinic ID associated with user' 
      });
    }
    
    const promotions = await clinicPromotionService.getClinicPromotions(clinicId);
    
    return res.status(200).json({ 
      success: true, 
      promotions 
    });
  } catch (error) {
    console.error('Error getting clinic promotions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching promotions' 
    });
  }
});

// Get a specific promotion by ID
clinicPromotionRouter.get('/clinic/promotions/:id', requireClinicStaff, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId?.toString();
    
    const promotion = await clinicPromotionService.getPromotion(id);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    // Ensure clinic can only access their own promotions
    if (promotion.clinicId !== clinicId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this promotion' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      promotion 
    });
  } catch (error) {
    console.error('Error getting promotion details:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching promotion' 
    });
  }
});

// Create a new promotion draft
clinicPromotionRouter.post('/clinic/promotions', requireClinicStaff, async (req: Request, res: Response) => {
  try {
    const validationResult = createPromotionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid promotion data', 
        errors: validationResult.error.errors 
      });
    }
    
    const clinicId = req.user.clinicId?.toString();
    if (!clinicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No clinic ID associated with user' 
      });
    }
    
    const userId = req.user.id.toString();
    const promotionData = {
      ...validationResult.data,
      clinicId,
      created_by: userId,
      display_on_homepage: false,
      homepage_priority: 5
    } as Omit<ExtendedPromoCode, 'id' | 'status' | 'created_at' | 'version'>;
    
    const newPromotion = await clinicPromotionService.createPromotionDraft(promotionData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Promotion draft created successfully', 
      promotion: newPromotion 
    });
  } catch (error) {
    console.error('Error creating promotion draft:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error creating promotion draft' 
    });
  }
});

// Update a draft promotion
clinicPromotionRouter.put('/clinic/promotions/:id', requireClinicStaff, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId?.toString();
    
    // Get the existing promotion
    const existingPromotion = await clinicPromotionService.getPromotion(id);
    
    if (!existingPromotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    // Ensure clinic can only update their own promotions
    if (existingPromotion.clinicId !== clinicId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this promotion' 
      });
    }
    
    // Validate update data
    const validationResult = updatePromotionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid promotion data', 
        errors: validationResult.error.errors 
      });
    }
    
    // Update the promotion
    const updatedPromotion = await clinicPromotionService.updatePromotionDraft(id, validationResult.data);
    
    if (!updatedPromotion) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update promotion' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Promotion updated successfully', 
      promotion: updatedPromotion 
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error updating promotion' 
    });
  }
});

// Submit a draft promotion for approval
clinicPromotionRouter.post('/clinic/promotions/:id/submit', requireClinicStaff, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId?.toString();
    
    // Get the existing promotion
    const existingPromotion = await clinicPromotionService.getPromotion(id);
    
    if (!existingPromotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    // Ensure clinic can only submit their own promotions
    if (existingPromotion.clinicId !== clinicId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this promotion' 
      });
    }
    
    // Submit for approval
    const submittedPromotion = await clinicPromotionService.submitForApproval(id);
    
    if (!submittedPromotion) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to submit promotion for approval' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Promotion submitted for approval', 
      promotion: submittedPromotion 
    });
  } catch (error) {
    console.error('Error submitting promotion for approval:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error submitting promotion' 
    });
  }
});

// Delete a draft promotion
clinicPromotionRouter.delete('/clinic/promotions/:id', requireClinicStaff, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId?.toString();
    
    // Get the existing promotion
    const existingPromotion = await clinicPromotionService.getPromotion(id);
    
    if (!existingPromotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    // Ensure clinic can only delete their own promotions
    if (existingPromotion.clinicId !== clinicId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this promotion' 
      });
    }
    
    // Delete the draft
    const success = await clinicPromotionService.deleteDraft(id);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete promotion draft' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Promotion draft deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting promotion draft:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error deleting promotion draft' 
    });
  }
});

// Admin API Endpoints

// Get all promotions pending approval
clinicPromotionRouter.get('/admin/promotions/pending', requireAdmin, async (req: Request, res: Response) => {
  try {
    const pendingPromotions = await clinicPromotionService.getPendingApprovals();
    
    return res.status(200).json({ 
      success: true, 
      promotions: pendingPromotions 
    });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching pending approvals' 
    });
  }
});

// Approve a promotion
clinicPromotionRouter.put('/admin/promotions/:id/approve', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id.toString();
    
    // Validate approval data
    const validationResult = approvePromotionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid approval data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { notes, startDate, endDate, displayOnHomepage, homepagePriority, homepageImageUrl, homepageShortDescription } = validationResult.data;
    
    // Approve the promotion
    const approvedPromotion = await clinicPromotionService.approvePromotion(
      id, 
      adminId, 
      notes, 
      { 
        startDate, 
        endDate, 
        displayOnHomepage, 
        homepagePriority,
        homepageImageUrl,
        homepageShortDescription
      }
    );
    
    if (!approvedPromotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Promotion approved successfully', 
      promotion: approvedPromotion 
    });
  } catch (error) {
    console.error('Error approving promotion:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error approving promotion' 
    });
  }
});

// Reject a promotion
clinicPromotionRouter.put('/admin/promotions/:id/reject', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id.toString();
    
    // Validate rejection data
    const validationResult = rejectPromotionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid rejection data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { reason } = validationResult.data;
    
    // Reject the promotion
    const rejectedPromotion = await clinicPromotionService.rejectPromotion(id, adminId, reason);
    
    if (!rejectedPromotion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Promotion rejected', 
      promotion: rejectedPromotion 
    });
  } catch (error) {
    console.error('Error rejecting promotion:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error rejecting promotion' 
    });
  }
});

// Homepage Display Endpoints

// Get promotions for homepage display
clinicPromotionRouter.get('/promotions/featured', async (req: Request, res: Response) => {
  try {
    // Update promotion statuses based on dates
    await clinicPromotionService.updatePromotionStatuses();
    
    // Get featured promotions
    const featuredPromotions = await clinicPromotionService.getFeaturedPromotions();
    
    return res.status(200).json({ 
      success: true, 
      promotions: featuredPromotions 
    });
  } catch (error) {
    console.error('Error getting featured promotions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching featured promotions' 
    });
  }
});

// Analytics endpoint - Track promotion view
clinicPromotionRouter.post('/promotions/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await clinicPromotionService.trackPromotionView(id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'View tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking promotion view:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error tracking view' 
    });
  }
});

export default clinicPromotionRouter;