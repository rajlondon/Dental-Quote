import { Router } from 'express';
import { db } from '../db';
import { quoteResponses } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Get quotes for logged-in patient
router.get('/my-quotes', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userId = req.user!.id;
    
    const quotes = await db
      .select()
      .from(quoteResponses)
      .where(eq(quoteResponses.userId, userId))
      .orderBy(desc(quoteResponses.createdAt));

    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching user quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes'
    });
  }
});

// Get quotes for clinic staff
router.get('/clinic', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = req.user!;
    if (user.role !== 'clinic_staff') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const clinicId = user.clinicId;
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'No clinic associated with user' });
    }

    const quotes = await db
      .select()
      .from(quoteResponses)
      .where(eq(quoteResponses.clinicId, clinicId))
      .orderBy(desc(quoteResponses.createdAt));

    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching clinic quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinic quotes'
    });
  }
});

// Create new quote response
router.post('/', async (req, res) => {
  try {
    const {
      sessionId,
      patientInfo,
      treatments,
      dentalChart,
      promoCode,
      selectedClinic,
      totalEstimate,
      status = 'submitted',
      clinicId
    } = req.body;

    // Add user ID if authenticated
    const insertData: any = {
      sessionId,
      patientInfo,
      treatments,
      dentalChart: dentalChart || { selectedConditions: [] },
      promoCode,
      selectedClinic,
      totalEstimate,
      status,
      submittedAt: new Date(),
      clinicId
    };

    if (req.isAuthenticated()) {
      insertData.userId = req.user!.id;
    }

    const [newQuote] = await db
      .insert(quoteResponses)
      .values(insertData)
      .returning();

    res.json({
      success: true,
      data: newQuote
    });
  } catch (error) {
    console.error('Error creating quote response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quote response'
    });
  }
});

// Update quote status (for clinics)
router.patch('/:id/status', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = req.user!;
    if (user.role !== 'clinic_staff') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const quoteId = parseInt(req.params.id);
    const { status, clinicNotes } = req.body;

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (clinicNotes) {
      updateData.clinicNotes = clinicNotes;
      updateData.clinicReviewedAt = new Date();
    }

    const [updatedQuote] = await db
      .update(quoteResponses)
      .set(updateData)
      .where(and(
        eq(quoteResponses.id, quoteId),
        eq(quoteResponses.clinicId, user.clinicId!)
      ))
      .returning();

    if (!updatedQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote status'
    });
  }
});

export default router;