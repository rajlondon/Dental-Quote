/**
 * Main JavaScript for Dental Quote System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize flash message handling
    initFlashMessages();
    
    // Initialize promo code auto-application from URL
    autoApplyPromoCodeFromURL();
    
    // Initialize AJAX form handling for promo codes
    initPromoCodeForms();
});

/**
 * Initialize flash message handling
 */
function initFlashMessages() {
    // Get all flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    
    // Add close button functionality
    flashMessages.forEach(message => {
        // Add close button if it doesn't exist
        if (!message.querySelector('.close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', function() {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.remove();
                }, 300);
            });
            message.appendChild(closeBtn);
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

/**
 * Auto-apply promo code from URL query parameter
 */
function autoApplyPromoCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
        // Check if we're on the quote builder page
        const promoCodeInput = document.querySelector('#promo_code');
        const promoForm = document.querySelector('.promo-form');
        
        if (promoCodeInput && promoForm) {
            // Only apply if no promo code is already applied
            const appliedPromo = document.querySelector('.applied-promo');
            if (!appliedPromo) {
                // Set promo code in input
                promoCodeInput.value = promoCode;
                
                // Submit the form
                promoForm.submit();
            }
        }
    }
}

/**
 * Initialize AJAX form handling for promo codes
 */
function initPromoCodeForms() {
    // Promo code application form
    const promoForm = document.querySelector('.promo-form');
    if (promoForm) {
        promoForm.addEventListener('submit', function(e) {
            // For now, use standard form submission
            // In a future enhancement, this could be converted to AJAX
        });
    }
    
    // Promo code removal form
    const removePromoForm = document.querySelector('.applied-promo form');
    if (removePromoForm) {
        removePromoForm.addEventListener('submit', function(e) {
            // For now, use standard form submission
            // In a future enhancement, this could be converted to AJAX
        });
    }
}

/**
 * Create and show a flash message
 * 
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, warning, info)
 */
function showFlashMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `flash-message ${type}`;
    messageEl.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    });
    messageEl.appendChild(closeBtn);
    
    // Add to page
    const flashContainer = document.querySelector('.flash-container');
    if (flashContainer) {
        flashContainer.appendChild(messageEl);
    } else {
        // Create container if it doesn't exist
        const container = document.createElement('div');
        container.className = 'flash-container';
        container.appendChild(messageEl);
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    }, 5000);
}