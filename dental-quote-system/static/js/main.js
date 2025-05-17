/**
 * MyDentalFly - Dental Quote System
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle AJAX treatment updates
    setupTreatmentHandlers();
    
    // Handle AJAX promo code application
    setupPromoCodeHandlers();
    
    // Setup quantity controls
    setupQuantityControls();
    
    // Check for URL parameters
    checkUrlParameters();
});

/**
 * Setup treatment add/remove handlers
 */
function setupTreatmentHandlers() {
    // Add treatment via AJAX
    document.querySelectorAll('.add-treatment-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const treatmentId = this.dataset.treatmentId;
            const treatmentName = this.dataset.treatmentName;
            
            fetch('/api/add-treatment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ treatment_id: treatmentId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateQuoteSummary(data);
                    showToast('success', `${treatmentName} added to your quote`);
                } else {
                    showToast('danger', data.message || 'Failed to add treatment');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('danger', 'An error occurred. Please try again.');
            });
        });
    });
    
    // Remove treatment via AJAX - use event delegation for dynamically created elements
    document.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-treatment');
        if (removeBtn) {
            e.preventDefault();
            
            const treatmentId = removeBtn.dataset.treatmentId;
            
            fetch('/api/remove-treatment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ treatment_id: treatmentId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateQuoteSummary(data);
                    showToast('success', 'Treatment removed from your quote');
                } else {
                    showToast('danger', data.message || 'Failed to remove treatment');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('danger', 'An error occurred. Please try again.');
            });
        }
    });
}

/**
 * Setup promo code application handlers
 */
function setupPromoCodeHandlers() {
    // Apply promo code
    const applyBtn = document.getElementById('apply-promo-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const promoInput = document.getElementById('promo-code-input');
            const promoCode = promoInput.value.trim();
            
            if (!promoCode) {
                showToast('warning', 'Please enter a promo code');
                return;
            }
            
            fetch('/api/apply-promo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ promo_code: promoCode })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateQuoteSummary(data);
                    showToast('success', 'Promo code applied successfully');
                } else {
                    // Show error message inline
                    const errorElem = document.getElementById('promo-error');
                    if (errorElem) {
                        errorElem.textContent = data.message || 'Invalid promo code';
                        errorElem.classList.remove('d-none');
                    } else {
                        showToast('danger', data.message || 'Failed to apply promo code');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('danger', 'An error occurred. Please try again.');
            });
        });
    }
    
    // Remove promo code - use event delegation
    document.addEventListener('click', function(e) {
        const removePromoBtn = e.target.closest('#remove-promo-btn');
        if (removePromoBtn) {
            e.preventDefault();
            
            fetch('/api/remove-promo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateQuoteSummary(data);
                    showToast('success', 'Promo code removed');
                } else {
                    showToast('danger', data.message || 'Failed to remove promo code');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('danger', 'An error occurred. Please try again.');
            });
        }
    });
    
    // Handle enter key on promo input
    const promoInput = document.getElementById('promo-code-input');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('apply-promo-btn').click();
            }
        });
    }
}

/**
 * Setup quantity controls for selected treatments
 */
function setupQuantityControls() {
    // Increase quantity - use event delegation
    document.addEventListener('click', function(e) {
        const increaseBtn = e.target.closest('.increase-quantity');
        if (increaseBtn) {
            e.preventDefault();
            
            const treatmentId = increaseBtn.dataset.treatmentId;
            const quantityInput = increaseBtn.parentNode.querySelector('.treatment-quantity');
            let currentQty = parseInt(quantityInput.value);
            let newQty = currentQty + 1;
            
            updateTreatmentQuantity(treatmentId, newQty);
        }
    });
    
    // Decrease quantity - use event delegation
    document.addEventListener('click', function(e) {
        const decreaseBtn = e.target.closest('.decrease-quantity');
        if (decreaseBtn) {
            e.preventDefault();
            
            const treatmentId = decreaseBtn.dataset.treatmentId;
            const quantityInput = decreaseBtn.parentNode.querySelector('.treatment-quantity');
            let currentQty = parseInt(quantityInput.value);
            
            // Min quantity is 1, if trying to go below 1, remove the treatment
            if (currentQty <= 1) {
                // Find and click the remove button for this treatment
                const removeBtn = document.querySelector(`.remove-treatment[data-treatment-id="${treatmentId}"]`);
                if (removeBtn) {
                    removeBtn.click();
                }
            } else {
                let newQty = currentQty - 1;
                updateTreatmentQuantity(treatmentId, newQty);
            }
        }
    });
}

/**
 * Update treatment quantity via AJAX
 */
