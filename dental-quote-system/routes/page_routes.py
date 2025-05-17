from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, session
from services.treatment_service import TreatmentService
from services.promo_service import PromoService
from utils.session_manager import SessionManager

page_routes = Blueprint('pages', __name__)

@page_routes.route('/')
def home():
    # Get featured offers and popular treatments for homepage
    featured_offers = PromoService.get_featured_offers()
    popular_treatments = TreatmentService.get_popular_treatments()
    
    return render_template('index.html', 
                          featured_offers=featured_offers,
                          popular_treatments=popular_treatments)

@page_routes.route('/quote-builder')
def quote_builder():
    # Initialize session
    SessionManager.initialize_session(reset=request.args.get('reset', False))
    
    # Get treatments organized by category
    categorized_treatments = TreatmentService.get_treatments_by_category()
    
    # Get current quote data for display
    selected_treatments = SessionManager.get_selected_treatments()
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return render_template('quote/quote_builder.html',
                          categorized_treatments=categorized_treatments,
                          selected_treatments=selected_treatments,
                          promo_code=promo_code,
                          promo_details=promo_details,
                          subtotal=subtotal,
                          discount=discount,
                          total=total)

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    # Check if we have treatments selected
    selected_treatments = SessionManager.get_selected_treatments()
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('pages.quote_builder'))
    
    if request.method == 'POST':
        # Save patient info to session
        patient_data = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'preferred_date': request.form.get('preferred_date'),
            'notes': request.form.get('notes')
        }
        
        SessionManager.set_patient_info(patient_data)
        
        # Redirect to review page
        return redirect(url_for('pages.review_quote'))
    
    # Get list of countries for the form
    countries = TreatmentService.get_countries()
    
    # Get current patient info if exists
    patient_info = SessionManager.get_patient_info()
    
    return render_template('quote/patient_info.html',
                          countries=countries,
                          patient_info=patient_info)

@page_routes.route('/review-quote')
def review_quote():
    # Check if we have both treatments and patient info
    selected_treatments = SessionManager.get_selected_treatments()
    patient_info = SessionManager.get_patient_info()
    
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('pages.quote_builder'))
    
    if not patient_info:
        flash('Please provide your information before reviewing the quote.', 'warning')
        return redirect(url_for('pages.patient_info'))
    
    # Get quote data for display
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return render_template('quote/review_quote.html',
                          selected_treatments=selected_treatments,
                          patient_info=patient_info,
                          promo_code=promo_code,
                          promo_details=promo_details,
                          subtotal=subtotal,
                          discount=discount,
                          total=total)

@page_routes.route('/finalize-quote', methods=['POST'])
def finalize_quote():
    # Check if we have both treatments and patient info
    selected_treatments = SessionManager.get_selected_treatments()
    patient_info = SessionManager.get_patient_info()
    
    if not selected_treatments or not patient_info:
        flash('Missing information. Please complete all steps before finalizing.', 'error')
        return redirect(url_for('pages.quote_builder'))
    
    # Get promo information
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    # Save quote to storage and get a quote ID
    quote_id = TreatmentService.save_quote(
        patient_info, 
        selected_treatments,
        promo_code,
        promo_details,
        subtotal,
        discount,
        total
    )
    
    # Save the quote ID to session
    SessionManager.set_quote_id(quote_id)
    
    # Redirect to confirmation page
    return redirect(url_for('pages.quote_confirmation', quote_id=quote_id))

@page_routes.route('/quote-confirmation/<quote_id>')
def quote_confirmation(quote_id):
    # Retrieve quote data
    quote_data = TreatmentService.get_quote(quote_id)
    
    if not quote_data:
        flash('Quote not found.', 'error')
        return redirect(url_for('pages.home'))
    
    # Reset session to start fresh after confirmation
    SessionManager.initialize_session(reset=True)
    
    return render_template('quote/confirmation.html', quote=quote_data)