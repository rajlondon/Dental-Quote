import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the user is authenticated
 * This will check for an authenticated session with Passport.js
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
};

/**
 * Middleware to check if the user has admin role
 * This will check if the user is authenticated and has role = 'admin'
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: req.isAuthenticated()
      ? 'Insufficient permissions'
      : 'Not authenticated'
  });
};

/**
 * Middleware to check if the user has clinic role
 * This will check if the user is authenticated and has role = 'clinic'
 */
export const isClinic = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === 'clinic') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: req.isAuthenticated()
      ? 'Insufficient permissions'
      : 'Not authenticated'
  });
};

/**
 * Middleware to check if the user is a patient
 * This will check if the user is authenticated and has role = 'patient'
 */
export const isPatient = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === 'patient') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: req.isAuthenticated()
      ? 'Insufficient permissions'
      : 'Not authenticated'
  });
};

/**
 * Middleware to check if the user is admin or clinic
 * This will check if the user is authenticated and has role = 'admin' or 'clinic'
 */
export const isAdminOrClinic = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user?.role === 'admin' || req.user?.role === 'clinic')) {
    return next();
  }

  res.status(403).json({
    success: false,
    message: req.isAuthenticated()
      ? 'Insufficient permissions'
      : 'Not authenticated'
  });
};

export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  console.log('Auth middleware - checking session for path:', req.path);
  console.log('Auth middleware - Session exists:', !!req.session);
  console.log('Auth middleware - Session user:', req.session?.user?.email);

  if (!req.session?.user) {
    console.log('Auth middleware - No user in session, returning 401');
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.user = req.session.user;
  console.log('Auth middleware - User authenticated:', req.user.email, 'for path:', req.path);
  next();
};