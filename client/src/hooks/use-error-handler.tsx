import { useState, useCallback } from 'react';
import { 
  AppError, 
  ErrorCategory, 
  createError, 
  handleError, 
  showErrorToast 
} from '@/lib/error-handler';

/**
 * Hook for handling errors in React components
 * 
 * Provides utility functions for creating, displaying, and managing errors,
 * as well as state for tracking error conditions.
 */
const useErrorHandler = (options: {
  showToasts?: boolean;
  logErrors?: boolean;
  defaultCategory?: ErrorCategory;
} = {}) => {
  const { 
    showToasts = true, 
    logErrors = true,
    defaultCategory = ErrorCategory.UNKNOWN
  } = options;
  
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Create and set an error
   */
  const setAppError = useCallback((message: string, category?: ErrorCategory, options?: Record<string, any>) => {
    const newError = createError(message, category || defaultCategory, options);
    setError(newError);
    
    if (showToasts) {
      showErrorToast(newError);
    }
    
    if (logErrors) {
      console.error('Error:', newError);
    }
    
    return newError;
  }, [showToasts, logErrors, defaultCategory]);
  
  /**
   * Handle an async operation with proper error handling
   * Can be used with any async function such as API calls or data processing
   */
  const handleAsyncOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    {
      loadingState = true,
      errorMessage = 'An error occurred during the operation',
      category = defaultCategory,
      context = {},
      showToast = showToasts,
      rethrow = false
    }: {
      loadingState?: boolean;
      errorMessage?: string;
      category?: ErrorCategory;
      context?: Record<string, any>;
      showToast?: boolean;
      rethrow?: boolean;
    } = {}
  ): Promise<T | null> => {
    if (loadingState) {
      setIsLoading(true);
    }
    
    clearError();
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const caughtError = err instanceof Error ? err : new Error(String(err));
      // Create our error context with the original error's details
      const errorContext = { 
        ...context,
        originalErrorMessage: caughtError.message,
        originalErrorStack: caughtError.stack
      };
      
      const appError = (caughtError as AppError).category 
        ? (caughtError as AppError)
        : createError(
            errorMessage, 
            category, 
            { context: errorContext }
          );
      
      setError(appError);
      
      if (showToast) {
        showErrorToast(appError);
      }
      
      if (logErrors) {
        console.error('Operation error:', appError);
      }
      
      if (rethrow) {
        throw appError;
      }
      
      return null;
    } finally {
      if (loadingState) {
        setIsLoading(false);
      }
    }
  }, [clearError, setError, showToasts, logErrors, defaultCategory]);
  
  /**
   * Execute a function with error boundary-like behavior
   * Useful for operations that might throw but aren't asynchronous
   */
  const tryCatch = useCallback(<T,>(
    operation: () => T,
    fallback: T,
    errorMessage = 'An error occurred',
    category = defaultCategory
  ): T => {
    try {
      return operation();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      // Create error context with the details of the caught error
      const errorContext = {
        syncOperationError: true,
        errorMessage: error.message,
        errorStack: error.stack
      };
      setAppError(errorMessage, category, { context: errorContext });
      return fallback;
    }
  }, [setAppError, defaultCategory]);
  
  return {
    error,
    isLoading,
    clearError,
    setError: setAppError,
    handleAsyncOperation,
    tryCatch
  };
};

export default useErrorHandler;