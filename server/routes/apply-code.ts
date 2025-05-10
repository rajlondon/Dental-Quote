import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import logger from '../utils/logger';
import { DiscountType } from '@shared/schema';
import { validatePromoCode, canApplyPromoToQuote, applyPromoToQuote, removePromoFromQuote, findPromoById } from '../utils/promo-utils';
import { z } from 'zod';
import { BadRequestError, NotFoundError } from '../models/custom-errors';
import { trackPromoCodeApplied, trackPromoCodeRemoved } from '../utils/analytics';

const router = express.Router();

/**
 * Validate a promo code without applying it
 */
router.post('/api/promo/validate', 
  body('code').isString().notEmpty().withMessage('Promo code is required'),
  validate,
  async (req, res, next) => {
    try {
      const { code } = req.body;
      logger.info(`Validating promo code: ${code}`);
      
      const validationResult = await validatePromoCode(code);
      
      return res.json({
        success: validationResult.isValid,
        message: validationResult.message,
        data: validationResult.promo || null
      });
    } catch (error) {
      logger.error('Error validating promo code:', error);
      next(error);
    }
  }
);

/**
 * Check if a promo code can be applied to a specific quote
 */
router.post('/api/promo/can-apply/:quoteId',
  param('quoteId').isInt().withMessage('Quote ID must be an integer'),
  body('code').isString().notEmpty().withMessage('Promo code is required'),
  validate,
  async (req, res, next) => {
    try {
      const { code } = req.body;
      const quoteId = parseInt(req.params.quoteId);
      
      logger.info(`Checking if promo code ${code} can be applied to quote ${quoteId}`);
      
      const canApplyResult = await canApplyPromoToQuote(code, quoteId);
      
      return res.json({
        success: canApplyResult.canApply,
        message: canApplyResult.message,
        data: canApplyResult.promo || null
      });
    } catch (error) {
      logger.error('Error checking if promo can be applied:', error);
      next(error);
    }
  }
);

/**
 * Apply a promo code to a quote
 */
router.post('/api/promo/apply/:quoteId',
  param('quoteId').isInt().withMessage('Quote ID must be an integer'),
  body('code').isString().notEmpty().withMessage('Promo code is required'),
  body('calculatedDiscount').optional(),
  validate,
  async (req, res, next) => {
    try {
      const { code, calculatedDiscount } = req.body;
      const quoteId = parseInt(req.params.quoteId);
      
      logger.info(`Applying promo code ${code} to quote ${quoteId}`);
      
      const result = await applyPromoToQuote(code, quoteId, calculatedDiscount);
      
      // Track this event for analytics
      if (result.success && result.promoDetails) {
        trackPromoCodeApplied({
          promoId: result.promoDetails.id,
          promoCode: result.promoDetails.code,
          quoteId,
          userId: req.user?.id,
          discountAmount: calculatedDiscount?.discountAmount,
          discountType: result.promoDetails.discountType,
          referrer: req.headers.referer || undefined,
          metadata: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            source: req.body.source || 'manual'
          }
        });
      }
      
      return res.json({
        success: result.success,
        message: result.message,
        data: result.quote || null,
        promoDetails: result.promoDetails || null
      });
    } catch (error) {
      logger.error('Error applying promo code:', error);
      next(error);
    }
  }
);

/**
 * Remove a promo code from a quote
 */
router.post('/api/promo/remove/:quoteId',
  param('quoteId').isInt().withMessage('Quote ID must be an integer'),
  validate,
  async (req, res, next) => {
    try {
      const quoteId = parseInt(req.params.quoteId);
      
      logger.info(`Removing promo from quote ${quoteId}`);
      
      // Get the quote's promo before removing it (for analytics tracking)
      let promoId = req.body.promoId;
      let promoCode = req.body.promoCode;
      
      const result = await removePromoFromQuote(quoteId);
      
      // Track this event for analytics if removal was successful
      if (result.success && (promoId || promoCode)) {
        trackPromoCodeRemoved({
          promoId: promoId || 'unknown',
          promoCode: promoCode || 'unknown',
          quoteId,
          userId: req.user?.id,
          referrer: req.headers.referer || undefined,
          metadata: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            source: req.body.source || 'manual',
            reason: req.body.reason || 'manual_removal'
          }
        });
      }
      
      return res.json({
        success: result.success,
        message: result.message,
        data: result.quote || null
      });
    } catch (error) {
      logger.error('Error removing promo code:', error);
      next(error);
    }
  }
);

export default router;