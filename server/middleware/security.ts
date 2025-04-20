import { Request, Response, NextFunction } from "express";
import csrf from "csurf";
import rateLimit from "express-rate-limit";

// CSRF protection middleware
export const csrfProtection = csrf({ cookie: { sameSite: "lax" } });

// CSRF error handler
export function handleCsrfError(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle CSRF token errors
    res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
    });
  } else {
    next(err);
  }
}

// CSRF token handler
export function csrfTokenHandler(req: Request, res: Response) {
  res.json({ csrfToken: req.csrfToken() });
}

// API rate limiter - 100 requests per minute per IP
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute'
  }
});

// Authentication rate limiter - 10 login attempts per 15 minutes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  }
});

// File upload rate limiter - 20 uploads per hour
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again after an hour'
  }
});