import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { 
  specialOffers, 
  treatmentPackages, 
  packageTreatments, 
  packageServices,
  promoCodeUsage,
  clinics,
  insertSpecialOfferSchema,
  insertTreatmentPackageSchema,
  type SpecialOffer,
  type TreatmentPackage 
} from '@shared/schema';

const router = Router();

// Get all special offers
router.get('/special-offers', async (req, res) => {
  try {
    const offers = await db
      .select()
      .from(specialOffers)
      .orderBy(desc(specialOffers.createdAt));
    
    res.json(offers);
  } catch (error) {
    console.error('Error fetching special offers:', error);
    res.status(500).json({ error: 'Failed to fetch special offers' });
  }
});

// Get special offers by clinic
router.get('/clinics/:clinicId/special-offers', async (req, res) => {
  try {
    const clinicId = parseInt(req.params.clinicId);
    
    const offers = await db
      .select()
      .from(specialOffers)
      .where(and(
        eq(specialOffers.clinicId, clinicId),
        eq(specialOffers.isActive, true)
      ))
      .orderBy(desc(specialOffers.createdAt));
    
    res.json(offers);
  } catch (error) {
    console.error('Error fetching clinic special offers:', error);
    res.status(500).json({ error: 'Failed to fetch clinic special offers' });
  }
});

// Create special offer
router.post('/special-offers', async (req, res) => {
  try {
    const validatedData = insertSpecialOfferSchema.parse(req.body);
    
    // Check if clinic exists
    const clinic = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, validatedData.clinicId))
      .limit(1);
    
    if (clinic.length === 0) {
      return res.status(400).json({ error: 'Clinic not found' });
    }
    
    // Check if promo code already exists
    const existingOffer = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.promoCode, validatedData.promoCode))
      .limit(1);
    
    if (existingOffer.length > 0) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }
    
    const [newOffer] = await db
      .insert(specialOffers)
      .values({
        ...validatedData,
        expiryDate: new Date(validatedData.expiryDate),
      })
      .returning();
    
    res.status(201).json(newOffer);
  } catch (error) {
    console.error('Error creating special offer:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create special offer' });
  }
});

// Update special offer
router.put('/special-offers/:id', async (req, res) => {
  try {
    const offerId = parseInt(req.params.id);
    const validatedData = insertSpecialOfferSchema.parse(req.body);
    
    // Check if offer exists
    const existingOffer = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, offerId))
      .limit(1);
    
    if (existingOffer.length === 0) {
      return res.status(404).json({ error: 'Special offer not found' });
    }
    
    // Check if promo code already exists (excluding current offer)
    const duplicatePromoCode = await db
      .select()
      .from(specialOffers)
      .where(and(
        eq(specialOffers.promoCode, validatedData.promoCode),
        eq(specialOffers.id, offerId)
      ))
      .limit(1);
    
    if (duplicatePromoCode.length > 0 && duplicatePromoCode[0].id !== offerId) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }
    
    const [updatedOffer] = await db
      .update(specialOffers)
      .set({
        ...validatedData,
        expiryDate: new Date(validatedData.expiryDate),
        updatedAt: new Date(),
      })
      .where(eq(specialOffers.id, offerId))
      .returning();
    
    res.json(updatedOffer);
  } catch (error) {
    console.error('Error updating special offer:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update special offer' });
  }
});

// Delete special offer
router.delete('/special-offers/:id', async (req, res) => {
  try {
    const offerId = parseInt(req.params.id);
    
    // Check if offer exists
    const existingOffer = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, offerId))
      .limit(1);
    
    if (existingOffer.length === 0) {
      return res.status(404).json({ error: 'Special offer not found' });
    }
    
    await db
      .delete(specialOffers)
      .where(eq(specialOffers.id, offerId));
    
    res.json({ message: 'Special offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting special offer:', error);
    res.status(500).json({ error: 'Failed to delete special offer' });
  }
});

// Get all treatment packages
router.get('/treatment-packages', async (req, res) => {
  try {
    const packages = await db
      .select()
      .from(treatmentPackages)
      .orderBy(desc(treatmentPackages.createdAt));
    
    res.json(packages);
  } catch (error) {
    console.error('Error fetching treatment packages:', error);
    res.status(500).json({ error: 'Failed to fetch treatment packages' });
  }
});

// Get treatment packages by clinic
router.get('/clinics/:clinicId/treatment-packages', async (req, res) => {
  try {
    const clinicId = parseInt(req.params.clinicId);
    
    const packages = await db
      .select()
      .from(treatmentPackages)
      .where(and(
        eq(treatmentPackages.clinicId, clinicId),
        eq(treatmentPackages.isActive, true)
      ))
      .orderBy(desc(treatmentPackages.createdAt));
    
    res.json(packages);
  } catch (error) {
    console.error('Error fetching clinic treatment packages:', error);
    res.status(500).json({ error: 'Failed to fetch clinic treatment packages' });
  }
});

