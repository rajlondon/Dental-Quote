/**
 * Centralized routes registry for MyDentalFly
 * 
 * This file serves as the single source of truth for all application routes.
 * Use these constants throughout the application instead of hardcoding paths
 * to ensure consistency and make route changes easier.
 */

const ROUTES = {
  // Public Routes
  HOME: '/',
  BLOG: '/blog',
  BLOG_DENTAL_IMPLANTS: '/blog/dental-implants',
  BLOG_VENEERS: '/blog/veneers',
  BLOG_HOLLYWOOD_SMILE: '/blog/hollywood-smile',
  BLOG_FULL_MOUTH: '/blog/full-mouth',
  BLOG_HOW_IT_WORKS: '/blog/how-it-works',
  DENTAL_IMPLANTS: '/dental-implants',
  VENEERS: '/veneers',
  HOLLYWOOD_SMILE: '/hollywood-smile',
  FULL_MOUTH: '/full-mouth',
  PRICING: '/pricing',
  TEAM: '/team',
  FAQ: '/faq',
  DENTAL_CHART: '/dental-chart',
  YOUR_QUOTE: '/your-quote',
  QUOTE_RESULTS: '/quote-results',
  BOOKING: '/booking',
  
  // Package Routes
  PACKAGE_DETAIL: (id: string) => `/package/${id}`,
  
  // Clinic Routes
  CLINIC_DETAIL: (id: string) => `/clinic/${id}`,
  CLINIC_DEBUG: (id?: string) => id ? `/clinic-debug/${id}` : '/clinic-debug',
  
  // Portal Routes
  PORTAL_LOGIN: '/portal-login',
  
  // Payment Routes
  DEPOSIT_PAYMENT: '/deposit-payment',
  PAYMENT_CONFIRMATION: '/payment-confirmation',
  TREATMENT_PAYMENT: (bookingId?: string) => 
    bookingId ? `/treatment-payment/${bookingId}` : '/treatment-payment',
  
  // Patient Portal Routes
  PATIENT_PORTAL: '/patient-portal',
  CLIENT_PORTAL: '/client-portal',
  MY_DENTAL_CHART: '/my-dental-chart',
  TREATMENT_COMPARISON: '/treatment-comparison',
  ACCOUNT_SETTINGS: '/account-settings',
  MY_PROFILE: '/my-profile',
  DENTAL_ADVICE: '/dental-advice',
  
  // Patient Portal Canonical Routes
  PATIENT_QUOTE_DETAIL: (id: string) => `/portal/quotes/${id}`,
  PATIENT_TREATMENT_DETAIL: (id: string) => `/portal/treatment/${id}`,
  
  // Auth Routes
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFICATION_SENT: '/verification-sent',
  EMAIL_VERIFIED: '/email-verified',
  VERIFICATION_FAILED: '/verification-failed',
  
  // Booking Routes
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
  CREATE_BOOKING: '/create-booking',
  CREATE_BOOKING_FOR_CLINIC: (clinicId: string) => `/create-booking/${clinicId}`,
  
  // Admin Routes
  ADMIN_LOGOUT: '/admin-logout',
  ADMIN_PORTAL: '/admin-portal',
  ADMIN_TREATMENT_MAPPER: '/admin-treatment-mapper',
  DATA_ARCHITECTURE: '/data-architecture',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_DETAIL: (id: string) => `/admin/bookings/${id}`,
  ADMIN_CREATE_BOOKING: '/admin/create-booking',
  ADMIN_NEW_QUOTE: '/admin/new-quote',
  
  // Clinic Staff Routes
  SIMPLE_CLINIC: '/simple-clinic',
  CLINIC_PORTAL: '/clinic-portal',
  CLINIC_TREATMENT_MAPPER: '/clinic-treatment-mapper',
  CLINIC_DENTAL_CHARTS: '/clinic-dental-charts',
  CLINIC_BOOKINGS: '/clinic/bookings',
  CLINIC_BOOKING_DETAIL: (id: string) => `/clinic/bookings/${id}`,
  CLINIC_CREATE_BOOKING: '/clinic/create-booking',
  CLINIC_QUOTE_DETAIL: (id: string) => `/clinic/quotes/${id}`,
  
  // Testing and Development Routes (only in development)
  PORTAL_TESTING: '/portal-testing',
  PORTAL_COMMUNICATION_TEST: '/portal-communication-test',
  ERROR_TEST: '/error-test',
  XRAY_COMPONENT_TEST: '/testing/xray-component',
  
  // API Routes
  API: {
    // Auth API Routes
    AUTH: {
      USER: '/api/auth/user',
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
    },
    // Treatment Lines API Routes with canonical v1 path
    TREATMENT_LINES: {
      BASE: '/api/v1/treatment-lines',
      LIST: '/api/v1/treatment-lines',
      DETAIL: (id: string) => `/api/v1/treatment-lines/${id}`,
      UPDATE: (id: string) => `/api/v1/treatment-lines/${id}`,
      DELETE: (id: string) => `/api/v1/treatment-lines/${id}`,
      CREATE: '/api/v1/treatment-lines',
    },
    // Notifications API Routes
    NOTIFICATIONS: {
      LIST: '/api/notifications',
      MARK_READ: (id: string) => `/api/notifications/${id}/read`,
      MARK_ALL_READ: '/api/notifications/mark-all-read'
    },
    // Special Offers API Routes
    SPECIAL_OFFERS: {
      LIST: '/api/special-offers',
      HOMEPAGE: '/api/special-offers/homepage',
      DETAIL: (id: string) => `/api/special-offers/${id}`,
    },
    // Bookings API Routes
    BOOKINGS: {
      LIST: '/api/bookings',
      DETAIL: (id: string) => `/api/bookings/${id}`,
      CREATE: '/api/bookings',
      UPDATE: (id: string) => `/api/bookings/${id}`,
    }
  }
};

export default ROUTES;