"""
Page Routes Module
Defines the main page routes for the application
"""
import logging
import json
from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify
from services.treatment_service import (
    get_all_treatments, get_treatments_by_category, get_popular_treatments, get_treatment_by_id
)
from services.promo_service import get_active_promotions
from utils.session_manager import (
    get_session_treatments, add_treatment_to_session, remove_treatment_from_session,
    update_treatment_quantity, get_quote_totals, update_quote_totals,
    get_applied_promo_code, get_promo_details, update_patient_info
)

logger = logging.getLogger(__name__)

# Create blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Render the home page"""
    # Get popular treatments for the home page
    popular_treatments = get_popular_treatments()
    # Get active promotions
    promotions = get_active_promotions()
    
    return render_template(
        'index.html',
        popular_treatments=popular_treatments,
        promotions=promotions
    )

@page_routes.route('/quote-builder', methods=['GET', 'POST'])
def quote_builder():
    """Render the quote builder page"""
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if request.method == 'POST':
        action = request.form.get('action')
        treatment_id = request.form.get('treatment_id')
        
        if action == 'add':
            # Add treatment to session
            success, message = add_treatment_to_session(treatment_id)
            return jsonify({
                'success': success,
                'message': message,
                'totals': get_quote_totals()
            })
        
        elif action == 'remove':
            # Remove treatment from session
            success, message = remove_treatment_from_session(treatment_id)
            return jsonify({
                'success': success,
                'message': message,
                'totals': get_quote_totals()
            })
        
        elif action == 'update_quantity':
            # Update treatment quantity
            quantity = request.form.get('quantity', 1)
            success, message = update_treatment_quantity(treatment_id, quantity)
            return jsonify({
                'success': success,
                'message': message,
                'totals': get_quote_totals()
            })
    
    # Get all available treatments by category
    categories = {
        'implants': 'Dental Implants',
        'cosmetic': 'Cosmetic Dentistry',
        'restorative': 'Restorative Treatments',
        'preventive': 'Preventive Care'
    }
    
    categorized_treatments = {}
    for category_id, category_name in categories.items():
        categorized_treatments[category_id] = {
            'name': category_name,
            'treatments': get_treatments_by_category(category_id)
        }
    
    # Get selected treatments from session
    selected_treatments = get_session_treatments()
    
    # Get applied promo code
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    
    # If it's an AJAX request, just return the treatments list partial
    if is_ajax_request:
        return render_template(
            'quote/quote_builder.html',
            categorized_treatments=categorized_treatments,
            selected_treatments=selected_treatments,
            promo_code=promo_code,
            promo_details=promo_details
        )
    
    return render_template(
        'quote/quote_builder.html',
        categorized_treatments=categorized_treatments,
        selected_treatments=selected_treatments,
        promo_code=promo_code,
        promo_details=promo_details
    )

@page_routes.route('/special-offers')
def special_offers():
    """Render the special offers page"""
    # Get active promotions
    promotions = get_active_promotions()
    
    return render_template(
        'promo/special_offers.html',
        promotions=promotions
    )

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Render the patient information page"""
    # Check if there are treatments in the session
    selected_treatments = get_session_treatments()
    
    if not selected_treatments:
        # Redirect to quote builder if no treatments selected
        return redirect(url_for('page_routes.quote_builder'))
    
    if request.method == 'POST':
        # Process form data
        patient_data = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'preferred_dates': request.form.get('preferred_dates'),
            'special_requests': request.form.get('special_requests')
        }
        
        # Update session with patient info
        update_patient_info(patient_data)
        
        # Redirect to review page
        return redirect(url_for('page_routes.review_quote'))
    
    return render_template(
        'quote/patient_info.html',
        selected_treatments=selected_treatments
    )

@page_routes.route('/review-quote')
def review_quote():
    """Render the quote review page"""
    # Check if there are treatments and patient info in the session
    selected_treatments = get_session_treatments()
    patient_info = session.get('patient_info', {})
    
    if not selected_treatments:
        # Redirect to quote builder if no treatments selected
        return redirect(url_for('page_routes.quote_builder'))
    
    if not patient_info:
        # Redirect to patient info if no patient information
        return redirect(url_for('page_routes.patient_info'))
    
    # Get promo code details
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    
    return render_template(
        'quote/review_quote.html',
        selected_treatments=selected_treatments,
        patient_info=patient_info,
        promo_code=promo_code,
        promo_details=promo_details,
        quote_totals=get_quote_totals()
    )