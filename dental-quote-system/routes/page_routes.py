"""
Page Routes for Dental Quote System
Handles rendering of page templates
"""

from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import os

page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Homepage"""
    # Get data from services
    treatment_service = request.app.config.get('treatment_service')
    promo_service = request.app.config.get('promo_service')
    
    # Get popular treatments and promotions for the homepage
    popular_treatments = treatment_service.get_popular_treatments()
    promotions = promo_service.get_featured_offers()
    
    return render_template(
        'index.html',
        popular_treatments=popular_treatments,
        promotions=promotions
    )

@page_routes.route('/quote-builder')
def quote_builder():
    """Quote Builder Page - Step 1"""
    # Get data from services
    treatment_service = request.app.config.get('treatment_service')
    session_manager = request.app.config.get('session_manager')
    
    # Get categorized treatments
    categorized_treatments = treatment_service.get_categorized_treatments()
    
    # Get session data
    selected_treatments = session_manager.get_selected_treatments()
    quote_totals = session_manager.calculate_quote_totals()
    promo_code = session_manager.get_promo_code()
    promo_details = session_manager.get_promo_details()
    
    return render_template(
        'quote/quote_builder.html',
        categorized_treatments=categorized_treatments,
        selected_treatments=selected_treatments,
        quote_totals=quote_totals,
        promo_code=promo_code,
        promo_details=promo_details
    )

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Patient Information Form - Step 2"""
    session_manager = request.app.config.get('session_manager')
    
    # Check if there are treatments in the quote
    if not session_manager.get_selected_treatments():
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    if request.method == 'POST':
        # Save patient info to session
        patient_data = {
            'full_name': request.form.get('full_name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'country': request.form.get('country', ''),
            'travel_date': request.form.get('travel_date', ''),
            'additional_notes': request.form.get('additional_notes', '')
        }
        
        session_manager.save_patient_info(patient_data)
        
        # Redirect to review page
        return redirect(url_for('page_routes.review_quote'))
    
    # Pre-fill form with any existing data
    patient_info = session_manager.get_patient_info()
    
    # Get quote data for summary
    selected_treatments = session_manager.get_selected_treatments()
    quote_totals = session_manager.calculate_quote_totals()
    
    return render_template(
        'quote/patient_info.html',
        patient_info=patient_info,
        selected_treatments=selected_treatments,
        quote_totals=quote_totals
    )

@page_routes.route('/review-quote')
def review_quote():
    """Review Quote - Step 3"""
    session_manager = request.app.config.get('session_manager')
    
    # Check if there are treatments in the quote
    if not session_manager.get_selected_treatments():
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Check if patient info is provided
    if not session_manager.get_patient_info():
        flash('Please provide your information before reviewing the quote.', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    # Get data for the review page
    patient_info = session_manager.get_patient_info()
    selected_treatments = session_manager.get_selected_treatments()
    quote_totals = session_manager.calculate_quote_totals()
    promo_code = session_manager.get_promo_code()
    promo_details = session_manager.get_promo_details()
    
    return render_template(
        'quote/review_quote.html',
        patient_info=patient_info,
        selected_treatments=selected_treatments,
        quote_totals=quote_totals,
        promo_code=promo_code,
        promo_details=promo_details
    )

@page_routes.route('/submit-quote', methods=['POST'])
def submit_quote():
    """Submit the quote for processing"""
    session_manager = request.app.config.get('session_manager')
    
    # Get the complete quote
    quote_data = session_manager.get_full_quote()
    
    # Generate a unique quote ID
    # In production, this would save to a database
    quote_id = f"Q{os.urandom(4).hex().upper()}"
    session_manager.set_quote_id(quote_id)
    
    # Send confirmation email (mock)
    # email_service.send_confirmation(patient_info['email'], quote_id)
    
    # Redirect to thank you page
    return redirect(url_for('page_routes.thank_you'))

@page_routes.route('/thank-you')
def thank_you():
    """Thank You Page after quote submission"""
    session_manager = request.app.config.get('session_manager')
    
    # Get quote information for the page
    quote_id = session_manager.get_quote_id()
    patient_info = session_manager.get_patient_info()
    
    # Check if quote was submitted
    if not quote_id:
        return redirect(url_for('page_routes.index'))
    
    return render_template(
        'quote/thank_you.html',
        quote_id=quote_id,
        patient_info=patient_info
    )

@page_routes.route('/start-new-quote')
def start_new_quote():
    """Clear session and start a new quote"""
    session_manager = request.app.config.get('session_manager')
    session_manager.clear_quote()
    
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/add-treatment-to-session', methods=['POST'])
def add_treatment_to_session():
    """Add a treatment to the session directly (non-AJAX)"""
    treatment_service = request.app.config.get('treatment_service')
    session_manager = request.app.config.get('session_manager')
    
    treatment_id = request.form.get('treatment_id')
    if not treatment_id:
        flash('Treatment ID is required', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get treatment details
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    if not treatment:
        flash('Treatment not found', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Add to session
    session_manager.add_treatment_to_quote(treatment)
    flash(f'Added {treatment["name"]} to your quote', 'success')
    
    # Redirect back to the page
    return redirect(url_for('page_routes.quote_builder'))