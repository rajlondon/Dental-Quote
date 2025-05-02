/**
 * Global error handling middleware for Express
 */
import { Request, Response, NextFunction } from 'express';
import { logError, ErrorSeverity } from '../services/error-logger';

// Custom error class with status code and optional details
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indicates this is a known operational error
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle 404 errors - when no route is matched
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Central error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';
  
  // Determine error severity based on status code
  const severity = error.statusCode >= 500 
    ? ErrorSeverity.ERROR 
    : error.statusCode >= 400 
      ? ErrorSeverity.WARNING 
      : ErrorSeverity.INFO;

  // Log the error with contextual information
  logError(error, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    request: {
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: severity !== ErrorSeverity.ERROR ? req.body : undefined // Don't log bodies for server errors
    }
  }, severity);

  // Sanitize error response in production
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && !error.isOperational) {
    error.message = 'Something went wrong';
    delete error.details;
  }

  // Format the error response
  const errorResponse = {
    success: false,
    status: error.status,
    message: error.message,
    ...((!isProd || error.isOperational) && error.details ? { details: error.details } : {}),
    ...((!isProd && error.stack) ? { stack: error.stack } : {})
  };

  // Send response with appropriate status code
  res.status(error.statusCode).json(errorResponse);
};

// Helper function to wrap async route handlers with error catching
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};