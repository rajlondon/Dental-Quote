import express, { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { packages, treatmentLines, users, clinics, quoteRequests } from "@shared/schema";
import { isAuthenticated } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { storage } from "../storage";
import { extractNumericFromUuid } from "../utils/id-converter";

const router: Router = express.Router();

/**
 * Treatment Plans Module Routes
 * 
 * This module handles all Treatment Plan related routes including:
 * - Getting packages and treatments
 * - Managing treatment lines (add/update/delete)
 * - Viewing/editing treatment plans
 */

// Schema for validating treatment line input
const treatmentLineSchema = z.object({
  clinicId: z.number(),
  patientId: z.number(),
  // Accept either a UUID string OR a numeric quote ID that will be converted to UUID format
  quoteId: z.union([
    z.string().uuid(),
    z.string().regex(/^\d+$/).transform(val => {
      // For numeric IDs, we'll generate a deterministic UUID based on the numeric ID
      // This is a simple way to map numeric IDs to UUIDs consistently
      return `00000000-0000-4000-a000-${val.padStart(12, '0')}`;
    })
  ]),
  procedureCode: z.string(),
  description: z.string(),
  quantity: z.number().default(1),
  unitPrice: z.string(), // Decimal in DB is handled as string
  isPackage: z.boolean().default(false),
  packageId: z.string().uuid().optional(),
  status: z.enum(["draft", "confirmed", "deleted"]).default("draft"),
  patientNotes: z.string().optional(),
  clinicNotes: z.string().optional(),
});

// Get all available packages
router.get("/packages", isAuthenticated, async (req: Request, res: Response) => {
  console.log(`[DEBUG] GET /packages request received, authenticated as:`, 
    req.user ? `User ID: ${req.user.id}, Role: ${req.user.role}` : 'Not authenticated');
  
  try {
    const packagesList = await db.select().from(packages).where(eq(packages.isActive, true));
    
    console.log(`[DEBUG] Found ${packagesList.length} active packages`);
    
    // Let's make sure we're returning valid JSON
    const responseData = {
      success: true,
      data: packagesList
    };
    
    // Verify the data can be serialized properly
    try {
      const serializedData = JSON.stringify(responseData);
      console.log(`[DEBUG] Successfully serialized package data: ${serializedData.substring(0, 100)}...`);
      
      return res.status(200).json(responseData);
    } catch (jsonError) {
      console.error('[ERROR] Failed to serialize package data to JSON:', jsonError);
      return res.status(500).json({
        success: false,
        message: "Failed to serialize package data"
      });
    }
  } catch (error) {
    console.error("Error fetching packages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch packages"
    });
  }
});