// Create treatment package
router.post('/treatment-packages', async (req, res) => {
  try {
    const { includedTreatments, includedServices, ...packageData } = req.body;
    const validatedPackageData = insertTreatmentPackageSchema.parse(packageData);
    
    // Check if clinic exists
    const clinic = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, validatedPackageData.clinicId))
      .limit(1);
    
    if (clinic.length === 0) {
      return res.status(400).json({ error: 'Clinic not found' });
    }
    
    // Check if promo code already exists
    const existingPackage = await db
      .select()
      .from(treatmentPackages)
      .where(eq(treatmentPackages.promoCode, validatedPackageData.promoCode))
      .limit(1);
    
    if (existingPackage.length > 0) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }
    
    // Create package
    const [newPackage] = await db
      .insert(treatmentPackages)
      .values({
        ...validatedPackageData,
        expiryDate: new Date(validatedPackageData.expiryDate),
      })
      .returning();
    
    // Add included treatments
    if (includedTreatments && includedTreatments.length > 0) {
      await db.insert(packageTreatments).values(
        includedTreatments.map((treatment: any) => ({
          packageId: newPackage.id,
          treatmentId: treatment.treatmentId,
          treatmentName: treatment.treatmentName,
          treatmentPrice: treatment.treatmentPrice,
          quantity: treatment.quantity,
        }))
      );
    }
    
    // Add included services
    if (includedServices && includedServices.length > 0) {
      await db.insert(packageServices).values(
        includedServices.map((service: any) => ({
          packageId: newPackage.id,
          serviceType: service.serviceType,
          name: service.name,
          description: service.description,
          quantity: service.quantity,
        }))
      );
    }
    
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Error creating treatment package:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create treatment package' });
  }
});

// Update treatment package
router.put('/treatment-packages/:id', async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    const { includedTreatments, includedServices, ...packageData } = req.body;
    const validatedPackageData = insertTreatmentPackageSchema.parse(packageData);
    
    // Check if package exists
    const existingPackage = await db
      .select()
      .from(treatmentPackages)
      .where(eq(treatmentPackages.id, packageId))
      .limit(1);
    
    if (existingPackage.length === 0) {
      return res.status(404).json({ error: 'Treatment package not found' });
    }
    
    // Update package
    const [updatedPackage] = await db
      .update(treatmentPackages)
      .set({
        ...validatedPackageData,
        expiryDate: new Date(validatedPackageData.expiryDate),
        updatedAt: new Date(),
      })
      .where(eq(treatmentPackages.id, packageId))
      .returning();
    
    // Delete existing treatments and services
    await db.delete(packageTreatments).where(eq(packageTreatments.packageId, packageId));
    await db.delete(packageServices).where(eq(packageServices.packageId, packageId));
    
    // Add updated treatments
    if (includedTreatments && includedTreatments.length > 0) {
      await db.insert(packageTreatments).values(
        includedTreatments.map((treatment: any) => ({
          packageId: packageId,
          treatmentId: treatment.treatmentId,
          treatmentName: treatment.treatmentName,
          treatmentPrice: treatment.treatmentPrice,
          quantity: treatment.quantity,
        }))
      );
    }
    
    // Add updated services
    if (includedServices && includedServices.length > 0) {
      await db.insert(packageServices).values(
        includedServices.map((service: any) => ({
          packageId: packageId,
          serviceType: service.serviceType,
          name: service.name,
          description: service.description,
          quantity: service.quantity,
        }))
      );
    }
    
    res.json(updatedPackage);
  } catch (error) {
    console.error('Error updating treatment package:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update treatment package' });
  }
});

// Delete treatment package
router.delete('/treatment-packages/:id', async (req, res) => {
  try {
    const packageId = parseInt(req.params.id);
    
    // Check if package exists
    const existingPackage = await db
      .select()
      .from(treatmentPackages)
      .where(eq(treatmentPackages.id, packageId))
      .limit(1);
    
    if (existingPackage.length === 0) {
      return res.status(404).json({ error: 'Treatment package not found' });
    }
    
    // Delete package (cascade will delete related treatments and services)
    await db
      .delete(treatmentPackages)
      .where(eq(treatmentPackages.id, packageId));
    
    res.json({ message: 'Treatment package deleted successfully' });
  } catch (error) {
    console.error('Error deleting treatment package:', error);
    res.status(500).json({ error: 'Failed to delete treatment package' });
  }
});

