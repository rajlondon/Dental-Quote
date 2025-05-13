import { Router } from 'express';
import { storage } from '../storage';
import { ZodError } from 'zod';
import { isAuthenticated, ensureRole } from '../middleware/auth';

const router = Router();

/**
 * Quote management API endpoints
 * These endpoints handle CRUD operations for quotes
 */

/**
 * Get all quotes
 * GET /api/quotes
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = req.user!;
    let quotes;

    // Filter quotes based on user role
    if (user.role === 'admin') {
      // Admins can see all quotes
      quotes = await storage.getAllQuotes();
    } else if (user.role === 'clinic_staff') {
      // Clinic staff can only see quotes for their clinic
      if (!user.clinicId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with a clinic'
        });
      }
      quotes = await storage.getQuotesByClinicId(user.clinicId);
    } else {
      // Patients can only see their own quotes
      quotes = await storage.getQuotesByUserId(user.id);
    }

    return res.status(200).json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching quotes.'
    });
  }
});

/**
 * Get a specific quote by ID
 * GET /api/quotes/:id
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const quoteId = req.params.id;
    const user = req.user!;

    // Get the quote
    const quote = await storage.getQuote(quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found.'
      });
    }

    // Check permissions
    if (
      user.role !== 'admin' &&
      (user.role === 'clinic_staff' && quote.clinicId !== user.clinicId) &&
      (user.role === 'patient' && quote.patientId !== user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this quote.'
      });
    }

    return res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the quote.'
    });
  }
});

/**
 * Create a new quote
 * POST /api/quotes
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const user = req.user!;
    const quoteData = req.body;

    // Add user information to the quote
    if (user.role === 'patient') {
      quoteData.patientId = user.id;
    } else if (user.role === 'clinic_staff' && user.clinicId) {
      quoteData.clinicId = user.clinicId;
    }

    // Set created by
    quoteData.createdBy = user.id;

    // Create the quote
    const quote = await storage.createQuote(quoteData);

    return res.status(201).json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quote data.',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the quote.'
    });
  }
});

/**
 * Update a quote
 * PATCH /api/quotes/:id
 */
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const quoteId = req.params.id;
    const user = req.user!;
    const updateData = req.body;

    // Get the existing quote
    const existingQuote = await storage.getQuote(quoteId);

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found.'
      });
    }

    // Check permissions
    if (
      user.role !== 'admin' &&
      (user.role === 'clinic_staff' && existingQuote.clinicId !== user.clinicId) &&
      (user.role === 'patient' && existingQuote.patientId !== user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this quote.'
      });
    }

    // Update the quote
    const updatedQuote = await storage.updateQuote(quoteId, updateData);

    return res.status(200).json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quote data.',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the quote.'
    });
  }
});

/**
 * Delete a quote
 * DELETE /api/quotes/:id
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const quoteId = req.params.id;
    const user = req.user!;

    // Get the existing quote
    const existingQuote = await storage.getQuote(quoteId);

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found.'
      });
    }

    // Check permissions (only admins and the original creator can delete)
    if (
      user.role !== 'admin' &&
      (user.role === 'clinic_staff' && existingQuote.clinicId !== user.clinicId) &&
      (user.role === 'patient' && existingQuote.createdBy !== user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this quote.'
      });
    }

    // Delete the quote
    await storage.deleteQuote(quoteId);

    return res.status(200).json({
      success: true,
      message: 'Quote deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the quote.'
    });
  }
});

/**
 * Get available treatments
 * GET /api/treatments
 */
router.get('/treatments', async (req, res) => {
  try {
    const treatments = await storage.getTreatments();
    
    return res.status(200).json({
      success: true,
      data: treatments
    });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching treatments.'
    });
  }
});

/**
 * Get available packages
 * GET /api/packages
 */
router.get('/packages', async (req, res) => {
  try {
    const packages = await storage.getPackages();
    
    return res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching packages.'
    });
  }
});

/**
 * Get available add-ons
 * GET /api/addons
 */
router.get('/addons', async (req, res) => {
  try {
    const addons = await storage.getAddons();
    
    return res.status(200).json({
      success: true,
      data: addons
    });
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching add-ons.'
    });
  }
});

export default router;