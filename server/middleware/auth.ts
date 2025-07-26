import { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure user is authenticated
 * Updated to work with both Passport.js and our memory auth sessions
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check Passport.js authentication (original method)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Check our memory auth sessions (new method)
  if (req.session && req.session.userId) {
    console.log('✅ AUTH MIDDLEWARE: Session authenticated for user:', req.session.userId);
    return next();
  }
  
  console.log('❌ AUTH MIDDLEWARE: No valid authentication found');
  
  // Respond based on requested content type
  if (req.headers.accept?.includes('application/json')) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in to access this resource."
    });
  }
  
  // Redirect to login page for non-API requests
  return res.redirect("/portal-login");
}

/**
 * Middleware to ensure user is authenticated (alias for compatibility)
 */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  return isAuthenticated(req, res, next);
}

/**
 * Middleware to ensure user has specific role
 */
export function ensureRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated first
    if (!req.isAuthenticated?.() && !req.session?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    // Check role from Passport.js user object
    if (req.user && (req.user as any).role === role) {
      return next();
    }
    
    // Check role from our memory auth session
    if (req.session && req.session.userRole === role) {
      console.log('✅ ROLE MIDDLEWARE: User has required role:', role);
      return next();
    }
    
    console.log('❌ ROLE MIDDLEWARE: User does not have required role:', role, 'User role:', req.session?.userRole);
    
    return res.status(403).json({
      success: false,
      message: `Access denied. ${role} role required.`
    });
  };
}
