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
            if (nextStep === 'patient-info') {
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
                // Reload the page to reflect changes
                window.location.reload();
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
                // Reload the page to reflect changes
                window.location.reload();
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
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
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
                window.location.reload();
            }
        })
        .catch(error => console.error('Error removing promo code:', error));
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
                    showSuccessModal(data.quote_id, data.message);
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
    
    // =====================================
    // Success Modal
    // =====================================
    function showSuccessModal(quoteId, message) {
        // Create modal if it doesn't exist
        let modal = document.querySelector('.modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            modalContent.innerHTML = `
                <div class="success-icon">✓</div>
                <h3>Quote Submitted!</h3>
                <p>Your quote has been successfully generated.</p>
                <p>Quote ID: <strong>${quoteId}</strong></p>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn next-btn new-quote-btn">Create New Quote</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Add event listener to new quote button
            const newQuoteBtn = modal.querySelector('.new-quote-btn');
            newQuoteBtn.addEventListener('click', () => {
                resetQuote();
            });
        }
        
        // Show the modal
        modal.classList.add('visible');
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