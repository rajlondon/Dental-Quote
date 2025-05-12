import { Router } from 'express';
import { db } from '../db';
import { specialOffers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, ensureRole } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Schema for validating query parameters
const listQuerySchema = z.object({
  clinicId: z.coerce.number().optional(),
  active: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional()
}).optional();

// GET /api/special-offers - List all special offers
router.get('/', async (req, res) => {
  try {
    const query = listQuerySchema.parse(req.query);
    
    let queryBuilder = db.select().from(specialOffers);
    
    // Apply filters
    if (query?.clinicId) {
      queryBuilder = queryBuilder.where(eq(specialOffers.clinicId, query.clinicId));
    }
    
    // Active filter is removed since validFrom/validUntil are not in schema
    
    // Apply pagination
    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    
    if (query?.offset) {
      queryBuilder = queryBuilder.offset(query.offset);
    }
    
    const offers = await queryBuilder;
    res.json(offers);
  } catch (error) {
    console.error('Error fetching special offers:', error);
    res.status(500).json({ error: 'Failed to fetch special offers' });
  }
});

// GET /api/special-offers/:id - Get a specific special offer
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [offer] = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, id));
    
    if (!offer) {
      return res.status(404).json({ error: 'Special offer not found' });
    }
    
    res.json(offer);
  } catch (error) {
    console.error('Error fetching special offer:', error);
    res.status(500).json({ error: 'Failed to fetch special offer' });
  }
});

// Create a new special offer (admin only)
router.post('/', isAuthenticated, ensureRole("admin"), async (req, res) => {
  try {
    const [offer] = await db
      .insert(specialOffers)
      .values(req.body)
      .returning();
    
    res.status(201).json(offer);
  } catch (error) {
    console.error('Error creating special offer:', error);
    res.status(500).json({ error: 'Failed to create special offer' });
  }
});

// Update a special offer (admin or clinic staff)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const [existingOffer] = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, id));
    
    if (!existingOffer) {
      return res.status(404).json({ error: 'Special offer not found' });
    }
    
    // Check if user is admin or if they belong to the clinic
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (user.role !== 'admin' && existingOffer.clinicId !== user.clinicId) {
      return res.status(403).json({ error: 'Not authorized to update this offer' });
    }
    
    const [updatedOffer] = await db
      .update(specialOffers)
      .set(req.body)
      .where(eq(specialOffers.id, id))
      .returning();
    
    res.json(updatedOffer);
  } catch (error) {
    console.error('Error updating special offer:', error);
    res.status(500).json({ error: 'Failed to update special offer' });
  }
});

// Delete a special offer (admin only)
router.delete('/:id', isAuthenticated, ensureRole("admin"), async (req, res) => {
  try {
    const id = req.params.id;
    await db.delete(specialOffers).where(eq(specialOffers.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting special offer:', error);
    res.status(500).json({ error: 'Failed to delete special offer' });
  }
});

export default router;