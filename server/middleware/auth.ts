import { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure user is authenticated
 */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
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
 * Middleware to check if user has required role
 * @param roles - Single role or array of roles that are allowed
 */
export function ensureRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure user is authenticated
    if (!req.isAuthenticated()) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please log in to access this resource."
        });
      }
      return res.redirect("/portal-login");
    }
    
    // Check if user has one of the required roles
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this resource."
        });
      }
      
      // For non-API requests, redirect to access denied page or home
      return res.status(403).send(`
        <html>
          <head>
            <title>Access Denied</title>
            <style>
              body { font-family: sans-serif; padding: 2rem; text-align: center; }
              h1 { color: #e63946; }
              a { color: #1d3557; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #1d3557; border-radius: 4px; }
              a:hover { background-color: #1d3557; color: white; }
            </style>
          </head>
          <body>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this resource.</p>
            <p>This area requires ${requiredRoles.join(' or ')} access.</p>
            <div style="margin-top: 2rem;">
              <a href="/">Return to Home</a>
            </div>
          </body>
        </html>
      `);
    }
    
    // User has required role, proceed
    next();
  };
}

/**
 * Middleware to check if accessing own resources
 * Useful for operations where users should only access their own data
 */
export function ensureOwnResources(paramIdField: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip for admins
    if (req.user?.role === 'admin') {
      return next();
    }
    
    // Get ID from params
    const resourceId = parseInt(req.params[paramIdField], 10);
    
    // For clinic staff, check if they're accessing their clinic's resources
    if (req.user?.role === 'clinic_staff' && req.user.clinicId) {
      // This would need more logic based on your data model to ensure proper access
      // For now we'll just proceed, but in a real app we'd check the resource's clinicId
      return next();
    }
    
    // For regular users, check if they're accessing their own resources
    if (req.user?.id === resourceId) {
      return next();
    }
    
    // Not authorized
    return res.status(403).json({
      success: false,
      message: "You don't have permission to access this resource."
    });
  };
}