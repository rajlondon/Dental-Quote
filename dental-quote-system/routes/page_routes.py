"""
Page routes for the MyDentalFly application.
Handles main navigational pages and the quote flow.
"""

import logging
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from utils.session_manager import get_session_data, save_session_data
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
    """Render the homepage with featured offers."""
    featured_offers = promo_service.get_featured_offers()
    return render_template('index.html', featured_offers=featured_offers)

@page_routes.route('/quote-builder')
def quote_builder():
    """Render the quote builder page."""
    # Get query params
    treatment_id = request.args.get('treatment')
    promo_code = request.args.get('promo')
    
    # Initialize session if not present
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    if 'promo_code' not in session:
        session['promo_code'] = None
    
    # Add treatment if specified in query
    if treatment_id:
        treatment = treatment_service.get_treatment_by_id(treatment_id)
        if treatment:
            # Check if treatment is already in selected treatments
            existing_treatments = [t for t in session['selected_treatments'] if t['id'] == treatment_id]
            if not existing_treatments:
                treatment['quantity'] = 1
                session['selected_treatments'].append(treatment)
                flash(f"{treatment['name']} added to your quote.", "success")
    
    # Apply promo code if specified in query
    if promo_code and not session['promo_code']:
        valid, message = promo_service.validate_promo_code(promo_code)
        if valid:
            session['promo_code'] = promo_code
            flash(f"Promo code {promo_code} applied successfully.", "success")
        else:
            flash(message, "warning")
    
    # Get data for template
    categorized_treatments = treatment_service.get_categorized_treatments()
    selected_treatments = session['selected_treatments']
    promo_code = session['promo_code']
    
    # Calculate totals
    quote_totals = calculate_quote_totals(selected_treatments, promo_code)
    
    return render_template('quote/quote_builder.html', 
                          categorized_treatments=categorized_treatments,
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          quote_totals=quote_totals)

@page_routes.route('/patient-info')
def patient_info():
    """Render the patient information page."""
    # Redirect to quote builder if no treatments selected
    if 'selected_treatments' not in session or not session['selected_treatments']:
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get session data
    selected_treatments = session['selected_treatments']
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info', {})
    
    # Calculate totals
    quote_totals = calculate_quote_totals(selected_treatments, promo_code)
    
    return render_template('quote/patient_info.html',
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          quote_totals=quote_totals,
                          patient_info=patient_info)

@page_routes.route('/submit-patient-info', methods=['POST'])
def submit_patient_info():
    """Process patient information form submission."""
    # Redirect to quote builder if no treatments selected
    if 'selected_treatments' not in session or not session['selected_treatments']:
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Save patient information
    patient_info = {
        'first_name': request.form.get('first_name'),
        'last_name': request.form.get('last_name'),
        'email': request.form.get('email'),
        'phone': request.form.get('phone'),
        'country': request.form.get('country'),
        'preferred_travel_date': request.form.get('preferred_travel_date'),
        'travel_flexibility': request.form.get('travel_flexibility'),
        'travel_companions': request.form.get('travel_companions'),
        'accommodation_assistance': 'accommodation_assistance' in request.form,
        'transportation_assistance': 'transportation_assistance' in request.form,
        'medical_conditions': request.form.get('medical_conditions'),
        'current_medications': request.form.get('current_medications'),
        'dental_anxiety': 'dental_anxiety' in request.form,
        'special_requests': request.form.get('special_requests'),
        'consent_contact': 'consent_contact' in request.form,
        'consent_privacy': 'consent_privacy' in request.form,
        'subscribe_newsletter': 'subscribe_newsletter' in request.form
    }
    session['patient_info'] = patient_info
    
    # Redirect to quote review
    flash("Patient information saved successfully.", "success")
    return redirect(url_for('page_routes.quote_review'))

@page_routes.route('/quote-review')
def quote_review():
    """Render the quote review page."""
    # Redirect if required session data is missing
    if 'selected_treatments' not in session or not session['selected_treatments']:
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    if 'patient_info' not in session or not session['patient_info']:
        flash("Please provide patient information before proceeding.", "warning")
        return redirect(url_for('page_routes.patient_info'))
    
    # Get session data
    selected_treatments = session['selected_treatments']
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info')
    
    # Get promo details if applicable
    promo_details = None
    if promo_code:
        promo_details = promo_service.get_promo_details(promo_code)
    
    # Calculate totals
    quote_totals = calculate_quote_totals(selected_treatments, promo_code)
    
    return render_template('quote/quote_review.html',
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          promo_details=promo_details,
                          patient_info=patient_info,
                          quote_totals=quote_totals)

@page_routes.route('/quote-confirmation')
def quote_confirmation():
    """Render the quote confirmation page."""
    # Redirect if required session data is missing
    if 'selected_treatments' not in session or not session['selected_treatments']:
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    if 'patient_info' not in session or not session['patient_info']:
        flash("Please provide patient information before proceeding.", "warning")
        return redirect(url_for('page_routes.patient_info'))
    
    # Generate a quote ID
    import uuid
    quote_id = str(uuid.uuid4())[:8].upper()
    session['quote_id'] = quote_id
    
    # Get session data
    selected_treatments = session['selected_treatments']
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info')
    
    # Calculate totals
    quote_totals = calculate_quote_totals(selected_treatments, promo_code)
    
    return render_template('quote/quote_confirmation.html',
                          quote_id=quote_id,
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          patient_info=patient_info,
                          quote_totals=quote_totals)

def calculate_quote_totals(treatments, promo_code=None):
    """Calculate quote totals with or without a promo code."""
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in treatments)
    
    # Apply promo code discount if available
    discount_amount = 0
    if promo_code:
        discount_amount = promo_service.calculate_discount(promo_code, treatments, subtotal)
    
    total = subtotal - discount_amount
    
    return {
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    }