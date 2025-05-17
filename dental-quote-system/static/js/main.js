/**
 * MyDentalFly - Main JavaScript
 * Handles common functionality across the site
 */

$(document).ready(function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Mobile menu toggle
    $('.navbar-toggler').on('click', function() {
        $('body').toggleClass('menu-open');
    });

    // Handle flash message dismissal
    $('.alert-dismissible .btn-close').on('click', function() {
        $(this).parent().fadeOut();
    });

    // Auto-dismiss flash messages after 5 seconds
    setTimeout(function() {
        $('.alert-dismissible').fadeOut();
    }, 5000);

    // Handle form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Special offer cards animation
    $('.special-offer-card').hover(
        function() {
            $(this).find('.card-img-top').css('transform', 'scale(1.05)');
        },
        function() {
            $(this).find('.card-img-top').css('transform', 'scale(1)');
        }
    );

    // AJAX form submission handler
    $('.ajax-form').on('submit', function(e) {
        e.preventDefault();
        
        const form = $(this);
        const submitBtn = form.find('[type="submit"]');
        const originalBtnText = submitBtn.html();
        
        // Show loading state
        submitBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        submitBtn.prop('disabled', true);
        
        $.ajax({
            url: form.attr('action'),
            type: form.attr('method'),
            data: form.serialize(),
            success: function(response) {
                if (response.success) {
                    if (response.redirect) {
                        window.location.href = response.redirect;
                    } else if (response.message) {
                        showAlert('success', response.message);
                    }
                } else {
                    showAlert('danger', response.message || 'An error occurred. Please try again.');
                }
            },
            error: function() {
                showAlert('danger', 'An error occurred. Please try again.');
            },
            complete: function() {
                // Restore button state
                submitBtn.html(originalBtnText);
                submitBtn.prop('disabled', false);
            }
        });
    });

    // Function to display alerts
    window.showAlert = function(type, message) {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        $('#alert-container').html(alertHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            $('.alert-dismissible').fadeOut();
        }, 5000);
    };

    // Promotional code handling for special offers
    $('.special-offer-link').on('click', function(e) {
        const offerId = $(this).data('offer-id');
        
        // Store selected offer in session via AJAX
        $.ajax({
            url: '/select-special-offer',
            type: 'POST',
            data: { offer_id: offerId },
            success: function(response) {
                if (response.success && response.redirect) {
                    window.location.href = response.redirect;
                }
            }
        });
    });

    // Handle treatment selection in dental chart
    $('.dental-chart-tooth').on('click', function() {
        $(this).toggleClass('selected');
        const toothId = $(this).data('tooth-id');
        
        // Update hidden input with selected teeth
        updateSelectedTeeth();
    });

    // Function to update selected teeth in a hidden input
    function updateSelectedTeeth() {
        const selectedTeeth = [];
        $('.dental-chart-tooth.selected').each(function() {
            selectedTeeth.push($(this).data('tooth-id'));
        });
        
        $('#selected-teeth-input').val(selectedTeeth.join(','));
    }
});