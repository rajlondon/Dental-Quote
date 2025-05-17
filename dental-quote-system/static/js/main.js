/**
 * MyDentalFly Dental Quote System
 * Main JavaScript file
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive elements
    initAddTreatmentButtons();
    initRemoveTreatmentButtons();
    initPromoCodeForms();
    initRemovePromoButtons();
    initFlashMessages();
});

/**
 * Initialize the Add Treatment buttons with AJAX functionality
 */
function initAddTreatmentButtons() {
    const addTreatmentForms = document.querySelectorAll('.treatment-actions form');
    
    addTreatmentForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const treatmentId = formData.get('treatment_id');
            
            // Show loading state
            const submitButton = form.querySelector('button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Adding...';
            submitButton.disabled = true;
            
            // Send AJAX request
            fetch('/add-treatment', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the quote summary with the new treatment
                    updateQuoteSummary(data);
                    showFlashMessage('success', 'Treatment added to quote');
                } else {
                    showFlashMessage('error', data.message || 'Failed to add treatment');
                }
            })
            .catch(error => {
                console.error('Error adding treatment:', error);
                showFlashMessage('error', 'An error occurred. Please try again.');
            })
            .finally(() => {
                // Restore button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    });
}

/**
 * Initialize the Remove Treatment buttons with AJAX functionality
 */
function initRemoveTreatmentButtons() {
    const removeTreatmentForms = document.querySelectorAll('.summary-item form');
    
    removeTreatmentForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const treatmentId = formData.get('treatment_id');
            const summaryItem = form.closest('.summary-item');
            
            // Add loading state
            summaryItem.style.opacity = '0.5';
            
            // Send AJAX request
            fetch('/remove-treatment', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the quote summary
                    updateQuoteSummary(data);
                    showFlashMessage('success', 'Treatment removed from quote');
                } else {
                    showFlashMessage('error', data.message || 'Failed to remove treatment');
                    summaryItem.style.opacity = '1'; // Restore opacity if failed
                }
            })
            .catch(error => {
                console.error('Error removing treatment:', error);
                showFlashMessage('error', 'An error occurred. Please try again.');
                summaryItem.style.opacity = '1'; // Restore opacity if error
            });
        });
    });
}

/**
 * Initialize the Promo Code form with AJAX functionality
 */
function initPromoCodeForms() {
    const promoForms = document.querySelectorAll('.promo-form');
    
    promoForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const promoCode = formData.get('promo_code');
            const submitButton = form.querySelector('button');
            
            if (!promoCode) {
                showFlashMessage('error', 'Please enter a promo code');
                return;
            }
            
            // Show loading state
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Applying...';
            submitButton.disabled = true;
            
            // Send AJAX request
            fetch('/apply-promo-code', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the quote summary with the applied promo
                    updateQuoteSummary(data);
                    showFlashMessage('success', `Promo code "${promoCode}" applied successfully`);
                    
                    // Replace promo form with applied promo info
                    form.innerHTML = `
                        <div class="applied-promo">
                            <div class="applied-promo-info">
                                <div>Applied promo: <span class="applied-promo-code">${data.promo_code}</span></div>
                                <div class="applied-promo-description">${data.promo_description}</div>
                            </div>
                            <button type="button" class="applied-promo-remove" title="Remove promo code">&times;</button>
                        </div>
                    `;
                    
                    // Initialize the new remove button
                    initRemovePromoButtons();
                } else {
                    showFlashMessage('error', data.message || 'Invalid promo code');
                }
            })
            .catch(error => {
                console.error('Error applying promo code:', error);
                showFlashMessage('error', 'An error occurred. Please try again.');
            })
            .finally(() => {
                // Restore button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    });
}

/**
 * Initialize the Remove Promo Code buttons with AJAX functionality
 */
function initRemovePromoButtons() {
    const removePromoButtons = document.querySelectorAll('.applied-promo-remove');
    
    removePromoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const appliedPromo = button.closest('.applied-promo');
            
            // Show loading state
            appliedPromo.style.opacity = '0.5';
            
            // Send AJAX request
            fetch('/remove-promo-code', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the quote summary
                    updateQuoteSummary(data);
                    showFlashMessage('success', 'Promo code removed');
                    
                    // Replace applied promo with promo form
                    const container = appliedPromo.closest('.promo-form') || appliedPromo.parentNode;
                    container.innerHTML = `
                        <h3 class="mb-2">Promotional Code</h3>
                        <div class="input-group">
                            <input type="text" id="promo_code" name="promo_code" class="form-control" placeholder="Enter promo code">
                            <button type="submit" class="btn btn-primary">Apply</button>
                        </div>
                    `;
                    
                    // Reinitialize the promo form
                    initPromoCodeForms();
                } else {
                    showFlashMessage('error', data.message || 'Failed to remove promo code');
                    appliedPromo.style.opacity = '1'; // Restore opacity if failed
                }
            })
            .catch(error => {
                console.error('Error removing promo code:', error);
                showFlashMessage('error', 'An error occurred. Please try again.');
                appliedPromo.style.opacity = '1'; // Restore opacity if error
            });
        });
    });
}

