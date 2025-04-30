import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useGlobalAuth } from "@/contexts/GlobalAuthProvider";

export default function ClinicGuard({ children }: { children: JSX.Element }) {
  // CRITICAL CHANGE: Use the global auth provider instead of the local one
  // This ensures the auth check happens only once at the app level
  const { user, loading } = useGlobalAuth();
  
  // Wait for the global auth check to complete
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying clinic staff access...</p>
      </div>
    );
  }
  
  // Check if user is authenticated and has clinic_staff role
  if (!user || user.role !== "clinic_staff") {
    console.log("ClinicGuard: Not authenticated as clinic staff, redirecting to login");
    return <Redirect to="/portal-login" replace />;
  }
  
  // User is authenticated and has the correct role
  console.log(`ClinicGuard: Authenticated as clinic staff: ${user.email}`);
  return children;
}