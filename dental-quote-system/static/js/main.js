/**
 * Main JavaScript for Dental Quote System
 * Handles user interactions, promo code management, and session monitoring
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize the application
 */
function initApp() {
    console.log('Dental Quote System initialized');
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for URL parameters like promo codes
    checkForPromoCodeInUrl();
    
    // Create session status indicator
    createSessionIndicator();
    
    // Start session monitoring
    startSessionMonitoring();
}

/**
 * Create session status indicator
 */
function createSessionIndicator() {
    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'session-status';
    indicator.id = 'session-status-indicator';
    indicator.innerHTML = `
        <div class="session-active" id="session-status-dot"></div>
        <span id="session-status-text">Session Active</span>
    `;
    
    // Append to body
    document.body.appendChild(indicator);
}

/**
 * Set up event listeners for form submission and UI interactions
 */
function setupEventListeners() {
    // Promo code form submission
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
        promoForm.addEventListener('submit', handlePromoSubmit);
    }
    
    // Promo code removal button
    const removePromoBtn = document.getElementById('remove-promo');
    if (removePromoBtn) {
        removePromoBtn.addEventListener('click', handlePromoRemoval);
    }
    
    // Treatment selection
    const treatmentCards = document.querySelectorAll('.treatment-card');
    treatmentCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle selected class
            card.classList.toggle('selected');
            
            // Update quote summary
            updateQuoteSummary();
        });
    });
    
    // Cache-busting for all form submissions (to prevent browser caching issues)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            // Add timestamp to form action to prevent caching
            const timestamp = Date.now();
            const separator = this.action.includes('?') ? '&' : '?';
            this.action = `${this.action}${separator}t=${timestamp}`;
        });
    });
}

/**
 * Handle promo code submission
 * @param {Event} e - Form submission event
 */
function handlePromoSubmit(e) {
    e.preventDefault();
    
    // Get promo code input
    const promoInput = document.getElementById('promo-code');
    const promoCode = promoInput.value.trim();
    
    if (!promoCode) {
        showMessage('Please enter a promo code', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Applying...';
    
    // Send AJAX request to apply promo code
    fetch('/api/apply-promo-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: `promo_code=${encodeURIComponent(promoCode)}`
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            // Update UI with promo code
            updatePromoDisplay(data.promo);
            showMessage(`Promo code "${data.promo.code}" applied successfully!`, 'success');
            
            // Clear input
            promoInput.value = '';
            
            // Update quote summary
            updateQuoteSummary();
        } else {
            showMessage(data.error || 'Invalid promo code', 'error');
        }
    })
    .catch(error => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        console.error('Error applying promo code:', error);
        showMessage('An error occurred while applying the promo code', 'error');
    });
}

/**
 * Handle promo code removal
 * @param {Event} e - Click event
 */
function handlePromoRemoval(e) {
    e.preventDefault();
    
    // Show loading state
    e.target.disabled = true;
    const originalText = e.target.textContent;
    e.target.textContent = 'Removing...';
    
    // Send AJAX request to remove promo code
    fetch('/api/remove-promo-code', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        e.target.disabled = false;
        e.target.textContent = originalText;
        
        if (data.success) {
            // Update UI to remove promo code
            updatePromoDisplay(null);
            showMessage('Promo code removed', 'success');
            
            // Update quote summary
            updateQuoteSummary();
        } else {
            showMessage('Failed to remove promo code', 'error');
        }
    })
    .catch(error => {
        // Reset button
        e.target.disabled = false;
        e.target.textContent = originalText;
        
        console.error('Error removing promo code:', error);
        showMessage('An error occurred while removing the promo code', 'error');
    });
}

/**
 * Check for promo code in URL and auto-apply it
 */
function checkForPromoCodeInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
        console.log('Promo code found in URL:', promoCode);
        
        // If promo code section exists and no promo is already applied
        const promoSection = document.querySelector('.promo-section');
        const promoActive = document.querySelector('.promo-active');
        
        if (promoSection && !promoActive) {
            // Automatically fill and submit the form
            const promoInput = document.getElementById('promo-code');
            if (promoInput) {
                promoInput.value = promoCode;
                
                // Get promo form and submit it
                const promoForm = document.getElementById('promo-form');
                if (promoForm) {
                    // Small delay to ensure the page is fully loaded
                    setTimeout(() => {
                        promoForm.dispatchEvent(new Event('submit'));
                    }, 500);
                }
            }
        }
    }
}

/**
 * Update promo code display in the UI
 * @param {Object|null} promo - Promo code data or null if removed
 */
function updatePromoDisplay(promo) {
    const promoActiveContainer = document.getElementById('promo-active-container');
    
    if (!promoActiveContainer) {
        return;
    }
    
    if (promo) {
        // Show active promo
        promoActiveContainer.innerHTML = `
            <div class="promo-active">
                <div class="promo-details">
                    <strong>Active Promo Code:</strong> <span>${promo.code}</span>
                    <p>${promo.discount_type === 'percentage' ? `${promo.discount_value}% Off` : `$${promo.discount_value} Off`}</p>
                </div>
                <button type="button" class="promo-remove" id="remove-promo">Remove</button>
            </div>
        `;
        
        // Re-attach event listener to the new button
        const removePromoBtn = document.getElementById('remove-promo');
        if (removePromoBtn) {
            removePromoBtn.addEventListener('click', handlePromoRemoval);
        }
    } else {
        // Clear promo display
        promoActiveContainer.innerHTML = '';
    }
}

