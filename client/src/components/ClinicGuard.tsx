import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ClinicGuard({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();  // Already fetches /auth/user once
  
  // Wait for the auth check to complete
  if (isLoading) {
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
  return children;
}