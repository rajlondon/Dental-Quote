"""
Page Routes for Dental Quote System
Handles main page rendering and form submissions
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, session
import logging
import time
from utils.session_manager import SessionManager
from services.promo_service import PromoService

logger = logging.getLogger(__name__)

# Create blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/quote-builder')
def quote_builder():
    """Main quote builder page"""
    # Initialize session if needed
    SessionManager.initialize_session()
    SessionManager.update_activity()
    
    # Get current data from session
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    patient_info = SessionManager.get_patient_info()
    
    # Create a backup of the current session
    SessionManager.create_backup()
    
    # Calculate totals
    subtotal = sum(treatment.get('price', 0) for treatment in treatments)
    discount_percent = promo_details.get('discount_percent', 0)
    discount_amount = (subtotal * discount_percent) / 100
    total = subtotal - discount_amount
    
    # Get special offer details if a promo code is applied
    promo_code = promo_details.get('promo_code')
    special_offer = PromoService.get_special_offer_details(promo_code) if promo_code else None
    
    # Render the template
    return render_template(
        'quote/quote_builder.html',
        treatments=treatments,
        subtotal=subtotal,
        discount_percent=discount_percent,
        discount_amount=discount_amount,
        total=total,
        promo_code=promo_code,
        special_offer=special_offer,
        patient_info=patient_info
    )

@page_routes.route('/select-treatments', methods=['POST'])
def select_treatments():
    """Handle treatment selection"""
    # Get treatments from form
    selected_treatments = []
    for key, value in request.form.items():
        if key.startswith('treatment_') and value == 'on':
            treatment_id = key.replace('treatment_', '')
            price = request.form.get(f'price_{treatment_id}', 0)
            name = request.form.get(f'name_{treatment_id}', 'Unknown Treatment')
            selected_treatments.append({
                'id': treatment_id,
                'name': name,
                'price': float(price) if price else 0
            })
    
    # Store treatments in session
    SessionManager.store_treatments(selected_treatments)
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/save-patient-info', methods=['POST'])
def save_patient_info():
    """Save patient information"""
    # Get patient info from form
    patient_info = {
        'name': request.form.get('patient-name', ''),
        'email': request.form.get('patient-email', ''),
        'phone': request.form.get('patient-phone', ''),
        'notes': request.form.get('patient-notes', '')
    }
    
    # Store patient info in session
    SessionManager.store_patient_info(patient_info)
    
    # Redirect to quote summary
    return redirect(url_for('page_routes.quote_summary'))

@page_routes.route('/quote-summary')
def quote_summary():
    """Quote summary page"""
    # Get current data from session
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    patient_info = SessionManager.get_patient_info()
    
    # Check if we have all necessary data
    if not treatments:
        flash("Please select at least one treatment.", "error")
        return redirect(url_for('page_routes.quote_builder'))
    
    if not patient_info.get('name') or not patient_info.get('email'):
        flash("Please provide patient information.", "error")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Calculate totals
    subtotal = sum(treatment.get('price', 0) for treatment in treatments)
    discount_percent = promo_details.get('discount_percent', 0)
    discount_amount = (subtotal * discount_percent) / 100
    total = subtotal - discount_amount
    
    # Get special offer details if a promo code is applied
    promo_code = promo_details.get('promo_code')
    special_offer = PromoService.get_special_offer_details(promo_code) if promo_code else None
    
    # Generate quote reference
    quote_reference = f"Q{int(time.time())}"
    
    # Render the summary template
    return render_template(
        'quote/quote_summary.html',
        treatments=treatments,
        subtotal=subtotal,
        discount_percent=discount_percent,
        discount_amount=discount_amount,
        total=total,
        promo_code=promo_code,
        special_offer=special_offer,
        patient_info=patient_info,
        quote_reference=quote_reference
    )

@page_routes.route('/reset-quote', methods=['POST'])
def reset_quote():
    """Reset the quote and start over"""
    # Reset the session but keep the session ID
    SessionManager.reset_session()
    
    flash("Quote has been reset. You can start a new quote.", "info")
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/')
def index():
    """Home page - redirects to quote builder"""
    return redirect(url_for('page_routes.quote_builder'))