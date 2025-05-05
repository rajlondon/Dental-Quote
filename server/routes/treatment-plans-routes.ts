import express, { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { packages, treatmentLines, users, clinics } from "@shared/schema";
import { isAuthenticated } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

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
  quoteId: z.string().uuid(),
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
  try {
    const packagesList = await db.select().from(packages).where(eq(packages.isActive, true));
    
    return res.status(200).json({
      success: true,
      data: packagesList
    });
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
  
  try {
    const packageData = await db.query.packages.findFirst({
      where: eq(packages.id, packageId as string),
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
    
    return res.status(200).json({
      success: true,
      data: packageData
    });
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
  
  if (!quoteId) {
    return res.status(400).json({
      success: false,
      message: "Quote ID is required"
    });
  }
  
  try {
    const treatmentLinesList = await db.query.treatmentLines.findMany({
      where: eq(treatmentLines.quoteId, quoteId as string),
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
      .where(eq(treatmentLines.id, id))
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