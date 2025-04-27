import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const VerificationSentPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  
  useEffect(() => {
    // Extract email from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);
  
  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address is missing. Please go back to login and try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsResending(true);
      
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
      } else {
        toast({
          title: "Failed to Send Verification",
          description: data.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      toast({
        title: "Error",
        description: "Failed to request verification email. Please try again.",
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
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verification Email Sent</CardTitle>
            <CardDescription>
              We've sent a verification link to {email || "your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Please verify your email</AlertTitle>
              <AlertDescription className="mt-2">
                Click the link in the email we just sent you to verify your account. If you don't see the email, check your spam folder.
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Didn't receive the email? Click the button below to resend.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleResendVerification}
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
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
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

export default VerificationSentPage;