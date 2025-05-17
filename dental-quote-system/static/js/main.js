/**
 * Main JavaScript for Dental Quote System
 * Handles promo codes, session management, and UI interactions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Check session status periodically
    startSessionMonitoring();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the application
 */
function initApp() {
    console.log('Dental Quote System initialized');
    
    // Show session indicator
    createSessionIndicator();
    
    // Check for promo code in URL
    checkForPromoCodeInUrl();
}

/**
 * Create session status indicator
 */
function createSessionIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'persistence-indicator';
    indicator.textContent = 'Session Active';
    indicator.id = 'session-indicator';
    document.body.appendChild(indicator);
}

/**
 * Set up event listeners for form submission and UI interactions
 */
function setupEventListeners() {
    // Promo code form
    const promoForm = document.getElementById('promo-code-form');
    if (promoForm) {
        promoForm.addEventListener('submit', handlePromoSubmit);
    }
    
    // Promo code removal button
    const removePromoButton = document.getElementById('remove-promo-code');
    if (removePromoButton) {
        removePromoButton.addEventListener('click', handlePromoRemoval);
    }
    
    // Quote form
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            // Prevent double submission
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';
            }
        });
    }
    
    // Treatment selection checkboxes
    const treatmentCheckboxes = document.querySelectorAll('.treatment-checkbox');
    treatmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateQuoteSummary);
    });
}

/**
 * Handle promo code submission
 * @param {Event} e - Form submission event
 */
function handlePromoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const promoCodeInput = form.querySelector('#promo-code');
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        showMessage('Please enter a promo code', 'error');
        return;
    }
    
    // Disable form and show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Applying...';
    }
    
    // Submit form via fetch to avoid full page reload
    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: new URLSearchParams(new FormData(form))
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(`Promo code '${promoCode}' applied successfully!`, 'success');
            updatePromoDisplay(data.promo);
            updateQuoteSummary();
            
            // Add animation effect to summary
            const summaryElement = document.querySelector('.quote-summary');
            if (summaryElement) {
                summaryElement.classList.add('promo-animation');
                setTimeout(() => {
                    summaryElement.classList.remove('promo-animation');
                }, 1000);
            }
        } else {
            showMessage(data.error || 'Failed to apply promo code', 'error');
        }
    })
    .catch(error => {
        console.error('Error applying promo code:', error);
        showMessage('An error occurred. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Apply';
        }
    });
}

/**
 * Handle promo code removal
 * @param {Event} e - Click event
 */
function handlePromoRemoval(e) {
    e.preventDefault();
    
    const button = e.target;
    button.disabled = true;
    button.textContent = 'Removing...';
    
    fetch('/api/remove-promo-code', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Promo code removed', 'success');
            updatePromoDisplay(null);
            updateQuoteSummary();
            
            // Clear promo code input
            const promoInput = document.getElementById('promo-code');
            if (promoInput) {
                promoInput.value = '';
            }
        } else {
            showMessage(data.error || 'Failed to remove promo code', 'error');
        }
    })
    .catch(error => {
        console.error('Error removing promo code:', error);
        showMessage('An error occurred. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        button.disabled = false;
        button.textContent = 'Remove';
    });
}

/**
 * Check for promo code in URL and auto-apply it
 */
function checkForPromoCodeInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
        console.log(`Found promo code in URL: ${promoCode}`);
        
        // Auto-fill promo code input
        const promoInput = document.getElementById('promo-code');
        if (promoInput) {
            promoInput.value = promoCode;
            
            // Auto-submit the form
            const promoForm = document.getElementById('promo-code-form');
            if (promoForm) {
                // Slight delay to ensure UI is ready
                setTimeout(() => {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    promoForm.dispatchEvent(event);
                }, 500);
            }
        }
        
        // Clean URL to prevent reapplication on page refresh
        // But preserve other parameters
        urlParams.delete('promo');
        const newUrl = urlParams.toString() 
            ? `${window.location.pathname}?${urlParams.toString()}`
            : window.location.pathname;
        
        window.history.replaceState({}, document.title, newUrl);
    }
}

/**
 * Update promo code display in the UI
 * @param {Object|null} promo - Promo code data or null if removed
 */
function updatePromoDisplay(promo) {
    const promoDisplayElement = document.getElementById('applied-promo-code');
    const promoInfoElement = document.getElementById('promo-info');
    const removePromoButton = document.getElementById('remove-promo-code');
    
    if (!promoDisplayElement) return;
    
    if (promo) {
        promoDisplayElement.textContent = promo.code;
        promoDisplayElement.style.display = 'inline-flex';
        
        if (promoInfoElement) {
            promoInfoElement.textContent = `${promo.discount_type === 'percentage' ? promo.discount_value + '%' : '$' + promo.discount_value} discount`;
            promoInfoElement.style.display = 'block';
        }
        
        if (removePromoButton) {
            removePromoButton.style.display = 'inline-block';
        }
    } else {
        promoDisplayElement.style.display = 'none';
        
        if (promoInfoElement) {
            promoInfoElement.style.display = 'none';
        }
        
        if (removePromoButton) {
            removePromoButton.style.display = 'none';
        }
    }
}

