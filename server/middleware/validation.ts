import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../models/custom-errors';
import logger from '../utils/logger';

/**
 * Middleware to validate request data using express-validator
 */
export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    return next(new ValidationError('Validation error', errors.array()));
  }
  
  next();
}