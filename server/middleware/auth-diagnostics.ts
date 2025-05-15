/**
 * Authentication Diagnostics Middleware
 * 
 * This middleware helps diagnose authentication issues by logging
 * detailed information about the session, cookies, and authentication state.
 * It only logs for authentication-related routes to avoid excessive logging.
 */

import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

// Routes that should trigger auth diagnostics
const AUTH_ROUTES = [
  '/api/auth',
  '/api/login',
  '/api/logout',
  '/api/register',
  '/api/user',
  '/api/admin-login',
  '/api/clinic-login',
  '/api/patient-login',
  '/admin/login',
  '/clinic/login',
  '/patient/login'
];

// Check if a route is an auth-related route
const isAuthRoute = (path: string): boolean => {
  return AUTH_ROUTES.some(route => path.includes(route));
};

/**
 * Middleware to diagnose authentication issues
 * This middleware logs detailed information about session state, cookies, 
 * and authentication for auth-related routes
 */
export const authDiagnosticsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only log for authentication-related routes
  if (isAuthRoute(req.path)) {
    const originalEnd = res.end;
    const originalJson = res.json;
    
    log(`🔍 AUTH DIAGNOSTICS - REQUEST: ${req.method} ${req.path}`, 'auth-diagnostics');
    
    // Log session info
    if (req.session) {
      log(`SESSION ID: ${req.sessionID}`, 'auth-diagnostics');
      log(`SESSION DATA: ${JSON.stringify({
        // Safely show some session data without exposing sensitive info
        passport: req.session.passport ? 'present' : 'absent',
        userId: req.session.passport?.user,
        cookie: {
          originalMaxAge: req.session.cookie?.originalMaxAge,
          expires: req.session.cookie?.expires ? 
            new Date(req.session.cookie.expires).toISOString() : undefined,
          secure: req.session.cookie?.secure,
          httpOnly: req.session.cookie?.httpOnly,
          sameSite: req.session.cookie?.sameSite,
          path: req.session.cookie?.path
        }
      }, null, 2)}`, 'auth-diagnostics');
    } else {
      log('⚠️ NO SESSION FOUND', 'auth-diagnostics');
    }
    
    // Log cookie info
    if (req.headers.cookie) {
      log(`REQUEST COOKIES: ${req.headers.cookie}`, 'auth-diagnostics');
    } else {
      log('⚠️ NO COOKIES FOUND IN REQUEST', 'auth-diagnostics');
    }
    
    // Intercept response to log response info
    res.json = function(body) {
      log(`RESPONSE BODY: ${JSON.stringify(body, null, 2)}`, 'auth-diagnostics');
      return originalJson.apply(res, [body]);
    };
    
    // Save original end method
    // Simple override without complex type handling
    res.end = function() {
      // Log response cookies
      const cookies = res.getHeader('set-cookie');
      if (cookies) {
        log(`RESPONSE SET-COOKIE: ${JSON.stringify(cookies)}`, 'auth-diagnostics');
      }
      
      // Log authentication status
      log(`AUTH STATUS: ${req.isAuthenticated?.() ? 'Authenticated' : 'Not authenticated'}`, 'auth-diagnostics');
      
      // Log user info if authenticated
      if (req.isAuthenticated?.() && req.user) {
        log(`USER INFO: ${JSON.stringify({
          id: req.user.id,
          role: req.user.role,
          email: req.user.email
        })}`, 'auth-diagnostics');
      }
      
      log(`🔍 AUTH DIAGNOSTICS - RESPONSE: ${res.statusCode}`, 'auth-diagnostics');
      log('-----------------------------------------------------', 'auth-diagnostics');
      
      // Call original end with all arguments
      return originalEnd.apply(res, arguments);
    };
  }
  
  next();
};