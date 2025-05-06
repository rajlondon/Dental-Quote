/**
 * Central registry for all application routes
 * 
 * This file serves as a single source of truth for all route paths in the application.
 * Using this registry ensures consistent path references throughout the app and makes
 * it easier to change route paths in the future.
 */
export const ROUTES = {
  // Home and public pages
  HOME: '/',
  
  // Authentication
  LOGIN: '/portal-login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Patient portal
  PATIENT_PORTAL: '/patient-portal',
  PATIENT_DASHBOARD: '/patient-portal',
  PATIENT_QUOTES: '/patient/quotes',
  PATIENT_QUOTE_DETAIL: '/patient/quotes/:id',
  PATIENT_QUOTE_EDIT: '/patient/quotes/:id/edit',
  PATIENT_QUOTE_REVIEW: '/patient/quotes/:id/review',
  PATIENT_TREATMENT_DETAIL: '/portal/treatment/:id',
  PATIENT_MESSAGES: '/patient/messages',
  
  // Admin portal
  ADMIN_PORTAL: '/admin-portal',
  ADMIN_DASHBOARD: '/admin-portal',
  ADMIN_QUOTES: '/admin/quotes',
  ADMIN_QUOTE_DETAIL: '/admin/quotes/:id',
  ADMIN_NEW_QUOTE: '/admin/new-quote',
  
  // Clinic portal
  CLINIC_PORTAL: '/clinic-portal',
  CLINIC_DASHBOARD: '/clinic-portal',
  CLINIC_QUOTES: '/clinic/quotes',
  CLINIC_QUOTE_DETAIL: '/clinic/quotes/:id',
  
  // Treatment management
  ADMIN_TREATMENT_MAPPER: '/admin-treatment-mapper',
  CLINIC_TREATMENT_MAPPER: '/clinic-treatment-mapper',
  
  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  CREATE_BOOKING: '/create-booking',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_DETAIL: '/admin/bookings/:id',
  ADMIN_CREATE_BOOKING: '/admin/create-booking',
  CLINIC_BOOKINGS: '/clinic/bookings',
  CLINIC_BOOKING_DETAIL: '/clinic/bookings/:id',
  CLINIC_CREATE_BOOKING: '/clinic/create-booking',
  
  // Clinic pages
  CLINIC_DETAIL: '/clinic-detail/:id',
  PACKAGE_DETAIL: '/package/:id',
  
  // Payment
  DEPOSIT_PAYMENT: '/deposit-payment',
  PAYMENT_CONFIRMATION: '/payment-confirmation',
  TREATMENT_PAYMENT: '/treatment-payment/:bookingId',
  
  // User profile
  ACCOUNT_SETTINGS: '/account-settings',
  PROFILE: '/my-profile',
  
  // Verification
  VERIFY_EMAIL: '/verify-email',
  VERIFICATION_SENT: '/verification-sent',
  EMAIL_VERIFIED: '/email-verified',
  VERIFICATION_FAILED: '/verification-failed',
  
  // Content pages
  BLOG: '/blog',
  BLOG_HOW_IT_WORKS: '/blog/how-it-works',
  BLOG_DENTAL_IMPLANTS: '/blog/dental-implants',
  BLOG_VENEERS: '/blog/veneers',
  BLOG_HOLLYWOOD_SMILE: '/blog/hollywood-smile',
  BLOG_FULL_MOUTH: '/blog/full-mouth',
  DENTAL_IMPLANTS: '/dental-implants',
  VENEERS: '/veneers',
  HOLLYWOOD_SMILE: '/hollywood-smile',
  FULL_MOUTH: '/full-mouth',
  PRICING: '/pricing',
  TEAM: '/team',
  HOW_IT_WORKS: '/how-it-works',
  FAQ: '/faq',
  YOUR_QUOTE: '/your-quote',
  QUOTE_RESULTS: '/quote-results',
  BOOKING: '/booking',
  DENTAL_CHART: '/dental-chart',
  PATIENT_DENTAL_CHART: '/my-dental-chart',
  TREATMENT_COMPARISON: '/treatment-comparison',
  DENTAL_ADVICE: '/dental-advice',
} as const;