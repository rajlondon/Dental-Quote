import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, AlertTriangle } from "lucide-react";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract token from URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage("Verification token is missing");
      toast({
        title: "Verification Failed",
        description: "The verification link is invalid or has expired.",
        variant: "destructive",
      });
      return;
    }
    
    // The verification is handled by the server
    // This page is just to show a loading state and then the result
    // We'll simulate a short delay to let the server process the verification
    const timer = setTimeout(() => {
      // Check if we've been redirected to login page with success parameter
      const redirectSuccess = window.location.pathname === '/portal-login' && 
                              window.location.search.includes('verified=true');
      
      if (redirectSuccess) {
        // We've been redirected, so verification was successful
        setVerificationStatus('success');
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully. You can now log in.",
        });
      } else {
        // If we're still on this page, something might have gone wrong
        setVerificationStatus('error');
        setErrorMessage("Verification process is taking longer than expected");
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">
              {verificationStatus === 'loading' && "We're verifying your email address..."}
              {verificationStatus === 'success' && "Your email has been verified successfully!"}
              {verificationStatus === 'error' && "There was a problem verifying your email."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            {verificationStatus === 'loading' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <p className="text-center text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
            
            {verificationStatus === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <p className="text-center text-green-600 font-medium">
                  Your email has been verified successfully!
                </p>
                <p className="text-center text-gray-600">
                  You can now log in to your account.
                </p>
              </div>
            )}
            
            {verificationStatus === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <p className="text-center text-red-600 font-medium">
                  Email verification failed
                </p>
                {errorMessage && (
                  <p className="text-center text-gray-600">
                    {errorMessage}
                  </p>
                )}
                <p className="text-center text-gray-600">
                  The verification link may be invalid or expired. Please try again or contact support.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/portal-login">
                Go to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}