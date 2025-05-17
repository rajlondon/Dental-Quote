import logging
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
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

@page_routes_bp.route('/')
def index():
    """
    Render the homepage
    """
    # Get featured offers for the homepage
    featured_offers = promo_service.get_featured_special_offers(limit=3)
    
    # Get popular treatments for the homepage
    popular_treatments = treatment_service.get_popular_treatments(limit=6)
    
    return render_template('index.html', 
                          featured_offers=featured_offers,
                          popular_treatments=popular_treatments)

@page_routes_bp.route('/start-quote')
def start_quote():
    """
    Start a new quote by resetting the session and redirecting to the quote builder
    """
    # Reset the session to start fresh
    SessionManager.reset_session()
    
    return redirect(url_for('page_routes.quote_builder'))

@page_routes_bp.route('/quote-builder')
def quote_builder():
    """
    Render the quote builder page
    """
    # Get treatment categories and their treatments
    categorized_treatments = treatment_service.get_categorized_treatments()
    
    # Get selected treatments from session
    selected_treatments = SessionManager.get_selected_treatments()
    
    # Get promo code if applied
    promo_code = SessionManager.get_promo_code()
    
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    subtotal = quote_data.get('subtotal', 0)
    discount_amount = quote_data.get('discount_amount', 0)
    total = quote_data.get('total', 0)
    
    return render_template('quote/quote_builder.html',
                          categorized_treatments=categorized_treatments,
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          subtotal=subtotal,
                          discount_amount=discount_amount,
                          total=total)

@page_routes_bp.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """
    Handle patient information form
    """
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    subtotal = quote_data.get('subtotal', 0)
    discount_amount = quote_data.get('discount_amount', 0)
    total = quote_data.get('total', 0)
    
    # Get selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    
    # If no treatments selected, redirect to quote builder
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Handle form submission
    if request.method == 'POST':
        # Get form data
        patient_info = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'travel_month': request.form.get('travel_month'),
            'notes': request.form.get('notes')
        }
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'phone', 'country']
        if not all(patient_info.get(field) for field in required_fields):
            flash('Please fill out all required fields.', 'error')
            return render_template('quote/patient_info.html',
                                  selected_treatments=selected_treatments,
                                  subtotal=subtotal,
                                  discount_amount=discount_amount,
                                  total=total,
                                  patient_info=patient_info)
        
        # Save patient info to session
        SessionManager.update_patient_info(patient_info)
        
        # Redirect to quote review
        return redirect(url_for('page_routes.quote_review'))
    
    # Get existing patient info
    patient_info = SessionManager.get_patient_info()
    
    return render_template('quote/patient_info.html',
                          selected_treatments=selected_treatments,
                          subtotal=subtotal,
                          discount_amount=discount_amount,
                          total=total,
                          patient_info=patient_info)

@page_routes_bp.route('/quote-review')
def quote_review():
    """
    Render the quote review page
    """
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    subtotal = quote_data.get('subtotal', 0)
    discount_amount = quote_data.get('discount_amount', 0)
    total = quote_data.get('total', 0)
    
    # Get selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    
    # Get patient info
    patient_info = SessionManager.get_patient_info()
    
    # If no treatments selected or no patient info, redirect
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    if not patient_info:
        flash('Please provide your information before proceeding.', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    # Get promo code if applied
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    return render_template('quote/quote_review.html',
                          selected_treatments=selected_treatments,
                          patient_info=patient_info,
                          subtotal=subtotal,
                          discount_amount=discount_amount,
                          total=total,
                          promo_code=promo_code,
                          promo_details=promo_details)

@page_routes_bp.route('/quote-confirmation', methods=['POST'])
def quote_confirmation():
    """
    Handle quote confirmation and render the confirmation page
    """
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    
    # Get selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    
    # Get patient info
    patient_info = SessionManager.get_patient_info()
    
    # If no treatments selected or no patient info, redirect
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    if not patient_info:
        flash('Please provide your information before proceeding.', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    # In a real application, we would save the quote to a database here
    # and potentially send emails or trigger other workflows
    
    # Generate a unique reference for the quote (using the one from session)
    quote_reference = quote_data.get('id', '')
    
    # Clear the session to ensure a fresh quote for next time
    # but keep a copy of the data for the confirmation page
    confirmed_data = {
        'quote_reference': quote_reference,
        'quote_data': quote_data,
        'selected_treatments': selected_treatments,
        'patient_info': patient_info,
        'promo_code': SessionManager.get_promo_code(),
        'promo_details': SessionManager.get_promo_details()
    }
    
    # Reset the session
    SessionManager.reset_session()
    
    return render_template('quote/quote_confirmation.html', **confirmed_data)