import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Extract token from URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    
    if (!token) {
      // Redirect to verification failed page
      navigate('/verification-failed');
      return;
    }
    
    // The actual verification is handled by the server-side route
    // The server will redirect to /email-verified if successful
    // We'll check for that redirect or wait a reasonable time before showing error
    
    const timer = setTimeout(() => {
      // If we're still on this page after timeout, something went wrong
      if (window.location.pathname === '/verify-email') {
        navigate('/verification-failed');
      }
      // If we're on /email-verified or another page, don't do anything
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold text-center">Verifying Your Email</h2>
        <p className="text-center text-muted-foreground max-w-md">
          Please wait while we verify your email address. This will only take a moment...
        </p>
      </div>
    </div>
  );
}