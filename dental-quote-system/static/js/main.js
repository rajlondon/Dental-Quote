/**
 * Main JavaScript file for the MyDentalFly Dental Quote System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle URL parameter for promo code auto-application
    function handlePromoCodeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const promoCode = urlParams.get('promo');
        
        if (promoCode && document.getElementById('promo-form')) {
            const promoInput = document.querySelector('#promo-form input[name="promo_code"]');
            if (promoInput) {
                promoInput.value = promoCode;
                
                // Auto-submit the form if there's a promo code in the URL
                const promoForm = document.getElementById('promo-form');
                if (promoForm) {
                    promoForm.dispatchEvent(new Event('submit'));
                }
                
                // Remove the promo parameter from the URL without reloading the page
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }
    
    // Call the function to handle promo codes from URL
    handlePromoCodeFromUrl();
    
    // Add treatment counter badge to navbar
    function updateTreatmentCounter() {
        const treatmentsList = document.querySelector('.list-group');
        if (treatmentsList) {
            const treatmentCount = treatmentsList.querySelectorAll('li').length;
            const counterBadge = document.getElementById('treatment-counter');
            
            if (counterBadge) {
                counterBadge.textContent = treatmentCount.toString();
                
                if (treatmentCount > 0) {
                    counterBadge.classList.remove('d-none');
                } else {
                    counterBadge.classList.add('d-none');
                }
            }
        }
    }
    
    // Call the function to update treatment counter
    updateTreatmentCounter();
    
    // Show scroll-to-top button when scrolling down
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add event listeners for category filter buttons in quote builder
    const categoryFilters = document.querySelectorAll('.category-filter');
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Remove active class from all filters
                categoryFilters.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked filter
                this.classList.add('active');
                
                // Show/hide treatments based on category
                const treatmentCards = document.querySelectorAll('.treatment-card');
                
                treatmentCards.forEach(card => {
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        card.closest('.col-md-6').style.display = 'block';
                    } else {
                        card.closest('.col-md-6').style.display = 'none';
                    }
                });
            });
        });
    }
});