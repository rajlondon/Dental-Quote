/**
 * Helper functions for portal navigation with proper hash-based routing
 */

/**
 * Navigate to the client portal with optional section and clinic parameters
 * This uses direct hash-based navigation to ensure proper routing
 */
export const navigateToClientPortal = (section?: string, clinicId?: string): void => {
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

/**
 * Navigate to the portal login page
 */
export const navigateToPortalLogin = (): void => {
  window.location.href = '/#/portal-login';
};

/**
 * Navigate to the admin portal
 */
export const navigateToAdminPortal = (): void => {
  window.location.href = '/#/admin-portal';
};

/**
 * Navigate to the clinic portal
 */
export const navigateToClinicPortal = (): void => {
  window.location.href = '/#/clinic-portal';
};