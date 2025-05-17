"""
Page Routes for Dental Quote System
Handles page rendering and navigation
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
import logging
from services.promo_service import PromoService
from utils.session_manager import SessionManager

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Homepage that redirects to quote builder"""
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/quote-builder')
def quote_builder():
    """Main quote builder page"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Get query parameters
    promo_code = request.args.get('promo')
    
    # Get session data if available
    session_data = SessionManager.get_session_data()
    treatments = session_data.get('treatments', []) if session_data else []
    promo_code_from_session = session_data.get('promo_code') if session_data else None
    patient_info = session_data.get('patient_info', {}) if session_data else {}
    
    # Create backup of current session state
    SessionManager.backup_session_data()
    
    # Get available treatments
    available_treatments = get_available_treatments()
    
    # Check for promo code in URL
    applied_promo = None
    if promo_code and not promo_code_from_session:
        promo_details = PromoService.validate_promo_code(promo_code)
        if promo_details:
            # Store valid promo code in session
            SessionManager.store_promo_code(promo_details['code'], promo_details['value'])
            applied_promo = promo_details
            flash(f"Promo code '{promo_code}' automatically applied!")
    elif promo_code_from_session:
        # Use existing promo code from session
        promo_details = PromoService.validate_promo_code(promo_code_from_session)
        if promo_details:
            applied_promo = promo_details
    
    # Get session metadata
    session_metadata = SessionManager.get_session_metadata()
    
    # Render quote builder template
    return render_template(
        'quote/quote_builder.html',
        treatments=treatments,
        available_treatments=available_treatments,
        promo_code=promo_code_from_session,
        promo_details=applied_promo,
        patient_info=patient_info,
        session_id=session_metadata.get('session_id')
    )

@page_routes.route('/review-quote')
def review_quote():
    """Quote review page"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Get session data
    session_data = SessionManager.get_session_data()
    
    # Redirect to quote builder if no treatments selected
    if not session_data or not session_data.get('treatments'):
        flash("Please select treatments before reviewing your quote")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get treatments and info from session
    treatments = session_data.get('treatments', [])
    promo_code = session_data.get('promo_code')
    patient_info = session_data.get('patient_info', {})
    
    # Calculate totals
    subtotal = sum(float(t.get('price', 0)) for t in treatments)
    
    # Apply discount if promo code is available
    discount = 0
    promo_details = None
    if promo_code:
        promo_details = PromoService.validate_promo_code(promo_code)
        if promo_details:
            discount = PromoService.calculate_discount(promo_details, subtotal)
    
    # Calculate final total
    total = max(0, subtotal - discount)
    
    # Render review page
    return render_template(
        'quote/review_quote.html',
        treatments=treatments,
        promo_code=promo_code,
        promo_details=promo_details,
        patient_info=patient_info,
        subtotal=subtotal,
        discount=discount,
        total=total
    )

@page_routes.route('/submit-quote', methods=['POST'])
def submit_quote():
    """Submit final quote"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Get session data
    session_data = SessionManager.get_session_data()
    
    # Redirect if no treatments selected
    if not session_data or not session_data.get('treatments'):
        flash("Please select treatments before submitting")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Create quote data for submission
    quote_data = {
        'treatments': session_data.get('treatments', []),
        'promo_code': session_data.get('promo_code'),
        'patient_info': session_data.get('patient_info', {}),
        'session_id': session_data.get('session_id'),
        'timestamp': session_data.get('last_activity')
    }
    
    # Store final quote data in session
    SessionManager.store_quote_data(quote_data)
    
    # In a real application, here we would:
    # 1. Save the quote to a database
    # 2. Send confirmation emails
    # 3. Generate PDF quote documents
    
    # Redirect to confirmation page
    return redirect(url_for('page_routes.quote_confirmation'))

@page_routes.route('/confirmation')
def quote_confirmation():
    """Quote confirmation page"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Get session data
    session_data = SessionManager.get_session_data()
    quote_data = session_data.get('quote_data', {}) if session_data else {}
    
    # Redirect if no quote data
    if not quote_data:
        flash("No quote data found. Please start a new quote.")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get quote information
    treatments = quote_data.get('treatments', [])
    promo_code = quote_data.get('promo_code')
    patient_info = quote_data.get('patient_info', {})
    
    # Calculate totals
    subtotal = sum(float(t.get('price', 0)) for t in treatments)
    
    # Apply discount if promo code is available
    discount = 0
    if promo_code:
        promo_details = PromoService.validate_promo_code(promo_code)
        if promo_details:
            discount = PromoService.calculate_discount(promo_details, subtotal)
    
    # Calculate final total
    total = max(0, subtotal - discount)
    
    # Render confirmation page
    return render_template(
        'quote/confirmation.html',
        quote_id=quote_data.get('session_id', '')[:8],
        treatments=treatments,
        promo_code=promo_code,
        patient_info=patient_info,
        subtotal=subtotal,
        discount=discount,
        total=total
    )

