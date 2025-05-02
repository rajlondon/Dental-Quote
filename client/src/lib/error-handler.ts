/**
 * Error Handling Utilities for Client-Side Applications
 * 
 * Provides standardized error handling, formatting, and reporting functions.
 */

import { toast } from "@/hooks/use-toast";

// Error categories for better organization and handling
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  PAYMENT = 'payment',
  UPLOAD = 'upload',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown'
}

// Interface for the structured error object
export interface AppError extends Error {
  category: ErrorCategory;
  statusCode?: number;
  context?: Record<string, any>;
  isSensitive?: boolean; // Indicates if error contains sensitive information
  retry?: () => Promise<any>; // Optional retry function
}

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  options: Partial<AppError> = {}
): AppError {
  const error = new Error(message) as AppError;
  error.category = category;
  
  if (options.statusCode) error.statusCode = options.statusCode;
  if (options.context) error.context = options.context;
  if (options.isSensitive) error.isSensitive = options.isSensitive;
  if (options.retry) error.retry = options.retry;
  
  return error;
}

/**
 * Handle API response errors
 */
export async function handleApiError(response: Response): Promise<AppError> {
  let message = 'An unexpected error occurred';
  let category = ErrorCategory.UNKNOWN;
  
  try {
    // Try to parse the response as JSON
    const data = await response.json();
    message = data.message || message;
    
    // Determine error category based on status code
    if (response.status === 401) {
      category = ErrorCategory.AUTHENTICATION;
    } else if (response.status === 403) {
      category = ErrorCategory.AUTHORIZATION;
    } else if (response.status === 422 || response.status === 400) {
      category = ErrorCategory.VALIDATION;
    } else if (response.status >= 500) {
      category = ErrorCategory.SERVER;
    } else if (response.status >= 400) {
      category = ErrorCategory.CLIENT;
    }
  } catch (e) {
    // If we can't parse JSON, use the status text
    message = response.statusText || message;
  }
  
  return createError(message, category, { statusCode: response.status });
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: Error): AppError {
  return createError(
    'Network error: Please check your internet connection',
    ErrorCategory.NETWORK,
    { context: { originalError: error.message } }
  );
}

/**
 * Format user-friendly error messages
 */
export function formatErrorMessage(error: AppError | Error): string {
  // Generic error
  if (!(error as AppError).category) {
    return error.message || 'An unexpected error occurred';
  }
  
  const appError = error as AppError;
  
  // Don't expose sensitive errors to users
  if (appError.isSensitive) {
    return 'An error occurred. Please try again or contact support.';
  }
  
  // Category-specific error messages
  switch (appError.category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication error: Please sign in again';
    case ErrorCategory.AUTHORIZATION:
      return 'You do not have permission to perform this action';
    case ErrorCategory.NETWORK:
      return 'Network error: Please check your internet connection';
    case ErrorCategory.VALIDATION:
      return appError.message || 'Validation error: Please check your input';
    case ErrorCategory.SERVER:
      return 'Server error: Our team has been notified';
    case ErrorCategory.PAYMENT:
      return appError.message || 'Payment error: Please try a different payment method';
    case ErrorCategory.UPLOAD:
      return appError.message || 'Upload failed: Please try again';
    case ErrorCategory.EXTERNAL_SERVICE:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return appError.message || 'An unexpected error occurred';
  }
}

/**
 * Show error toast with appropriate message and styling
 */
export function showErrorToast(error: AppError | Error) {
  const message = formatErrorMessage(error as AppError);
  
  toast({
    title: getErrorTitle(error as AppError),
    description: message,
    variant: "destructive",
    duration: 5000, // Give users time to read the error
  });
}

/**
 * Get an appropriate error title based on error category
 */
function getErrorTitle(error: AppError): string {
  // Generic error
  if (!error.category) {
    return 'Error';
  }
  
  // Category-specific titles
  switch (error.category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorCategory.AUTHORIZATION:
      return 'Access Denied';
    case ErrorCategory.NETWORK:
      return 'Connection Error';
    case ErrorCategory.VALIDATION:
      return 'Validation Error';
    case ErrorCategory.SERVER:
      return 'Server Error';
    case ErrorCategory.PAYMENT:
      return 'Payment Error';
    case ErrorCategory.UPLOAD:
      return 'Upload Failed';
    case ErrorCategory.EXTERNAL_SERVICE:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}

/**
 * Log error details to console in development and potentially to a monitoring service in production
 */
export function logErrorToService(error: AppError | Error, context: Record<string, any> = {}) {
  // In development, log to console with helpful details
  if (process.env.NODE_ENV !== 'production') {
    console.error('ERROR DETAILS:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    if ((error as AppError).category) {
      console.error('Category:', (error as AppError).category);
      console.error('Status Code:', (error as AppError).statusCode);
      console.error('Context:', (error as AppError).context);
    }
    
    if (Object.keys(context).length > 0) {
      console.error('Additional Context:', context);
    }
  } else {
    // In production, this could integrate with an error monitoring service
    // Example: Sentry.captureException(error, { extra: { ...context } });
    console.error('[ERROR]', error.message, { error, context });
  }
}

/**
 * Unified error handling function that logs, formats, and displays error
 */
export function handleError(error: Error | AppError, context: Record<string, any> = {}) {
  // Normalize the error to our AppError type
  const appError = (error as AppError).category 
    ? (error as AppError)
    : createError(error.message || 'An unexpected error occurred');
  
  // 1. Log the error
  logErrorToService(appError, context);
  
  // 2. Show error toast to user
  showErrorToast(appError);
  
  // 3. Return the error for further handling if needed
  return appError;
}