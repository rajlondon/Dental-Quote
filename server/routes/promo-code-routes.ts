/**
 * Promo Code API Routes
 * Handles validation and application of promo codes
 */
import { Router, Request, Response } from 'express';
import { promoCodeService } from '../services/promo-code-service';

export const promoCodeRouter = Router();

// Validate a promo code with GET endpoint
promoCodeRouter.get('/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid promo code format'
      });
    }

    const validationResult = await promoCodeService.validateCode(code);
    
    // If this is a package code, include package data
    let packageData = null;
    if (validationResult.valid && validationResult.type === 'package') {
      const packagePromo = await promoCodeService.getPackagePromoCode(code);
      if (packagePromo && packagePromo.packageData) {
        packageData = packagePromo.packageData;
      }
    }
    
    // Calculate a sample discount amount for display purposes
    let sampleDiscountAmount = null;
    if (validationResult.valid && validationResult.discountType && validationResult.discountValue) {
      if (validationResult.discountType === 'percentage') {
        sampleDiscountAmount = `${validationResult.discountValue}%`;
      } else if (validationResult.discountType === 'fixed_amount') {
        sampleDiscountAmount = `£${validationResult.discountValue}`;
      }
    }
    
    return res.status(200).json({
      success: true,
      valid: validationResult.valid,
      code: validationResult.code,
      type: validationResult.type || 'discount',
      isPackage: validationResult.type === 'package',
      discountType: validationResult.discountType,
      discountValue: validationResult.discountValue,
      sampleDiscountAmount,
      packageData,
      message: validationResult.valid 
        ? `Successfully validated promo code: ${validationResult.code}` 
        : validationResult.error,
      clinicId: validationResult.clinicId
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error validating promo code'
    });
  }
});

// Validate a promo code with POST
promoCodeRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid promo code format'
      });
    }

    const validationResult = await promoCodeService.validateCode(code);
    
    return res.status(200).json({
      success: true,
      valid: validationResult.valid,
      code: validationResult.code,
      type: validationResult.type || 'discount',
      discountType: validationResult.discountType,
      discountValue: validationResult.discountValue,
      message: validationResult.valid 
        ? `Successfully validated promo code: ${validationResult.code}` 
        : validationResult.error
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error validating promo code'
    });
  }
});

// Apply promo code and calculate discount
promoCodeRouter.post('/apply', async (req: Request, res: Response) => {
  try {
    const { code, treatmentIds } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid promo code format' });
    }
    
    if (!Array.isArray(treatmentIds)) {
      return res.status(400).json({ error: 'Treatment IDs must be an array' });
    }
    
    // First validate the code
    const validationResult = await promoCodeService.validateCode(code);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        valid: false,
        error: validationResult.error
      });
    }
    
    // If this is a package code, redirect to the package endpoint
    if (validationResult.type === 'package') {
      return res.status(400).json({
        valid: false,
        error: 'This is a package promo code. Please use the /apply-package endpoint.'
      });
    }
    
    // Then calculate the discount
    const calculationResult = await promoCodeService.calculateDiscount({
      code: validationResult.code,
      discountType: validationResult.discountType,
      discountValue: validationResult.discountValue,
      treatmentIds
    });
    
    // Return the discount information
    return res.json({
      code: validationResult.code,
      type: 'discount',
      discountType: validationResult.discountType,
      discountValue: validationResult.discountValue,
      discountAmount: calculationResult.discountAmount,
      originalTotal: calculationResult.originalTotal,
      newTotal: calculationResult.newTotal
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return res.status(500).json({ error: 'Failed to apply promo code' });
  }
});

// Apply a package promo code
promoCodeRouter.post('/apply-package', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Promo code is required' });
    }
    
    // Get the package promo code
    const packagePromo = await promoCodeService.getPackagePromoCode(code);
    
    if (!packagePromo) {
      return res.status(404).json({ error: 'Invalid package promo code' });
    }
    
    if (packagePromo.type !== 'package' || !packagePromo.packageData) {
      return res.status(400).json({ error: 'This is not a package promo code' });
    }
    
    // Fetch complete treatment data for each treatment in the package
    const packageTreatments = await promoCodeService.getPackageTreatments(packagePromo.packageData.treatments);
    
    // Return the package data with full treatment information
    res.json({
      code: packagePromo.code,
      type: 'package',
      packageName: packagePromo.packageData.name,
      packageDescription: packagePromo.packageData.description,
      treatments: packageTreatments,
      originalPrice: packagePromo.packageData.originalPrice,
      packagePrice: packagePromo.packageData.packagePrice,
      clinicId: packagePromo.clinicId,
      savings: packagePromo.packageData.originalPrice - packagePromo.packageData.packagePrice,
      attractions: packagePromo.packageData.attractions || [],
      additionalServices: packagePromo.packageData.additionalServices || []
    });
  } catch (error) {
    console.error('Error applying package promo code:', error);
    res.status(500).json({ error: 'Failed to apply package promo code' });
  }
});

// Calculate discount for a price
promoCodeRouter.post('/calculate-discount', async (req: Request, res: Response) => {
  try {
    const { code, price } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid promo code format'
      });
    }
    
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price value'
      });
    }
    
    // Validate the promo code
    const validationResult = await promoCodeService.validateCode(code);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: validationResult.error
      });
    }
    
    // Calculate discount amount based on discount type
    let discountAmount = 0;
    const originalPrice = Number(price);
    
    if (validationResult.discountType === 'percentage') {
      discountAmount = originalPrice * (validationResult.discountValue / 100);
    } else if (validationResult.discountType === 'fixed_amount') {
      discountAmount = Math.min(originalPrice, validationResult.discountValue);
    }
    
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    
    return res.status(200).json({
      success: true,
      valid: true,
      code: validationResult.code,
      type: validationResult.type || 'discount',
      message: `Successfully applied promo code: ${validationResult.code}`,
      title: validationResult.title,
      discountType: validationResult.discountType,
      discountValue: validationResult.discountValue,
      originalPrice,
      discountAmount,
      finalPrice
    });
  } catch (error) {
    console.error('Error calculating discount:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error calculating discount'
    });
  }
});

export default promoCodeRouter;