import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { catchAsync } from '../middleware/error-handler';
import { db } from '../db';
import { treatmentPackages } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const adminPackageRouter = Router();

// Get all packages for admin
adminPackageRouter.get('/', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const packages = await db.select().from(treatmentPackages);
  res.json({
    success: true,
    data: packages
  });
}));

// Update package
adminPackageRouter.put('/:id', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, packagePrice, originalPrice } = req.body;
  
  const updated = await db.update(treatmentPackages)
    .set({
      name,
      description,
      packagePrice: packagePrice.toString(),
      originalPrice: originalPrice.toString(),
      updatedAt: new Date()
    })
    .where(eq(treatmentPackages.id, id))
    .returning();
    
  res.json({
    success: true,
    data: updated[0]
  });
}));

export default adminPackageRouter;