// Validate promo code
router.post('/validate-promo-code', async (req, res) => {
  try {
    const { promoCode, userId } = req.body;
    
    if (!promoCode) {
      return res.status(400).json({ error: 'Promo code is required' });
    }
    
    // Check special offers
    const specialOffer = await db
      .select()
      .from(specialOffers)
      .where(and(
        eq(specialOffers.promoCode, promoCode),
        eq(specialOffers.isActive, true)
      ))
      .limit(1);
    
    if (specialOffer.length > 0) {
      const offer = specialOffer[0];
      
      // Check if expired
      if (new Date(offer.expiryDate) < new Date()) {
        return res.status(400).json({ error: 'Promo code has expired' });
      }
      
      // Check usage limit
      if (offer.maxUses && offer.currentUses >= offer.maxUses) {
        return res.status(400).json({ error: 'Promo code usage limit reached' });
      }
      
      // Check if user already used this promo code
      if (userId) {
        const userUsage = await db
          .select()
          .from(promoCodeUsage)
          .where(and(
            eq(promoCodeUsage.userId, userId),
            eq(promoCodeUsage.promoCode, promoCode)
          ))
          .limit(1);
        
        if (userUsage.length > 0) {
          return res.status(400).json({ error: 'You have already used this promo code' });
        }
      }
      
      return res.json({
        valid: true,
        type: 'special_offer',
        offer: offer,
        discountType: offer.discountType,
        discountValue: parseFloat(offer.discountValue),
      });
    }
    
    // Check treatment packages
    const treatmentPackage = await db
      .select()
      .from(treatmentPackages)
      .where(and(
        eq(treatmentPackages.promoCode, promoCode),
        eq(treatmentPackages.isActive, true)
      ))
      .limit(1);
    
    if (treatmentPackage.length > 0) {
      const pkg = treatmentPackage[0];
      
      // Check if expired
      if (new Date(pkg.expiryDate) < new Date()) {
        return res.status(400).json({ error: 'Promo code has expired' });
      }
      
      // Check usage limit
      if (pkg.maxUses && pkg.currentUses >= pkg.maxUses) {
        return res.status(400).json({ error: 'Promo code usage limit reached' });
      }
      
      // Check if user already used this promo code
      if (userId) {
        const userUsage = await db
          .select()
          .from(promoCodeUsage)
          .where(and(
            eq(promoCodeUsage.userId, userId),
            eq(promoCodeUsage.promoCode, promoCode)
          ))
          .limit(1);
        
        if (userUsage.length > 0) {
          return res.status(400).json({ error: 'You have already used this promo code' });
        }
      }
      
      // Get package details with treatments and services
      const treatments = await db
        .select()
        .from(packageTreatments)
        .where(eq(packageTreatments.packageId, pkg.id));
      
      const services = await db
        .select()
        .from(packageServices)
        .where(eq(packageServices.packageId, pkg.id));
      
      return res.json({
        valid: true,
        type: 'treatment_package',
        package: {
          ...pkg,
          includedTreatments: treatments,
          includedServices: services,
        },
        packagePrice: parseFloat(pkg.totalPrice),
        originalPrice: parseFloat(pkg.originalPrice),
        savings: parseFloat(pkg.originalPrice) - parseFloat(pkg.totalPrice),
      });
    }
    
    return res.status(400).json({ error: 'Invalid promo code' });
    
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
});

// Apply promo code (record usage)
router.post('/apply-promo-code', async (req, res) => {
  try {
    const { promoCode, userId, quoteRequestId, discountAmount } = req.body;
    
    if (!promoCode || !userId || !discountAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the promo code
    let offerId = null;
    let packageId = null;
    
    const specialOffer = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.promoCode, promoCode))
      .limit(1);
    
    if (specialOffer.length > 0) {
      offerId = specialOffer[0].id;
      
      // Update usage count
      await db
        .update(specialOffers)
        .set({ 
          currentUses: specialOffer[0].currentUses + 1,
          updatedAt: new Date(),
        })
        .where(eq(specialOffers.id, offerId));
    } else {
      const treatmentPackage = await db
        .select()
        .from(treatmentPackages)
        .where(eq(treatmentPackages.promoCode, promoCode))
        .limit(1);
      
      if (treatmentPackage.length > 0) {
        packageId = treatmentPackage[0].id;
        
        // Update usage count
        await db
          .update(treatmentPackages)
          .set({ 
            currentUses: treatmentPackage[0].currentUses + 1,
            updatedAt: new Date(),
          })
          .where(eq(treatmentPackages.id, packageId));
      } else {
        return res.status(400).json({ error: 'Invalid promo code' });
      }
    }
    
    // Record usage
    await db.insert(promoCodeUsage).values({
      userId,
      promoCode,
      offerId,
      packageId,
      quoteRequestId,
      discountAmount,
    });
    
    res.json({ message: 'Promo code applied successfully' });
    
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ error: 'Failed to apply promo code' });
  }
});

export default router;