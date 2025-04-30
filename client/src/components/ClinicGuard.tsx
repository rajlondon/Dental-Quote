import { Redirect } from "wouter";
import { useClinicAuth } from "../contexts/ClinicAuth";
import { Loader2 } from "lucide-react";

export default function ClinicGuard({ children }: { children: JSX.Element }) {
  const { loading, ok } = useClinicAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!ok) {
    console.log("ClinicGuard: Not authenticated, redirecting to login");
    return <Redirect to="/portal-login" replace />;
  }
  
  return children;
}