import { Redirect } from "wouter";
import { useClinicAuth } from "../contexts/ClinicAuth";
import { Loader2 } from "lucide-react";

export default function ClinicGuard({ children }: { children: JSX.Element }) {
  // Access the enhanced clinic auth context
  const { loading, ok, user } = useClinicAuth();
  
  // Wait for the API call to complete
  // This is the critical fix - we wait for the loading state
  // to become false before making any redirect decisions
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying clinic staff session...</p>
      </div>
    );
  }
  
  // Check if user is authenticated and has clinic_staff role
  if (!ok || !user || user.role !== "clinic_staff") {
    console.log("ClinicGuard: Not authenticated as clinic staff, redirecting to login");
    return <Redirect to="/portal-login" replace />;
  }
  
  // User is authenticated and has the correct role
  console.log(`ClinicGuard: Authenticated as clinic staff: ${user.email}`);
  return children;
}