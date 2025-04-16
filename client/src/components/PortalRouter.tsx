import React from 'react';
import { useLocation } from 'wouter';

interface PortalRouterProps {
  children: React.ReactNode;
}

/**
 * A centralized component to handle portal routing
 * This ensures that all routes follow the same pattern and work correctly with hash-based routing
 */
const PortalRouter: React.FC<PortalRouterProps> = ({ children }) => {
  const [, navigate] = useLocation();

  // Function to handle authenticated navigation with clinic selection
  const navigateToClientPortal = (section?: string, clinicId?: string) => {
    let url = '/client-portal';
    
    // Add query parameters if provided
    if (section || clinicId) {
      url += '?';
      if (section) {
        url += `section=${section}`;
      }
      if (clinicId) {
        url += section ? `&clinic=${clinicId}` : `clinic=${clinicId}`;
      }
    }
    
    // Use direct hash-based navigation
    window.location.href = `/#${url}`;
  };

  // Expose methods to the global window object for direct access
  React.useEffect(() => {
    // @ts-ignore - extending window object
    window.portalRouter = {
      navigateToClientPortal,
    };
  }, []);

  return <>{children}</>;
};

export default PortalRouter;