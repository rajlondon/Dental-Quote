/**
 * Routes Registry for MyDentalFly
 * 
 * This file serves as the single source of truth for all application routes.
 * Always use these constants for navigation to ensure consistency and prevent errors.
 */

import { ensureUuidFormat } from './id-converter';

/**
 * Normalized route paths for the application
 */
export const ROUTES = {
  // Auth routes
  AUTH: '/auth',
  LOGIN: '/auth?tab=login',
  REGISTER: '/auth?tab=register',
  
  // Common routes
  HOME: '/',
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  CLINICS: '/clinics',
  CLINIC_DETAIL: (id: string | number) => `/clinics/${ensureUuidFormat(id.toString())}`,
  TREATMENTS: '/treatments',
  TREATMENT_DETAIL: (id: string | number) => `/treatments/${ensureUuidFormat(id.toString())}`,
  PACKAGES: '/packages',
  PACKAGE_DETAIL: (id: string | number) => `/packages/${ensureUuidFormat(id.toString())}`,
  SPECIAL_OFFERS: '/special-offers',
  SPECIAL_OFFER_DETAIL: (id: string | number) => `/special-offers/${ensureUuidFormat(id.toString())}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Patient portal routes
  PATIENT_PORTAL: '/portal',
  PATIENT_PORTAL_SECTION: (section: string) => `/portal?section=${section}`,
  PATIENT_DASHBOARD: '/portal?section=dashboard',
  PATIENT_QUOTES: '/portal?section=quotes',
  PATIENT_MESSAGES: '/portal?section=messages',
  PATIENT_APPOINTMENTS: '/portal?section=appointments',
  PATIENT_DOCUMENTS: '/portal?section=documents',
  PATIENT_TREATMENT_PLANS: '/portal?section=treatment-plans',
  PATIENT_SAVED_OFFERS: '/portal?section=saved-offers',
  PATIENT_PROFILE: '/portal?section=profile',
  PATIENT_SETTINGS: '/portal?section=settings',
  
  // Specific patient portal item routes
  PATIENT_QUOTE_DETAIL: (id: string | number) => `/portal/quotes/${ensureUuidFormat(id.toString())}`,
  PATIENT_TREATMENT_DETAIL: (id: string | number) => `/portal/treatment/${ensureUuidFormat(id.toString())}`,
  PATIENT_APPOINTMENT_DETAIL: (id: string | number) => `/portal/appointments/${ensureUuidFormat(id.toString())}`,
  
  // Clinic portal routes
  CLINIC_PORTAL: '/clinic-portal',
  CLINIC_PORTAL_SECTION: (section: string) => `/clinic-portal?section=${section}`,
  CLINIC_DASHBOARD: '/clinic-portal?section=dashboard',
  CLINIC_PATIENTS: '/clinic-portal?section=patients',
  CLINIC_TREATMENTS: '/clinic-portal?section=treatments',
  CLINIC_TREATMENT_PLANS: '/clinic-portal?section=treatment-plans',
  CLINIC_APPOINTMENTS: '/clinic-portal?section=appointments',
  CLINIC_MESSAGES: '/clinic-portal?section=messages',
  CLINIC_PROFILE: '/clinic-portal?section=profile',
  CLINIC_SETTINGS: '/clinic-portal?section=settings',
  CLINIC_OFFERS: '/clinic-portal?section=offers',
  
  // Specific clinic portal item routes
  CLINIC_PATIENT_DETAIL: (id: string | number) => `/clinic-portal/patients/${ensureUuidFormat(id.toString())}`,
  CLINIC_TREATMENT_DETAIL: (id: string | number) => `/clinic-portal/treatments/${ensureUuidFormat(id.toString())}`,
  CLINIC_TREATMENT_PLAN_DETAIL: (id: string | number) => `/clinic-portal/treatment-plans/${ensureUuidFormat(id.toString())}`,
  
  // Admin portal routes
  ADMIN_PORTAL: '/admin-portal',
  ADMIN_PORTAL_SECTION: (section: string) => `/admin-portal?section=${section}`,
  ADMIN_DASHBOARD: '/admin-portal?section=dashboard',
  ADMIN_CLINICS: '/admin-portal?section=clinics',
  ADMIN_PATIENTS: '/admin-portal?section=patients',
  ADMIN_QUOTES: '/admin-portal?section=quotes',
  ADMIN_BOOKINGS: '/admin-portal?section=bookings',
  ADMIN_OFFERS: '/admin-portal?section=offers',
  ADMIN_SETTINGS: '/admin-portal?section=settings',
  
  // Quote request flow
  QUOTE_REQUEST: '/quote-request',
  QUOTE_RESULT: '/quote-result',
  
  // Error and utility routes
  NOT_FOUND: '/404',
  ERROR: '/error',
};

/**
 * Check if a route exists in the application
 * @param path The route path to check
 * @returns boolean indicating if the route is valid
 */
export function isValidRoute(path: string): boolean {
  // Get all static routes as values
  const staticRoutes = Object.values(ROUTES).filter(route => typeof route === 'string');
  
  // Check if this is a static route
  if (staticRoutes.includes(path)) {
    return true;
  }
  
  // Check if this is a dynamic route
  // Extract the base path (everything before any IDs or parameters)
  const basePath = path.split('/').slice(0, 3).join('/');
  
  // Check for common dynamic route patterns
  const dynamicPatterns = [
    // Pattern: /portal/treatment/{uuid}
    /^\/portal\/treatment\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /portal/quotes/{uuid}
    /^\/portal\/quotes\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /portal/appointments/{uuid}
    /^\/portal\/appointments\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /clinic-portal/patients/{uuid}
    /^\/clinic-portal\/patients\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /clinic-portal/treatments/{uuid}
    /^\/clinic-portal\/treatments\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /clinic-portal/treatment-plans/{uuid}
    /^\/clinic-portal\/treatment-plans\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /clinics/{uuid}
    /^\/clinics\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /treatments/{uuid}
    /^\/treatments\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /packages/{uuid}
    /^\/packages\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /special-offers/{uuid}
    /^\/special-offers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    // Pattern: /blog/{slug}
    /^\/blog\/[\w-]+$/,
  ];
  
  // Check if the path matches any dynamic pattern
  return dynamicPatterns.some(pattern => pattern.test(path));
}

/**
 * Get a safe redirect URL if the requested URL is invalid
 * @param requestedPath The path that was requested
 * @param userRole The current user's role
 * @returns A safe path to redirect to
 */
export function getSafeRedirect(requestedPath: string, userRole?: string): string {
  // If the path is valid, return it
  if (isValidRoute(requestedPath)) {
    return requestedPath;
  }
  
  // If no role or invalid role, return to home
  if (!userRole) {
    return ROUTES.HOME;
  }
  
  // Determine appropriate portal based on role
  switch (userRole) {
    case 'patient':
      return ROUTES.PATIENT_PORTAL;
    case 'clinic_staff':
    case 'clinic_admin':
      return ROUTES.CLINIC_PORTAL;
    case 'admin':
      return ROUTES.ADMIN_PORTAL;
    default:
      return ROUTES.HOME;
  }
}

export default ROUTES;