// Get a specific package by ID
router.get("/packages/:packageId", isAuthenticated, async (req: Request, res: Response) => {
  const { packageId } = req.params;
  
  console.log(`[DEBUG] GET /packages/${packageId} request received, authenticated as:`, 
    req.user ? `User ID: ${req.user.id}, Role: ${req.user.role}` : 'Not authenticated');
  
  try {
    // Map URL slugs to package IDs if needed
    const slugToIdMap: Record<string, string> = {
      'hollywood-smile-vacation': 'e53cc92a-596d-4edc-a3f4-b1f31856415e',
      // Add more mappings as needed
    };
    
    // Get the actual ID to use for the database query
    const dbPackageId = slugToIdMap[packageId] || packageId;
    
    console.log(`[DEBUG] Looking up package - URL param: ${packageId}, Database ID: ${dbPackageId}`);
    
    const packageData = await db.query.packages.findFirst({
      where: eq(packages.id, dbPackageId as string),
      with: {
        clinic: true
      }
    });
    
    if (!packageData) {
      console.log(`[ERROR] Package not found: ${packageId} (DB ID: ${dbPackageId})`);
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }
    
    console.log(`[DEBUG] Package data found for ${packageId} (DB ID: ${dbPackageId})`);
    
    // Process JSON fields to ensure proper serialization
    const processedPackage = {
      ...packageData,
      // Safely handle potential JSON string fields
      hotelDetails: typeof packageData.hotelDetails === 'string' 
        ? JSON.parse(packageData.hotelDetails) 
        : packageData.hotelDetails,
      flightDetails: typeof packageData.flightDetails === 'string' 
        ? JSON.parse(packageData.flightDetails) 
        : packageData.flightDetails
    };
    
    // Let's make sure we're returning valid JSON
    const responseData = {
      success: true,
      data: processedPackage
    };
    
    // Verify the data can be serialized properly
    try {
      const serializedData = JSON.stringify(responseData);
      console.log(`[DEBUG] Successfully serialized package data: ${serializedData.substring(0, 100)}...`);
      
      return res.status(200).json(responseData);
    } catch (jsonError) {
      console.error('[ERROR] Failed to serialize package data to JSON:', jsonError);
      
      // Try to identify the problematic fields
      console.error('[DEBUG] Problem fields examination:');
      for (const [key, value] of Object.entries(processedPackage)) {
        try {
          JSON.stringify({ [key]: value });
          console.log(`[DEBUG] Field '${key}' serializes correctly`);
        } catch (fieldError) {
          console.error(`[ERROR] Field '${key}' causes serialization error:`, fieldError);
        }
      }
      
      return res.status(500).json({
        success: false,
        message: "Failed to serialize package data"
      });
    }
  } catch (error) {
    console.error(`Error fetching package ${packageId}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch package details"
    });
  }
});

// Get treatment lines for a given quote
router.get("/treatment-lines/:quoteId", isAuthenticated, async (req: Request, res: Response) => {
  const { quoteId } = req.params;
  
  console.log(`[DEBUG] GET request to /api/treatment-plans/treatment-lines/${quoteId}`);
  console.log(`[DEBUG] Authenticated user: ${req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'Not authenticated'}`);
  
  if (!quoteId) {
    return res.status(400).json({
      success: false,
      message: "Quote ID is required"
    });
  }
  
  try {
    // For numeric quote IDs, generate a deterministic UUID
    let normalizedQuoteId = quoteId;
    // Check if quoteId is numeric
    if (/^\d+$/.test(quoteId)) {
      normalizedQuoteId = `00000000-0000-4000-a000-${quoteId.padStart(12, '0')}`;
      console.log(`[DEBUG] Converted numeric quote ID ${quoteId} to UUID format: ${normalizedQuoteId}`);
    }
    
    const treatmentLinesList = await db.query.treatmentLines.findMany({
      where: eq(treatmentLines.quoteId, normalizedQuoteId),
      with: {
        clinic: true,
        package: true
      },
      orderBy: [desc(treatmentLines.createdAt)]
    });
    
    return res.status(200).json({
      success: true,
      data: treatmentLinesList
    });
  } catch (error) {
    console.error(`Error fetching treatment lines for quote ${quoteId}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch treatment lines"
    });
  }
});

// Add a new treatment line
router.post("/treatment-lines", isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  
  try {
    const validatedData = treatmentLineSchema.parse(req.body);
    
    // Create a new treatment line
    const [newTreatmentLine] = await db.insert(treatmentLines)
      .values({
        ...validatedData,
        id: uuidv4(),
      })
      .returning();
    
    return res.status(201).json({
      success: true,
      data: newTreatmentLine,
      message: "Treatment line added successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: error.errors
      });
    }
    
    console.error("Error creating treatment line:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create treatment line"
    });
  }
});

