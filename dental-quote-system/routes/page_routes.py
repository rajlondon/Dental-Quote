"""
Page Routes for Dental Quote System
Handles rendering of application pages
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from utils.session_manager import get_session_data, save_patient_info
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize blueprint
page_routes = Blueprint('page_routes', __name__)

# Service instances
treatment_service = TreatmentService()
promo_service = PromoService()

@page_routes.route('/')
def index():
    """
    Render the homepage
    """
    # Get featured promotions for display
    featured_offers = promo_service.get_featured_promotions(limit=3)
    
    return render_template('index.html', featured_offers=featured_offers)

@page_routes.route('/quote-builder')
def quote_builder():
    """
    Render the quote builder page
    """
    # Get treatments categorized by category
    categorized_treatments = treatment_service.get_treatments_categorized()
    
    # Get current session data
    session_data = get_session_data()
    
    return render_template(
        'quote/quote_builder.html',
        categorized_treatments=categorized_treatments,
        selected_treatments=session_data.get('selected_treatments', []),
        promo_code=session_data.get('promo_code'),
        quote_totals=session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        })
    )

@page_routes.route('/patient-info')
def patient_info():
    """
    Render the patient information page
    """
    # Get current session data
    session_data = get_session_data()
    
    # Check if there are selected treatments
    if not session_data.get('selected_treatments'):
        flash('Please select at least one treatment before proceeding', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    return render_template(
        'quote/patient_info.html',
        selected_treatments=session_data.get('selected_treatments', []),
        promo_code=session_data.get('promo_code'),
        quote_totals=session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        })
    )

@page_routes.route('/submit-patient-info', methods=['POST'])
def submit_patient_info():
    """
    Process patient information form submission
    """
    # Get form data
    patient_data = {
        'first_name': request.form.get('first_name', ''),
        'last_name': request.form.get('last_name', ''),
        'email': request.form.get('email', ''),
        'phone': request.form.get('phone', ''),
        'country': request.form.get('country', ''),
        'preferred_travel_date': request.form.get('preferred_travel_date', ''),
        'travel_flexibility': request.form.get('travel_flexibility', ''),
        'travel_companions': request.form.get('travel_companions', '0'),
        'medical_conditions': request.form.get('medical_conditions', ''),
        'current_medications': request.form.get('current_medications', ''),
        'dental_anxiety': bool(request.form.get('dental_anxiety')),
        'special_requests': request.form.get('special_requests', ''),
        'accommodation_assistance': bool(request.form.get('accommodation_assistance')),
        'transportation_assistance': bool(request.form.get('transportation_assistance')),
        'consent_contact': bool(request.form.get('consent_contact')),
        'consent_privacy': bool(request.form.get('consent_privacy')),
        'subscribe_newsletter': bool(request.form.get('subscribe_newsletter')),
        'date_submitted': request.form.get('date_submitted', '')
    }
    
    # Save patient information to session
    save_patient_info(patient_data)
    
    # Redirect to quote review page
    return redirect(url_for('page_routes.quote_review'))

@page_routes.route('/quote-review')
def quote_review():
    """
    Render the quote review page
    """
    # Get current session data
    session_data = get_session_data()
    
    # Check if patient info is available
    if not session_data.get('patient_info'):
        flash('Please provide your contact information before proceeding', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    return render_template(
        'quote/quote_review.html',
        selected_treatments=session_data.get('selected_treatments', []),
        promo_code=session_data.get('promo_code'),
        promo_details=session_data.get('promo_details'),
        quote_totals=session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        }),
        patient_info=session_data.get('patient_info', {})
    )

@page_routes.route('/quote-confirmation')
def quote_confirmation():
    """
    Render the quote confirmation page
    """
    # Get current session data
    session_data = get_session_data()
    
    # Generate a quote ID
    import uuid
    quote_id = str(uuid.uuid4())[:8].upper()
    
    return render_template(
        'quote/quote_confirmation.html',
        quote_id=quote_id,
        selected_treatments=session_data.get('selected_treatments', []),
        promo_code=session_data.get('promo_code'),
        quote_totals=session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        }),
        patient_info=session_data.get('patient_info', {})
    )