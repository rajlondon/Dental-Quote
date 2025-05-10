/**
 * Feature Flags for MyDentalFly Application
 * 
 * This file defines feature flags to control the visibility and availability
 * of features throughout the application.
 */

export const FEATURES = {
  // Core features
  CITY_FILTERING: true,
  PACKAGE_QUOTES: true,
  SPECIAL_OFFERS: true,
  
  // New/experimental features
  COUPON_CODES: true,    // Support for manual coupon code entry
  CUSTOM_AVATARS: false, // User profile custom avatars
  PATIENT_CHAT: false,   // Real-time chat between patient and clinic
  DARK_MODE: false,      // Dark mode support
  AI_DIAGNOSIS: false,   // AI-powered treatment recommendations
};

export default FEATURES;