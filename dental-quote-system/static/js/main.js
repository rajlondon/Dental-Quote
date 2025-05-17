/**
 * MyDentalFly Quote System Main JavaScript
 * Handles AJAX form submissions and UI interactions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Apply Promo Code via AJAX
    setupPromoCodeForm();
    
    // Treatment Actions (Add, Remove, Update Quantity)
    setupTreatmentForms();
    
    // Auto-apply promo code from URL parameter
    autoApplyPromoFromUrl();
});

/**
 * Setup promo code form submission via AJAX
 */
function setupPromoCodeForm() {
    const promoForm = document.getElementById('promoCodeForm');
    const promoResult = document.getElementById('promoResult');
    
    if (promoForm) {
        promoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(promoForm);
            
            // Send AJAX request
            fetch('/apply-promo', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update quote summary
                    updateQuoteSummary(data.totals);
                    
                    // Show success message
                    if (promoResult) {
                        promoResult.innerHTML = `
                            <div class="alert alert-success" role="alert">
                                ${data.message}
                            </div>
                            <div class="applied-promo">
                                <div><strong>Applied Code:</strong> ${data.promo_details.code}</div>
                                <div><strong>Discount:</strong> 
                                    ${data.promo_details.discount_type === 'percentage' 
                                        ? data.promo_details.discount_value + '%' 
                                        : '$' + data.promo_details.discount_value}
                                </div>
                                <div>${data.promo_details.description}</div>
                                <button id="removePromoBtn" class="btn btn-sm btn-outline-danger mt-2">Remove</button>
                            </div>
                        `;
                        
                        // Setup remove promo button
                        const removeBtn = document.getElementById('removePromoBtn');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', removePromoCode);
                        }
                        
                        // Hide the form
                        promoForm.style.display = 'none';
                    }
                } else {
                    // Show error message
                    if (promoResult) {
                        promoResult.innerHTML = `
                            <div class="alert alert-danger" role="alert">
                                ${data.message}
                            </div>
                        `;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (promoResult) {
                    promoResult.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            An error occurred while processing your request. Please try again.
                        </div>
                    `;
                }
            });
        });
    }
}

/**
 * Remove promo code via AJAX
 */
function removePromoCode() {
    const promoForm = document.getElementById('promoCodeForm');
    const promoResult = document.getElementById('promoResult');
    
    // Send AJAX request
    fetch('/remove-promo', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update quote summary
            updateQuoteSummary(data.totals);
            
            // Clear promo result
            if (promoResult) {
                promoResult.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        ${data.message}
                    </div>
                `;
                
                // Show the form again
                if (promoForm) {
                    promoForm.style.display = 'block';
                    promoForm.reset();
                }
            }
        } else {
            if (promoResult) {
                promoResult.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        ${data.message}
                    </div>
                `;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (promoResult) {
            promoResult.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    An error occurred while processing your request. Please try again.
                </div>
            `;
        }
    });
}

/**
 * Setup treatment forms for AJAX submission
 */
function setupTreatmentForms() {
    // Add treatment forms
    const addForms = document.querySelectorAll('.add-treatment-form');
    addForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            
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
                    // Update selected treatments list
                    updateSelectedTreatments(data.selected_treatments);
                    
                    // Update quote summary
                    updateQuoteSummary(data.totals);
                    
                    // Show success notification
                    showNotification(data.message, 'success');
                } else {
                    showNotification(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred. Please try again.', 'danger');
            });
        });
    });
    
    // Remove treatment buttons
    setupRemoveTreatmentButtons();
    
    // Quantity controls
    setupQuantityControls();
}

/**
 * Setup event handlers for remove treatment buttons
 */
function setupRemoveTreatmentButtons() {
    const removeBtns = document.querySelectorAll('.remove-treatment-btn');
    
    removeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const treatmentId = this.getAttribute('data-id');
            const formData = new FormData();
            formData.append('treatment_id', treatmentId);
            
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
                    // Update selected treatments list
                    updateSelectedTreatments(data.selected_treatments);
                    
                    // Update quote summary
                    updateQuoteSummary(data.totals);
                    
                    // Show success notification
                    showNotification(data.message, 'success');
                } else {
                    showNotification(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred. Please try again.', 'danger');
            });
        });
    });
}

