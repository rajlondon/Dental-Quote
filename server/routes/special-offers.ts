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
    
    // Define columns to select
    const columns = {
      id: specialOffers.id,
      clinicId: specialOffers.clinicId,
      title: specialOffers.title,
      description: specialOffers.description,
      discountType: specialOffers.discountType,
      discountValue: specialOffers.discountValue,
      applicableTreatments: specialOffers.applicableTreatments,
      startDate: specialOffers.startDate,
      endDate: specialOffers.endDate,
      promoCode: specialOffers.promoCode,
      termsAndConditions: specialOffers.termsAndConditions,
      imageUrl: specialOffers.imageUrl,
      badgeText: specialOffers.badgeText,
      treatmentPriceGBP: specialOffers.treatmentPriceGBP,
      treatmentPriceUSD: specialOffers.treatmentPriceUSD,
      displayOnHomepage: specialOffers.displayOnHomepage,
      featured: specialOffers.featured,
      isActive: specialOffers.isActive,
      cityCode: specialOffers.cityCode,
      cityName: specialOffers.cityName,
      status: specialOffers.status,
      createdAt: specialOffers.createdAt,
      updatedAt: specialOffers.updatedAt
    };
    
    // Start with base query
    let baseQuery = db.select(columns).from(specialOffers);
    
    // Apply filters in a chain
    if (query?.clinicId) {
      baseQuery = baseQuery.where(eq(specialOffers.clinicId, query.clinicId));
    }
    
    if (query?.active) {
      baseQuery = baseQuery.where(eq(specialOffers.isActive, query.active === 'true'));
    }
    
    if (query?.limit) {
      baseQuery = baseQuery.limit(query.limit);
    }
    
    if (query?.offset) {
      baseQuery = baseQuery.offset(query.offset);
    }
    
    // Execute the query
    const offers = await baseQuery;
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
    
    // Reuse the same column definition from the list route
    const columns = {
      id: specialOffers.id,
      clinicId: specialOffers.clinicId,
      title: specialOffers.title,
      description: specialOffers.description,
      discountType: specialOffers.discountType,
      discountValue: specialOffers.discountValue,
      applicableTreatments: specialOffers.applicableTreatments,
      startDate: specialOffers.startDate,
      endDate: specialOffers.endDate,
      promoCode: specialOffers.promoCode,
      termsAndConditions: specialOffers.termsAndConditions,
      imageUrl: specialOffers.imageUrl,
      badgeText: specialOffers.badgeText,
      treatmentPriceGBP: specialOffers.treatmentPriceGBP,
      treatmentPriceUSD: specialOffers.treatmentPriceUSD,
      displayOnHomepage: specialOffers.displayOnHomepage,
      featured: specialOffers.featured,
      isActive: specialOffers.isActive,
      cityCode: specialOffers.cityCode,
      cityName: specialOffers.cityName,
      status: specialOffers.status,
      createdAt: specialOffers.createdAt,
      updatedAt: specialOffers.updatedAt
    };
    
    // Build and execute the query
    const results = await db
      .select(columns)
      .from(specialOffers)
      .where(eq(specialOffers.id, id));
    
    const offer = results[0];
    
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
    
    // Define columns to select
    const columns = {
      id: specialOffers.id,
      clinicId: specialOffers.clinicId,
      title: specialOffers.title,
      description: specialOffers.description,
      discountType: specialOffers.discountType,
      discountValue: specialOffers.discountValue,
      applicableTreatments: specialOffers.applicableTreatments,
      startDate: specialOffers.startDate,
      endDate: specialOffers.endDate,
      promoCode: specialOffers.promoCode,
      termsAndConditions: specialOffers.termsAndConditions,
      imageUrl: specialOffers.imageUrl,
      badgeText: specialOffers.badgeText,
      treatmentPriceGBP: specialOffers.treatmentPriceGBP,
      treatmentPriceUSD: specialOffers.treatmentPriceUSD,
      displayOnHomepage: specialOffers.displayOnHomepage,
      featured: specialOffers.featured,
      isActive: specialOffers.isActive,
      cityCode: specialOffers.cityCode,
      cityName: specialOffers.cityName,
      status: specialOffers.status,
      createdAt: specialOffers.createdAt,
      updatedAt: specialOffers.updatedAt
    };
    
    // Find the existing offer
    const results = await db
      .select(columns)
      .from(specialOffers)
      .where(eq(specialOffers.id, id));
    
    const existingOffer = results[0];
    
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
    
    // Update the offer
    const updatedResults = await db
      .update(specialOffers)
      .set(req.body)
      .where(eq(specialOffers.id, id))
      .returning();
    
    const updatedOffer = updatedResults[0];
    
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