import express from 'express';
import { db } from '../db';
import { quoteResponses, insertQuoteResponseSchema } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// Save quote response data (for both anonymous and logged-in users)
router.post('/api/quote-responses', async (req, res) => {
  try {
    // Validate the incoming data
    const validatedData = insertQuoteResponseSchema.parse(req.body);
    
    // Generate session ID if not provided and user not logged in
    const sessionId = validatedData.sessionId || 
                     (req.user?.id ? null : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Create the quote response
    const [quoteResponse] = await db
      .insert(quoteResponses)
      .values({
        ...validatedData,
        userId: req.user?.id || null,
        sessionId,
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({
      success: true,
      data: quoteResponse,
      message: 'Quote response saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving quote response:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to save quote response',
      error: error.message
    });
  }
});

// Update existing quote response
router.put('/api/quote-responses/:id', async (req, res) => {
  try {
    const quoteResponseId = parseInt(req.params.id);
    const validatedData = insertQuoteResponseSchema.partial().parse(req.body);

    // Update the quote response
    const [updatedQuoteResponse] = await db
      .update(quoteResponses)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(quoteResponses.id, quoteResponseId))
      .returning();

    if (!updatedQuoteResponse) {
      return res.status(404).json({
        success: false,
        message: 'Quote response not found'
      });
    }

    res.json({
      success: true,
      data: updatedQuoteResponse,
      message: 'Quote response updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating quote response:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update quote response',
      error: error.message
    });
  }
});

// Get quote responses for current user (patient portal)
router.get('/api/quote-responses/my-quotes', async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const userQuoteResponses = await db
      .select()
      .from(quoteResponses)
      .where(eq(quoteResponses.userId, req.user.id));

    res.json({
      success: true,
      data: userQuoteResponses
    });

  } catch (error: any) {
    console.error('Error fetching user quote responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote responses',
      error: error.message
    });
  }
});

// Get quote responses for a specific clinic (clinic portal)
router.get('/api/quote-responses/clinic/:clinicId', async (req, res) => {
  if (!req.user?.id || req.user.role !== 'clinic_staff') {
    return res.status(403).json({
      success: false,
      message: 'Clinic staff access required'
    });
  }

  try {
    const clinicId = parseInt(req.params.clinicId);
    
    const clinicQuoteResponses = await db
      .select()
      .from(quoteResponses)
      .where(eq(quoteResponses.clinicId, clinicId));

    res.json({
      success: true,
      data: clinicQuoteResponses
    });

  } catch (error: any) {
    console.error('Error fetching clinic quote responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinic quote responses',
      error: error.message
    });
  }
});

// Get a specific quote response by ID
router.get('/api/quote-responses/:id', async (req, res) => {
  try {
    const quoteResponseId = parseInt(req.params.id);
    
    const [quoteResponse] = await db
      .select()
      .from(quoteResponses)
      .where(eq(quoteResponses.id, quoteResponseId));

    if (!quoteResponse) {
      return res.status(404).json({
        success: false,
        message: 'Quote response not found'
      });
    }

    // Check permissions
    if (!req.user?.id || 
        (quoteResponse.userId !== req.user.id && 
         req.user.role !== 'clinic_staff' && 
         req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: quoteResponse
    });

  } catch (error: any) {
    console.error('Error fetching quote response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote response',
      error: error.message
    });
  }
});

// Submit quote response to clinic
router.post('/api/quote-responses/:id/submit', async (req, res) => {
  try {
    const quoteResponseId = parseInt(req.params.id);
    
    const [quoteResponse] = await db
      .select()
      .from(quoteResponses)
      .where(eq(quoteResponses.id, quoteResponseId));

    if (!quoteResponse) {
      return res.status(404).json({
        success: false,
        message: 'Quote response not found'
      });
    }

    // Update status to submitted
    const [updatedQuoteResponse] = await db
      .update(quoteResponses)
      .set({
        status: 'submitted',
        submittedToClinic: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(quoteResponses.id, quoteResponseId))
      .returning();

    res.json({
      success: true,
      data: updatedQuoteResponse,
      message: 'Quote response submitted to clinic successfully'
    });

  } catch (error: any) {
    console.error('Error submitting quote response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quote response',
      error: error.message
    });
  }
});

// Clinic reviews quote response
router.post('/api/quote-responses/:id/review', async (req, res) => {
  if (!req.user?.id || req.user.role !== 'clinic_staff') {
    return res.status(403).json({
      success: false,
      message: 'Clinic staff access required'
    });
  }

  try {
    const quoteResponseId = parseInt(req.params.id);
    const { clinicNotes, status } = req.body;
    
    const [updatedQuoteResponse] = await db
      .update(quoteResponses)
      .set({
        status: status || 'under_review',
        clinicNotes,
        clinicReviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(quoteResponses.id, quoteResponseId))
      .returning();

    if (!updatedQuoteResponse) {
      return res.status(404).json({
        success: false,
        message: 'Quote response not found'
      });
    }

    res.json({
      success: true,
      data: updatedQuoteResponse,
      message: 'Quote response reviewed successfully'
    });

  } catch (error: any) {
    console.error('Error reviewing quote response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review quote response',
      error: error.message
    });
  }
});

export default router;