/**
 * Main JavaScript file for the MyDentalFly Dental Quote System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle treatment selection
    setupTreatmentSelectionHandlers();
    
    // Handle promo code application
    setupPromoCodeHandlers();
    
    // Handle quantity updates
    setupQuantityHandlers();
});

/**
 * Setup event handlers for treatment selection
 */
function setupTreatmentSelectionHandlers() {
    // Add treatment buttons
    const addButtons = document.querySelectorAll('.add-treatment-btn');
    
    if (addButtons) {
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
    
    if (removeButtons) {
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
 * Setup event handlers for promo code application
 */
function setupPromoCodeHandlers() {
    // Apply promo code form
    const promoForm = document.getElementById('promo-form');
    
    if (promoForm) {
        promoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyPromoCode();
        });
    }
    
    // Remove promo code button
    const removePromoButton = document.getElementById('remove-promo-btn');
    
    if (removePromoButton) {
        removePromoButton.addEventListener('click', function(e) {
            e.preventDefault();
            removePromoCode();
        });
    }
}

/**
 * Setup event handlers for quantity updates
 */
function setupQuantityHandlers() {
    // Quantity input fields
    const quantityInputs = document.querySelectorAll('.treatment-quantity');
    
    if (quantityInputs) {
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const treatmentId = this.getAttribute('data-treatment-id');
                const quantity = parseInt(this.value);
                updateQuantity(treatmentId, quantity);
            });
        });
    }
}

/**
 * Add a treatment to the quote
 */
function addTreatment(treatmentId) {
    // Create form data
    const formData = new FormData();
    formData.append('treatment_id', treatmentId);
    formData.append('action', 'add');
    
    // Send AJAX request
    fetch('/quote-builder', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showMessage('success', data.message);
            
            // Update the quote summary
            updateQuoteSummary(data.totals);
            
            // Reload the page if not already in quote builder
            if (!window.location.pathname.includes('quote-builder')) {
                window.location.href = '/quote-builder';
            } else {
                // Refresh the treatment list
                loadSelectedTreatments();
            }
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('error', 'An error occurred while adding the treatment');
    });
}

/**
 * Remove a treatment from the quote
 */
function removeTreatment(treatmentId) {
    // Create form data
    const formData = new FormData();
    formData.append('treatment_id', treatmentId);
    formData.append('action', 'remove');
    
    // Send AJAX request
    fetch('/quote-builder', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showMessage('success', data.message);
            
            // Update the quote summary
            updateQuoteSummary(data.totals);
            
            // Remove the treatment from the list
            const treatmentElement = document.getElementById(`treatment-${treatmentId}`);
            if (treatmentElement) {
                treatmentElement.remove();
            }
            
            // Check if there are no treatments left
            const treatmentList = document.getElementById('selected-treatments-list');
            if (treatmentList && treatmentList.children.length === 0) {
                treatmentList.innerHTML = '<div class="alert alert-info">No treatments selected yet. Browse treatments above to add them to your quote.</div>';
            }
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('error', 'An error occurred while removing the treatment');
    });
}

/**
 * Update treatment quantity
 */
function updateQuantity(treatmentId, quantity) {
    // Validate quantity
    if (quantity <= 0) {
        removeTreatment(treatmentId);
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('treatment_id', treatmentId);
    formData.append('action', 'update_quantity');
    formData.append('quantity', quantity);
    
    // Send AJAX request
    fetch('/quote-builder', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showMessage('success', data.message);
            
            // Update the quote summary
            updateQuoteSummary(data.totals);
            
            // Update the treatment price
            updateTreatmentPrice(treatmentId, quantity);
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('error', 'An error occurred while updating the quantity');
    });
}

/**
 * Apply a promo code
 */
function applyPromoCode() {
    // Get the promo code
    const promoCode = document.getElementById('promo-code').value;
    
    if (!promoCode) {
        showMessage('error', 'Please enter a promo code');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('promo_code', promoCode);
    
    // Send AJAX request
    fetch('/promo/apply-promo', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showMessage('success', data.message);
            
            // Update the quote summary
            updateQuoteSummary(data.totals);
            
            // Update the promo code section
            updatePromoCodeSection(promoCode, data.promo_details);
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('error', 'An error occurred while applying the promo code');
    });
}

/**
 * Remove a promo code
 */
function removePromoCode() {
    // Send AJAX request
    fetch('/promo/remove-promo', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showMessage('success', data.message);
            
            // Update the quote summary
            updateQuoteSummary(data.totals);
            
            // Clear the promo code section
            clearPromoCodeSection();
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('error', 'An error occurred while removing the promo code');
    });
}

/**
 * Load selected treatments
 */
