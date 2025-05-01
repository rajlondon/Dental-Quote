/**
 * Treatment plan API routes
 * Handles all treatment plan operations for clinics and patients
 */
import express from 'express';
import { ensureRole } from '../middleware/auth';
import { TreatmentPlan, TreatmentPlanStatus, PaymentStatus } from '../../shared/models/treatment-plan';

const router = express.Router();

// Define mock treatment plans data to be used across all endpoints
const MOCK_TREATMENT_PLANS: TreatmentPlan[] = [
  {
    id: 1,
    patientId: 1,
    patientName: "James Wilson",
    clinicId: 1,
    clinicName: "Istanbul Dental Smile",
    status: TreatmentPlanStatus.ACCEPTED,
    title: "Full Dental Restoration",
    description: "Complete smile makeover including veneers and implants",
    createdAt: "2025-04-01T10:30:00Z",
    updatedAt: "2025-04-05T14:45:00Z",
    estimatedDuration: "7-10 days",
    treatmentItems: [
      {
        id: 1,
        name: "Dental Implant",
        price: 700,
        quantity: 2,
        description: "Titanium implant with abutment"
      },
      {
        id: 2,
        name: "Porcelain Veneers",
        price: 350,
        quantity: 6,
        description: "Premium porcelain veneers for front teeth"
      }
    ],
    totalPrice: 3500,
    currency: "GBP",
    notes: "Patient prefers to complete all treatments in one visit",
    paymentStatus: PaymentStatus.PARTIAL,
    appointmentDate: "2025-05-15T09:00:00Z"
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Sarah Johnson",
    clinicId: 1,
    clinicName: "Istanbul Dental Smile",
    status: TreatmentPlanStatus.COMPLETED,
    title: "Smile Makeover",
    description: "Veneers and whitening treatment",
    createdAt: "2025-03-15T09:20:00Z",
    updatedAt: "2025-04-10T16:30:00Z",
    estimatedDuration: "5-7 days",
    treatmentItems: [
      {
        id: 3,
        name: "Porcelain Veneers",
        price: 350,
        quantity: 8,
        description: "Premium porcelain veneers"
      },
      {
        id: 4,
        name: "Teeth Whitening",
        price: 250,
        quantity: 1,
        description: "In-office laser whitening treatment"
      }
    ],
    totalPrice: 3050,
    currency: "GBP",
    notes: "Patient requested natural-looking veneers",
    paymentStatus: PaymentStatus.PAID,
    appointmentDate: "2025-04-01T10:00:00Z",
    completionDate: "2025-04-07T15:30:00Z"
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Michael Brown",
    clinicId: 1,
    clinicName: "Istanbul Dental Smile",
    status: TreatmentPlanStatus.DRAFT,
    title: "Dental Implant Treatment",
    description: "Full mouth restoration with implants",
    createdAt: "2025-04-10T11:00:00Z",
    updatedAt: "2025-04-10T11:00:00Z",
    estimatedDuration: "10-14 days",
    treatmentItems: [
      {
        id: 5,
        name: "Dental Implant",
        price: 700,
        quantity: 4,
        description: "Premium dental implants"
      },
      {
        id: 6,
        name: "Bone Grafting",
        price: 500,
        quantity: 2,
        description: "Bone augmentation for implant support"
      }
    ],
    totalPrice: 3800,
    currency: "GBP",
    notes: "Initial consultation completed, waiting for confirmation",
    paymentStatus: PaymentStatus.PENDING
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Emma Davis",
    clinicId: 1,
    clinicName: "Istanbul Dental Smile",
    status: TreatmentPlanStatus.SENT,
    title: "Orthodontic Treatment",
    description: "Clear aligner treatment for mild crowding",
    createdAt: "2025-04-05T14:15:00Z",
    updatedAt: "2025-04-07T09:30:00Z",
    estimatedDuration: "12 months",
    treatmentItems: [
      {
        id: 7,
        name: "Clear Aligners",
        price: 2500,
        quantity: 1,
        description: "Full clear aligner treatment including refinements"
      },
      {
        id: 8,
        name: "3D Treatment Planning",
        price: 300,
        quantity: 1,
        description: "Digital scanning and treatment planning"
      }
    ],
    totalPrice: 2800,
    currency: "GBP",
    notes: "Patient would like to minimize treatment time if possible",
    paymentStatus: PaymentStatus.PENDING
  },
  {
    id: 5,
    patientId: 5,
    patientName: "Robert Taylor",
    clinicId: 1,
    clinicName: "Istanbul Dental Smile",
    status: TreatmentPlanStatus.IN_PROGRESS,
    title: "Complete Smile Reconstruction",
    description: "Full mouth rehabilitation with crowns and implants",
    createdAt: "2025-03-10T13:45:00Z",
    updatedAt: "2025-04-12T10:20:00Z",
    estimatedDuration: "14-20 days",
    treatmentItems: [
      {
        id: 9,
        name: "Dental Implant",
        price: 700,
        quantity: 6,
        description: "Premium dental implants with abutments"
      },
      {
        id: 10,
        name: "Porcelain Crown",
        price: 450,
        quantity: 10,
        description: "Zirconia crowns for remaining teeth"
      }
    ],
    totalPrice: 8700,
    currency: "GBP",
    notes: "Initial phase completed, implants healing before final restoration",
    paymentStatus: PaymentStatus.PARTIAL,
    appointmentDate: "2025-04-18T09:00:00Z"
  }
];