/**
 * Update quote summary with current selections
 */
function updateQuoteSummary() {
    const treatmentCheckboxes = document.querySelectorAll('.treatment-checkbox:checked');
    const summaryItemsContainer = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('subtotal-amount');
    const discountElement = document.getElementById('discount-amount');
    const totalElement = document.getElementById('total-amount');
    
    if (!summaryItemsContainer || !subtotalElement) return;
    
    // Clear current items
    summaryItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    // Add selected treatments to summary
    treatmentCheckboxes.forEach(checkbox => {
        const price = parseFloat(checkbox.dataset.price) || 0;
        const name = checkbox.dataset.name || 'Treatment';
        
        subtotal += price;
        
        const listItem = document.createElement('div');
        listItem.className = 'flex justify-between py-2';
        listItem.innerHTML = `
            <span>${name}</span>
            <span>$${price.toFixed(2)}</span>
        `;
        
        summaryItemsContainer.appendChild(listItem);
    });
    
    // Update subtotal
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    // Calculate discount if applicable
    let discount = 0;
    const promoDisplayElement = document.getElementById('applied-promo-code');
    
    if (promoDisplayElement && promoDisplayElement.style.display !== 'none') {
        const promoTypeElement = document.getElementById('promo-info');
        if (promoTypeElement) {
            const promoText = promoTypeElement.textContent;
            
            if (promoText.includes('%')) {
                // Percentage discount
                const percentValue = parseFloat(promoText) || 0;
                discount = (subtotal * percentValue) / 100;
            } else {
                // Fixed amount discount
                const match = promoText.match(/\$([0-9.]+)/);
                if (match && match[1]) {
                    discount = parseFloat(match[1]) || 0;
                }
            }
        }
    }
    
    // Update discount and total
    if (discountElement) {
        discountElement.textContent = `$${discount.toFixed(2)}`;
    }
    
    if (totalElement) {
        const total = Math.max(0, subtotal - discount);
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    // Show empty state if no treatments selected
    if (treatmentCheckboxes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center py-4 text-gray-500';
        emptyState.textContent = 'No treatments selected';
        summaryItemsContainer.appendChild(emptyState);
    }
}

/**
 * Start monitoring session status
 */
function startSessionMonitoring() {
    checkSessionStatus();
    
    // Check every 30 seconds
    setInterval(checkSessionStatus, 30000);
}

/**
 * Check server session status
 */
function checkSessionStatus() {
    fetch('/api/session-status')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateSessionIndicator(data.data);
            } else {
                console.error('Session status check failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error checking session status:', error);
        });
}

/**
 * Update session indicator with latest data
 * @param {Object} sessionData - Session metadata from server
 */
function updateSessionIndicator(sessionData) {
    const indicator = document.getElementById('session-indicator');
    if (!indicator) return;
    
    const sessionId = sessionData.session_id || 'Unknown';
    const lastActivity = sessionData.last_activity_time || 'Unknown';
    const isExpiring = sessionData.expires_in_minutes < 10;
    
    indicator.textContent = `Session: ${sessionId.substring(0, 8)}...`;
    
    if (isExpiring) {
        indicator.style.color = '#EF4444';
        indicator.classList.add('expiring');
    } else {
        indicator.style.color = '#6B7280';
        indicator.classList.remove('expiring');
    }
    
    // Set tooltip with more details
    indicator.title = `Session ID: ${sessionId}\nLast Activity: ${lastActivity}\nExpires in: ${sessionData.expires_in_minutes} minutes`;
}

/**
 * Show a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    // Check if a message container already exists
    let messageContainer = document.getElementById('message-container');
    
    // Create message container if it doesn't exist
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.zIndex = '9999';
        document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'section-fade';
    messageElement.style.padding = '12px 16px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '6px';
    messageElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    messageElement.style.maxWidth = '300px';
    
    // Set styles based on message type
    if (type === 'success') {
        messageElement.style.backgroundColor = '#10B981';
        messageElement.style.color = 'white';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#EF4444';
        messageElement.style.color = 'white';
    } else {
        messageElement.style.backgroundColor = '#3B82F6';
        messageElement.style.color = 'white';
    }
    
    messageElement.textContent = message;
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 300);
    }, 5000);
}