function loadSelectedTreatments() {
    // Get the selected treatments container
    const treatmentsContainer = document.getElementById('selected-treatments-list');
    
    if (!treatmentsContainer) {
        return;
    }
    
    // Clear the container
    treatmentsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading treatments...</div></div>';
    
    // Send AJAX request
    fetch('/quote-builder', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.text())
    .then(data => {
        // Extract the treatments list from the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const newTreatmentsList = doc.getElementById('selected-treatments-list');
        
        if (newTreatmentsList) {
            treatmentsContainer.innerHTML = newTreatmentsList.innerHTML;
            
            // Reinitialize event handlers
            setupTreatmentSelectionHandlers();
            setupQuantityHandlers();
        } else {
            treatmentsContainer.innerHTML = '<div class="alert alert-info">No treatments selected yet. Browse treatments above to add them to your quote.</div>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        treatmentsContainer.innerHTML = '<div class="alert alert-danger">An error occurred while loading treatments. Please refresh the page.</div>';
    });
}

/**
 * Update the quote summary
 */
function updateQuoteSummary(totals) {
    if (!totals) return;
    
    // Update subtotal
    const subtotalElement = document.getElementById('quote-subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `$${totals.subtotal.toFixed(2)}`;
    }
    
    // Update discount
    const discountElement = document.getElementById('quote-discount');
    if (discountElement) {
        discountElement.textContent = `-$${totals.discount.toFixed(2)}`;
        
        // Show/hide discount row
        const discountRow = document.getElementById('discount-row');
        if (discountRow) {
            discountRow.style.display = totals.discount > 0 ? 'table-row' : 'none';
        }
    }
    
    // Update total
    const totalElement = document.getElementById('quote-total');
    if (totalElement) {
        totalElement.textContent = `$${totals.total.toFixed(2)}`;
    }
    
    // Update item count badges
    const itemCountBadges = document.querySelectorAll('.item-count-badge');
    if (itemCountBadges) {
        itemCountBadges.forEach(badge => {
            badge.textContent = totals.item_count;
            badge.style.display = totals.item_count > 0 ? 'inline-block' : 'none';
        });
    }
}

/**
 * Update the treatment price display
 */
function updateTreatmentPrice(treatmentId, quantity) {
    const treatment = document.getElementById(`treatment-${treatmentId}`);
    
    if (!treatment) return;
    
    // Get the unit price
    const unitPriceElement = treatment.querySelector('.unit-price');
    
    if (!unitPriceElement) return;
    
    const unitPrice = parseFloat(unitPriceElement.getAttribute('data-price'));
    
    // Update the total price
    const totalPriceElement = treatment.querySelector('.total-price');
    
    if (totalPriceElement) {
        const totalPrice = unitPrice * quantity;
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

/**
 * Update the promo code section
 */
function updatePromoCodeSection(promoCode, promoDetails) {
    const promoSection = document.getElementById('promo-section');
    
    if (!promoSection) return;
    
    // Update the display
    const promoDisplay = document.getElementById('promo-display');
    
    if (promoDisplay) {
        // Show the promo code
        promoDisplay.style.display = 'block';
        
        // Update the promo code text
        const promoCodeDisplay = document.getElementById('promo-code-display');
        if (promoCodeDisplay) {
            promoCodeDisplay.textContent = promoCode;
        }
        
        // Update the promo description
        const promoDescription = document.getElementById('promo-description');
        if (promoDescription && promoDetails) {
            promoDescription.textContent = promoDetails.description || '';
        }
    }
    
    // Hide the form and show the remove button
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
        promoForm.style.display = 'none';
    }
    
    const removePromoButton = document.getElementById('remove-promo-btn');
    if (removePromoButton) {
        removePromoButton.style.display = 'block';
    }
}

/**
 * Clear the promo code section
 */
function clearPromoCodeSection() {
    const promoSection = document.getElementById('promo-section');
    
    if (!promoSection) return;
    
    // Hide the promo display
    const promoDisplay = document.getElementById('promo-display');
    
    if (promoDisplay) {
        promoDisplay.style.display = 'none';
    }
    
    // Show the form and hide the remove button
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
        promoForm.style.display = 'block';
        
        // Clear the form field
        const promoCodeInput = document.getElementById('promo-code');
        if (promoCodeInput) {
            promoCodeInput.value = '';
        }
    }
    
    const removePromoButton = document.getElementById('remove-promo-btn');
    if (removePromoButton) {
        removePromoButton.style.display = 'none';
    }
}

/**
 * Show a message to the user
 */
function showMessage(type, message) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alert.role = 'alert';
    
    // Add message
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to page
    const messagesContainer = document.getElementById('messages-container');
    
    if (messagesContainer) {
        messagesContainer.appendChild(alert);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                alert.remove();
            }, 150);
        }, 5000);
    } else {
        // If no container, show alert at the top of the page
        const container = document.createElement('div');
        container.className = 'container mt-3';
        container.appendChild(alert);
        
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(container, main.firstChild);
            
            // Auto dismiss after 5 seconds
            setTimeout(() => {
                container.remove();
            }, 5000);
        }
    }
}