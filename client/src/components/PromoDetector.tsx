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
  
  // Critical redirection protection: Check for clinic login cookies
  const hasClinicRedirectCookie = typeof document !== 'undefined' && 
    document.cookie.split(';').some(c => 
      c.trim().startsWith('clinic_redirect_target=') ||
      c.trim().startsWith('no_promo_redirect=true'));
  
  // If we're on a protected route or have a clinic redirect cookie, don't process promo params
  if (isClinicRoute || isAdminRoute || isClinicLoginRoute || hasClinicRedirectCookie) {
    console.log('PromoDetector skipping for protected route/session:', location, 
      hasClinicRedirectCookie ? '(clinic redirect cookie detected)' : '');
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
      cookie.trim().startsWith('is_clinic_login=true'));
      
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