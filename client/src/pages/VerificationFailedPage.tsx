import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const VerificationFailedPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  
  // Try to get email from URL (if it was passed in a redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);
  
  const requestNewVerification = async () => {
    if (!email) {
      // If we don't have an email, just redirect to the verification sent page
      // where they can manually enter their email
      navigate('/verification-sent');
      return;
    }
    
    setIsResending(true);
    
    try {
      // Use the public endpoint that doesn't require authentication
      const response = await fetch('/api/auth/public-resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "If your email is registered and not yet verified, you will receive a verification link.",
        });
        
        // Redirect to verification sent page
        navigate('/verification-sent?email=' + encodeURIComponent(email));
      } else {
        toast({
          title: "Failed to Send Verification",
          description: data.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast({
        title: "Error",
        description: "Failed to request verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link href="/">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly Logo" 
              className="h-20 w-auto mx-auto mb-6 shadow-sm border border-gray-100 rounded-md p-2 cursor-pointer" 
            />
          </Link>
        </div>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
            <CardDescription>
              We couldn't verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Unable to verify email</AlertTitle>
              <AlertDescription className="mt-2">
                The verification link may have expired or is invalid. Please request a new verification email.
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>If you continue to have problems, please contact our support team for assistance.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              onClick={requestNewVerification}
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Request New Verification Link
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/portal-login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerificationFailedPage;