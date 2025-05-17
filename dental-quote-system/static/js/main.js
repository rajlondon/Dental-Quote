/* MyDentalFly - Main JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top button functionality
    const scrollToTopButton = document.getElementById('scroll-to-top');
    
    if (scrollToTopButton) {
        // Show/hide scroll to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopButton.style.display = 'block';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        });
        
        // Scroll to top when button is clicked
        scrollToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Treatment counter functionality
    updateTreatmentCounter();
    
    // Handle AJAX form submissions for quote builder
    setupAjaxForms();
    
    // Handle promo code application and removal
    setupPromoCodeForms();
});

/**
 * Update the treatment counter in the navbar
 */
function updateTreatmentCounter() {
    const counter = document.getElementById('treatment-counter');
    const selectedTreatments = document.querySelectorAll('.selected-treatment-item');
    
    if (counter && selectedTreatments.length > 0) {
        counter.textContent = selectedTreatments.length;
        counter.classList.remove('d-none');
    } else if (counter) {
        counter.classList.add('d-none');
    }
}

/**
 * Setup AJAX form submissions for treatments
 */
function setupAjaxForms() {
    const ajaxForms = document.querySelectorAll('.ajax-form');
    
    ajaxForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Disable the button during submission
            if (submitButton) {
                submitButton.disabled = true;
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Processing...';
            }
            
            // Send AJAX request
            fetch(form.action, {
                method: form.method || 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
                
                if (data.success) {
                    // Show success message
                    showMessage(data.message, 'success');
                    
                    // If the form is for adding/removing treatments, update the selected treatments
                    if (form.closest('.treatment-card') || form.closest('.selected-treatment-item')) {
                        updateSelectedTreatments(data);
                    }
                } else {
                    // Show error message
                    showMessage(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred. Please try again.', 'danger');
                
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            });
        });
    });
}

/**
 * Setup promo code application and removal
 */
function setupPromoCodeForms() {
    const promoForm = document.getElementById('promo-form');
    const removePromoBtn = document.getElementById('remove-promo-btn');
    
    if (promoForm) {
        promoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const promoInput = this.querySelector('input[name="promo_code"]');
            
            // Disable the button during submission
            if (submitButton) {
                submitButton.disabled = true;
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Applying...';
            }
            
            // Send AJAX request
            fetch(promoForm.action, {
                method: promoForm.method || 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
                
                if (data.success) {
                    // Show success message and update totals
                    showMessage(data.message, 'success');
                    updateTotals(data.totals);
                    
                    // Show promo details
                    showPromoDetails(data.promo_details);
                    
                    // Clear the input
                    if (promoInput) {
                        promoInput.value = '';
                    }
                } else {
                    // Show error message
                    showMessage(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred. Please try again.', 'danger');
                
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            });
        });
    }
    
    if (removePromoBtn) {
        removePromoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Disable the button during submission
            this.disabled = true;
            const originalText = this.textContent;
            this.textContent = 'Removing...';
            
            // Send AJAX request
            fetch(this.getAttribute('data-url'), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                this.disabled = false;
                this.textContent = originalText;
                
                if (data.success) {
                    // Show success message and update totals
                    showMessage(data.message, 'info');
                    updateTotals(data.totals);
                    
                    // Hide promo details
                    hidePromoDetails();
                } else {
                    // Show error message
                    showMessage(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred. Please try again.', 'danger');
                
                this.disabled = false;
                this.textContent = originalText;
            });
        });
    }
}

/**
 * Show promo details after applying a promo code
 */
function showPromoDetails(promoDetails) {
    const promoDetailsContainer = document.getElementById('promo-details');
    const appliedPromoCode = document.getElementById('applied-promo-code');
    const removePromoBtn = document.getElementById('remove-promo-btn');
    
    if (promoDetailsContainer && appliedPromoCode && promoDetails) {
        appliedPromoCode.textContent = promoDetails.code || promoDetails.promo_code;
        promoDetailsContainer.classList.remove('d-none');
        
        if (removePromoBtn) {
            removePromoBtn.classList.remove('d-none');
        }
    }
}

/**
 * Hide promo details after removing a promo code
 */
function hidePromoDetails() {
    const promoDetailsContainer = document.getElementById('promo-details');
    const removePromoBtn = document.getElementById('remove-promo-btn');
    
    if (promoDetailsContainer) {
        promoDetailsContainer.classList.add('d-none');
    }
    
    if (removePromoBtn) {
        removePromoBtn.classList.add('d-none');
    }
}

/**
 * Update selected treatments in quote builder
 */
function updateSelectedTreatments(data) {
    // Refresh the page to update the selected treatments
    // In a production environment, this would be done via AJAX
    // to avoid a full page reload
    window.location.reload();
}

/**
 * Update quote totals after changes
 */
function updateTotals(totals) {
    if (!totals) return;
    
    const subtotalElem = document.getElementById('subtotal-amount');
    const discountElem = document.getElementById('discount-amount');
    const totalElem = document.getElementById('total-amount');
    
    if (subtotalElem) {
        subtotalElem.textContent = '$' + totals.subtotal.toFixed(2);
    }
    
    if (discountElem) {
        if (totals.discount > 0) {
            discountElem.parentElement.classList.remove('d-none');
            discountElem.textContent = '-$' + totals.discount.toFixed(2);
        } else {
            discountElem.parentElement.classList.add('d-none');
        }
    }
    
    if (totalElem) {
        totalElem.textContent = '$' + totals.total.toFixed(2);
    }
}

/**
 * Show a message to the user
 */
function showMessage(message, type = 'info') {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find a suitable container for the alert
    let container = document.querySelector('.container .mt-3');
    if (!container) {
        container = document.createElement('div');
        container.className = 'container mt-3';
        const mainContainer = document.querySelector('.container');
        if (mainContainer) {
            mainContainer.parentNode.insertBefore(container, mainContainer);
        } else {
            document.body.insertBefore(container, document.body.firstChild);
        }
    }
    
    // Add alert to the container
    container.appendChild(alertElement);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertElement.parentNode) {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, 5000);
}

/**
 * Handle quantity changes for treatments
 */
function updateQuantity(treatmentId, increment) {
    const inputElem = document.getElementById(`quantity-${treatmentId}`);
    if (!inputElem) return;
    
    let currentValue = parseInt(inputElem.value) || 1;
    currentValue += increment;
    
    // Ensure the value is at least 1
    if (currentValue < 1) {
        currentValue = 1;
    }
    
    inputElem.value = currentValue;
    
    // Trigger the update form submission
    const updateForm = document.getElementById(`update-form-${treatmentId}`);
    if (updateForm) {
        const event = new Event('submit', { cancelable: true });
        updateForm.dispatchEvent(event);
    }
}