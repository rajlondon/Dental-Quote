import logging
import os
import uuid
from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify, flash, abort

from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize blueprint
page_routes_bp = Blueprint('page_routes', __name__)

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Helper functions
def save_session_data():
    """Ensure session data is saved by marking the session as modified."""
    session.modified = True

def check_treatments_selected():
    """Check if any treatments have been selected, redirect if not."""
    if not SessionManager.get_selected_treatments():
        return redirect(url_for('page_routes.quote_builder'))
    return None

def check_patient_info():
    """Check if patient info has been provided, redirect if not."""
    if not SessionManager.get_patient_info():
        return redirect(url_for('page_routes.patient_info'))
    return None

def reset_quote():
    """Reset the quote session data."""
    SessionManager.reset_session()

# Route handlers
@page_routes_bp.route('/')
def index():
    """Render the homepage."""
    # Get popular treatments for the homepage
    popular_treatments = treatment_service.get_popular_treatments()
    
    # Get featured special offers for the homepage
    featured_offers = promo_service.get_featured_special_offers()
    
    return render_template('index.html', 
                          popular_treatments=popular_treatments,
                          featured_offers=featured_offers)

@page_routes_bp.route('/start-quote')
def start_quote():
    """Start a new quote by resetting the session and redirecting to the quote builder."""
    reset_quote()
    return redirect(url_for('page_routes.quote_builder'))

@page_routes_bp.route('/quote-builder')
def quote_builder():
    """Render the quote builder page with treatment categories and selected treatments."""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get categorized treatments for the quote builder
    categorized_treatments = treatment_service.get_categorized_treatments()
    
    # Get selected treatments, promo code, and totals from session
    selected_treatments = SessionManager.get_selected_treatments()
    promo_code = SessionManager.get_promo_code()
    totals = SessionManager.calculate_totals()
    
    # Check if treatment_id was provided in the query parameters
    # This allows direct addition of a treatment from elsewhere
    treatment_id = request.args.get('treatment_id')
    if treatment_id:
        treatment = treatment_service.get_treatment_by_id(treatment_id)
        if treatment:
            SessionManager.add_treatment(treatment)
            selected_treatments = SessionManager.get_selected_treatments()
            totals = SessionManager.calculate_totals()
    
    return render_template('quote/quote_builder.html',
                          categorized_treatments=categorized_treatments,
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          subtotal=totals['subtotal'],
                          discount_amount=totals['discount_amount'],
                          total=totals['total'])

@page_routes_bp.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """
    Handle patient information form.
    GET: Display the form with any existing data
    POST: Process the submitted form data
    """
    # Check if treatments are selected
    redirect_response = check_treatments_selected()
    if redirect_response:
        return redirect_response
    
    # If POST request, process form data
    if request.method == 'POST':
        # Get form data
        patient_data = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'address': request.form.get('address'),
            'city': request.form.get('city'),
            'country': request.form.get('country'),
            'preferred_date': request.form.get('preferred_date'),
            'message': request.form.get('message')
        }
        
        # Save patient info to session
        SessionManager.save_patient_info(patient_data)
        
        # Redirect to review page
        return redirect(url_for('page_routes.quote_review'))
    
    # GET request - display the form
    patient = SessionManager.get_patient_info()
    
    return render_template('quote/patient_info.html', patient=patient)

@page_routes_bp.route('/quote-review')
def quote_review():
    """Render the quote review page with all quote information."""
    # Check if treatments are selected and patient info is provided
    redirect_response = check_treatments_selected()
    if redirect_response:
        return redirect_response
    
    redirect_response = check_patient_info()
    if redirect_response:
        return redirect_response
    
    # Get all necessary data from session
    selected_treatments = SessionManager.get_selected_treatments()
    patient = SessionManager.get_patient_info()
    promo_code = SessionManager.get_promo_code()
    totals = SessionManager.calculate_totals()
    
    return render_template('quote/quote_review.html',
                          selected_treatments=selected_treatments,
                          patient=patient,
                          promo_code=promo_code,
                          subtotal=totals['subtotal'],
                          discount_amount=totals['discount_amount'],
                          total=totals['total'])

@page_routes_bp.route('/finalize-quote', methods=['POST'])
def finalize_quote():
    """Finalize the quote and redirect to confirmation page."""
    # Check if treatments are selected and patient info is provided
    redirect_response = check_treatments_selected()
    if redirect_response:
        return redirect_response
    
    redirect_response = check_patient_info()
    if redirect_response:
        return redirect_response
    
    # Get quote data for confirmation
    quote_data = SessionManager.get_quote_data()
    
    # Generate a reference number for the quote
    quote_reference = f"Q{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    # Here you would typically save the quote to a database
    # and send confirmation emails, but that's beyond the scope of this example
    
    # For this demo, we'll just pass the reference to the confirmation page
    return redirect(url_for('page_routes.quote_confirmation', reference=quote_reference))

@page_routes_bp.route('/quote-confirmation')
def quote_confirmation():
    """Render the quote confirmation page."""
    # Check if treatments are selected and patient info is provided
    redirect_response = check_treatments_selected()
    if redirect_response:
        return redirect_response
    
    redirect_response = check_patient_info()
    if redirect_response:
        return redirect_response
    
    # Get quote reference from query parameters
    quote_reference = request.args.get('reference')
    
    # Get all necessary data from session
    selected_treatments = SessionManager.get_selected_treatments()
    patient = SessionManager.get_patient_info()
    promo_code = SessionManager.get_promo_code()
    totals = SessionManager.calculate_totals()
    
    return render_template('quote/quote_confirmation.html',
                          quote_reference=quote_reference,
                          selected_treatments=selected_treatments,
                          patient=patient,
                          promo_code=promo_code,
                          subtotal=totals['subtotal'],
                          discount_amount=totals['discount_amount'],
                          total=totals['total'])