/**
 * Update the quote summary section with new data
 */
function updateQuoteSummary(data) {
    const summaryList = document.querySelector('.summary-list');
    const summaryTotals = document.querySelector('.summary-totals');
    
    if (!summaryList || !summaryTotals) return;
    
    // Update treatment list
    if (data.treatments && data.treatments.length > 0) {
        let treatmentsHTML = '';
        
        data.treatments.forEach(treatment => {
            treatmentsHTML += `
                <div class="summary-item">
                    <div class="summary-item-name">${treatment.name}</div>
                    <div class="summary-item-price">$${treatment.price.toFixed(2)}</div>
                    <form action="/remove-treatment" method="POST" class="d-inline">
                        <input type="hidden" name="treatment_id" value="${treatment.id}">
                        <button type="submit" class="summary-item-remove" title="Remove">&times;</button>
                    </form>
                </div>
            `;
        });
        
        summaryList.innerHTML = treatmentsHTML;
        
        // Re-initialize the remove buttons for the new treatment items
        initRemoveTreatmentButtons();
        
        // Show the continue button if it was hidden
        const actionButtons = document.querySelector('.quote-summary .mt-4');
        if (actionButtons) {
            actionButtons.style.display = 'block';
        }
    } else {
        // Empty quote state
        summaryList.innerHTML = '';
        
        // Hide the continue button if no treatments
        const actionButtons = document.querySelector('.quote-summary .mt-4');
        if (actionButtons) {
            actionButtons.style.display = 'none';
        }
    }
    
    // Update totals
    let totalsHTML = `
        <div class="summary-subtotal">
            <div>Subtotal</div>
            <div>$${data.subtotal.toFixed(2)}</div>
        </div>
    `;
    
    if (data.discount > 0) {
        totalsHTML += `
            <div class="summary-discount">
                <div>Discount (${data.promo_description || 'Promotional discount'})</div>
                <div>-$${data.discount.toFixed(2)}</div>
            </div>
        `;
    }
    
    totalsHTML += `
        <div class="summary-total">
            <div>Total</div>
            <div>$${data.total.toFixed(2)}</div>
        </div>
    `;
    
    summaryTotals.innerHTML = totalsHTML;
}

/**
 * Show a flash message
 */
function showFlashMessage(type, message) {
    const flashContainer = document.querySelector('.flash-container');
    
    if (!flashContainer) return;
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.textContent = message;
    
    flashContainer.appendChild(flashMessage);
    
    // Auto-remove the message after 5 seconds
    setTimeout(() => {
        flashMessage.style.opacity = '0';
        flashMessage.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            flashContainer.removeChild(flashMessage);
        }, 300);
    }, 5000);
}

/**
 * Initialize flash messages to auto-dismiss
 */
function initFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        // Add transition styles for smooth fade-out
        message.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Auto-remove the message after 5 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 5000);
    });
}

/**
 * Auto-apply promo code from URL parameter
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check for promo code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
        const promoInput = document.querySelector('#promo_code');
        
        if (promoInput) {
            promoInput.value = promoCode;
            
            // Auto-submit the form
            const promoForm = promoInput.closest('form');
            if (promoForm) {
                setTimeout(() => {
                    promoForm.dispatchEvent(new Event('submit'));
                    
                    // Clean URL after applying promo
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 500);
            }
        }
    }
});