import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const VerificationFailedPage: React.FC = () => {
  const [, navigate] = useLocation();
  
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
              onClick={() => navigate('/verification-sent')}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Request New Verification Link
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