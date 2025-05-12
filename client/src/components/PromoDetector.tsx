import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSpecialOfferDetection } from '@/hooks/use-special-offer-detection';
import { usePackageDetection } from '@/hooks/use-package-detection';
import { usePromoStore } from '@/features/promo/usePromoStore';
import { useAuth } from '@/hooks/use-auth';

/**
 * PromoDetector is a component that runs inside the router context
 * to detect URL parameters related to promotions, packages, and special offers.
 * This prevents hooks rule violations by encapsulating the use of router hooks.
 */
const PromoDetector: React.FC = () => {
  // IMPORTANT: Always call hooks at the top level of the component
  // to maintain consistent hook order between renders
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const specialOfferHook = useSpecialOfferDetection();
  const packageHook = usePackageDetection();
  const { setPromoSlug } = usePromoStore();
  
  // Helper function to check if promo detection should be skipped
  const shouldSkipPromoDetection = () => {
    // Route-based conditions
    const isClinicRoute = location.startsWith('/clinic-') || 
                        location.startsWith('/clinic/') || 
                        location.startsWith('/clinic_');
    const isAdminRoute = location.startsWith('/admin');
    const isClinicLoginRoute = location === '/clinic-login';
    
    // Auth-based conditions
    const isClinicStaffUser = user && user.role === 'clinic_staff';
    
    // Cookie-based conditions
    const hasClinicCookies = typeof document !== 'undefined' && 
      document.cookie.split(';').some(c => 
        c.trim().startsWith('clinic_redirect_target=') ||
        c.trim().startsWith('no_promo_redirect=true') ||
        c.trim().startsWith('is_clinic_staff=true') ||
        c.trim().startsWith('clinic_session_active=true') ||
        c.trim().startsWith('is_clinic_login=true') ||
        c.trim().startsWith('clinic_login_timestamp=') ||
        c.trim().startsWith('disable_quote_redirect=true') ||
        c.trim().startsWith('no_special_offer_redirect=true'));
    
    // Session storage conditions
    const hasClinicSessionStorage = typeof window !== 'undefined' && (
      sessionStorage.getItem('clinic_portal_access_successful') === 'true' ||
      sessionStorage.getItem('clinic_dashboard_accessed') !== null ||
      sessionStorage.getItem('disable_promo_redirect') === 'true' ||
      sessionStorage.getItem('clinic_user_id') !== null ||
      sessionStorage.getItem('clinic_session_initialized') === 'true' ||
      sessionStorage.getItem('clinic_dashboard_requested') === 'true' ||
      sessionStorage.getItem('clinic_login_in_progress') === 'true' ||
      sessionStorage.getItem('is_clinic_staff') === 'true' ||
      sessionStorage.getItem('no_special_offer_redirect') === 'true' ||
      sessionStorage.getItem('disable_quote_redirect') === 'true' ||
      sessionStorage.getItem('clinic_session_active') === 'true'
    );
    
    // Explicit flag check
    const hasDisablePromoFlag = typeof window !== 'undefined' && 
      sessionStorage.getItem('disable_promo_redirect') === 'true';
    
    // URL parameter conditions
    const searchParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    );
    const isFromClinicLogin = searchParams.get('from') === 'clinic_login';
    
    // Role check conditions
    const hasClinicRoleIndicator = typeof window !== 'undefined' && (
      sessionStorage.getItem('user_role') === 'clinic_staff' ||
      document.cookie.split(';').some(c => c.trim().startsWith('user_role=clinic_staff'))
    );
    
    // Clinic guard redirect check
    const isRedirectingFromClinicGuard = typeof window !== 'undefined' && 
      sessionStorage.getItem('redirecting_from_clinic_guard') === 'true';
    
    // Apply protection for clinic staff users
    if (isClinicStaffUser && typeof window !== 'undefined') {
      console.log('PromoDetector skipping for authenticated clinic staff user');
      sessionStorage.setItem('disable_promo_redirect', 'true');
      sessionStorage.setItem('no_special_offer_redirect', 'true');
      sessionStorage.setItem('disable_quote_redirect', 'true');
      return true;
    }
    
    // Clear the redirecting flag if it's set
    if (isRedirectingFromClinicGuard && typeof window !== 'undefined') {
      console.log('PromoDetector clearing redirect from clinic guard flag');
      sessionStorage.removeItem('redirecting_from_clinic_guard');
    }
    
    // Return the combined result of all checks
    return isLoading || 
      isClinicRoute || 
      isAdminRoute || 
      isClinicLoginRoute || 
      hasClinicCookies || 
      hasClinicSessionStorage || 
      hasDisablePromoFlag || 
      hasClinicRoleIndicator || 
      isFromClinicLogin || 
      isRedirectingFromClinicGuard;
  };

  // Process URL parameters once on mount or when they change
  useEffect(() => {
    // Create search params instance
    const searchParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    );
    
    // Skip promo detection if any of our conditions are met
    if (shouldSkipPromoDetection()) {
      return;
    }
    
    // Skip if in the middle of a clinic login
    if (typeof window !== 'undefined' && (window as any).clinicLoginInProgress) {
      console.log('PromoDetector skipping due to clinic login in progress');
      return;
    }
    
    console.log('PromoDetector processing URL parameters');
    
    // Initialize special offers from URL params
    specialOfferHook.initFromSearchParams(searchParams);
    
    // Initialize package details from URL params
    packageHook.initFromSearchParams(searchParams);
    
    // Check for promo slug
    const promoSlug = searchParams.get('promo');
    if (promoSlug) {
      setPromoSlug(promoSlug);
    }
  }, [location, specialOfferHook, packageHook, setPromoSlug]);

  // This component doesn't render anything visible
  return null;
};

export default PromoDetector;