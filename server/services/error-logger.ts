/**
 * Error Logging Service
 * 
 * Provides error logging functionality for the application.
 * In development, it logs to the console.
 * In production, it can be configured to use external error monitoring services.
 */

// Error severity levels
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error context type
export interface ErrorContext {
  userId?: number;
  path?: string;
  method?: string;
  request?: any;
  response?: any;
  timestamp?: Date;
  environment?: string;
  component?: string;
  [key: string]: any; // Allow for additional context
}

// Convert Error to a plain object for logging
function errorToObject(err: Error): any {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(err as any) // Include any additional properties
  };
}

// Get current environment
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Log an error
 * @param error The error to log
 * @param context Additional context about the error
 * @param severity The severity of the error
 */
export function logError(
  error: Error | string,
  context: ErrorContext = {},
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void {
  // Ensure timestamp
  const timestamp = context.timestamp || new Date();
  
  // Create error object
  const errorObject = typeof error === 'string' 
    ? { message: error } 
    : errorToObject(error as Error);
  
  // Create log entry
  const logEntry = {
    severity,
    error: errorObject,
    context: {
      ...context,
      timestamp,
      environment: process.env.NODE_ENV || 'development'
    }
  };
  
  // In production, we can integrate with external error monitoring services
  if (isProduction) {
    // Production logging - could be sent to a monitoring service
    console.error('[ERROR]', JSON.stringify(logEntry));
    
    // TODO: Add integration with error monitoring services like Sentry, LogRocket, etc.
    // For now, we'll just log to the console
  } else {
    // Development logging - more detailed for local debugging
    console.error(`[${severity.toUpperCase()}] ${timestamp.toISOString()}`);
    console.error('Error:', typeof error === 'string' ? error : error.message);
    if (typeof error !== 'string' && error.stack) {
      console.error('Stack:', error.stack);
    }
    if (Object.keys(context).length > 0) {
      console.error('Context:', context);
    }
    console.error('---');
  }
}

/**
 * Log a debug message
 */
export function logDebug(message: string, context: ErrorContext = {}): void {
  logError(message, context, ErrorSeverity.DEBUG);
}

/**
 * Log an info message
 */
export function logInfo(message: string, context: ErrorContext = {}): void {
  logError(message, context, ErrorSeverity.INFO);
}

/**
 * Log a warning message
 */
export function logWarning(message: string, context: ErrorContext = {}): void {
  logError(message, context, ErrorSeverity.WARNING);
}

/**
 * Log a critical error
 */
export function logCritical(error: Error | string, context: ErrorContext = {}): void {
  logError(error, context, ErrorSeverity.CRITICAL);
}

/**
 * Create an error handler middleware for Express
 */
export function createErrorHandler() {
  return (err: any, req: any, res: any, next: any) => {
    // Log the error with request context
    logError(err, {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      request: {
        headers: req.headers,
        query: req.query,
        params: req.params
      }
    });
    
    // Don't expose error details in production
    const message = isProduction
      ? 'An unexpected error occurred'
      : err.message || 'Unknown error';
    
    // Send response
    res.status(err.status || 500).json({
      success: false,
      message
    });
  };
}