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
  
  // Check for new auth state format in localStorage
  try {
    // Check for clinic authentication state
    const clinicAuthState = localStorage.getItem('clinic_auth_state');
    if (clinicAuthState) {
      const { user, timestamp } = JSON.parse(clinicAuthState);
      const now = new Date().getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (user && (now - timestamp < maxAge)) {
        if (user.role === 'clinic_staff' || user.role === 'clinic') {
          console.log('Using clinic auth state from localStorage');
          
          // Set a cookie to maintain consistency with cookie-based auth checks
          document.cookie = `clinic_auth=true; path=/; max-age=${60 * 60}`; // 1 hour
          document.cookie = `mdf_user_role=clinic_staff; path=/; max-age=${60 * 60}`;
          document.cookie = `mdf_authenticated=true; path=/; max-age=${60 * 60}`;
          if (user.id) {
            document.cookie = `mdf_user_id=${user.id}; path=/; max-age=${60 * 60}`;
          }
          
          return 'clinic';
        }
        if (user.role === 'admin') {
          console.log('Using admin auth state from localStorage');
          
          // Set a cookie for admin auth
          document.cookie = `admin_auth=true; path=/; max-age=${60 * 60}`;
          document.cookie = `mdf_user_role=admin; path=/; max-age=${60 * 60}`;
          document.cookie = `mdf_authenticated=true; path=/; max-age=${60 * 60}`;
          if (user.id) {
            document.cookie = `mdf_user_id=${user.id}; path=/; max-age=${60 * 60}`;
          }
          
          return 'admin';
        }
      }
    }
    
    // Check legacy format: is_clinic flag + clinic_user combo
    const isClinic = localStorage.getItem('is_clinic') === 'true';
    const clinicUser = localStorage.getItem('clinic_user');
    
    if (isClinic && clinicUser) {
      try {
        const user = JSON.parse(clinicUser);
        if (user && (user.role === 'clinic_staff' || user.role === 'clinic')) {
          console.log('Using legacy clinic auth from localStorage');
          
          // Set cookies for consistency
          document.cookie = `clinic_auth=true; path=/; max-age=${60 * 60}`;
          document.cookie = `mdf_user_role=clinic_staff; path=/; max-age=${60 * 60}`;
          document.cookie = `mdf_authenticated=true; path=/; max-age=${60 * 60}`;
          if (user.id) {
            document.cookie = `mdf_user_id=${user.id}; path=/; max-age=${60 * 60}`;
          }
          
          // Migrate to new format
          localStorage.setItem('clinic_auth_state', JSON.stringify({
            user,
            timestamp: new Date().getTime()
          }));
          
          return 'clinic';
        }
      } catch (e) {
        console.error('Error parsing clinic user:', e);
      }
    }
  } catch (e) {
    console.error('Error checking auth state:', e);
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
        // Redirect to standalone clinic portal as per user preference
        window.location.replace(`${baseUrl}/clinic-standalone.html?uid=${userId}&t=${timestamp}`);
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
        // Fallback to standalone clinic portal
        window.location.href = `/clinic-standalone.html?uid=${userId}&direct=true`;
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
  // First check cookies
  const cookieAuth = getCookie('mdf_authenticated') === 'true' || 
                     getCookie('admin_auth') === 'true' || 
                     getCookie('clinic_auth') === 'true' || 
                     getCookie('patient_auth') === 'true';
  
  if (cookieAuth) {
    return true;
  }
  
  // Then check localStorage auth state
  try {
    const authState = localStorage.getItem('clinic_auth_state');
    if (authState) {
      const { user, timestamp } = JSON.parse(authState);
      const now = new Date().getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (user && (now - timestamp < maxAge)) {
        // Valid auth state found - update cookies for system consistency
        document.cookie = `mdf_authenticated=true; path=/; max-age=${60 * 60}`;
        document.cookie = `mdf_user_role=${user.role}; path=/; max-age=${60 * 60}`;
        
        if (user.role === 'clinic_staff' || user.role === 'clinic') {
          document.cookie = `clinic_auth=true; path=/; max-age=${60 * 60}`;
        } else if (user.role === 'admin') {
          document.cookie = `admin_auth=true; path=/; max-age=${60 * 60}`;
        } else {
          document.cookie = `patient_auth=true; path=/; max-age=${60 * 60}`;
        }
        
        return true;
      }
    }
    
    // Check legacy format
    const isClinic = localStorage.getItem('is_clinic') === 'true';
    const clinicUser = localStorage.getItem('clinic_user');
    
    if (isClinic && clinicUser) {
      try {
        const user = JSON.parse(clinicUser);
        if (user && user.role) {
          // Migrate to new format
          localStorage.setItem('clinic_auth_state', JSON.stringify({
            user,
            timestamp: new Date().getTime()
          }));
          
          // Set cookies for system consistency
          document.cookie = `mdf_authenticated=true; path=/; max-age=${60 * 60}`;
          document.cookie = `clinic_auth=true; path=/; max-age=${60 * 60}`;
          document.cookie = `mdf_user_role=clinic_staff; path=/; max-age=${60 * 60}`;
          
          return true;
        }
      } catch (e) {
        console.error('Error parsing clinic user:', e);
      }
    }
  } catch (e) {
    console.error('Error checking localStorage auth:', e);
  }
  
  return false;
}