/**
 * Get all treatment plans for a clinic
 * Accessible by clinic staff
 */
router.get('/api/clinic/treatment-plans', ensureRole('clinic_staff'), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = (req.query.status as string) || '';
    const search = (req.query.search as string) || '';
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    console.log(`Retrieving treatment plans for clinic ${clinicId}, page ${page}, limit ${limit}, status "${status}", search "${search}"`);
    
    // Use our shared mock treatment plans data
    const allTreatmentPlans = [...MOCK_TREATMENT_PLANS];
    
    // Filter by status if provided
    let filteredPlans = [...allTreatmentPlans];
    if (status) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Filter by search term (patient name or title)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPlans = filteredPlans.filter(plan => 
        plan.patientName.toLowerCase().includes(searchLower) ||
        plan.title.toLowerCase().includes(searchLower)
      );
    }
    
    // Get total count for pagination
    const total = filteredPlans.length;
    
    // Apply pagination
    const paginatedPlans = filteredPlans.slice(skip, skip + limit);
    
    // Return the paginated and filtered results
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
    
  } catch (error) {
    console.error("Error retrieving treatment plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve treatment plans"
    });
  }
});

/**
 * Get a specific treatment plan by ID
 * Accessible by clinic staff
 */
router.get('/api/clinic/treatment-plans/:id', ensureRole('clinic_staff'), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const treatmentPlanId = parseInt(req.params.id);
    
    console.log(`Retrieving treatment plan ${treatmentPlanId} for clinic ${clinicId}`);
    
    // Use our shared mock treatment plans data
    const treatmentPlan = MOCK_TREATMENT_PLANS.find(p => p.id === treatmentPlanId);
    
    if (!treatmentPlan) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found"
      });
    }
    
    // Return the treatment plan
    res.json({
      success: true,
      message: "Treatment plan retrieved successfully",
      data: {
        treatmentPlan
      }
    });
    
  } catch (error) {
    console.error("Error retrieving treatment plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve treatment plan"
    });
  }
});

/**
 * Create a new treatment plan
 * Accessible by clinic staff
 */
router.post('/api/clinic/treatment-plans', ensureRole('clinic_staff'), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const { patientId, title, description, treatmentItems, estimatedDuration, notes, currency } = req.body;
    
    // Basic validation
    if (!patientId || !title || !treatmentItems || !treatmentItems.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if items have valid prices and quantities
    const invalidItems = treatmentItems.filter((item: any) => 
      !item.name || 
      typeof item.price !== 'number' || 
      item.price <= 0 ||
      typeof item.quantity !== 'number' || 
      item.quantity <= 0
    );
    
    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid treatment items. Ensure all items have valid names, prices, and quantities."
      });
    }
    
    console.log(`Creating new treatment plan for clinic ${clinicId}, patient ${patientId}: ${title}`);
    
    // Calculate total price
    const totalPrice = treatmentItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Mock creating a new treatment plan (in a real app, this would save to the database)
    const newTreatmentPlan: TreatmentPlan = {
      id: Date.now(), // Using timestamp as a mock ID
      patientId,
      patientName: "Mock Patient Name", // This would be retrieved from the database
      clinicId,
      clinicName: "Istanbul Dental Smile", // This would be retrieved from the database
      status: TreatmentPlanStatus.DRAFT,
      title,
      description: description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDuration: estimatedDuration || "",
      treatmentItems: treatmentItems.map((item: any, index: number) => ({
        id: Date.now() + index, // Using timestamp + index as a mock ID
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        description: item.description || ""
      })),
      totalPrice,
      currency: currency || "GBP",
      notes: notes || "",
      paymentStatus: PaymentStatus.PENDING
    };
    
    res.status(201).json({
      success: true,
      message: "Treatment plan created successfully",
      data: {
        treatmentPlan: newTreatmentPlan
      }
    });
    
  } catch (error) {
    console.error("Error creating treatment plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create treatment plan"
    });
  }
});

/**
 * Update an existing treatment plan
 * Accessible by clinic staff
 */
router.patch('/api/clinic/treatment-plans/:id', ensureRole('clinic_staff'), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const treatmentPlanId = parseInt(req.params.id);
    const updateData = req.body;
    
    console.log(`Updating treatment plan ${treatmentPlanId} for clinic ${clinicId}`);
    
    // In a real app, this would update the treatment plan in the database
    // For now, we'll just return success with a mocked updated plan
    
    res.json({
      success: true,
      message: "Treatment plan updated successfully",
      data: {
        treatmentPlan: {
          id: treatmentPlanId,
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error("Error updating treatment plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update treatment plan"
    });
  }
});

/**
 * Delete a treatment plan
 * Accessible by clinic staff
 */
router.delete('/api/clinic/treatment-plans/:id', ensureRole('clinic_staff'), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const treatmentPlanId = parseInt(req.params.id);
    
    console.log(`Deleting treatment plan ${treatmentPlanId} for clinic ${clinicId}`);
    
    // In a real app, this would delete the treatment plan from the database
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: "Treatment plan deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting treatment plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete treatment plan"
    });
  }
});

export default router;