function updateTreatmentQuantity(treatmentId, quantity) {
    fetch('/api/update-quantity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ 
            treatment_id: treatmentId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateQuoteSummary(data);
        } else {
            showToast('danger', data.message || 'Failed to update quantity');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('danger', 'An error occurred. Please try again.');
    });
}

/**
 * Update the quote summary section with new data
 */
function updateQuoteSummary(data) {
    // Update selected treatments list
    updateSelectedTreatments(data.treatments);
    
    // Update promo code section
    updatePromoSection(data.promo_code, data.promo_details);
    
    // Update totals
    updateTotals(data.totals);
    
    // Update continue button state
    updateContinueButton(data.treatments.length > 0);
}

/**
 * Update the selected treatments list in the quote summary
 */
function updateSelectedTreatments(treatments) {
    const container = document.getElementById('selected-treatments-container');
    if (!container) return;
    
    if (treatments.length === 0) {
        // Empty state
        container.innerHTML = `
            <div class="empty-cart mb-4">
                <div class="text-center">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <p>No treatments selected yet</p>
                </div>
            </div>
        `;
    } else {
        // List of treatments
        let html = `
            <h6 class="fw-bold mb-3">Selected Treatments</h6>
            <ul class="list-group mb-4" id="selected-treatments-list">
        `;
        
        treatments.forEach(treatment => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center" id="selected-${treatment.id}">
                    <div>
                        <div>${treatment.name}</div>
                        <div class="text-muted small">$${treatment.price} each</div>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="input-group quantity-control me-2">
                            <button class="btn btn-outline-secondary decrease-quantity" data-treatment-id="${treatment.id}">-</button>
                            <input type="text" class="form-control text-center treatment-quantity" value="${treatment.quantity || 1}" readonly>
                            <button class="btn btn-outline-secondary increase-quantity" data-treatment-id="${treatment.id}">+</button>
                        </div>
                        <button class="btn btn-sm btn-outline-danger remove-treatment" data-treatment-id="${treatment.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </li>
            `;
        });
        
        html += `</ul>`;
        container.innerHTML = html;
    }
}

/**
 * Update the promo code section in the quote summary
 */
function updatePromoSection(promoCode, promoDetails) {
    const container = document.querySelector('.promo-form');
    if (!container) return;
    
    if (promoCode) {
        // Promo applied state
        container.innerHTML = `
            <h6 class="fw-bold mb-3">Promo Code</h6>
            <div class="alert alert-success mb-3" id="promo-success">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${promoCode}</strong> applied!
                        ${promoDetails ? `<div class="small">${promoDetails.description}</div>` : ''}
                    </div>
                    <button class="btn btn-sm btn-outline-danger" id="remove-promo-btn">Remove</button>
                </div>
            </div>
        `;
    } else {
        // No promo applied state
        container.innerHTML = `
            <h6 class="fw-bold mb-3">Promo Code</h6>
            <div class="input-group mb-3">
                <input type="text" class="form-control" id="promo-code-input" placeholder="Enter code">
                <button class="btn btn-primary" type="button" id="apply-promo-btn">Apply</button>
            </div>
            <div class="alert alert-danger d-none" id="promo-error"></div>
        `;
    }
}

/**
 * Update the totals section in the quote summary
 */
function updateTotals(totals) {
    const subtotalElem = document.getElementById('subtotal');
    const discountElem = document.getElementById('discount');
    const discountRow = document.getElementById('discount-row');
    const totalElem = document.getElementById('total');
    
    if (subtotalElem) subtotalElem.textContent = `$${totals.subtotal}`;
    
    if (discountElem && discountRow) {
        if (totals.discount_amount > 0) {
            discountElem.textContent = `-$${totals.discount_amount}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    if (totalElem) totalElem.textContent = `$${totals.total}`;
}

/**
 * Update the continue button state based on whether treatments are selected
 */
function updateContinueButton(hasItems) {
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        if (hasItems) {
            continueBtn.classList.remove('disabled');
        } else {
            continueBtn.classList.add('disabled');
        }
    }
}

/**
 * Show a toast notification
 */
function showToast(type, message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    bsToast.show();
    
    // Remove after hiding
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

/**
 * Check URL parameters and handle them 
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    // If promo code is in URL, try to apply it
    if (promoCode) {
        // Wait for page to fully load
        setTimeout(() => {
            const promoInput = document.getElementById('promo-code-input');
            const applyButton = document.getElementById('apply-promo-btn');
            
            if (promoInput && applyButton) {
                promoInput.value = promoCode;
                applyButton.click();
            }
        }, 500);
    }
}