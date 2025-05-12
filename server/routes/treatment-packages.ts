import { Router } from 'express';
import { db } from '../db';
import { treatmentPackages } from '../../shared/schema';
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

// GET /api/treatment-packages - List all packages
router.get('/', async (req, res) => {
  try {
    const query = listQuerySchema.parse(req.query);
    
    let queryBuilder = db.select().from(treatmentPackages);
    
    // Apply filters
    if (query?.clinicId) {
      queryBuilder = queryBuilder.where(eq(treatmentPackages.clinicId, query.clinicId));
    }
    
    // Apply pagination
    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    
    if (query?.offset) {
      queryBuilder = queryBuilder.offset(query.offset);
    }
    
    const packages = await queryBuilder;
    res.json(packages);
  } catch (error) {
    console.error('Error fetching treatment packages:', error);
    res.status(500).json({ error: 'Failed to fetch treatment packages' });
  }
});

// GET /api/treatment-packages/:id - Get a specific package with its items
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get the package
    const [pkg] = await db
      .select()
      .from(treatmentPackages)
      .where(eq(treatmentPackages.id, id));
    
    if (!pkg) {
      return res.status(404).json({ error: 'Treatment package not found' });
    }
    
    // For now, we'll return a simplified package without items
    res.json(pkg);
  } catch (error) {
    console.error('Error fetching treatment package:', error);
    res.status(500).json({ error: 'Failed to fetch treatment package' });
  }
});

// Create a new package (admin or clinic staff)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const packageData = req.body;
    
    // Check if user is admin or if they belong to the clinic
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (user.role !== 'admin' && packageData.clinicId !== user.clinicId) {
      return res.status(403).json({ error: 'Not authorized to create package for this clinic' });
    }
    
    // Create the package
    const [pkg] = await db
      .insert(treatmentPackages)
      .values(packageData)
      .returning();
    
    res.status(201).json(pkg);
  } catch (error) {
    console.error('Error creating treatment package:', error);
    res.status(500).json({ error: 'Failed to create treatment package' });
  }
});

// Update a package (admin or clinic staff)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const packageData = req.body;
    
    // Get the existing package
    const [existingPackage] = await db
      .select()
      .from(treatmentPackages)
      .where(eq(treatmentPackages.id, id));
    
    if (!existingPackage) {
      return res.status(404).json({ error: 'Treatment package not found' });
    }
    
    // Check if user is admin or if they belong to the clinic
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (user.role !== 'admin' && existingPackage.clinicId !== user.clinicId) {
      return res.status(403).json({ error: 'Not authorized to update this package' });
    }
    
    // Update the package
    const [updatedPackage] = await db
      .update(treatmentPackages)
      .set(packageData)
      .where(eq(treatmentPackages.id, id))
      .returning();
    
    res.json(updatedPackage);
  } catch (error) {
    console.error('Error updating treatment package:', error);
    res.status(500).json({ error: 'Failed to update treatment package' });
  }
});

// Delete a package (admin only)
router.delete('/:id', isAuthenticated, ensureRole("admin"), async (req, res) => {
  try {
    const id = req.params.id;
    
    // Delete the package
    await db.delete(treatmentPackages).where(eq(treatmentPackages.id, id));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting treatment package:', error);
    res.status(500).json({ error: 'Failed to delete treatment package' });
  }
});

export default router;