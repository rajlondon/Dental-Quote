import { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure user is logged in
 */
export function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: "Authentication required" });
}

/**
 * Middleware to ensure user has specific role
 */
export function ensureRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // The user object is set by Passport during authentication
    const user = req.user as Express.User;
    
    if (user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${role}` 
      });
    }
    
    next();
  };
}