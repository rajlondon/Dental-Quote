import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Type declaration for CSRF token
declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}

// Extended Error interface for CSRF errors
interface CsrfError extends Error {
  code?: string;
}

// Configure CSRF protection
export const csrfProtection = csrf({ 
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF error handler
export const handleCsrfError = (err: CsrfError, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle CSRF token errors
    return res.status(403).json({
      error: 'Invalid or missing CSRF token. Please refresh the page and try again.'
    });
  }
  next(err);
};

// Generate CSRF token endpoint
export const csrfTokenHandler = (req: Request, res: Response) => {
  return res.json({ csrfToken: req.csrfToken() });
};

// Configure rate limiting for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// More strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login/registration attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts from this IP, please try again after an hour'
  }
});

// Rate limit for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many file uploads from this IP, please try again after an hour'
  }
});