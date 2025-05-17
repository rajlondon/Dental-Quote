// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // =====================================
    // Step Navigation
    // =====================================
    const stepButtons = document.querySelectorAll('.step-btn');
    const stepPanels = document.querySelectorAll('.step-panel');
    
    // Add click event listeners to step buttons
    stepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const step = button.dataset.step;
            setActiveStep(step);
        });
    });
    
    // Next/Back buttons
    const nextButtons = document.querySelectorAll('.next-btn');
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStep = button.dataset.nextStep;
            if (nextStep === 'review') {
                // Validate patient info before proceeding
                if (validatePatientForm()) {
                    setActiveStep(nextStep);
                }
            } else {
                setActiveStep(nextStep);
            }
        });
    });
    
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = button.dataset.prevStep;
            setActiveStep(prevStep);
        });
    });
    
    // Function to set active step and update UI
    function setActiveStep(step) {
        // Update server-side state
        fetch('/api/quote/set-step', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ step }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI
                stepButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.step === step);
                });
                
                stepPanels.forEach(panel => {
                    panel.classList.toggle('hidden', panel.id !== `${step}-step`);
                });
            }
        })
        .catch(error => console.error('Error setting step:', error));
    }
    
    // =====================================
    // Treatment Selection
    // =====================================
    const treatmentCards = document.querySelectorAll('.treatment-card');
    
    treatmentCards.forEach(card => {
        card.addEventListener('click', () => {
            const treatmentId = parseInt(card.dataset.id);
            addTreatment(treatmentId);
        });
    });
    
    function addTreatment(treatmentId) {
        fetch('/api/quote/add-treatment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ treatment_id: treatmentId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the UI without refreshing the page
                updateTreatmentsList(data.treatments);
                updateTotals(data.totals);
                
                // Show a success indicator on the treatment card
                const card = document.querySelector(`.treatment-card[data-id="${treatmentId}"]`);
                if (card) {
                    card.classList.add('selected');
                    setTimeout(() => {
                        card.classList.remove('selected');
                    }, 1000);
                }
                
                // Enable the continue button if there are treatments
                if (data.treatments.length > 0) {
                    const nextBtn = document.querySelector('#treatments-step .next-btn');
                    if (nextBtn) {
                        nextBtn.style.display = 'block';
                    }
                }
            }
        })
        .catch(error => console.error('Error adding treatment:', error));
    }
    
    // Remove treatment buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const instanceId = button.dataset.instanceId;
            removeTreatment(instanceId);
        });
    });
    
    function removeTreatment(instanceId) {
        fetch('/api/quote/remove-treatment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instance_id: instanceId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI without page refresh
                updateTreatmentsList(data.treatments);
                updateTotals(data.totals);
                
                // Hide the continue button if no treatments
                if (data.treatments.length === 0) {
                    const nextBtn = document.querySelector('#treatments-step .next-btn');
                    if (nextBtn) {
                        nextBtn.style.display = 'none';
                    }
                }
            }
        })
        .catch(error => console.error('Error removing treatment:', error));
    }
    
    // =====================================
    // Promo Code Application
    // =====================================
    const applyPromoBtn = document.querySelector('.apply-promo-btn');
    const promoInput = document.getElementById('promo-code');
    const promoMessage = document.querySelector('.promo-message');
    const promoChips = document.querySelectorAll('.promo-chip');
    
    // Click on promo chip to fill the input
    promoChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const promoText = chip.textContent.split(' ')[0]; // Extract the code part
            promoInput.value = promoText;
        });
    });
    
    // Apply promo code
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => {
            const promoCode = promoInput.value.trim();
            if (!promoCode) {
                showPromoMessage('Please enter a promo code', false);
                return;
            }
            
            applyPromoCode(promoCode);
        });
    }
    
    function applyPromoCode(promoCode) {
        fetch('/api/quote/apply-promo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promo_code: promoCode }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showPromoMessage(`Promo code ${promoCode} applied successfully!`, true);
                
                // Update UI without page refresh
                updatePromoCodeDisplay(promoCode, data.discount);
                updateTotals(data.totals);
                
                // Clear input field
                if (promoInput) {
                    promoInput.value = '';
                }
            } else {
                showPromoMessage(data.error || 'Failed to apply promo code', false);
            }
        })
        .catch(error => {
            console.error('Error applying promo code:', error);
            showPromoMessage('An error occurred. Please try again.', false);
        });
    }
    
    // Remove promo code
    const removePromoBtn = document.querySelector('.remove-promo-btn');
    if (removePromoBtn) {
        removePromoBtn.addEventListener('click', () => {
            removePromoCode();
        });
    }
    
    function removePromoCode() {
        fetch('/api/quote/remove-promo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI without page refresh
                const promoDisplayEl = document.querySelector('.promo-code-display');
                if (promoDisplayEl) {
                    promoDisplayEl.innerHTML = '';
                    promoDisplayEl.style.display = 'none';
                }
                
                const removePromoBtn = document.querySelector('.remove-promo-btn');
                if (removePromoBtn) {
                    removePromoBtn.style.display = 'none';
                }
                
                // Update totals
                updateTotals(data.totals);
            }
        })
        .catch(error => console.error('Error removing promo code:', error));
    }
    
    // Helper functions for updating the UI without page refreshes
    function updateTreatmentsList(treatments) {
        const selectedTreatmentsEl = document.querySelector('.selected-treatments');
        if (!selectedTreatmentsEl) return;
        
        // Clear existing treatments
        selectedTreatmentsEl.innerHTML = '';
        
        if (treatments && treatments.length > 0) {
            treatments.forEach(treatment => {
                const treatmentItem = document.createElement('div');
                treatmentItem.className = 'treatment-item';
                treatmentItem.innerHTML = `
                    <span>${treatment.name}</span>
                    <span>$${treatment.price.toFixed(2)}</span>
                    <button class="remove-btn" data-id="${treatment.instance_id}">Remove</button>
                `;
                selectedTreatmentsEl.appendChild(treatmentItem);
                
                // Add event listener to the new remove button
                const removeBtn = treatmentItem.querySelector('.remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const instanceId = removeBtn.getAttribute('data-id');
                    removeTreatment(instanceId);
                });
            });
        } else {
            selectedTreatmentsEl.innerHTML = '<p>No treatments selected yet.</p>';
        }
    }
    
    function updateTotals(totals) {
        if (!totals) return;
        
        const subtotalEl = document.getElementById('subtotal');
        const discountEl = document.getElementById('discount');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `$${totals.discount.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;
        
        // Update review step totals as well if they exist
        const reviewSubtotalEl = document.getElementById('review-subtotal');
        const reviewDiscountEl = document.getElementById('review-discount');
        const reviewTotalEl = document.getElementById('review-total');
        
        if (reviewSubtotalEl) reviewSubtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
        if (reviewDiscountEl) reviewDiscountEl.textContent = `$${totals.discount.toFixed(2)}`;
        if (reviewTotalEl) reviewTotalEl.textContent = `$${totals.total.toFixed(2)}`;
    }
    
    function updatePromoCodeDisplay(promoCode, discount) {
        const promoDisplayEl = document.querySelector('.promo-code-display');
        if (!promoDisplayEl) return;
        
        promoDisplayEl.innerHTML = `
            <p>Applied Promo Code: <strong>${promoCode}</strong> (${discount}% off)</p>
        `;
        promoDisplayEl.style.display = 'block';
        
        const removePromoBtn = document.querySelector('.remove-promo-btn');
        if (removePromoBtn) {
            removePromoBtn.style.display = 'inline-block';
        }
    }
    
    function showPromoMessage(message, isSuccess) {
        promoMessage.textContent = message;
        promoMessage.className = 'promo-message';
        promoMessage.classList.add(isSuccess ? 'success-message' : 'error-message');
    }
    
    // =====================================
    // Patient Information
    // =====================================
    const patientForm = document.getElementById('patient-info-form');
    const patientNameInput = document.getElementById('patient-name');
    const patientEmailInput = document.getElementById('patient-email');
    const patientPhoneInput = document.getElementById('patient-phone');
    const preferredDateInput = document.getElementById('preferred-date');
    const patientNotesInput = document.getElementById('patient-notes');
    
    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Update patient info when inputs change (debounced)
    const updatePatientInfo = debounce(() => {
        const patientInfo = {
            name: patientNameInput.value,
            email: patientEmailInput.value,
            phone: patientPhoneInput.value,
            preferred_date: preferredDateInput.value,
            notes: patientNotesInput.value
        };
        
        fetch('/api/quote/update-patient-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patient_info: patientInfo }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Patient info updated:', data.success);
        })
        .catch(error => console.error('Error updating patient info:', error));
    }, 500);
    
    // Add event listeners to all patient info inputs
    if (patientNameInput) patientNameInput.addEventListener('input', updatePatientInfo);
    if (patientEmailInput) patientEmailInput.addEventListener('input', updatePatientInfo);
    if (patientPhoneInput) patientPhoneInput.addEventListener('input', updatePatientInfo);
    if (preferredDateInput) preferredDateInput.addEventListener('change', updatePatientInfo);
    if (patientNotesInput) patientNotesInput.addEventListener('input', updatePatientInfo);
    
    function validatePatientForm() {
        if (!patientNameInput.value.trim()) {
            alert('Please enter your name');
            patientNameInput.focus();
            return false;
        }
        
        if (!patientEmailInput.value.trim()) {
            alert('Please enter your email');
            patientEmailInput.focus();
            return false;
        }
        
        if (!patientPhoneInput.value.trim()) {
            alert('Please enter your phone number');
            patientPhoneInput.focus();
            return false;
        }
        
        return true;
    }
    
    // =====================================
    // Submit Quote
    // =====================================
    const submitBtn = document.querySelector('.submit-btn');
    const modal = document.getElementById('success-modal');
    const quoteIdElement = document.getElementById('quote-id');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            fetch('/api/quote/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success modal
                    quoteIdElement.textContent = `Quote ID: ${data.quote_id}`;
                    modal.classList.add('visible');
                } else {
                    alert('Failed to submit quote. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error submitting quote:', error);
                alert('An error occurred. Please try again.');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Quote';
            });
        });
    }
    
    // New quote button in success modal
    const newQuoteBtn = document.querySelector('.new-quote-btn');
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', () => {
            resetQuote();
        });
    }
    
    function resetQuote() {
        fetch('/api/quote/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/quote-builder';
            }
        })
        .catch(error => console.error('Error resetting quote:', error));
    }
});