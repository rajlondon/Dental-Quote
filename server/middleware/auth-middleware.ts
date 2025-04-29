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
 * This will check if the user is authenticated and has role = 'clinic_staff' or 'clinic'
 */
export const isClinic = (req: Request, res: Response, next: NextFunction) => {
  // Debug session information
  console.log("Auth check - isClinic middleware");
  console.log("User authenticated:", req.isAuthenticated());
  console.log("User role:", req.user?.role);
  
  // Accept both 'clinic_staff' and 'clinic' roles for backward compatibility
  if (req.isAuthenticated() && (req.user?.role === 'clinic_staff' || req.user?.role === 'clinic')) {
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
 * This will check if the user is authenticated and has role = 'admin' or 'clinic' or 'clinic_staff'
 */
export const isAdminOrClinic = (req: Request, res: Response, next: NextFunction) => {
  // Debug session information
  console.log("Auth check - isAdminOrClinic middleware");
  console.log("User authenticated:", req.isAuthenticated());
  console.log("User role:", req.user?.role);
  
  // Accept 'admin', 'clinic_staff' and 'clinic' roles for backward compatibility
  if (req.isAuthenticated() && 
      (req.user?.role === 'admin' || 
       req.user?.role === 'clinic' || 
       req.user?.role === 'clinic_staff')) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: req.isAuthenticated()
      ? 'Insufficient permissions'
      : 'Not authenticated'
  });
};