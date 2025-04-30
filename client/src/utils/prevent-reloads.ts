/**
 * Anti-refresh utility that prevents unwanted page reloads
 * This utility intercepts and blocks automatic page refreshes 
 * that might be triggered by various parts of the application
 */

// Store original reload function
const originalReload = window.location.reload;

// Count of prevented reloads for debugging
let preventedReloads = 0;

// Log info about blocked reloads
const logBlockedReload = () => {
  preventedReloads++;
  console.log(`⚠️ Prevented page reload #${preventedReloads} at ${new Date().toISOString()}`);
  console.trace('Reload call stack');
};

// Whitelist of allowed reload paths
const allowedReloadPaths = [
  '/portal-login', // Allow refreshes on login page
  '/patient-portal', // Allow refreshes on patient portal
];

/**
 * Initialize the reload prevention system
 * Call this function early in your application
 */
export function initPreventReloads() {
  console.log('🛡️ Initializing reload prevention system');
  
  // Override the reload method
  window.location.reload = function(...args) {
    const currentPath = window.location.pathname;
    
    // Allow reloads on whitelisted paths
    if (allowedReloadPaths.some(path => currentPath.includes(path))) {
      console.log(`✅ Allowing reload on whitelisted path: ${currentPath}`);
      return originalReload.apply(this, args);
    }
    
    // Block reload on clinic portal specifically
    if (currentPath.includes('clinic-portal')) {
      logBlockedReload();
      return undefined; // Don't reload
    }
    
    // Default behavior - allow reload but log it
    console.log(`⚠️ Detected reload on path: ${currentPath}`);
    return originalReload.apply(this, args);
  };
  
  // Create a property descriptor that prevents overriding our custom reload
  Object.defineProperty(window.location, 'reload', {
    writable: false,
    configurable: false
  });
  
  // Disable history-based refreshes (navigation to same URL)
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    const currentPath = window.location.pathname;
    const newPath = args[2];
    
    // Check if trying to navigate to same URL (which causes a refresh)
    if (currentPath === newPath && currentPath.includes('clinic-portal')) {
      logBlockedReload();
      return undefined; // Block redundant navigation
    }
    
    return originalPushState.apply(this, args);
  };
  
  // Add protection against refresh shortcuts (F5, Ctrl+R)
  window.addEventListener('keydown', (e) => {
    // Block F5 and Ctrl+R on clinic portal
    if (window.location.pathname.includes('clinic-portal') && 
        (e.key === 'F5' || (e.ctrlKey && e.key === 'r'))) {
      e.preventDefault();
      logBlockedReload();
      return false;
    }
  });
  
  console.log('✅ Reload prevention system active');
}

/**
 * Force a reload (bypassing the prevention mechanism)
 * Use this when a reload is actually needed
 */
export function forceReload() {
  console.log('⚠️ Force reloading page...');
  originalReload.apply(window.location);
}