/**
 * Update quote summary with current selections
 */
function updateQuoteSummary() {
    const quoteSummary = document.getElementById('quote-summary');
    if (!quoteSummary) {
        return;
    }
    
    // Get selected treatments
    const selectedTreatments = document.querySelectorAll('.treatment-card.selected');
    const treatmentsList = document.getElementById('selected-treatments-list');
    const subtotalElement = document.getElementById('subtotal-value');
    const discountElement = document.getElementById('discount-value');
    const totalElement = document.getElementById('total-value');
    
    // If required elements are not found, exit
    if (!treatmentsList || !subtotalElement || !totalElement) {
        return;
    }
    
    // Clear treatments list
    treatmentsList.innerHTML = '';
    
    // Calculate subtotal
    let subtotal = 0;
    selectedTreatments.forEach(treatment => {
        const id = treatment.dataset.id;
        const name = treatment.dataset.name;
        const price = parseFloat(treatment.dataset.price);
        
        // Add to list
        treatmentsList.innerHTML += `
            <div class="quote-summary-item">
                <span class="quote-summary-label">${name}</span>
                <span class="quote-summary-value">$${price.toFixed(2)}</span>
            </div>
        `;
        
        // Add to subtotal
        subtotal += price;
    });
    
    // Update subtotal display
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    // Check if there's an active promo
    let discount = 0;
    const promoActive = document.querySelector('.promo-active');
    
    if (promoActive && discountElement) {
        // Get promo details
        const promoText = promoActive.querySelector('.promo-details p').textContent;
        
        if (promoText.includes('%')) {
            // Percentage discount
            const percentMatch = promoText.match(/(\d+)%/);
            if (percentMatch && percentMatch[1]) {
                const percentValue = parseFloat(percentMatch[1]);
                discount = (subtotal * percentValue) / 100;
            }
        } else {
            // Fixed amount discount
            const dollarMatch = promoText.match(/\$(\d+)/);
            if (dollarMatch && dollarMatch[1]) {
                const dollarValue = parseFloat(dollarMatch[1]);
                discount = Math.min(dollarValue, subtotal); // Don't exceed subtotal
            }
        }
        
        // Update discount display
        discountElement.textContent = `-$${discount.toFixed(2)}`;
        discountElement.classList.add('quote-discount');
    } else if (discountElement) {
        // No discount
        discountElement.textContent = '$0.00';
        discountElement.classList.remove('quote-discount');
    }
    
    // Calculate total
    const total = Math.max(0, subtotal - discount);
    totalElement.textContent = `$${total.toFixed(2)}`;
}

/**
 * Start monitoring session status
 */
function startSessionMonitoring() {
    // Check immediately
    checkSessionStatus();
    
    // Set up interval to check every 30 seconds
    setInterval(checkSessionStatus, 30000);
}

/**
 * Check server session status
 */
function checkSessionStatus() {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    
    fetch(`/api/session-status?t=${timestamp}`)
        .then(response => response.json())
        .then(data => {
            updateSessionIndicator(data);
        })
        .catch(error => {
            console.error('Session status check failed:', error);
            // Show error state
            const statusDot = document.getElementById('session-status-dot');
            const statusText = document.getElementById('session-status-text');
            
            if (statusDot && statusText) {
                statusDot.className = 'session-inactive';
                statusText.textContent = 'Session Error';
            }
        });
}

/**
 * Update session indicator with latest data
 * @param {Object} sessionData - Session metadata from server
 */
function updateSessionIndicator(sessionData) {
    const statusDot = document.getElementById('session-status-dot');
    const statusText = document.getElementById('session-status-text');
    
    if (!statusDot || !statusText) {
        return;
    }
    
    if (sessionData.exists) {
        // Session exists
        statusDot.className = 'session-active';
        statusText.textContent = 'Session Active';
        
        // Add more detailed info on hover
        const indicator = document.getElementById('session-status-indicator');
        if (indicator) {
            indicator.title = `Session Age: ${sessionData.age_minutes.toFixed(1)} min | Idle: ${sessionData.idle_minutes.toFixed(1)} min`;
        }
        
        // If session is older than 20 minutes, show a warning
        if (sessionData.age_minutes > 20) {
            statusText.textContent = 'Session Active (Aging)';
        }
        
        // If session is idle for more than 5 minutes, show a warning
        if (sessionData.idle_minutes > 5) {
            statusDot.className = 'session-inactive';
            statusText.textContent = 'Session Idle';
        }
    } else {
        // No session
        statusDot.className = 'session-inactive';
        statusText.textContent = 'No Session';
    }
}

/**
 * Show a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    // Check if flash container exists, if not create it
    let flashContainer = document.querySelector('.flash-messages');
    
    if (!flashContainer) {
        flashContainer = document.createElement('div');
        flashContainer.className = 'flash-messages';
        
        // Add to page before the first main content element
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.parentNode.insertBefore(flashContainer, mainContent);
        } else {
            // If no container, add at the top of body
            const firstElement = document.body.firstChild;
            document.body.insertBefore(flashContainer, firstElement);
        }
    }
    
    // Create flash message
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'flash-close';
    closeButton.style.float = 'right';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.fontSize = '1.2rem';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        flashMessage.remove();
    });
    
    flashMessage.prepend(closeButton);
    
    // Add to container
    flashContainer.appendChild(flashMessage);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (flashMessage.parentNode) {
            flashMessage.remove();
        }
    }, 5000);
}