@page_routes.route('/reset-quote')
def reset_quote():
    """Reset the current quote and start over"""
    # Clear session
    SessionManager.clear_session()
    
    # Reinitialize session
    SessionManager.initialize_session()
    
    # Redirect to quote builder
    flash("Your quote has been reset. You can start a new quote.")
    return redirect(url_for('page_routes.quote_builder'))

def get_available_treatments():
    """Get list of available dental treatments"""
    treatments = [
        {
            'id': 'dental_cleaning',
            'name': 'Dental Cleaning',
            'description': 'Professional dental cleaning and checkup',
            'price': 100,
            'category': 'Preventive'
        },
        {
            'id': 'teeth_whitening',
            'name': 'Teeth Whitening',
            'description': 'Professional teeth whitening treatment',
            'price': 350,
            'category': 'Cosmetic'
        },
        {
            'id': 'dental_filling',
            'name': 'Dental Filling',
            'description': 'Composite filling for cavities',
            'price': 150,
            'category': 'Restorative'
        },
        {
            'id': 'root_canal',
            'name': 'Root Canal',
            'description': 'Root canal treatment for infected teeth',
            'price': 800,
            'category': 'Endodontic'
        },
        {
            'id': 'dental_implant_standard',
            'name': 'Dental Implant',
            'description': 'Single tooth implant (standard)',
            'price': 1500,
            'category': 'Implants'
        },
        {
            'id': 'dental_implant_premium',
            'name': 'Premium Dental Implant',
            'description': 'Single tooth implant (premium quality)',
            'price': 2200,
            'category': 'Implants'
        },
        {
            'id': 'dental_crowns',
            'name': 'Dental Crown',
            'description': 'Porcelain or ceramic crown',
            'price': 900,
            'category': 'Restorative'
        },
        {
            'id': 'porcelain_veneers',
            'name': 'Porcelain Veneers',
            'description': 'Custom porcelain veneers (per tooth)',
            'price': 1000,
            'category': 'Cosmetic'
        },
        {
            'id': 'wisdom_tooth_extraction',
            'name': 'Wisdom Tooth Extraction',
            'description': 'Surgical extraction of wisdom teeth',
            'price': 450,
            'category': 'Oral Surgery'
        },
        {
            'id': 'full_mouth_reconstruction',
            'name': 'Full Mouth Reconstruction',
            'description': 'Complete reconstruction of all teeth',
            'price': 15000,
            'category': 'Restoration'
        },
        {
            'id': 'hollywood_smile',
            'name': 'Hollywood Smile',
            'description': 'Complete smile makeover with veneers',
            'price': 8000,
            'category': 'Cosmetic'
        },
        {
            'id': 'all_on_4_implants',
            'name': 'All-on-4 Implants',
            'description': 'Full arch restoration on 4 implants',
            'price': 12000,
            'category': 'Implants'
        }
    ]
    return treatments