// Update an existing treatment line
router.put("/treatment-lines/:id", isAuthenticated, async (req: Request, res: Response) => {
  const { id } = req.params;
  
  console.log(`[DEBUG] ============ TREATMENT LINE UPDATE ============`);
  console.log(`[DEBUG] PUT request to /treatment-lines/${id}`);
  console.log(`[DEBUG] CORRECT ENDPOINT PATH: This route is mounted at: /api/treatment-module/treatment-lines/${id}`);
  console.log(`[DEBUG] Full URL path requested: ${req.originalUrl}`);
  console.log(`[DEBUG] Any request to /api/treatment-plans/treatment-lines/${id} will NOT work - only /api/treatment-module/... works`);
  console.log(`[DEBUG] Authenticated user: ${req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'Not authenticated'}`);
  console.log(`[DEBUG] Request body:`, req.body);
  console.log(`[DEBUG] Host: ${req.headers.host}, Origin: ${req.headers.origin}, Referer: ${req.headers.referer}`);
  console.log(`[DEBUG] ===============================================`);
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  
  try {
    // Find existing treatment line
    const existingTreatmentLine = await db.query.treatmentLines.findFirst({
      where: eq(treatmentLines.id, id)
    });
    
    if (!existingTreatmentLine) {
      return res.status(404).json({
        success: false,
        message: "Treatment line not found"
      });
    }
    
    // Check if the user has permission to update this treatment line
    const isClinicStaff = req.user.role === "clinic_staff" && req.user.clinicId === existingTreatmentLine.clinicId;
    const isAdmin = req.user.role === "admin";
    const isPatient = req.user.role === "patient" && req.user.id === existingTreatmentLine.patientId;
    
    if (!isAdmin && !isClinicStaff && !isPatient) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this treatment line"
      });
    }
    
    // Validate and update the treatment line
    const validatedData = treatmentLineSchema.partial().parse(req.body);
    
    const [updatedTreatmentLine] = await db.update(treatmentLines)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(treatmentLines.id, id))
      .returning();
    
    return res.status(200).json({
      success: true,
      data: updatedTreatmentLine,
      message: "Treatment line updated successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: error.errors
      });
    }
    
    console.error(`Error updating treatment line ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to update treatment line"
    });
  }
});

// Delete a treatment line
router.delete("/treatment-lines/:id", isAuthenticated, async (req: Request, res: Response) => {
  const { id } = req.params;
  
  console.log(`[DEBUG] ============ TREATMENT LINE DELETE ============`);
  console.log(`[DEBUG] DELETE request to /treatment-lines/${id}`);
  console.log(`[DEBUG] CORRECT ENDPOINT PATH: This route is mounted at: /api/treatment-module/treatment-lines/${id}`);
  console.log(`[DEBUG] Full URL path requested: ${req.originalUrl}`);
  console.log(`[DEBUG] Any request to /api/treatment-plans/treatment-lines/${id} will NOT work - only /api/treatment-module/... works`);
  console.log(`[DEBUG] HTTP method: ${req.method}`);
  console.log(`[DEBUG] Request body:`, req.body);
  console.log(`[DEBUG] Authenticated user: ${req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'Not authenticated'}`);
  console.log(`[DEBUG] Host: ${req.headers.host}, Origin: ${req.headers.origin}, Referer: ${req.headers.referer}`);
  
  // Handle ID format conversion if needed
  const treatmentLineId = id;
  console.log(`[DEBUG] Original ID from URL: ${id}`);
  
  // If ID is in UUID format, extract the numeric part if it follows our pattern
  if (id.includes('-')) {
    try {
      const numericId = extractNumericFromUuid(id);
      console.log(`[DEBUG] UUID format detected. Original: ${id}, Extracted numeric ID: ${numericId}`);
    } catch (e) {
      console.log(`[DEBUG] ID appears to be in UUID format but doesn't follow our conversion pattern`);
    }
  }
  
  console.log(`[DEBUG] Using ID for database lookup: ${treatmentLineId}`);
  console.log(`[DEBUG] ===============================================`);
  
  if (!req.user) {
    console.log(`[DEBUG] Rejecting request due to missing authentication`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  
  try {
    // Find existing treatment line
    const existingTreatmentLine = await db.query.treatmentLines.findFirst({
      where: eq(treatmentLines.id, treatmentLineId)
    });
    
    if (!existingTreatmentLine) {
      return res.status(404).json({
        success: false,
        message: "Treatment line not found"
      });
    }
    
    // Check if the user has permission to delete this treatment line
    const isClinicStaff = req.user.role === "clinic_staff" && req.user.clinicId === existingTreatmentLine.clinicId;
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin && !isClinicStaff) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this treatment line"
      });
    }
    
    // Soft delete by updating status
    const [updatedTreatmentLine] = await db.update(treatmentLines)
      .set({
        status: "deleted",
        updatedAt: new Date()
      })
      .where(eq(treatmentLines.id, treatmentLineId))
      .returning();
    
    return res.status(200).json({
      success: true,
      data: updatedTreatmentLine,
      message: "Treatment line deleted successfully"
    });
  } catch (error) {
    console.error(`Error deleting treatment line ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete treatment line"
    });
  }
});

// Book a treatment package
router.post("/book-package/:packageId", isAuthenticated, async (req: Request, res: Response) => {
  const { packageId } = req.params;
  
  console.log(`[DEBUG] POST /book-package/${packageId} request received`);
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  
  try {
    // Map URL slugs to package IDs if needed
    const slugToIdMap: Record<string, string> = {
      'hollywood-smile-vacation': 'e53cc92a-596d-4edc-a3f4-b1f31856415e',
      // Add more mappings as needed
    };
    
    // Get the actual ID to use for the database query
    const dbPackageId = slugToIdMap[packageId] || packageId;
    
    console.log(`[DEBUG] Booking package - URL param: ${packageId}, Database ID: ${dbPackageId}`);
    
    // Get the package details
    const packageData = await db.query.packages.findFirst({
      where: eq(packages.id, dbPackageId as string),
      with: {
        clinic: true
      }
    });
    
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }
    
    // Check if this is a patient
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book packages"
      });
    }
    
    // Generate a unique quote ID for treatment lines
    const quoteId = uuidv4();
    
    // Find or create a quote request for the patient
    // We'll use this for tracking the booking in the system
    const existingQuoteRequests = await db.select().from(quoteRequests)
      .where(and(
        eq(quoteRequests.userId, req.user.id),
        eq(quoteRequests.status, "active")
      ));
    
    let quoteRequestId: number;
    
    if (existingQuoteRequests.length > 0) {
      quoteRequestId = existingQuoteRequests[0].id;
    } else {
      // Create a new quote request for the patient
      const [createdQuoteRequest] = await db.insert(quoteRequests).values({
        userId: req.user.id,
        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || "Patient",
        email: req.user.email,
        phone: "",
        treatment: packageData.name,
        specificTreatment: packageData.description,
        selectedClinicId: packageData.clinicId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      quoteRequestId = createdQuoteRequest.id;
    }
    
    // Add the package as a treatment line
    const treatmentLineData = {
      id: uuidv4(),
      clinicId: packageData.clinicId,
      patientId: req.user.id,
      quoteId: quoteId,
      procedureCode: packageData.procedureCode || 'PACKAGE', // Provide default if missing
      description: packageData.name,
      quantity: 1,
      unitPrice: packageData.price.toString(),
      isPackage: true,
      packageId: packageData.id,
      status: "confirmed", // Automatically confirm the package
      createdAt: new Date(),
      updatedAt: new Date(),
      patientNotes: `Booked package: ${packageData.name}`
    };
    
    const [newTreatmentLine] = await db.insert(treatmentLines)
      .values(treatmentLineData)
      .returning();
    
    // Create a notification for the patient
    await storage.createNotification({
      userId: req.user.id,
      type: "treatment",
      title: "Package Booked",
      message: `You have successfully booked the ${packageData.name} package from ${packageData.clinic.name}`,
      priority: "high",
      category: "treatment",
      read: false,
      additionalData: JSON.stringify({
        packageId: packageData.id,
        treatmentLineId: newTreatmentLine.id,
        quoteId: quoteId
      })
    });
    
    // Create a notification for the clinic
    await storage.createNotification({
      userId: packageData.clinicId,
      type: "treatment",
      title: "New Package Booking",
      message: `A patient has booked the ${packageData.name} package`,
      priority: "high",
      category: "treatment",
      read: false,
      additionalData: JSON.stringify({
        packageId: packageData.id,
        patientId: req.user.id,
        treatmentLineId: newTreatmentLine.id,
        quoteId: quoteId
      })
    });
    
    // For API calls, return JSON response
    if (req.headers['accept'] === 'application/json') {
      return res.status(201).json({
        success: true,
        data: {
          treatmentLine: newTreatmentLine,
          quoteId: quoteId,
          package: packageData
        },
        message: "Package booked successfully"
      });
    }
    
    // For browser form submissions, redirect to the patient portal
    return res.redirect('/client-portal?booked=true&package=' + encodeURIComponent(packageData.name));
  } catch (error) {
    console.error(`Error booking package ${packageId}:`, error);
    
    // For API calls, return JSON error
    if (req.headers['accept'] === 'application/json') {
      return res.status(500).json({
        success: false,
        message: "Failed to book package"
      });
    }
    
    // For browser form submissions, redirect to error page
    return res.redirect('/client-portal?error=booking-failed&package=' + encodeURIComponent(packageId));
  }
});

// Get patient treatment summary
router.get("/patient/treatment-summary", isAuthenticated, async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized. Only patients can access their treatment summary."
    });
  }
  
  try {
    // Get all active treatment lines for the patient
    const patientTreatmentLines = await db.query.treatmentLines.findMany({
      where: and(
        eq(treatmentLines.patientId, req.user.id),
        eq(treatmentLines.status, "confirmed")
      ),
      with: {
        clinic: true,
        package: true
      }
    });
    
    // Calculate summary information
    const totalSpent = patientTreatmentLines.reduce((sum, tl) => {
      return sum + (Number(tl.unitPrice) * tl.quantity);
    }, 0);
    
    // Group treatment lines by clinic
    const treatmentsByClinic = patientTreatmentLines.reduce((acc, tl) => {
      const clinicId = tl.clinicId;
      if (!acc[clinicId]) {
        acc[clinicId] = {
          clinic: tl.clinic,
          treatmentLines: []
        };
      }
      acc[clinicId].treatmentLines.push(tl);
      return acc;
    }, {} as Record<number, { clinic: any, treatmentLines: typeof patientTreatmentLines }>);
    
    return res.status(200).json({
      success: true,
      data: {
        totalTreatmentLines: patientTreatmentLines.length,
        totalSpent,
        treatmentsByClinic: Object.values(treatmentsByClinic)
      }
    });
  } catch (error) {
    console.error(`Error fetching treatment summary for patient ${req.user.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch treatment summary"
    });
  }
});

export default router;