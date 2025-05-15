/**
 * Authentication Utilities
 * 
 * This module provides centralized authentication utilities for consistent session handling
 * across different parts of the application.
 */

import { Request, Response } from 'express';
import { User } from '@shared/schema';

/**
 * Sets up a consistent session configuration across all authentication endpoints
 */
export function configureSessionForPersistence(req: Request): void {
  // Set a longer cookie expiry for better persistence (7 days)
  req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
  
  // Configure cookie security settings
  req.session.cookie.secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  req.session.cookie.httpOnly = true;
  req.session.cookie.sameSite = 'lax';
  
  // For development/testing to ensure cookies persist without HTTPS
  if (process.env.NODE_ENV !== 'production') {
    req.session.cookie.secure = false;
  }
  
  // Log session configuration for debugging
  console.log('Session configured:', {
    maxAge: req.session.cookie.maxAge,
    secure: req.session.cookie.secure,
    httpOnly: req.session.cookie.httpOnly,
    sameSite: req.session.cookie.sameSite,
    path: req.session.cookie.path,
    domain: req.session.cookie.domain,
  });
}

/**
 * Sets role-specific cookies for better front-end experience
 */
export function setRoleSpecificCookies(req: Request, res: Response, user: User): void {
  if (user.role === 'clinic_staff') {
    res.cookie('is_clinic_staff', 'true', { 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: false, // Make accessible to client JS
      path: '/',
      sameSite: 'lax',
      // Don't set secure in development for testing
      secure: process.env.NODE_ENV === 'production'
    });

    res.cookie('clinic_session_active', 'true', {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  if (user.role === 'admin') {
    res.cookie('is_admin', 'true', { 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: false, // Make accessible to client JS
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
}

/**
 * Clear all authentication cookies with multiple options to ensure proper cleanup
 */
export function clearAllAuthCookies(res: Response): void {
  const cookieOptions = { path: '/', sameSite: 'lax' as const };
  const secureCookieOptions = { ...cookieOptions, secure: true };
  const insecureCookieOptions = { ...cookieOptions, secure: false };
  
  // List of cookies to clear
  const cookiesToClear = [
    'is_clinic_staff',
    'clinic_session_active',
    'is_admin',
    'no_promo_redirect',
    'disable_quote_redirect',
    'no_special_offer_redirect',
    'connect.sid'  // Clear the session cookie explicitly
  ];
  
  // Clear each cookie with multiple option combinations for thorough cleanup
  cookiesToClear.forEach(cookieName => {
    res.clearCookie(cookieName, cookieOptions);
    res.clearCookie(cookieName, secureCookieOptions);
    res.clearCookie(cookieName, insecureCookieOptions);
    res.clearCookie(cookieName, { path: '/' });
    res.clearCookie(cookieName); // Default options
  });
}

/**
 * Helper to return user's type & ID for analytics/logging
 */
export function getUserIdentifier(req: Request): string {
  if (!req.isAuthenticated() || !req.user) {
    return 'unauthenticated';
  }
  return `${req.user.role}:${req.user.id}`;
}