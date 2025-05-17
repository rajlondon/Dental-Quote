/**
 * Main JavaScript file for Dental Quote System
 * Provides common functionality used across multiple pages
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss alerts after 5 seconds
    const autoCloseAlerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    autoCloseAlerts.forEach(function(alert) {
        setTimeout(function() {
            const closeButton = alert.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            } else {
                alert.classList.add('fade');
                setTimeout(function() {
                    alert.remove();
                }, 150);
            }
        }, 5000);
    });
    
    // Dynamic form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Handle "Add to Quote" buttons on homepage
    const addToQuoteButtons = document.querySelectorAll('.add-to-quote-btn');
    addToQuoteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const treatmentId = this.dataset.treatmentId;
            window.location.href = `/quote-builder?add_treatment=${treatmentId}`;
        });
    });
    
    // Format currency inputs
    const currencyInputs = document.querySelectorAll('.currency-input');
    currencyInputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            let value = parseFloat(this.value.replace(/[^0-9.]/g, ''));
            if (!isNaN(value)) {
                this.value = value.toFixed(2);
            }
        });
    });
    
    // Handle bookmark special offers
    const bookmarkButtons = document.querySelectorAll('.btn-bookmark');
    bookmarkButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const offerId = this.dataset.offerId;
            const isBookmarked = this.classList.contains('active');
            
            // Toggle active state
            this.classList.toggle('active');
            
            // Update icon
            const icon = this.querySelector('i');
            if (isBookmarked) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                showToast('Offer removed from favorites');
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showToast('Offer added to favorites');
            }
            
            // Store in local storage
            const bookmarks = JSON.parse(localStorage.getItem('bookmarkedOffers') || '[]');
            if (isBookmarked) {
                const index = bookmarks.indexOf(offerId);
                if (index > -1) {
                    bookmarks.splice(index, 1);
                }
            } else {
                if (!bookmarks.includes(offerId)) {
                    bookmarks.push(offerId);
                }
            }
            
            localStorage.setItem('bookmarkedOffers', JSON.stringify(bookmarks));
        });
    });
    
    // Initialize bookmarked offers from local storage
    if (bookmarkButtons.length > 0) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedOffers') || '[]');
        bookmarkButtons.forEach(function(button) {
            const offerId = button.dataset.offerId;
            if (bookmarks.includes(offerId)) {
                button.classList.add('active');
                const icon = button.querySelector('i');
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        });
    }
    
    // Handle treatment quantity change on quote page
    const quantityControls = document.querySelectorAll('.treatment-quantity');
    quantityControls.forEach(function(input) {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            }
        });
    });
    
    // Check if URL contains 'add_treatment' parameter and handle it
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('add_treatment')) {
        const treatmentId = urlParams.get('add_treatment');
        const addButton = document.querySelector(`.btn-add-treatment[data-treatment-id="${treatmentId}"]`);
        
        if (addButton) {
            // Scroll to the treatment
            const treatmentItem = document.querySelector(`.treatment-item[data-treatment-id="${treatmentId}"]`);
            if (treatmentItem) {
                setTimeout(function() {
                    treatmentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    treatmentItem.classList.add('highlight-item');
                    setTimeout(function() {
                        treatmentItem.classList.remove('highlight-item');
                    }, 1500);
                }, 500);
            }
            
            // Simulate click on add button
            setTimeout(function() {
                addButton.click();
            }, 1000);
        }
    }
    
    // Handle promo code from URL
    if (urlParams.has('promo_code')) {
        const promoCode = urlParams.get('promo_code');
        const promoInput = document.getElementById('promo_code');
        const applyButton = document.getElementById('btn-apply-promo');
        
        if (promoInput && applyButton) {
            promoInput.value = promoCode;
            setTimeout(function() {
                applyButton.click();
            }, 500);
        }
    }
});

// Show a toast notification
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.id = toastId;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toastEl);
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // Remove toast after it's hidden
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove();
    });
}

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Calculate discount amount
function calculateDiscount(subtotal, discountType, discountValue) {
    if (discountType === 'percentage') {
        return subtotal * (discountValue / 100);
    } else if (discountType === 'fixed_amount') {
        return Math.min(discountValue, subtotal);
    }
    return 0;
}

// Check if a treatment ID is compatible with a promotion
function isPromotionCompatible(promotionApplicableTreatments, selectedTreatmentIds) {
    if (!promotionApplicableTreatments || promotionApplicableTreatments.length === 0) {
        return true; // No restrictions, compatible with all treatments
    }
    
    // Check if any of the selected treatments are in the applicable treatments list
    return selectedTreatmentIds.some(id => promotionApplicableTreatments.includes(id));
}

// Validate email format
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}