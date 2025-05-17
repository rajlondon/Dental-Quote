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
                updateTotals(data.totals, promoCode); // Pass promoCode to updateTotals
                
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
                    promoDisplayEl.textContent = '';
                    promoDisplayEl.style.display = 'none';
                }
                
                const removePromoBtn = document.querySelector('.remove-promo-btn');
                if (removePromoBtn) {
                    removePromoBtn.style.display = 'none';
                }
                
                // Show success message
                const messageEl = document.querySelector('.promo-message');
                if (messageEl) {
                    messageEl.textContent = 'Promo code removed successfully';
                    messageEl.className = 'promo-message success-message';
                }
                
                // Enable promo code input and apply button
                const promoCodeInput = document.getElementById('promo-code');
                const applyPromoBtn = document.querySelector('.apply-promo-btn');
                
                if (promoCodeInput) {
                    promoCodeInput.disabled = false;
                }
                
                if (applyPromoBtn) {
                    applyPromoBtn.disabled = false;
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
            const treatmentList = document.createElement('ul');
            treatmentList.className = 'treatment-list';
            
            treatments.forEach(treatment => {
                const treatmentItem = document.createElement('li');
                treatmentItem.className = 'treatment-item';
                treatmentItem.innerHTML = `
                    <span>${treatment.name}</span>
                    <div>
                        <span>$${treatment.price.toFixed(2)}</span>
                        <button class="remove-btn" data-instance-id="${treatment.instance_id}">✕</button>
                    </div>
                `;
                treatmentList.appendChild(treatmentItem);
                
                // Add event listener to the new remove button
                const removeBtn = treatmentItem.querySelector('.remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const instanceId = removeBtn.getAttribute('data-instance-id');
                    removeTreatment(instanceId);
                });
            });
            
            selectedTreatmentsEl.appendChild(treatmentList);
            
            // Show the continue button in the treatments step
            const nextBtn = document.querySelector('#treatments-step .next-btn');
            if (nextBtn) {
                nextBtn.style.display = 'block';
            }
        } else {
            selectedTreatmentsEl.innerHTML = '<p class="empty-message">No treatments selected yet</p>';
            
            // Hide the continue button if no treatments
            const nextBtn = document.querySelector('#treatments-step .next-btn');
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
        }
    }
    
    function updateTotals(totals, promoCode) {
        if (!totals) return;
        
        // Update the totals in the selected treatments panel
        const totalRows = document.querySelectorAll('.total-row');
        if (totalRows.length > 0) {
            // Find the subtotal row
            const subtotalRow = document.querySelector('.total-row:not(.discount):not(.grand-total)');
            if (subtotalRow) {
                const subtotalValueEl = subtotalRow.querySelector('span:last-child');
                if (subtotalValueEl) {
                    subtotalValueEl.textContent = `$${totals.subtotal.toFixed(2)}`;
                }
            }
            
            // Find the discount row
            const discountRow = document.querySelector('.total-row.discount');
            
            // If we have a discount
            if (totals.discount_amount > 0) {
                // If promo code was provided or we can get it from the display
                if (!promoCode) {
                    // Try to get promo code from displayed message
                    const promoDisplayEl = document.querySelector('.promo-code-display');
                    if (promoDisplayEl && promoDisplayEl.textContent) {
                        const match = promoDisplayEl.textContent.match(/Applied Promo: (\w+)/);
                        if (match && match[1]) {
                            promoCode = match[1];
                        }
                    }
                }
                
                if (discountRow) {
                    // Update existing discount row
                    const discountLabelEl = discountRow.querySelector('span:first-child');
                    const discountValueEl = discountRow.querySelector('span:last-child');
                    
                    if (discountLabelEl && promoCode) {
                        discountLabelEl.textContent = `Discount - ${promoCode} (${totals.discount_percentage}%):`;
                    }
                    
                    if (discountValueEl) {
                        discountValueEl.textContent = `-$${totals.discount_amount.toFixed(2)}`;
                    }
                } else {
                    // Create new discount row if it doesn't exist
                    const newDiscountRow = document.createElement('div');
                    newDiscountRow.className = 'total-row discount';
                    
                    const discountLabelEl = document.createElement('span');
                    if (promoCode) {
                        discountLabelEl.textContent = `Discount - ${promoCode} (${totals.discount_percentage}%):`;
                    } else {
                        discountLabelEl.textContent = `Discount (${totals.discount_percentage}%):`;
                    }
                    
                    const discountValueEl = document.createElement('span');
                    discountValueEl.textContent = `-$${totals.discount_amount.toFixed(2)}`;
                    
                    newDiscountRow.appendChild(discountLabelEl);
                    newDiscountRow.appendChild(discountValueEl);
                    
                    // Insert before grand total
                    const totalRow = document.querySelector('.total-row.grand-total');
                    if (totalRow) {
                        totalRow.parentNode.insertBefore(newDiscountRow, totalRow);
                    }
                }
            } else if (discountRow) {
                // Remove discount row if there's no discount
                discountRow.remove();
            }
            
            // Find the total row
            const totalRow = document.querySelector('.total-row.grand-total');
            if (totalRow) {
                const totalValueEl = totalRow.querySelector('span:last-child');
                if (totalValueEl) {
                    totalValueEl.textContent = `$${totals.total.toFixed(2)}`;
                }
            }
        }
        
        // Update the review step totals as well if they exist
        const reviewTotals = document.querySelector('.review-totals');
        if (reviewTotals) {
            // Find the subtotal row in review
            const reviewSubtotalRow = reviewTotals.querySelector('.total-row:not(.discount):not(.grand-total)');
            if (reviewSubtotalRow) {
                const reviewSubtotalValueEl = reviewSubtotalRow.querySelector('span:last-child');
                if (reviewSubtotalValueEl) {
                    reviewSubtotalValueEl.textContent = `$${totals.subtotal.toFixed(2)}`;
                }
            }
            
            // Find the discount row in review
            const reviewDiscountRow = reviewTotals.querySelector('.total-row.discount');
            if (reviewDiscountRow) {
                const reviewDiscountValueEl = reviewDiscountRow.querySelector('span:last-child');
                if (reviewDiscountValueEl) {
                    reviewDiscountValueEl.textContent = `-$${totals.discount_amount.toFixed(2)}`;
                }
            }
            
            // Find the total row in review
            const reviewTotalRow = reviewTotals.querySelector('.total-row.grand-total');
            if (reviewTotalRow) {
                const reviewTotalValueEl = reviewTotalRow.querySelector('span:last-child');
                if (reviewTotalValueEl) {
                    reviewTotalValueEl.textContent = `$${totals.total.toFixed(2)}`;
                }
            }
        }
    }
    
    function updatePromoCodeDisplay(promoCode, discount) {
        // Update UI without page refresh
        const promoDisplayEl = document.querySelector('.promo-code-display');
        if (promoDisplayEl) {
            let discountText = '';
            if (discount.type === 'percentage') {
                discountText = `${discount.value}% off`;
            } else if (discount.type === 'fixed_amount') {
                discountText = `$${discount.value} off`;
            }
            
            promoDisplayEl.textContent = `Applied Promo: ${promoCode} (${discountText})`;
            promoDisplayEl.style.display = 'block';
        }
        
        // Show remove button
        const removePromoBtn = document.querySelector('.remove-promo-btn');
        if (removePromoBtn) {
            removePromoBtn.style.display = 'inline-block';
        }
        
        // Disable promo code input and apply button
        const promoCodeInput = document.getElementById('promo-code');
        const applyPromoBtn = document.querySelector('.apply-promo-btn');
        
        if (promoCodeInput) {
            promoCodeInput.disabled = true;
        }
        
        if (applyPromoBtn) {
            applyPromoBtn.disabled = true;
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
            
            // Add visual feedback that data was saved
            const formEl = document.getElementById('patient-info-form');
            if (formEl) {
                const savedIndicator = document.createElement('div');
                savedIndicator.className = 'saved-indicator';
                savedIndicator.textContent = 'Information Saved';
                formEl.appendChild(savedIndicator);
                
                // Remove the indicator after 2 seconds
                setTimeout(() => {
                    formEl.removeChild(savedIndicator);
                }, 2000);
            }
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