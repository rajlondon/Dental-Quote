/**
 * Enhanced routing helper for MyDentalFly portal navigation
 * Provides reliable routing functions that work across sessions
 */

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameLenPlus = (name.length + 1);
  return document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(cookie => {
      return cookie.substring(0, nameLenPlus) === `${name}=`;
    })
    .map(cookie => {
      return decodeURIComponent(cookie.substring(nameLenPlus));
    })[0] || null;
}

/**
 * Determine the appropriate portal based on cookies and user data
 */
export function determineUserPortal(): 'admin' | 'clinic' | 'patient' | null {
  // First check for explicit portal cookie
  const portalType = getCookie('portal_type');
  if (portalType) {
    return portalType as 'admin' | 'clinic' | 'patient';
  }
  
  // Then check role-specific cookies
  if (getCookie('admin_auth') === 'true') {
    return 'admin';
  }
  
  if (getCookie('clinic_auth') === 'true') {
    return 'clinic';
  }
  
  if (getCookie('patient_auth') === 'true') {
    return 'patient';
  }
  
  // Check global auth cookie and role
  const isAuthenticated = getCookie('mdf_authenticated') === 'true';
  const role = getCookie('mdf_user_role');
  
  if (isAuthenticated && role) {
    switch (role) {
      case 'admin':
        return 'admin';
      case 'clinic_staff':
      case 'clinic':
        return 'clinic';
      default:
        return 'patient';
    }
  }
  
  // No valid authentication found
  return null;
}

/**
 * Navigate to the appropriate portal based on cookies and user data
 * Using the most reliable navigation method possible
 */
export function navigateToUserPortal(): void {
  const portal = determineUserPortal();
  const baseUrl = window.location.origin;
  const timestamp = Date.now(); // Add timestamp to avoid caching
  
  // Attempt to get user ID from cookie for better direct link targeting
  const userId = getCookie('mdf_user_id') || '0';
  
  try {
    switch (portal) {
      case 'admin':
        window.location.replace(`${baseUrl}/admin-portal?uid=${userId}&t=${timestamp}`);
        break;
      case 'clinic':
        window.location.replace(`${baseUrl}/clinic-portal?uid=${userId}&t=${timestamp}`);
        break;
      case 'patient':
        window.location.replace(`${baseUrl}/client-portal?uid=${userId}&t=${timestamp}`);
        break;
      default:
        // Not authenticated, go to login
        window.location.replace(`${baseUrl}/portal-login?t=${timestamp}`);
    }
  } catch (e) {
    console.error('Navigation error:', e);
    // Fallback approach with direct parameter
    switch (portal) {
      case 'admin':
        window.location.href = `/admin-portal?uid=${userId}&direct=true`;
        break;
      case 'clinic':
        window.location.href = `/clinic-portal?uid=${userId}&direct=true`;
        break;
      case 'patient':
        window.location.href = `/client-portal?uid=${userId}&direct=true`;
        break;
      default:
        window.location.href = '/portal-login';
    }
  }
}

/**
 * Check if a user is authenticated based on cookies and session data
 */
export function isAuthenticated(): boolean {
  return getCookie('mdf_authenticated') === 'true' || 
         getCookie('admin_auth') === 'true' || 
         getCookie('clinic_auth') === 'true' || 
         getCookie('patient_auth') === 'true';
}