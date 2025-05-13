import { Router } from 'express';
import { db } from '../../db';
import { promos, promoClinics } from '@shared/schema';
import { eq, and, or, isNull, gte, like, desc, count, sql } from 'drizzle-orm';
import { isAdmin } from '../../middlewares/auth-middleware';
import { validatePromoData } from '../../utils/promo-utils';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';

const router = Router();

// List all promotions with filtering
router.get('/', isAdmin, async (req, res) => {
  try {
    const { status, clinicId, search } = req.query;
    
    let query = db.select({
      ...promos,
      usageCount: count(sql`distinct quotes.id`).as('usage_count'),
    })
    .from(promos)
    .leftJoin('quotes', eq(promos.id, sql`quotes.promo_id`))
    .leftJoin(promoClinics, eq(promos.id, promoClinics.promoId));
    
    // Apply filters
    const filters = [];
    
    if (status === 'active') {
      filters.push(eq(promos.isActive, true));
      filters.push(or(isNull(promos.endDate), gte(promos.endDate, new Date())));
    } else if (status === 'inactive') {
      filters.push(or(
        eq(promos.isActive, false),
        and(
          gte(new Date(), promos.endDate),
          isNull(promos.endDate).not()
        )
      ));
    }
    
    if (clinicId) {
      filters.push(eq(promoClinics.clinicId, String(clinicId)));
    }
    
    if (search) {
      filters.push(like(promos.code, `%${search}%`));
    }
    
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }
    
    // Group by promo ID to avoid duplicates from joins
    query = query.groupBy(promos.id)
      .orderBy(desc(promos.createdAt));
    
    const promotions = await query;
    
    // Get clinic names for restricted promos
    const promosWithClinics = await Promise.all(promotions.map(async (promo) => {
      const clinics = await db.select()
        .from(promoClinics)
        .leftJoin('clinics', eq(promoClinics.clinicId, sql`clinics.id`))
        .where(eq(promoClinics.promoId, promo.id));
      
      return {
        ...promo,
        clinics: clinics.map(c => ({ 
          id: c.clinics?.id, 
          name: c.clinics?.name 
        }))
      };
    }));
    
    res.json({
      success: true,
      data: promosWithClinics
    });
  } catch (error) {
    logger.error('Error fetching promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotions'
    });
  }
});

