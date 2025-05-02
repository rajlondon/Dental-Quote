import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import ErrorDisplay from '@/components/ui/error-display';
import ErrorBoundary from '@/components/ui/error-boundary';
import { ErrorCategory, createError } from '@/lib/error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import { apiRequest } from '@/lib/queryClient';

// Component that will intentionally throw an error when rendered
const BuggyComponent = () => {
  // Intentionally accessing a property of undefined
  const obj: any = undefined;
  return <div>{obj.nonExistentProperty}</div>;
};

// Test page to demonstrate various error handling capabilities
const ErrorTestPage: React.FC = () => {
  const { error, isLoading, clearError, setError, handleAsyncOperation, tryCatch } = useErrorHandler();
  const [errorMessage, setErrorMessage] = useState('Custom error message');
  const [customError, setCustomError] = useState<Error | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  // Demo for creating and displaying a custom error
  const handleCreateError = () => {
    const newError = createError(
      errorMessage,
      ErrorCategory.CLIENT,
      { context: { source: 'ErrorTestPage', timestamp: new Date().toISOString() } }
    );
    setCustomError(newError);
  };
  
  // Demo for error boundary with intentional error
  const triggerErrorBoundary = () => {
    // This state update will cause a re-render which will trigger the error in BuggyComponent
    setCustomError(null);
  };
  
  // Demo for async error handling
  const handleAsyncError = async () => {
    await handleAsyncOperation(async () => {
      throw new Error('This is an async operation error');
    }, {
      errorMessage: 'Async operation failed',
      category: ErrorCategory.NETWORK
    });
  };
  
  // Demo for try-catch error handling
  const handleSyncError = () => {
    const result = tryCatch(
      () => {
        // Intentionally throw an error
        throw new Error('This is a synchronous error');
      },
      'Fallback value',
      'Sync operation failed',
      ErrorCategory.CLIENT
    );
    
    console.log('TryCatch returned fallback:', result);
  };
  
  // Demo for API error handling
  const testApiError = async (statusCode: number) => {
    setApiResponse(null);
    
    try {
      const response = await apiRequest(
        'GET', 
        `/api/error-test/${statusCode}`,
        undefined,
        { suppressErrorToast: true }
      );
      
      const data = await response.json();
      setApiResponse({ success: true, data });
    } catch (err) {
      setApiResponse({ 
        success: false, 
        error: err instanceof Error ? err.message : String(err)
      });
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Error Handling Test Page</h1>
      <p className="text-gray-600 mb-6">
        This page demonstrates the various error handling mechanisms implemented in the application.
        Use the tabs below to test different error scenarios.
      </p>
      
      <Tabs defaultValue="custom">
        <TabsList className="mb-4">
          <TabsTrigger value="custom">Custom Errors</TabsTrigger>
          <TabsTrigger value="boundary">Error Boundary</TabsTrigger>
          <TabsTrigger value="async">Async Errors</TabsTrigger>
          <TabsTrigger value="api">API Errors</TabsTrigger>
        </TabsList>
        
        {/* Custom Error Tab */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Error Creation</CardTitle>
              <CardDescription>
                Create a custom error message and see how it's displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Error Message</label>
                  <Input
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    placeholder="Enter an error message"
                  />
                </div>
                
                <Button onClick={handleCreateError}>Create Error</Button>
                
                {customError && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Error Display:</h3>
                    <ErrorDisplay 
                      message={customError.message}
                      category={ErrorCategory.CLIENT}
                      onRetry={() => setCustomError(null)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Error Boundary Tab */}
        <TabsContent value="boundary">
          <Card>
            <CardHeader>
              <CardTitle>Error Boundary Testing</CardTitle>
              <CardDescription>
                Test how the ErrorBoundary component catches rendering errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Clicking the button below will render a component that will throw an error. 
                The ErrorBoundary will catch this error and display a fallback UI.
              </p>
              
              <Button 
                onClick={triggerErrorBoundary}
                className="mb-6"
              >
                Trigger Error Boundary
              </Button>
              
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Component with Error Boundary:</h3>
                <ErrorBoundary componentName="BuggyTestComponent">
                  {customError === null ? <BuggyComponent /> : <div>Click the button to trigger an error</div>}
                </ErrorBoundary>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Async Errors Tab */}
        <TabsContent value="async">
          <Card>
            <CardHeader>
              <CardTitle>Async Error Handling</CardTitle>
              <CardDescription>
                Test how async errors are handled using the useErrorHandler hook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleAsyncError}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Trigger Async Error'}
                </Button>
                
                <Button 
                  onClick={handleSyncError}
                  variant="outline"
                >
                  Trigger Sync Error with TryCatch
                </Button>
                
                {error && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Current Error:</h3>
                    <ErrorDisplay 
                      message={error.message}
                      category={(error as any).category || ErrorCategory.UNKNOWN}
                      onRetry={clearError}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Errors Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Error Handling</CardTitle>
              <CardDescription>
                Test how API errors are handled and displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => testApiError(400)} variant="outline">400 Bad Request</Button>
                  <Button onClick={() => testApiError(401)} variant="outline">401 Unauthorized</Button>
                  <Button onClick={() => testApiError(403)} variant="outline">403 Forbidden</Button>
                  <Button onClick={() => testApiError(404)} variant="outline">404 Not Found</Button>
                  <Button onClick={() => testApiError(500)} variant="outline">500 Server Error</Button>
                  <Button onClick={() => testApiError(0)} variant="destructive">Network Error</Button>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">API Response:</h3>
                  {apiResponse ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-60">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-500">No response yet. Click a button to test an API error.</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-xs text-gray-500">
                Note: These API endpoints are only available in development mode.
                They're designed for testing the error handling system.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorTestPage;