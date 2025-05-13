import express from 'express';
import { body, param, query } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../../middleware/validation';
import { isAdmin } from '../../middleware/auth-middleware';
import { db } from '../../db';
import { promos, promoClinics, DiscountType, PromoType } from '@shared/schema';
import { eq, and, gte, lte, sql, asc, desc, or, like, not, isNull, count } from 'drizzle-orm';
import { BadRequestError, NotFoundError, ConflictError } from '../../models/custom-errors';
import logger from '../../utils/logger';
import { generatePromoSlug, generatePromoCode } from '../../utils/promo-utils';

const router = express.Router();

// Get all promos with usage stats
router.get('/promos', isAdmin, async (req, res, next) => {
  try {
    const { status, search, sort, order } = req.query;
    
    // Count usage for each promo
    const promosWithUsage = await db
      .select({
        ...promos,
        usageCount: count(sql`quotes.id`).as('usage_count')
      })
      .from(promos)
      .leftJoin('quotes', eq(promos.id, sql`quotes.promo_id`))
      .groupBy(promos.id);
    
    // Apply filters
    let filteredPromos = [...promosWithUsage];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredPromos = filteredPromos.filter(promo => 
        promo.status === status
      );
    }
    
    // Search by title or code
    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredPromos = filteredPromos.filter(promo => 
        promo.title.toLowerCase().includes(searchTerm) || 
        (promo.code && promo.code.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply sorting (default: newest first)
    const sortField = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    
    filteredPromos.sort((a, b) => {
      if (sortField === 'usageCount') {
        return sortOrder === 'asc' 
          ? a.usageCount - b.usageCount 
          : b.usageCount - a.usageCount;
      }
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        return sortOrder === 'asc'
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
      
      return 0;
    });
    
    res.json(filteredPromos);
  } catch (error) {
    next(error);
  }
});

// Get a specific promo with usage stats and clinic associations
router.get('/promos/:id', isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get promo details
    const [promo] = await db
      .select()
      .from(promos)
      .where(eq(promos.id, id));
    
    if (!promo) {
      throw new NotFoundError('Promotion not found');
    }
    
    // Get clinic associations if applicable
    let clinics = [];
    if (promo.promoType === 'clinic-specific') {
      // Get all clinic IDs associated with this promo
      const clinicRelations = await db
        .select()
        .from(promoClinics)
        .where(eq(promoClinics.promoId, id));
      
      // Get clinic details for each associated clinic
      if (clinicRelations.length > 0) {
        const clinicIds = clinicRelations.map(rel => rel.clinicId);
        
        // Fetch clinic details
        const clinicDetails = await db
          .select()
          .from('clinics')
          .where(sql`clinics.id IN (${clinicIds.join(',')})`);
        
        clinics = clinicDetails;
      }
    }
    
    // Get usage stats
    const usageStats = await db
      .select({
        count: count(sql`quotes.id`).as('usage_count'),
        totalDiscount: sql`SUM(CAST(quotes.discount_amount AS FLOAT))`.as('total_discount')
      })
      .from('quotes')
      .where(eq(sql`quotes.promo_id`, id));
    
    // Return combined data
    res.json({
      ...promo,
      clinics,
      stats: {
        usageCount: usageStats[0]?.count || 0,
        totalDiscount: usageStats[0]?.totalDiscount || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create a new promo
router.post('/promos', 
  isAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('promoType').isIn(['global', 'clinic-specific']).withMessage('Invalid promo type'),
    body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').notEmpty().withMessage('Discount value is required'),
    body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
    body('code').optional(),
    body('description').optional(),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer'),
    body('clinicIds').optional().isArray().withMessage('Clinic IDs must be an array'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { 
        title, promoType, discountType, discountValue, status = 'draft',
        code, description, startDate, endDate, maxUses, clinicIds
      } = req.body;
      
      // Check that dates are valid
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new BadRequestError('Start date cannot be after end date');
      }
      
      // Generate a slug
      const slug = await generatePromoSlug(title);
      
      // Generate or validate promo code
      let promoCode = code;
      if (!promoCode) {
        promoCode = await generatePromoCode();
      } else {
        // Check if code already exists
        const existingPromo = await db
          .select()
          .from(promos)
          .where(eq(promos.code, promoCode));
        
        if (existingPromo.length > 0) {
          throw new ConflictError('Promo code already exists');
        }
      }
      
      // Create the promo
      const id = uuidv4();
      const now = new Date();
      
      const [newPromo] = await db.insert(promos).values({
        id,
        slug,
        code: promoCode,
        title,
        description: description || null,
        promoType: promoType as PromoType,
        discountType: discountType as DiscountType,
        discountValue,
        status: status as PromoStatus,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxUses: maxUses || null,
        uses: 0,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      // If clinic-specific, create associations with clinics
      if (promoType === 'clinic-specific' && clinicIds && clinicIds.length > 0) {
        const clinicPromises = clinicIds.map(clinicId => 
          db.insert(promoClinics).values({
            id: uuidv4(),
            promoId: id,
            clinicId,
            createdAt: now
          })
        );
        
        await Promise.all(clinicPromises);
      }
      
      // Return the created promo
      res.status(201).json(newPromo);
    } catch (error) {
      next(error);
    }
  }
);

// Update a promo
router.put('/promos/:id',
  isAdmin,
  [
    param('id').notEmpty().withMessage('Promo ID is required'),
    body('title').optional(),
    body('promoType').optional().isIn(['global', 'clinic-specific']).withMessage('Invalid promo type'),
    body('discountType').optional().isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').optional(),
    body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
    body('code').optional(),
    body('description').optional(),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer'),
    body('clinicIds').optional().isArray().withMessage('Clinic IDs must be an array'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if promo exists
      const [existingPromo] = await db
        .select()
        .from(promos)
        .where(eq(promos.id, id));
      
      if (!existingPromo) {
        throw new NotFoundError('Promotion not found');
      }
      
      // Check if code is being changed and if it's unique
      if (updates.code && updates.code !== existingPromo.code) {
        const [codeCheck] = await db
          .select()
          .from(promos)
          .where(eq(promos.code, updates.code));
        
        if (codeCheck) {
          throw new ConflictError('Promo code already exists');
        }
      }
      
      // Check that dates are valid
      const startDate = updates.startDate ? new Date(updates.startDate) : existingPromo.startDate;
      const endDate = updates.endDate ? new Date(updates.endDate) : existingPromo.endDate;
      
      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestError('Start date cannot be after end date');
      }
      
      // Update slug if title is changing
      let slug = existingPromo.slug;
      if (updates.title && updates.title !== existingPromo.title) {
        slug = await generatePromoSlug(updates.title);
      }
      
      // Prepare update data
      const updateData = {
        ...(updates.title && { title: updates.title }),
        ...(updates.title && { slug }),
        ...(updates.code && { code: updates.code }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.promoType && { promoType: updates.promoType as PromoType }),
        ...(updates.discountType && { discountType: updates.discountType as DiscountType }),
        ...(updates.discountValue && { discountValue: updates.discountValue }),
        ...(updates.status && { status: updates.status as PromoStatus }),
        ...(updates.startDate && { startDate: new Date(updates.startDate) }),
        ...(updates.endDate && { endDate: new Date(updates.endDate) }),
        ...(updates.maxUses !== undefined && { maxUses: updates.maxUses }),
        updatedAt: new Date()
      };
      
      // Update the promo
      const [updatedPromo] = await db
        .update(promos)
        .set(updateData)
        .where(eq(promos.id, id))
        .returning();
      
      // Handle clinic associations if promo type is clinic-specific
      if (updates.clinicIds && Array.isArray(updates.clinicIds)) {
        // Delete existing associations
        await db
          .delete(promoClinics)
          .where(eq(promoClinics.promoId, id));
        
        // Add new associations
        if (updates.clinicIds.length > 0) {
          const clinicPromises = updates.clinicIds.map(clinicId =>
            db.insert(promoClinics).values({
              id: uuidv4(),
              promoId: id,
              clinicId,
              createdAt: new Date()
            })
          );
          
          await Promise.all(clinicPromises);
        }
      }
      
      res.json(updatedPromo);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a promo
router.delete('/promos/:id', 
  isAdmin,
  param('id').notEmpty().withMessage('Promo ID is required'),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if promo exists
      const [existingPromo] = await db
        .select()
        .from(promos)
        .where(eq(promos.id, id));
      
      if (!existingPromo) {
        throw new NotFoundError('Promotion not found');
      }
      
      // Check if promo is in use
      const [inUseCheck] = await db
        .select({ count: count() })
        .from('quotes')
        .where(eq(sql`quotes.promo_id`, id));
      
      if (inUseCheck && inUseCheck.count > 0) {
        // Instead of deleting, mark as inactive
        await db
          .update(promos)
          .set({ 
            status: 'inactive',
            updatedAt: new Date()
          })
          .where(eq(promos.id, id));
        
        return res.json({
          success: true,
          message: 'Promo has been used in quotes and cannot be deleted. It has been marked as inactive instead.'
        });
      }
      
      // Delete clinic associations first
      await db
        .delete(promoClinics)
        .where(eq(promoClinics.promoId, id));
      
      // Delete the promo
      await db
        .delete(promos)
        .where(eq(promos.id, id));
      
      res.json({
        success: true,
        message: 'Promo deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get promo usage statistics
router.get('/promos/stats/overview', isAdmin, async (req, res, next) => {
  try {
    // Count promos by status
    const statusCounts = await db
      .select({
        status: promos.status,
        count: count().as('count')
      })
      .from(promos)
      .groupBy(promos.status);
    
    // Format status counts into an object
    const statusStats = {
      active: 0,
      inactive: 0,
      draft: 0
    };
    
    statusCounts.forEach(item => {
      statusStats[item.status] = item.count;
    });
    
    // Get total discount applied
    const [discountStats] = await db
      .select({
        totalDiscount: sql`SUM(CAST(quotes.discount_amount AS FLOAT))`.as('total_discount'),
        totalUses: count(sql`DISTINCT quotes.promo_id`).as('total_uses')
      })
      .from('quotes')
      .where(not(isNull(sql`quotes.promo_id`)));
    
    // Get most used promos (top 5)
    const mostUsedPromos = await db
      .select({
        ...promos,
        usageCount: count(sql`quotes.id`).as('usage_count')
      })
      .from(promos)
      .leftJoin('quotes', eq(promos.id, sql`quotes.promo_id`))
      .groupBy(promos.id)
      .orderBy(desc(sql`usage_count`))
      .limit(5);
    
    // Get recently created promos (last 5)
    const recentPromos = await db
      .select()
      .from(promos)
      .orderBy(desc(promos.createdAt))
      .limit(5);
    
    res.json({
      statusStats,
      discountStats: {
        totalDiscount: discountStats?.totalDiscount || 0,
        totalUses: discountStats?.totalUses || 0
      },
      mostUsedPromos,
      recentPromos
    });
  } catch (error) {
    next(error);
  }
});

export default router;