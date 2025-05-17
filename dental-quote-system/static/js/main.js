/**
 * MyDentalFly - Main JavaScript
 * 
 * This file handles all client-side functionality including:
 * - AJAX treatment selection/removal
 * - Promo code application/removal
 * - Quote updates without page reloads
 * - Form validation
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Setup message container
    initializeMessageSystem();
    
    // Setup treatment selection
    initializeTreatmentSelection();
    
    // Setup promo code form
    initializePromoCodeForms();
    
    // Setup treatment quantity changes
    initializeQuantityControls();
    
    // Check for URL parameters (for direct promo code application)
    checkUrlParameters();
});

/**
 * Message/Alert System
 */
function initializeMessageSystem() {
    // Create message container if it doesn't exist
    if (!document.getElementById('messages-container')) {
        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'messages-container';
        messagesContainer.style.position = 'fixed';
        messagesContainer.style.top = '20px';
        messagesContainer.style.right = '20px';
        messagesContainer.style.zIndex = '1050';
        messagesContainer.style.width = '350px';
        document.body.appendChild(messagesContainer);
    }
}

/**
 * Show alert message
 */
function showMessage(message, type = 'success', autoHide = true) {
    const messagesContainer = document.getElementById('messages-container');
    
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    
    // Add message
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    messagesContainer.appendChild(alertElement);
    
    // Auto hide after 5 seconds
    if (autoHide) {
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertElement.remove();
            }, 500);
        }, 5000);
    }
    
    return alertElement;
}

/**
 * Treatment Selection
 */
function initializeTreatmentSelection() {
    // Add treatment buttons
    const addButtons = document.querySelectorAll('.add-treatment-btn');
    
    if (addButtons.length) {
        addButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const treatmentId = this.getAttribute('data-treatment-id');
                addTreatment(treatmentId);
            });
        });
    }
    
    // Remove treatment buttons
    const removeButtons = document.querySelectorAll('.remove-treatment-btn');
    
    if (removeButtons.length) {
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const treatmentId = this.getAttribute('data-treatment-id');
                removeTreatment(treatmentId);
            });
        });
    }
}

/**
 * Add treatment via AJAX
 */
function addTreatment(treatmentId) {
    // Show loading state
    const addButton = document.querySelector(`.add-treatment-btn[data-treatment-id="${treatmentId}"]`);
    if (addButton) {
        const originalText = addButton.innerHTML;
        addButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
        addButton.disabled = true;
    }
    
    // Make AJAX request
    $.ajax({
        url: '/add-treatment',
        type: 'POST',
        data: {
            treatment_id: treatmentId
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            if (response.success) {
                // Show success message without causing jittery UI
                if (response.added) {
                    showMessage(response.message, 'success');
                }
                
                // Update quote summary
                updateQuoteSummary(response);
                
                // Enable continue button if there are treatments
                const continueButton = document.querySelector('button[type="submit"]');
                if (continueButton && response.selected_treatments.length > 0) {
                    continueButton.disabled = false;
                }
            } else {
                showMessage(response.message, 'danger');
            }
        },
        error: function() {
            showMessage('An error occurred while adding the treatment. Please try again.', 'danger');
        },
        complete: function() {
            // Restore button
            if (addButton) {
                addButton.innerHTML = '<i class="fas fa-plus-circle me-1"></i> Add to Quote';
                addButton.disabled = false;
            }
        }
    });
}

/**
 * Remove treatment via AJAX
 */
function removeTreatment(treatmentId) {
    // Make AJAX request
    $.ajax({
        url: '/remove-treatment',
        type: 'POST',
        data: {
            treatment_id: treatmentId
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            if (response.success) {
                // Update quote summary
                updateQuoteSummary(response);
                
                // Enable/disable continue button based on treatments
                const continueButton = document.querySelector('button[type="submit"]');
                if (continueButton) {
                    continueButton.disabled = response.selected_treatments.length === 0;
                }
            } else {
                showMessage(response.message, 'danger');
            }
        },
        error: function() {
            showMessage('An error occurred while removing the treatment. Please try again.', 'danger');
        }
    });
}

/**
 * Update quantity via AJAX
 */
function updateQuantity(treatmentId, quantity) {
    // Make AJAX request
    $.ajax({
        url: '/update-quantity',
        type: 'POST',
        data: {
            treatment_id: treatmentId,
            quantity: quantity
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            if (response.success) {
                // Update quote summary silently (no message)
                updateQuoteSummary(response, false);
            } else {
                showMessage(response.message, 'danger');
            }
        },
        error: function() {
            showMessage('An error occurred while updating the quantity. Please try again.', 'danger');
        }
    });
}

/**
 * Promo Code Forms
 */
function initializePromoCodeForms() {
    // Apply promo code form
    const promoForm = document.querySelector('#promo-form form');
    
    if (promoForm) {
        promoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const promoCode = document.getElementById('promo-code').value.trim();
            
            if (!promoCode) {
                showMessage('Please enter a promo code', 'warning');
                return;
            }
            
            applyPromoCode(promoCode);
        });
    }
    
    // Remove promo code button
    const removePromoBtn = document.getElementById('remove-promo-btn');
    
    if (removePromoBtn) {
        removePromoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            removePromoCode();
        });
    }
}

/**
 * Apply promo code via AJAX
 */
