/**
 * Treatment Lines API V1 Router
 * This is the canonical API for all treatment line operations
 */

import express from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { storage } from '../../storage';
import { extractNumericFromUuid } from '../../utils/id-converter';
import { z } from 'zod';

const router = express.Router();

// Schema to validate UUID format
const uuidSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
  message: 'Invalid UUID format. Expected format: 00000000-0000-4000-a000-000000000000'
});

// Validate lineId is in UUID format
function validateUuid(req, res, next) {
  try {
    const { lineId } = req.params;
    if (!lineId) {
      return res.status(400).json({
        success: false,
        message: 'Missing lineId parameter'
      });
    }
    
    // Parse and validate UUID
    const result = uuidSchema.safeParse(lineId);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID format',
        errors: result.error.errors
      });
    }
    
    next();
  } catch (error) {
    console.error('[ERROR] UUID validation error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid request data'
    });
  }
}

// Get all treatment lines for a quote
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { quoteId } = req.query;
    
    if (!quoteId) {
      return res.status(400).json({
        success: false,
        message: 'Missing quoteId parameter'
      });
    }
    
    console.log(`[API V1] GET treatment lines for quote ID: ${quoteId}`);
    
    // Extract numeric ID if in UUID format
    const numericQuoteId = extractNumericFromUuid(quoteId);
    console.log(`[API V1] Converted quoteId ${quoteId} -> ${numericQuoteId}`);
    
    const treatmentLines = await storage.getTreatmentLinesByQuoteId(numericQuoteId);
    
    console.log(`[API V1] Found ${treatmentLines.length} treatment lines for quote: ${numericQuoteId}`);
    
    return res.status(200).json({
      success: true,
      data: treatmentLines
    });
  } catch (error) {
    console.error('[ERROR] Error fetching treatment lines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment lines'
    });
  }
});

// Get a specific treatment line
router.get('/:lineId', isAuthenticated, validateUuid, async (req, res) => {
  try {
    const { lineId } = req.params;
    
    console.log(`[API V1] GET treatment line: ${lineId}`);
    
    // Extract numeric ID from UUID
    const id = extractNumericFromUuid(lineId);
    console.log(`[API V1] Converted lineId ${lineId} -> ${id}`);
    
    const treatmentLine = await storage.getTreatmentLineById(id);
    
    if (!treatmentLine) {
      return res.status(404).json({
        success: false,
        message: 'Treatment line not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: treatmentLine
    });
  } catch (error) {
    console.error('[ERROR] Error fetching treatment line:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment line'
    });
  }
});

// Create a new treatment line
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const data = req.body;
    
    console.log(`[API V1] POST treatment line for quote: ${data.quoteId}`);
    
    // Extract numeric ID if quoteId is in UUID format
    if (data.quoteId && data.quoteId.includes('-')) {
      data.quoteId = extractNumericFromUuid(data.quoteId);
      console.log(`[API V1] Converted quoteId ${req.body.quoteId} -> ${data.quoteId}`);
    }
    
    const newTreatmentLine = await storage.addTreatmentLine(data);
    
    return res.status(201).json({
      success: true,
      data: newTreatmentLine
    });
  } catch (error) {
    console.error('[ERROR] Error creating treatment line:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create treatment line'
    });
  }
});

// Update a treatment line
router.put('/:lineId', isAuthenticated, validateUuid, async (req, res) => {
  try {
    const { lineId } = req.params;
    const data = req.body;
    
    console.log(`[API V1] PUT treatment line: ${lineId}`);
    
    // Extract numeric ID from UUID
    const id = extractNumericFromUuid(lineId);
    console.log(`[API V1] Converted lineId ${lineId} -> ${id}`);
    
    // Extract numeric ID if quoteId is in UUID format
    if (data.quoteId && data.quoteId.includes('-')) {
      data.quoteId = extractNumericFromUuid(data.quoteId);
      console.log(`[API V1] Converted quoteId ${req.body.quoteId} -> ${data.quoteId}`);
    }
    
    const updatedTreatmentLine = await storage.updateTreatmentLine(id, data);
    
    if (!updatedTreatmentLine) {
      return res.status(404).json({
        success: false,
        message: 'Treatment line not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedTreatmentLine
    });
  } catch (error) {
    console.error('[ERROR] Error updating treatment line:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update treatment line'
    });
  }
});

// Delete a treatment line
router.delete('/:lineId', isAuthenticated, validateUuid, async (req, res) => {
  try {
    const { lineId } = req.params;
    
    console.log(`[API V1] DELETE treatment line: ${lineId}`);
    
    // Extract numeric ID from UUID
    const id = extractNumericFromUuid(lineId);
    console.log(`[API V1] Converted lineId ${lineId} -> ${id}`);
    
    await storage.deleteTreatmentLine(id);
    
    return res.status(200).json({
      success: true,
      message: 'Treatment line deleted successfully'
    });
  } catch (error) {
    console.error('[ERROR] Error deleting treatment line:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete treatment line'
    });
  }
});

export default router;