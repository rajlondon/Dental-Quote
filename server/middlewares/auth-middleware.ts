import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../models/custom-errors';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return next(new UnauthorizedError('You must be logged in to access this resource'));
  }
  next();
}

/**
 * Middleware to check if user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}

/**
 * Middleware to check if user is a clinic
 */
export function isClinic(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user || req.session.user.role !== 'clinic') {
    return next(new ForbiddenError('Clinic access required'));
  }
  next();
}

/**
 * Middleware to check if user is a patient
 */
export function isPatient(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user || req.session.user.role !== 'patient') {
    return next(new ForbiddenError('Patient access required'));
  }
  next();
}

/**
 * Middleware to check if user is admin or clinic
 */
export function isAdminOrClinic(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return next(new UnauthorizedError('You must be logged in to access this resource'));
  }
  
  const role = req.session.user.role;
  if (role !== 'admin' && role !== 'clinic') {
    return next(new ForbiddenError('Admin or clinic access required'));
  }
  
  next();
}