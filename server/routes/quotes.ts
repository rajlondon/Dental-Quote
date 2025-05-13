import { Router } from 'express';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Get all quotes
 * GET /api/quotes
 */
router.get('/', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to access quotes.'
      });
    }
    
    // Get user role from request
    const userRole = req.user?.role || 'patient';
    const userId = req.user?.id;
    
    let quotes = [];
    
    if (userRole === 'admin') {
      // Admins can see all quotes
      quotes = await storage.getAllQuotes();
    } else if (userRole === 'clinic_staff') {
      // Clinic staff can see quotes associated with their clinic
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(400).json({
          success: false,
          message: 'Clinic ID is required for clinic staff.'
        });
      }
      quotes = await storage.getQuotesByClinicId(clinicId);
    } else {
      // Patients can only see their own quotes
      quotes = await storage.getQuotesByUserId(userId);
    }
    
    return res.status(200).json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes. Please try again later.'
    });
  }
});

/**
 * Get a specific quote by ID
 * GET /api/quotes/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to access quotes.'
      });
    }
    
    // Get quote
    const quote = await storage.getQuote(quoteId);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found.'
      });
    }
    
    // Check permissions
    const userRole = req.user?.role || 'patient';
    const userId = req.user?.id;
    const clinicId = req.user?.clinicId;
    
    // Only allow access if user is admin, the quote belongs to the user,
    // or the quote is assigned to the user's clinic
    if (
      userRole !== 'admin' && 
      quote.patientId !== userId && 
      (userRole === 'clinic_staff' && quote.clinicId !== clinicId)
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
      message: 'Failed to fetch quote. Please try again later.'
    });
  }
});

/**
 * Create a new quote
 * POST /api/quotes
 */
router.post('/', async (req, res) => {
  try {
    const quoteData = req.body;
    
    // For logged in users, associate the quote with their account
    if (req.isAuthenticated()) {
      quoteData.patientId = req.user?.id;
    }
    
    // Generate a unique ID for the quote
    quoteData.id = quoteData.id || uuidv4();
    
    // Set the created date
    quoteData.createdAt = new Date().toISOString();
    
    // Set initial status
    quoteData.status = 'draft';
    
    // Create the quote
    const quote = await storage.createQuote(quoteData);
    
    return res.status(201).json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create quote. Please try again later.'
    });
  }
});

/**
 * Update a quote
 * PATCH /api/quotes/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const updateData = req.body;
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to update quotes.'
      });
    }
    
    // Get existing quote
    const existingQuote = await storage.getQuote(quoteId);
    
    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found.'
      });
    }
    
    // Check permissions
    const userRole = req.user?.role || 'patient';
    const userId = req.user?.id;
    const clinicId = req.user?.clinicId;
    
    // Only allow update if user is admin, the quote belongs to the user,
    // or the quote is assigned to the user's clinic
    if (
      userRole !== 'admin' && 
      existingQuote.patientId !== userId && 
      (userRole === 'clinic_staff' && existingQuote.clinicId !== clinicId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this quote.'
      });
    }
    
    // Update the quote
    const updatedQuote = await storage.updateQuote(quoteId, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    return res.status(200).json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update quote. Please try again later.'
    });
  }
});

/**
 * Delete a quote
 * DELETE /api/quotes/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to delete quotes.'
      });
    }
    
    // Get existing quote
    const existingQuote = await storage.getQuote(quoteId);
    
    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found.'
      });
    }
    
    // Check permissions
    const userRole = req.user?.role || 'patient';
    const userId = req.user?.id;
    
    // Only allow deletion if user is admin or the quote belongs to the user
    if (userRole !== 'admin' && existingQuote.patientId !== userId) {
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
      message: 'Failed to delete quote. Please try again later.'
    });
  }
});

/**
 * Get available treatments
 * GET /api/treatments
 */
router.get('/treatments', async (req, res) => {
  try {
    // Get treatments
    const treatments = await storage.getTreatments();
    
    return res.status(200).json(treatments);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch treatments. Please try again later.'
    });
  }
});

/**
 * Get available packages
 * GET /api/packages
 */
router.get('/packages', async (req, res) => {
  try {
    // Get packages
    const packages = await storage.getPackages();
    
    return res.status(200).json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch packages. Please try again later.'
    });
  }
});

/**
 * Get available add-ons
 * GET /api/addons
 */
router.get('/addons', async (req, res) => {
  try {
    // Get add-ons
    const addons = await storage.getAddons();
    
    return res.status(200).json(addons);
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch add-ons. Please try again later.'
    });
  }
});

export default router;