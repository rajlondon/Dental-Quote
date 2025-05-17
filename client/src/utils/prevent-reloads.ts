/**
 * Utility to prevent unwanted page reloads in the clinic portal
 * This is especially important for preventing WebSocket reconnection cycles
 */

let initialized = false;

export function initPreventReloads() {
  if (initialized) {
    console.log('Reload prevention already initialized');
    return;
  }
  
  console.log('Initializing reload prevention');
  
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Use a safer approach instead of directly overriding location.reload
  // Create a function to intercept reload attempts using beforeunload
  window.addEventListener('beforeunload', function(e) {
    const isClinicPortal = window.location.pathname.includes('clinic-portal') || 
                          window.location.pathname.includes('/clinic');
    
    if (isClinicPortal) {
      console.warn('BLOCKED: Automatic page reload prevented in clinic portal');
      console.trace('Reload stack trace');
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });
  
  // Intercept history API in clinic portal
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function customPushState(...args) {
    const isClinicPortal = window.location.pathname.includes('clinic-portal') || 
                          window.location.pathname.includes('/clinic');
    
    if (isClinicPortal) {
      console.log('HISTORY API: pushState in clinic portal', args);
    }
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function customReplaceState(...args) {
    const isClinicPortal = window.location.pathname.includes('clinic-portal') || 
                          window.location.pathname.includes('/clinic');
    
    if (isClinicPortal) {
      console.log('HISTORY API: replaceState in clinic portal', args);
    }
    return originalReplaceState.apply(this, args);
  };
  
  // Capture reload key combinations
  window.addEventListener('keydown', function(e) {
    const isClinicPortal = window.location.pathname.includes('clinic-portal') || 
                          window.location.pathname.includes('/clinic');
    
    if (isClinicPortal) {
      // Prevent F5 and Ctrl+R
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        console.warn('BLOCKED: Manual reload attempt in clinic portal');
        e.preventDefault();
        return false;
      }
    }
  }, { capture: true });
  
  // Add custom event for when a component manually forces a reload
  window.addEventListener('manual-force-reload', function(e) {
    const isClinicPortal = window.location.pathname.includes('clinic-portal') || 
                          window.location.pathname.includes('/clinic');
    
    if (isClinicPortal) {
      console.warn('DETECTED: Manual forced reload in clinic portal');
      console.trace('Manual reload stack trace');
      return false;
    }
  });
  
  initialized = true;
}