// Get promotion details
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [promo] = await db.select()
      .from(promos)
      .where(eq(promos.id, id));
    
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    // Get associated clinics
    const clinics = await db.select()
      .from(promoClinics)
      .leftJoin('clinics', eq(promoClinics.clinicId, sql`clinics.id`))
      .where(eq(promoClinics.promoId, id));
    
    // Get usage statistics
    const usageStats = await db.select({
      count: count()
    })
    .from('quotes')
    .where(eq(sql`quotes.promo_id`, id));
    
    res.json({
      success: true,
      data: {
        ...promo,
        clinics: clinics.map(c => ({ 
          id: c.clinics?.id, 
          name: c.clinics?.name 
        })),
        usageCount: usageStats[0]?.count || 0
      }
    });
  } catch (error) {
    logger.error(`Error fetching promotion ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion details'
    });
  }
});

// Create new promotion
router.post('/', isAdmin, async (req, res) => {
  try {
    const promoData = req.body;
    
    // Validate promo data
    const validation = validatePromoData(promoData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Check if code already exists
    const existingPromo = await db.select()
      .from(promos)
      .where(eq(promos.code, promoData.code));
    
    if (existingPromo.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code already exists'
      });
    }
    
    const promoId = uuidv4();
    
    // Create the promotion
    await db.insert(promos).values({
      id: promoId,
      code: promoData.code,
      title: promoData.description || `${promoData.code} Promotion`,
      description: promoData.description || '',
      discountType: promoData.type,
      discountValue: promoData.value,
      startDate: new Date(),
      endDate: promoData.expiryDate ? new Date(promoData.expiryDate) : null,
      maxUses: promoData.maxUses || null,
      currentUses: 0,
      isActive: promoData.status === 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // If clinic restriction is specified, create the association
    if (promoData.clinicId) {
      await db.insert(promoClinics).values({
        id: uuidv4(),
        promoId: promoId,
        clinicId: promoData.clinicId,
        createdAt: new Date()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: { id: promoId }
    });
  } catch (error) {
    logger.error('Error creating promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotion'
    });
  }
});

// Update promotion
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promoData = req.body;
    
    // Validate promo data
    const validation = validatePromoData(promoData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Check if the promotion exists
    const [existingPromo] = await db.select()
      .from(promos)
      .where(eq(promos.id, id));
    
    if (!existingPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    // Check if updated code already exists (if changing the code)
    if (promoData.code !== existingPromo.code) {
      const codeExists = await db.select()
        .from(promos)
        .where(and(
          eq(promos.code, promoData.code),
          sql`id != ${id}`
        ));
      
      if (codeExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Promotion code already exists'
        });
      }
    }
    
    // Update the promotion
    await db.update(promos)
      .set({
        code: promoData.code,
        title: promoData.description || `${promoData.code} Promotion`,
        description: promoData.description || '',
        discountType: promoData.type,
        discountValue: promoData.value,
        endDate: promoData.expiryDate ? new Date(promoData.expiryDate) : null,
        maxUses: promoData.maxUses || null,
        isActive: promoData.status === 'active',
        updatedAt: new Date()
      })
      .where(eq(promos.id, id));
    
    // Update clinic associations if needed
    if (promoData.clinicId) {
      // First, remove existing associations
      await db.delete(promoClinics)
        .where(eq(promoClinics.promoId, id));
      
      // Then add the new association
      await db.insert(promoClinics).values({
        id: uuidv4(),
        promoId: id,
        clinicId: promoData.clinicId,
        createdAt: new Date()
      });
    }
    
    res.json({
      success: true,
      message: 'Promotion updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating promotion ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotion'
    });
  }
});

// Delete promotion (or deactivate)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the promotion exists
    const [existingPromo] = await db.select()
      .from(promos)
      .where(eq(promos.id, id));
    
    if (!existingPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    // Check if this promo has been used in quotes
    const usageStats = await db.select({
      count: count()
    })
    .from('quotes')
    .where(eq(sql`quotes.promo_id`, id));
    
    const hasBeenUsed = usageStats[0]?.count > 0;
    
    if (hasBeenUsed) {
      // If used, just deactivate instead of deleting to maintain referential integrity
      await db.update(promos)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(promos.id, id));
      
      return res.json({
        success: true,
        message: 'Promotion has been used in quotes and has been deactivated instead of deleted'
      });
    }
    
    // If never used, we can safely delete it
    // First, remove clinic associations
    await db.delete(promoClinics)
      .where(eq(promoClinics.promoId, id));
    
    // Then delete the promotion
    await db.delete(promos)
      .where(eq(promos.id, id));
    
    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting promotion ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promotion'
    });
  }
});

// Get promotion statistics
router.get('/stats/overview', isAdmin, async (req, res) => {
  try {
    // Count active promotions
    const activePromosQuery = await db.select({
      count: count()
    })
    .from(promos)
    .where(and(
      eq(promos.isActive, true),
      or(isNull(promos.endDate), gte(promos.endDate, new Date()))
    ));
    
    const activePromosCount = activePromosQuery[0]?.count || 0;
    
    // Find most used promotion
    const mostUsedPromoQuery = await db.select({
      promoId: sql`quotes.promo_id`,
      code: promos.code,
      title: promos.title,
      usageCount: count(sql`quotes.id`).as('usage_count')
    })
    .from('quotes')
    .leftJoin(promos, eq(sql`quotes.promo_id`, promos.id))
    .where(sql`quotes.promo_id is not null`)
    .groupBy(sql`quotes.promo_id`, promos.code, promos.title)
    .orderBy(desc(sql`usage_count`))
    .limit(1);
    
    const mostUsedPromo = mostUsedPromoQuery.length > 0 ? mostUsedPromoQuery[0] : null;
    
    // Calculate total discount amount (optional)
    const totalDiscountQuery = await db.select({
      total: sql`sum(quotes.discount)`.as('total_discount')
    })
    .from('quotes')
    .where(sql`quotes.promo_id is not null`);
    
    const totalDiscount = totalDiscountQuery[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        activePromotions: activePromosCount,
        mostUsedPromo,
        totalDiscount
      }
    });
  } catch (error) {
    logger.error('Error fetching promotion statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion statistics'
    });
  }
});

// Export promotions as CSV
router.get('/export/csv', isAdmin, async (req, res) => {
  try {
    // Get all promotions with usage statistics
    const promotions = await db.select({
      ...promos,
      usageCount: count(sql`distinct quotes.id`).as('usage_count'),
    })
    .from(promos)
    .leftJoin('quotes', eq(promos.id, sql`quotes.promo_id`))
    .groupBy(promos.id)
    .orderBy(desc(promos.createdAt));
    
    // Create CSV content
    let csvContent = 'Code,Title,Type,Value,Status,Start Date,End Date,Max Uses,Current Uses,Usage Count,Created At,Updated At\n';
    
    promotions.forEach(promo => {
      const isActive = promo.isActive && (!promo.endDate || new Date(promo.endDate) >= new Date()) ? 'Active' : 'Inactive';
      const row = [
        promo.code,
        promo.title,
        promo.discountType,
        promo.discountValue,
        isActive,
        promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
        promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
        promo.maxUses || 'Unlimited',
        promo.currentUses,
        promo.usageCount,
        new Date(promo.createdAt).toISOString(),
        new Date(promo.updatedAt).toISOString()
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="promotions_export.csv"');
    
    res.send(csvContent);
  } catch (error) {
    logger.error('Error exporting promotions to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export promotions to CSV'
    });
  }
});

export default router;