/**
 * Canonical Treatment Lines API Routes (v1)
 * 
 * This is the definitive API for all treatment line operations and serves as a single source of truth.
 * All clients should use these endpoints rather than the legacy routes.
 */

import express, { Request, Response } from 'express';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';
import { catchAsync, AppError } from '../../middleware/error-handler';
import { convertNumericToUuid, extractNumericFromUuid, isUuidFormat } from '../../utils/id-converter';
import { z } from 'zod';

const router = express.Router();

// Define treatment line schema for validation
const treatmentLineSchema = z.object({
  id: z.string().optional(),
  quoteId: z.string(),
  treatmentId: z.string().optional(),
  clinicId: z.number().optional(),
  patientId: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  quantity: z.number().default(1),
  status: z.string().default('pending'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional()
});

// Helper function to standardize IDs
function standardizeId(id: string | number | undefined): string {
  if (!id) return '';
  
  const idStr = String(id);
  
  // If it's already a UUID format, return as is
  if (isUuidFormat(idStr)) {
    return idStr;
  }
  
  // Otherwise convert to UUID
  return convertNumericToUuid(idStr);
}

// GET /api/v1/treatment-lines - Get treatment lines by quote ID (using query params)
router.get('/', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { quoteId } = req.query;
  
  if (!quoteId) {
    return res.status(400).json({
      success: false,
      message: "Missing quote ID parameter"
    });
  }
  
  try {
    // Handle both UUID and numeric ID formats
    const searchId = isUuidFormat(String(quoteId)) 
      ? extractNumericFromUuid(String(quoteId))
      : String(quoteId);
    
    console.log(`[API v1] Getting treatment lines for quote ID: ${searchId} (from ${quoteId})`);
    
    const treatmentLines = await storage.getTreatmentLinesByQuoteId(Number(searchId));
    
    // Transform the IDs to UUID format for frontend consistency
    const transformedLines = treatmentLines.map(line => ({
      ...line,
      id: standardizeId(line.id)
    }));
    
    return res.json({
      success: true,
      data: transformedLines
    });
  } catch (error) {
    console.error(`[API v1] Error getting treatment lines:`, error);
    throw new AppError('Failed to get treatment lines', 500);
  }
}));

// GET /api/v1/treatment-lines/patient/treatment-summary - Get treatment summary for the logged-in patient
router.get('/patient/treatment-summary', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    console.log(`[API v1] Getting treatment summary for patient ID: ${userId}`);
    
    const treatmentSummary = await storage.getTreatmentSummaryForPatient(userId);
    
    // Transform the IDs to UUID format for frontend consistency
    const transformedSummary = {
      ...treatmentSummary,
      treatmentsByClinic: treatmentSummary.treatmentsByClinic.map(clinicGroup => ({
        ...clinicGroup,
        treatmentLines: clinicGroup.treatmentLines.map(line => ({
          ...line,
          id: standardizeId(line.id)
        }))
      }))
    };
    
    return res.json({
      success: true,
      data: transformedSummary
    });
  } catch (error) {
    console.error(`[API v1] Error getting treatment summary:`, error);
    throw new AppError('Failed to get treatment summary', 500);
  }
}));

// POST /api/v1/treatment-lines - Create a new treatment line
router.post('/', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  try {
    // Validate the incoming data
    const validatedData = treatmentLineSchema.parse(req.body);
    
    // Extract the numeric ID from UUID format if needed
    let numericQuoteId = validatedData.quoteId;
    if (isUuidFormat(validatedData.quoteId)) {
      numericQuoteId = extractNumericFromUuid(validatedData.quoteId);
    }
    
    // Ensure we have a number for the database
    const quoteIdNumber = Number(numericQuoteId);
    
    console.log(`[API v1] Creating treatment line for quote ID: ${quoteIdNumber} (from ${validatedData.quoteId})`);
    
    // Create the treatment line in the database
    const newTreatmentLine = await storage.createTreatmentLine({
      ...validatedData,
      quoteId: quoteIdNumber
    });
    
    // Return the new treatment line with standardized ID
    return res.status(201).json({
      success: true,
      data: {
        ...newTreatmentLine,
        id: standardizeId(newTreatmentLine.id)
      },
      message: "Treatment line created successfully"
    });
  } catch (error) {
    console.error(`[API v1] Error creating treatment line:`, error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid treatment line data",
        errors: error.errors
      });
    }
    
    throw new AppError('Failed to create treatment line', 500);
  }
}));

// PUT /api/v1/treatment-lines/:id - Update a treatment line
router.put('/:id', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Extract the numeric ID from UUID format
    let numericId = id;
    if (isUuidFormat(id)) {
      numericId = extractNumericFromUuid(id);
    }
    
    console.log(`[API v1] Updating treatment line with ID: ${numericId} (from ${id})`);
    
    // Validate the incoming data
    const validatedData = treatmentLineSchema.partial().parse(req.body);
    
    // Extract the numeric quote ID from UUID format if needed
    if (validatedData.quoteId && isUuidFormat(validatedData.quoteId)) {
      validatedData.quoteId = extractNumericFromUuid(validatedData.quoteId);
    }
    
    // Update the treatment line
    const updatedTreatmentLine = await storage.updateTreatmentLine(
      Number(numericId), 
      {
        ...validatedData,
        quoteId: validatedData.quoteId ? Number(validatedData.quoteId) : undefined
      }
    );
    
    if (!updatedTreatmentLine) {
      return res.status(404).json({
        success: false,
        message: "Treatment line not found"
      });
    }
    
    // Return the updated treatment line with standardized ID
    return res.json({
      success: true,
      data: {
        ...updatedTreatmentLine,
        id: standardizeId(updatedTreatmentLine.id)
      },
      message: "Treatment line updated successfully"
    });
  } catch (error) {
    console.error(`[API v1] Error updating treatment line:`, error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid treatment line data",
        errors: error.errors
      });
    }
    
    throw new AppError('Failed to update treatment line', 500);
  }
}));

// DELETE /api/v1/treatment-lines/:id - Delete a treatment line (soft delete)
router.delete('/:id', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Extract the numeric ID from UUID format
    let numericId = id;
    if (isUuidFormat(id)) {
      numericId = extractNumericFromUuid(id);
    }
    
    console.log(`[API v1] Deleting treatment line with ID: ${numericId} (from ${id})`);
    
    // Delete the treatment line
    const success = await storage.deleteTreatmentLine(Number(numericId));
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Treatment line not found"
      });
    }
    
    return res.json({
      success: true,
      message: "Treatment line deleted successfully"
    });
  } catch (error) {
    console.error(`[API v1] Error deleting treatment line:`, error);
    throw new AppError('Failed to delete treatment line', 500);
  }
}));

export default router;