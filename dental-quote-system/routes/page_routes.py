"""
Page Routes for Dental Quote System
Handles main page rendering
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, current_app, flash
from utils.session_manager import SessionManager

# Create a Blueprint
bp = Blueprint('page_routes', __name__)

# Get session manager instance
session_manager = SessionManager()

@bp.route('/')
def index():
    """Homepage route"""
    # Get treatment and promo services from app context
    treatment_service = current_app.config['treatment_service']
    promo_service = current_app.config['promo_service']
    
    # Get featured promotions for homepage
    featured_offers = promo_service.get_featured_promotions()
    
    return render_template('index.html', featured_offers=featured_offers)

@bp.route('/quote-builder')
def quote_builder():
    """Quote builder page route"""
    # Get treatment and promo services from app context
    treatment_service = current_app.config['treatment_service']
    promo_service = current_app.config['promo_service']
    
    # Get all treatments categorized
    categorized_treatments = treatment_service.get_all_categories()
    
    # Get session data
    selected_treatments = session_manager.get_selected_treatments()
    promo_code = session_manager.get_promo_code()
    promo_details = session_manager.get_promo_details()
    quote_totals = session_manager.calculate_totals()
    
    return render_template(
        'quote/quote_builder.html',
        categorized_treatments=categorized_treatments,
        selected_treatments=selected_treatments,
        promo_code=promo_code,
        promo_details=promo_details,
        quote_totals=quote_totals
    )

@bp.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Patient information page route"""
    # Check if there are selected treatments
    selected_treatments = session_manager.get_selected_treatments()
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
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
        
        session_manager.save_patient_info(patient_data)
        
        # Redirect to quote review page
        return redirect(url_for('page_routes.quote_review'))
    
    # GET request - show form
    patient_info = session_manager.get_patient_info()
    quote_totals = session_manager.calculate_totals()
    
    return render_template(
        'quote/patient_info.html',
        patient_info=patient_info,
        quote_totals=quote_totals
    )

@bp.route('/quote-review')
def quote_review():
    """Quote review page route"""
    # Check if there are selected treatments and patient info
    selected_treatments = session_manager.get_selected_treatments()
    patient_info = session_manager.get_patient_info()
    
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    if not patient_info or not patient_info.get('email'):
        flash('Please provide your information before proceeding', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    # Get quote data
    quote_data = session_manager.get_quote_summary()
    
    # Get treatment service to fetch details
    treatment_service = current_app.config['treatment_service']
    
    return render_template(
        'quote/quote_review.html',
        quote_data=quote_data,
        treatment_service=treatment_service
    )

@bp.route('/quote-confirmation')
def quote_confirmation():
    """Quote confirmation page after submission"""
    # Get quote data
    quote_data = session_manager.get_quote_summary()
    
    # In a real application, we would save the quote to a database here
    # and generate a quote number, but for this example we'll use a timestamp
    import time
    quote_number = f"Q{int(time.time())}"
    
    return render_template(
        'quote/quote_confirmation.html',
        quote_data=quote_data,
        quote_number=quote_number
    )

@bp.route('/download-quote-pdf')
def download_quote_pdf():
    """Generate and download quote as PDF"""
    # This route would generate a PDF using a library like xhtml2pdf or WeasyPrint
    # For this example, we'll redirect to the confirmation page
    flash('PDF generation would be implemented in a production system', 'info')
    return redirect(url_for('page_routes.quote_confirmation'))

@bp.route('/clear-session')
def clear_session():
    """Clear all session data and redirect to homepage"""
    session_manager.clear_session()
    flash('Your session has been cleared', 'info')
    return redirect(url_for('page_routes.index'))