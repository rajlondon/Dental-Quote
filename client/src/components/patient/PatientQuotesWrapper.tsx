import React from "react";
import { useLocation } from "wouter";
import { ROUTES } from "@/lib/routes";

/**
 * This component is a simple wrapper that manages redirecting the user to
 * the patient portal with the quotes section selected. It's used to handle
 * the /patient/quotes route without causing React hooks errors.
 */
export function PatientQuotesWrapper() {
  const [, setLocation] = useLocation();
  
  // Immediately redirect to the patient portal with the quotes section
  React.useEffect(() => {
    // Instead of using the navigation hook, we'll use a simpler, direct approach
    if (typeof window !== 'undefined') {
      // Set a session flag to indicate which section to show
      sessionStorage.setItem('patient_portal_section', 'quotes');
      // Use the setLocation from wouter for a simple redirect
      setLocation(ROUTES.PATIENT_PORTAL);
    }
  }, [setLocation]);
  
  // Render a placeholder while redirecting
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <p>Redirecting to quotes...</p>
    </div>
  );
}

export default PatientQuotesWrapper;