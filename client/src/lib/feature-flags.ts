/**
 * Feature flags for the application
 * 
 * This allows us to toggle features on and off without removing code
 */

interface FeatureFlags {
  couponCodes: boolean;
  // Add more feature flags as needed
}

export const FEATURES: FeatureFlags = {
  couponCodes: true, // Set to true to enable coupon codes
};

/**
 * Check if a feature is enabled
 * @param feature The feature to check
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURES[feature] === true;
}

/**
 * Conditionally renders a component based on whether a feature is enabled
 * @param feature The feature to check
 * @param component The component to render if the feature is enabled
 * @returns The component if the feature is enabled, null otherwise
 */
export function FeatureFlag({ 
  feature, 
  children 
}: { 
  feature: keyof FeatureFlags; 
  children: React.ReactNode 
}): React.ReactNode | null {
  return isFeatureEnabled(feature) ? children : null;
}