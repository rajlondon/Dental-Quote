import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSpecialOfferDetection } from '@/hooks/use-special-offer-detection';
import { usePackageDetection } from '@/hooks/use-package-detection';
import { usePromoStore } from '@/features/promo/usePromoStore';

/**
 * PromoDetector is a component that runs inside the router context
 * to detect URL parameters related to promotions, packages, and special offers.
 * This prevents hooks rule violations by encapsulating the use of router hooks.
 */
const PromoDetector: React.FC = () => {
  // Router hooks (only safe to use inside a Router component)
  const [location] = useLocation();
  
  // Skip for all protected routes - clinic portal, admin, clinic login, etc.
  const isClinicRoute = location.startsWith('/clinic-') || location.startsWith('/clinic/') || location.startsWith('/clinic_');
  const isAdminRoute = location.startsWith('/admin');
  const isClinicLoginRoute = location === '/clinic-login';
  const isPatientRoute = location.startsWith('/patient-portal');
  
  // Add more comprehensive sessionStorage and cookie checks
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
  
  // Check sessionStorage for clinic flags
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
  
  // Check if user has explicitly set disable_promo_redirect
  const hasDisablePromoFlag = typeof window !== 'undefined' && 
    sessionStorage.getItem('disable_promo_redirect') === 'true';
    
  // If we're on a protected route or have any clinic indicators, don't process promo params
  if (isClinicRoute || isAdminRoute || isClinicLoginRoute || hasClinicCookies || hasClinicSessionStorage || hasDisablePromoFlag) {
    console.log('PromoDetector skipping for protected route/session:', location, 
      hasClinicCookies ? '(clinic cookies detected)' : 
      hasClinicSessionStorage ? '(clinic session storage detected)' :
      hasDisablePromoFlag ? '(explicit disable_promo_redirect flag detected)' : '');
    return null;
  }
  
  // Additional safety check - if we have a user role cookie or session that indicates clinic staff,
  // completely disable promo detection regardless of other factors
  const isClinicUser = typeof window !== 'undefined' && (
    sessionStorage.getItem('user_role') === 'clinic_staff' ||
    document.cookie.split(';').some(c => c.trim().startsWith('user_role=clinic_staff'))
  );
  
  if (isClinicUser) {
    console.log('PromoDetector skipping for clinic staff user role');
    return null;
  }
  
  // Create searchParams from the current URL first
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  
  // Skip if explicitly disabled during clinic login
  if (typeof window !== 'undefined') {
    // Check multiple signals that we're in a clinic staff flow
    
    // 1. Check session storage flag
    if (sessionStorage.getItem('disable_promo_redirect') === 'true') {
      console.log('PromoDetector explicitly disabled via sessionStorage flag');
      return null;
    }
    
    // 2. Check for clinic_portal_access_successful flag
    if (sessionStorage.getItem('clinic_portal_access_successful') === 'true') {
      console.log('PromoDetector disabled: clinic portal access detected');
      return null;
    }
    
    // 3. Check for clinic staff cookies (multiple possible indicators)
    const cookies = document.cookie.split(';');
    const isClinicStaff = cookies.some(cookie => 
      cookie.trim().startsWith('is_clinic_staff=true') || 
      cookie.trim().startsWith('is_clinic_login=true') ||
      cookie.trim().startsWith('clinic_session_active=true') ||
      cookie.trim().startsWith('disable_quote_redirect=true') ||
      cookie.trim().startsWith('no_special_offer_redirect=true'));
      
    if (isClinicStaff) {
      console.log('PromoDetector disabled: detected clinic staff cookie');
      return null;
    }
    
    // 4. Check for clinic login URL parameter
    const isFromClinicLogin = searchParams.get('from') === 'clinic_login';
    if (isFromClinicLogin) {
      console.log('PromoDetector disabled: coming from clinic login page');
      return null;
    }
    
    // 5. Check for redirect from clinic guard flag
    if (sessionStorage.getItem('redirecting_from_clinic_guard') === 'true') {
      console.log('PromoDetector disabled: redirecting from clinic guard');
      // Clear this flag after checking
      sessionStorage.removeItem('redirecting_from_clinic_guard');
      return null;
    }
  }
  
  // Our custom hooks
  const specialOfferHook = useSpecialOfferDetection();
  const packageHook = usePackageDetection();
  const { setPromoSlug } = usePromoStore();

  // Process URL parameters once on mount or when they change
  useEffect(() => {
    // Check if we're in the middle of a clinic login
    if (typeof window !== 'undefined' && (window as any).clinicLoginInProgress) {
      console.log('PromoDetector skipping due to clinic login in progress');
      return;
    }
    
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