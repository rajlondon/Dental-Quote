/**
 * Authentication Utilities
 * 
 * This module provides standardized authentication functions and utilities
 * for consistent authentication behavior across all portals.
 * 
 * Features:
 * - Standardized session configuration
 * - Enhanced session persistence
 * - Role-based authentication
 * - Consistent login/logout handling
 * - Authentication diagnostics
 */

import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { log } from '../vite';

// Session configuration - Standardized across all portals
export const getSessionConfig = (): session.SessionOptions => {
  // Basic security check for required environment variable
  if (!process.env.SESSION_SECRET) {
    log('⚠️ SESSION_SECRET is not defined. Using a fallback secret (NOT secure for production)', 'auth');
  }

  // Calculate session expiry (7 days)
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  
  return {
    name: 'mydentalfly.sid', // Standardized session cookie name across portals
    secret: process.env.SESSION_SECRET || 'mydentalfly-session-secret-fallback',
    resave: false,
    saveUninitialized: false, // Don't create session until user logs in
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure in production only
      httpOnly: true, // Not accessible via JavaScript
      sameSite: 'lax', // Balances security with usability
      maxAge: SEVEN_DAYS, // Longer session expiry for better UX
      path: '/', // Ensure cookie is available on all paths
    },
    rolling: true, // Refresh expiration on activity
  };
};

// Authentication middleware - Use for protected routes
export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  // Log detailed diagnostic information for troubleshooting
  logAuthDiagnostics(req, 'REQUIRE_AUTH');
  
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Helper to log detailed authentication diagnostics
export const logAuthDiagnostics = (req: Request, source = 'AUTH') => {
  log(`====== AUTH REQUEST DIAGNOSTICS ======`, source);
  log(`Path: ${req.path}`, source);
  log(`Method: ${req.method}`, source);
  log(`Authenticated: ${req.isAuthenticated?.() || false}`, source);
  log(`User ID: ${req.user?.id}`, source);
  log(`User Role: ${req.user?.role}`, source);
  
  // Analyze cookies
  const hasCookieHeader = Boolean(req.headers.cookie);
  log(`Has Cookie Header: ${hasCookieHeader}`, source);
  if (hasCookieHeader && req.headers.cookie) {
    log(`Cookie Length: ${req.headers.cookie.length}`, source);
    log(`Cookie Preview: ${req.headers.cookie.substring(0, 40)}...`, source);
  }
  
  // Session info
  if (req.session) {
    log(`Session ID: ${req.sessionID}`, source);
    log(`Session Created: ${Boolean(req.session)}`, source);
  } else {
    log(`Session Missing`, source);
  }
  log(`======================================`, source);
};

// Helper to safely serialize user object for session
export const serializeUserForSession = (user: any) => {
  // Only include essential fields for session storage
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
};

// Helper to handle login response consistently across different portals
export const sendLoginResponse = (req: Request, res: Response, user: any) => {
  // Remove password and other sensitive fields
  const sanitizedUser = { ...user };
  if (sanitizedUser.password) delete sanitizedUser.password;
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: sanitizedUser
  });
};

// Helper to handle logout consistently
export const handleLogout = (req: Request, res: Response) => {
  // Get user info before logout for logging
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  req.logout((err) => {
    if (err) {
      log(`Logout error for user ${userId}: ${err.message}`, 'auth');
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    
    // Destroy session completely
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        log(`Session destruction error: ${sessionErr.message}`, 'auth');
      }
      
      log(`User ${userId} (${userRole}) logged out successfully`, 'auth');
      
      // Clear cookie regardless of session destruction
      res.clearCookie('mydentalfly.sid');
      // Also clear the legacy cookie name
      res.clearCookie('connect.sid');
      
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  });
};

// Helper to configure session for better persistence
export const configureSessionForPersistence = (req: Request) => {
  if (req.session && req.session.cookie) {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    
    // Set longer session cookie expiry
    req.session.cookie.maxAge = SEVEN_DAYS;
    
    // Use secure cookies in production
    req.session.cookie.secure = process.env.NODE_ENV === 'production';
    
    // Ensure cookie is accessible across the entire domain
    req.session.cookie.path = '/';
    
    // Set proper SameSite attribute for modern browsers
    req.session.cookie.sameSite = 'lax';
    
    log(`Session configured for persistence (maxAge: ${SEVEN_DAYS}ms)`, 'auth');
  } else {
    log('Warning: Session or cookie object not available, could not configure persistence', 'auth');
  }
};

// Helper to set role-specific cookies to help with portal-specific auth
export const setRoleSpecificCookies = (req: Request, res: Response, user: any) => {
  const roleCookieExpiryDate = new Date();
  roleCookieExpiryDate.setDate(roleCookieExpiryDate.getDate() + 7); // 7 days
  
  // Use the role to set a specific cookie
  const role = user.role;
  
  if (role === 'admin') {
    res.cookie('admin_auth', 'true', {
      expires: roleCookieExpiryDate,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
    log(`Set admin_auth cookie for user ${user.id}`, 'auth');
  } else if (role === 'clinic_staff') {
    res.cookie('clinic_auth', 'true', {
      expires: roleCookieExpiryDate,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
    log(`Set clinic_auth cookie for user ${user.id}`, 'auth');
  } else if (role === 'patient') {
    res.cookie('patient_auth', 'true', {
      expires: roleCookieExpiryDate,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
    log(`Set patient_auth cookie for user ${user.id}`, 'auth');
  }
  
  // Also set a general auth cookie for global auth checks
  res.cookie('authenticated', 'true', {
    expires: roleCookieExpiryDate,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax'
  });
};

// Helper to clear all auth-related cookies
export const clearAllAuthCookies = (res: Response) => {
  // Clear all possible auth cookies
  res.clearCookie('mydentalfly.sid');
  res.clearCookie('connect.sid'); // Legacy cookie name
  res.clearCookie('admin_auth');
  res.clearCookie('clinic_auth');
  res.clearCookie('patient_auth');
  res.clearCookie('authenticated');
  
  log('All authentication cookies cleared', 'auth');
};

// Helper to get user identifier for consistent logging
export const getUserIdentifier = (user: any): string => {
  if (!user) return 'unknown';
  
  return `${user.id} (${user.role})`;
};

// Middleware to ensure authentication for specific user roles
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // Then check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    
    next();
  };
};