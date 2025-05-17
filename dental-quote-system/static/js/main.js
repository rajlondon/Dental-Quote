/**
 * MyDentalFly - Dental Quote Builder
 * Main JavaScript file for the quote builder application
 */

// Waiting for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize session state management
    initSessionManager();
    
    // Add form submission handlers
    setupFormSubmissions();
    
    // Add animations and transitions
    setupAnimations();
    
    // Setup price calculations and display
    setupPriceCalculations();
    
    // Add promo code cache busting behavior
    setupCacheBusting();
    
    console.log('Dental Quote Builder initialized');
});

/**
 * Initializes session state management capabilities
 */
function initSessionManager() {
    // Create a backup of the current session state
    const backupSession = function() {
        // Store timestamp of last activity
        localStorage.setItem('lastActivity', Date.now());
    };
    
    // Auto-save activity periodically
    setInterval(backupSession, 10000); // Every 10 seconds
    
    // Add event listener for user activity
    document.addEventListener('click', backupSession);
    document.addEventListener('keypress', backupSession);
    
    // Check for session timeouts on page load
    const lastActivity = localStorage.getItem('lastActivity');
    const currentTime = Date.now();
    
    if (lastActivity && (currentTime - lastActivity > 3600000)) { // 1 hour
        console.log('Session may have timed out, preparing recovery actions');
    }
}

/**
 * Adds form submission handling, including AJAX for smoother experience
 */
function setupFormSubmissions() {
    // Promo code form submission is already handled in the template
    
    // Handle patient info form submission
    const patientInfoForm = document.querySelector('form[action*="save-patient-info"]');
    if (patientInfoForm) {
        patientInfoForm.addEventListener('submit', function(e) {
            // We'll keep the default form submission for now
            // But add validation
            const name = document.getElementById('patient-name');
            const email = document.getElementById('patient-email');
            
            if (!name.value.trim() || !email.value.trim()) {
                e.preventDefault();
                alert('Please fill in the required fields (name and email).');
            }
        });
    }
    
    // Add click handler for back-to-promo button
    const backToPromoBtn = document.getElementById('back-to-promo');
    const backForm = document.getElementById('back-form');
    
    if (backToPromoBtn && backForm) {
        backToPromoBtn.addEventListener('click', function() {
            backForm.submit();
        });
    }
}

/**
 * Sets up animations and transitions for a smoother user experience
 */
function setupAnimations() {
    // Show applied promo code with animation
    const promoBox = document.querySelector('.promo-animation');
    if (promoBox) {
        // Ensure it's visible (in case CSS hides it initially)
        promoBox.style.display = 'block';
    }
    
    // Smooth section transitions
    const allSections = document.querySelectorAll('.section-fade');
    allSections.forEach(section => {
        if (!section.hasAttribute('hidden')) {
            // Make visible sections fully opaque
            section.style.opacity = '1';
        }
    });
}

/**
 * Handles price calculations and updates based on treatments and promo codes
 */
function setupPriceCalculations() {
    // Price calculation is done server-side in the Flask templates
    // This function could be used for client-side calculations if needed
}

/**
 * Sets up cache busting for promo code requests
 */
function setupCacheBusting() {
    // Add timestamp to current URL if coming from promo code action
    if (window.location.href.indexOf('?t=') === -1 && 
        (document.referrer.includes('promo-code') || document.referrer.includes('promo_code'))) {
        
        const timestamp = new Date().getTime();
        const separator = window.location.href.indexOf('?') !== -1 ? '&' : '?';
        const newUrl = window.location.href + separator + 't=' + timestamp;
        
        // Use history API to avoid actual redirect
        window.history.replaceState({}, document.title, newUrl);
    }
}

/**
 * Handle errors gracefully
 */
window.addEventListener('error', function(e) {
    console.error('Application error:', e.message);
});

// Add a custom filter to help with session timeouts
const sessionRecoveryTimeout = 2000; // 2 seconds timeout for session recovery

/**
 * Try to recover application state if needed
 */
function tryRecoverApplicationState() {
    console.log('Attempting to recover application state...');
    // This would contact the server to recover previous session data
    // In a real implementation, we would make an AJAX request to a recovery endpoint
}