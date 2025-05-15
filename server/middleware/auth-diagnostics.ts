/**
 * Authentication Diagnostics Middleware
 * 
 * This middleware collects detailed diagnostics about authentication state
 * to help troubleshoot session persistence issues.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Add diagnostic information for authentication requests
 */
export function authDiagnosticsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only collect diagnostics for auth-related endpoints and root routes
  const isAuthRoute = req.path.includes('/auth/') || req.path === '/';
  
  if (isAuthRoute) {
    const sessionInfo = {
      path: req.path,
      method: req.method,
      authenticated: req.isAuthenticated(),
      userId: req.user?.id,
      userRole: req.user?.role,
      hasCookieHeader: !!req.headers.cookie,
      cookieLength: req.headers.cookie?.length,
      cookiePreview: req.headers.cookie?.substring(0, 40) + '...' || 'No cookies',
      sessionID: req.sessionID,
      sessionCreated: !!req.session
    };
    
    console.log('====== AUTH REQUEST DIAGNOSTICS ======');
    console.log(`Path: ${sessionInfo.path}`);
    console.log(`Method: ${sessionInfo.method}`);
    console.log(`Authenticated: ${sessionInfo.authenticated}`);
    console.log(`User ID: ${sessionInfo.userId}`);
    console.log(`User Role: ${sessionInfo.userRole}`);
    console.log(`Has Cookie Header: ${sessionInfo.hasCookieHeader}`);
    console.log(`Cookie Length: ${sessionInfo.cookieLength}`);
    console.log(`Cookie Preview: ${sessionInfo.cookiePreview}`);
    console.log(`Session ID: ${sessionInfo.sessionID}`);
    console.log(`Session Created: ${sessionInfo.sessionCreated}`);
    console.log('======================================');
    
    // Add timing information to all responses for auth routes
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`Auth request to ${req.path} completed in ${duration}ms with status ${res.statusCode}`);
    });
  }
  
  next();
}