/**
 * Setup quantity control buttons and inputs
 */
function setupQuantityControls() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    quantityInputs.forEach(input => {
        // Get associated controls
        const decreaseBtn = input.previousElementSibling;
        const increaseBtn = input.nextElementSibling;
        const treatmentId = input.getAttribute('data-id');
        
        // Decrease button
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', function() {
                let quantity = parseInt(input.value);
                if (quantity > 1) {
                    quantity--;
                    input.value = quantity;
                    updateTreatmentQuantity(treatmentId, quantity);
                }
            });
        }
        
        // Increase button
        if (increaseBtn) {
            increaseBtn.addEventListener('click', function() {
                let quantity = parseInt(input.value);
                quantity++;
                input.value = quantity;
                updateTreatmentQuantity(treatmentId, quantity);
            });
        }
        
        // Input change
        input.addEventListener('change', function() {
            let quantity = parseInt(input.value);
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
                input.value = quantity;
            }
            updateTreatmentQuantity(treatmentId, quantity);
        });
    });
}

/**
 * Update treatment quantity via AJAX
 */
function updateTreatmentQuantity(treatmentId, quantity) {
    const formData = new FormData();
    formData.append('treatment_id', treatmentId);
    formData.append('quantity', quantity);
    
    // Send AJAX request
    fetch('/update-quantity', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update selected treatments list
            updateSelectedTreatments(data.selected_treatments);
            
            // Update quote summary
            updateQuoteSummary(data.totals);
        } else {
            showNotification(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred. Please try again.', 'danger');
    });
}

/**
 * Update the quote summary with new totals
 */
function updateQuoteSummary(totals) {
    const subtotalElem = document.getElementById('quote-subtotal');
    const discountElem = document.getElementById('quote-discount');
    const totalElem = document.getElementById('quote-total');
    
    if (subtotalElem) {
        subtotalElem.textContent = '$' + totals.subtotal.toFixed(2);
    }
    
    if (discountElem) {
        discountElem.textContent = '$' + totals.discount.toFixed(2);
    }
    
    if (totalElem) {
        totalElem.textContent = '$' + totals.total.toFixed(2);
    }
}

/**
 * Update the selected treatments list
 */
function updateSelectedTreatments(treatments) {
    const treatmentsList = document.getElementById('selected-treatments');
    
    if (treatmentsList) {
        if (treatments.length === 0) {
            treatmentsList.innerHTML = '<p class="text-muted">No treatments selected yet.</p>';
            return;
        }
        
        let html = '';
        
        treatments.forEach(treatment => {
            const quantity = treatment.quantity || 1;
            const itemTotal = treatment.price * quantity;
            
            html += `
                <div class="treatment-item">
                    <button class="btn btn-sm btn-outline-danger remove-btn remove-treatment-btn" data-id="${treatment.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="row">
                        <div class="col-md-8">
                            <h5>${treatment.name}</h5>
                            <p class="mb-2 text-muted">${treatment.description}</p>
                            <div class="quantity-control">
                                <button type="button" class="decrease-btn">-</button>
                                <input type="number" class="quantity-input" value="${quantity}" min="1" data-id="${treatment.id}">
                                <button type="button" class="increase-btn">+</button>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="price-tag mb-2">$${treatment.price}</div>
                            <div class="text-muted">Total: $${itemTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        treatmentsList.innerHTML = html;
        
        // Re-attach event handlers
        setupRemoveTreatmentButtons();
        setupQuantityControls();
    }
}

/**
 * Show a notification message
 */
function showNotification(message, type) {
    const notificationsArea = document.getElementById('notifications');
    
    if (notificationsArea) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        notificationsArea.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notificationsArea.removeChild(notification);
            }, 150);
        }, 5000);
    }
}

/**
 * Auto-apply promo code from URL parameter
 */
function autoApplyPromoFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
        const promoInput = document.getElementById('promoCodeInput');
        const promoForm = document.getElementById('promoCodeForm');
        
        if (promoInput && promoForm) {
            promoInput.value = promoCode;
            
            // Submit the form
            const event = new Event('submit', {
                'bubbles': true,
                'cancelable': true
            });
            
            promoForm.dispatchEvent(event);
        }
    }
}