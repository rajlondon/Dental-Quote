import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { 
  ErrorCategory, 
  createError, 
  handleApiError, 
  handleNetworkError, 
  showErrorToast
} from "./error-handler";

/**
 * Enhanced API request function with improved error handling
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options: {
    suppressErrorToast?: boolean;
    retryCount?: number;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const { suppressErrorToast = false, headers = {}, retryCount = 0 } = options;

  try {
    // Ensure URL always starts with /api/ if it doesn't already
    const apiUrl = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
    console.log(`API Request: ${url} -> ${apiUrl}`);
    const res = await fetch(apiUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // If response is not ok, handle the error
    if (!res.ok) {
      const error = await handleApiError(res);
      
      // Don't show auth errors as toasts by default
      if (!suppressErrorToast && 
          error.category !== ErrorCategory.AUTHENTICATION) {
        showErrorToast(error);
      }
      
      throw error;
    }

    return res;
  } catch (error) {
    // Handle network errors (like CORS, network offline)
    if (!(error instanceof Response) && error instanceof Error && !('statusCode' in error)) {
      const networkError = handleNetworkError(error);
      
      if (!suppressErrorToast) {
        showErrorToast(networkError);
      }
      
      throw networkError;
    }
    
    // Re-throw other errors
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Enhanced query function that properly handles different error scenarios
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  retryCount?: number;
  suppressErrorToast?: boolean;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, retryCount = 0, suppressErrorToast = false }) =>
  async ({ queryKey }) => {
    try {
      // Ensure URL always starts with /api/ if it doesn't already
      const url = queryKey[0] as string;
      const apiUrl = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
      console.log(`Query Request: ${url} -> ${apiUrl}`);
      const res = await fetch(apiUrl, {
        credentials: "include",
      });

      // Special handling for 401 unauthorized errors
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        } else {
          const error = createError(
            "You are not authenticated or your session has expired.",
            ErrorCategory.AUTHENTICATION,
            { statusCode: 401 }
          );
          
          if (!suppressErrorToast) {
            showErrorToast(error);
          }
          
          throw error;
        }
      }

      // Handle other error statuses
      if (!res.ok) {
        const error = await handleApiError(res);
        
        if (!suppressErrorToast) {
          showErrorToast(error);
        }
        
        throw error;
      }

      // Parse and return JSON response
      try {
        return await res.json();
      } catch (parseError) {
        // Handle JSON parsing errors
        const error = createError(
          "Failed to parse server response",
          ErrorCategory.SERVER,
          { 
            statusCode: 200,
            context: { 
              parseError: (parseError as Error).message,
              url: queryKey[0],
              response: await res.text()
            }
          }
        );
        
        if (!suppressErrorToast) {
          showErrorToast(error);
        }
        
        throw error;
      }
    } catch (error) {
      // Handle network errors
      if (!(error instanceof Response) && error instanceof Error && !('statusCode' in error)) {
        const networkError = handleNetworkError(error);
        
        if (!suppressErrorToast) {
          showErrorToast(networkError);
        }
        
        throw networkError;
      }
      
      // Re-throw all other errors
      throw error;
    }
  };

// Configure React Query globally with standard settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ 
        on401: "throw",
        suppressErrorToast: false,
      }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      retryOnMount: false
    },
    mutations: {
      retry: false
    },
  }
});

// Add a custom error handler function that logs errors
const logQueryError = (error: unknown) => {
  console.error("Query error:", error);
};

// We use this for logging query errors in components
export const errorHandler = {
  logQueryError
};
