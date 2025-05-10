import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import logger from '../utils/logger';

/**
 * Express middleware to validate request using express-validator
 * This middleware should be used after defining validation rules
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};