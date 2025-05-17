"""
Page routes for the MyDentalFly application.
Handles rendering of HTML pages and form submissions.
"""

import logging
import uuid
from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from utils.session_manager import save_session_data, check_treatments_selected, check_patient_info, reset_quote
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Create Blueprint
page_routes = Blueprint('page_routes', __name__)

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Logger
logger = logging.getLogger(__name__)

@page_routes.route('/')
def index():
    """Render the homepage."""
    # Get featured offers for homepage display
    featured_offers = promo_service.get_featured_offers(limit=3)
    
    # Get popular treatments
    popular_treatments = treatment_service.get_popular_treatments()
    
    return render_template(
        'index.html',
        featured_offers=featured_offers,
        popular_treatments=popular_treatments
    )

@page_routes.route('/quote/start')
def start_quote():
    """Start a new quote by resetting session and redirecting to builder."""
    # Reset quote data
    reset_quote()
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/quote/builder', methods=['GET', 'POST'])
def quote_builder():
    """Render the quote builder page."""
    if request.method == 'POST':
        # Handle form submission
        promo_code = request.form.get('promo_code')
        
        if promo_code:
            # Validate promo code
            valid, message = promo_service.validate_promo_code(promo_code)
            
            if valid:
                # Save promo code to session
                save_session_data('promo_code', promo_code)
                flash(f"Promo code {promo_code} applied successfully.", "success")
            else:
                flash(message, "error")
        
        # Redirect to the same page to prevent form resubmission
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get data for template
    categorized_treatments = treatment_service.get_categorized_treatments()
    selected_treatments = session.get('selected_treatments', [])
    promo_code = session.get('promo_code')
    
    # Calculate totals
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in selected_treatments)
    discount_amount = 0
    if promo_code:
        discount_amount = promo_service.calculate_discount(promo_code, selected_treatments, subtotal)
    total = subtotal - discount_amount
    
    return render_template(
        'quote/quote_builder.html',
        categorized_treatments=categorized_treatments,
        selected_treatments=selected_treatments,
        promo_code=promo_code,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total=total
    )

@page_routes.route('/quote/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Render the patient information form."""
    # Check if treatments are selected
    if not check_treatments_selected():
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    if request.method == 'POST':
        # Process form submission
        patient_data = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'address': request.form.get('address', ''),
            'city': request.form.get('city', ''),
            'country': request.form.get('country', ''),
            'preferred_date': request.form.get('preferred_date', ''),
            'message': request.form.get('message', '')
        }
        
        # Basic validation
        required_fields = ['first_name', 'last_name', 'email', 'phone']
        missing_fields = [field for field in required_fields if not patient_data[field]]
        
        if missing_fields:
            flash(f"Please fill in all required fields: {', '.join(missing_fields)}", "error")
            return render_template('quote/patient_info.html', patient=patient_data)
        
        # Save patient info to session
        save_session_data('patient_info', patient_data)
        
        # Proceed to quote review
        return redirect(url_for('page_routes.quote_review'))
    
    # Get existing patient info from session
    patient_info = session.get('patient_info', {})
    
    return render_template('quote/patient_info.html', patient=patient_info)

@page_routes.route('/quote/review')
def quote_review():
    """Render the quote review page."""
    # Check if treatments are selected
    if not check_treatments_selected():
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Check if patient info is provided
    if not check_patient_info():
        flash("Please provide your contact information before proceeding.", "warning")
        return redirect(url_for('page_routes.patient_info'))
    
    # Get session data
    selected_treatments = session.get('selected_treatments', [])
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info', {})
    
    # Calculate totals
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in selected_treatments)
    discount_amount = 0
    if promo_code:
        discount_amount = promo_service.calculate_discount(promo_code, selected_treatments, subtotal)
    total = subtotal - discount_amount
    
    # Get promo details if applicable
    promo_details = None
    if promo_code:
        promo_details = promo_service.get_promo_details(promo_code)
    
    return render_template(
        'quote/quote_review.html',
        selected_treatments=selected_treatments,
        promo_code=promo_code,
        promo_details=promo_details,
        patient=patient_info,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total=total,
        quote_id=session.get('quote_id', 'QUOTE-TEMP')
    )

@page_routes.route('/quote/confirm', methods=['POST'])
def quote_confirm():
    """Confirm and finalize the quote."""
    # Check if treatments are selected
    if not check_treatments_selected():
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Check if patient info is provided
    if not check_patient_info():
        flash("Please provide your contact information before proceeding.", "warning")
        return redirect(url_for('page_routes.patient_info'))
    
    # In a real application, we would save the quote to a database here
    # and possibly trigger an email notification
    
    # For now, just generate a confirmation number and redirect
    confirmation_number = f"CONF-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
    save_session_data('confirmation_number', confirmation_number)
    
    return redirect(url_for('page_routes.quote_confirmation'))

@page_routes.route('/quote/confirmation')
def quote_confirmation():
    """Render the quote confirmation page."""
    # Check if confirmation number exists
    confirmation_number = session.get('confirmation_number')
    if not confirmation_number:
        flash("Please complete the quote process first.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get session data
    selected_treatments = session.get('selected_treatments', [])
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info', {})
    quote_id = session.get('quote_id', 'QUOTE-TEMP')
    
    # Calculate totals
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in selected_treatments)
    discount_amount = 0
    if promo_code:
        discount_amount = promo_service.calculate_discount(promo_code, selected_treatments, subtotal)
    total = subtotal - discount_amount
    
    return render_template(
        'quote/quote_confirmation.html',
        selected_treatments=selected_treatments,
        patient=patient_info,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total=total,
        quote_id=quote_id,
        confirmation_number=confirmation_number
    )