import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const EmailVerifiedPage: React.FC = () => {
  const [, navigate] = useLocation();
  
  // Auto-redirect to login page after 5 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/portal-login');
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
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
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mt-2">
              Thank you for verifying your email address. Your account is now fully activated and you can access all features of MyDentalFly.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              You will be redirected to the login page in a few seconds...
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/portal-login')}
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;