function applyPromoCode(promoCode) {
    // Create loading state
    const promoInput = document.getElementById('promo-code');
    const applyButton = promoInput.nextElementSibling;
    const originalButtonText = applyButton.innerHTML;
    
    applyButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Applying...';
    applyButton.disabled = true;
    
    // Make AJAX request
    $.ajax({
        url: '/apply-promo',
        type: 'POST',
        data: {
            promo_code: promoCode
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            if (response.success) {
                // Show success message
                showMessage(response.message, 'success');
                
                // Update totals
                updateTotals(response.totals);
                
                // Show promo display and hide promo form
                document.getElementById('promo-form').style.display = 'none';
                
                const promoDisplay = document.getElementById('promo-display');
                promoDisplay.style.display = 'block';
                document.getElementById('promo-code-display').textContent = promoCode;
                
                if (response.promo_details && response.promo_details.description) {
                    document.getElementById('promo-description').textContent = response.promo_details.description;
                }
            } else {
                showMessage(response.message, 'danger');
            }
        },
        error: function() {
            showMessage('An error occurred while applying the promo code. Please try again.', 'danger');
        },
        complete: function() {
            // Restore button
            applyButton.innerHTML = originalButtonText;
            applyButton.disabled = false;
            promoInput.value = '';
        }
    });
}

/**
 * Remove promo code via AJAX
 */
function removePromoCode() {
    // Make AJAX request
    $.ajax({
        url: '/remove-promo',
        type: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            if (response.success) {
                // Show success message
                showMessage(response.message, 'success');
                
                // Update totals
                updateTotals(response.totals);
                
                // Hide promo display and show promo form
                document.getElementById('promo-display').style.display = 'none';
                document.getElementById('promo-form').style.display = 'block';
            } else {
                showMessage(response.message, 'danger');
            }
        },
        error: function() {
            showMessage('An error occurred while removing the promo code. Please try again.', 'danger');
        }
    });
}

/**
 * Update quote summary with selected treatments
 */
function updateQuoteSummary(response, showMessage = true) {
    if (!response || !response.selected_treatments) return;
    
    const selectedTreatmentsList = document.getElementById('selected-treatments-list');
    
    if (!selectedTreatmentsList) return;
    
    // Clear current list
    selectedTreatmentsList.innerHTML = '';
    
    if (response.selected_treatments.length === 0) {
        // No treatments selected
        selectedTreatmentsList.innerHTML = `
            <div class="alert alert-info">
                No treatments selected yet. Browse treatments above to add them to your quote.
            </div>
        `;
    } else {
        // Add each treatment to the list
        response.selected_treatments.forEach(treatment => {
            const treatmentElement = document.createElement('div');
            treatmentElement.className = 'card mb-3 selected-treatment';
            treatmentElement.id = `treatment-${treatment.id}`;
            
            treatmentElement.innerHTML = `
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h6 class="mb-1">${treatment.name}</h6>
                            <p class="mb-0 text-muted small">
                                <span class="unit-price" data-price="${treatment.price}">$${treatment.price} each</span>
                            </p>
                        </div>
                        <div class="text-end">
                            <div class="input-group quantity-control mb-2">
                                <input type="number" class="form-control form-control-sm treatment-quantity" min="1" value="${treatment.quantity}" data-treatment-id="${treatment.id}">
                            </div>
                            <p class="mb-0 fw-bold total-price">$${treatment.price * treatment.quantity}</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger mt-2 remove-treatment-btn" data-treatment-id="${treatment.id}">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            `;
            
            selectedTreatmentsList.appendChild(treatmentElement);
        });
        
        // Reinitialize event listeners for new elements
        initializeTreatmentSelection();
        initializeQuantityControls();
    }
    
    // Update totals
    updateTotals(response.totals);
}

/**
 * Update totals in the summary
 */
function updateTotals(totals) {
    if (!totals) return;
    
    // Update subtotal
    const subtotalElement = document.getElementById('quote-subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `$${totals.subtotal}`;
    }
    
    // Update discount
    const discountElement = document.getElementById('quote-discount');
    const discountRow = document.getElementById('discount-row');
    
    if (discountElement && discountRow) {
        if (totals.discount > 0) {
            discountElement.textContent = `-$${totals.discount}`;
            discountRow.style.display = 'table-row';
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    // Update total
    const totalElement = document.getElementById('quote-total');
    if (totalElement) {
        totalElement.textContent = `$${totals.total}`;
    }
}

/**
 * Initialize quantity control inputs
 */
function initializeQuantityControls() {
    const quantityInputs = document.querySelectorAll('.treatment-quantity');
    
    if (quantityInputs.length) {
        quantityInputs.forEach(input => {
            // Remove existing event listener (to prevent duplicates)
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Add event listener
            newInput.addEventListener('change', function() {
                const treatmentId = this.getAttribute('data-treatment-id');
                const quantity = parseInt(this.value);
                
                // Validate quantity
                if (isNaN(quantity) || quantity < 1) {
                    this.value = 1;
                    updateQuantity(treatmentId, 1);
                    return;
                }
                
                // Update quantity
                updateQuantity(treatmentId, quantity);
                
                // Update treatment price display
                const priceElement = this.closest('.card-body').querySelector('.total-price');
                const unitPriceElement = this.closest('.card-body').querySelector('.unit-price');
                
                if (priceElement && unitPriceElement) {
                    const unitPrice = parseFloat(unitPriceElement.getAttribute('data-price'));
                    priceElement.textContent = `$${(unitPrice * quantity).toFixed(2)}`;
                }
            });
        });
    }
}

/**
 * Check URL parameters for promo codes
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
        // Auto-apply promo code if found in URL
        const promoInput = document.getElementById('promo-code');
        
        if (promoInput) {
            promoInput.value = promoCode;
            applyPromoCode(promoCode);
        }
    }
}