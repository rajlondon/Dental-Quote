"""
Page Routes Module
Defines the routes for page rendering
"""
import logging
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from services.treatment_service import (
    get_all_treatments, get_popular_treatments, 
    get_treatment_by_id, get_categorized_treatments
)
from utils.session_manager import (
    get_session_treatments, add_treatment, remove_treatment,
    update_treatment_quantity, get_quote_totals, get_applied_promo_code,
    get_promo_details, save_patient_info, get_patient_info
)

logger = logging.getLogger(__name__)

# Create blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Render the home page"""
    # Get popular treatments
    popular_treatments = get_popular_treatments(limit=6)
    
    # Get promotions (from promo service)
    from services.promo_service import get_active_promotions
    promotions = get_active_promotions()
    
    return render_template(
        'index.html',
        popular_treatments=popular_treatments,
        promotions=promotions
    )

@page_routes.route('/quote-builder')
def quote_builder():
    """Render the quote builder page"""
    # Get categorized treatments
    categorized_treatments = get_categorized_treatments()
    
    # Get selected treatments from session
    selected_treatments = get_session_treatments()
    
    # Get totals
    quote_totals = get_quote_totals()
    
    # Get promo code and details
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    
    # Check if we need to apply a promo code from URL
    promo_param = request.args.get('promo')
    if promo_param and not promo_code:
        # We'll handle this on the client side with JS
        pass
    
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
    """Render the patient information page"""
    # Get selected treatments from session
    selected_treatments = get_session_treatments()
    
    # Redirect to quote builder if no treatments selected
    if not selected_treatments:
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get patient info from session
    patient_info_data = get_patient_info()
    
    # Handle form submission
    if request.method == 'POST':
        # Get form data
        patient_data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'travel_date': request.form.get('travel_date'),
            'message': request.form.get('message')
        }
        
        # Save to session
        save_patient_info(patient_data)
        
        # Redirect to review page
        return redirect(url_for('page_routes.review_quote'))
    
    return render_template(
        'quote/patient_info.html',
        patient_info=patient_info_data
    )

@page_routes.route('/review-quote')
def review_quote():
    """Render the quote review page"""
    # Get selected treatments from session
    selected_treatments = get_session_treatments()
    
    # Redirect to quote builder if no treatments selected
    if not selected_treatments:
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get patient info from session
    patient_info_data = get_patient_info()
    
    # Redirect to patient info if no patient info
    if not patient_info_data:
        return redirect(url_for('page_routes.patient_info'))
    
    # Get promo details
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    
    # Get totals
    quote_totals = get_quote_totals()
    
    return render_template(
        'quote/review_quote.html',
        selected_treatments=selected_treatments,
        patient_info=patient_info_data,
        promo_code=promo_code,
        promo_details=promo_details,
        quote_totals=quote_totals
    )

@page_routes.route('/add-treatment', methods=['POST'])
def add_treatment_to_session():
    """Add a treatment to the session"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Get treatment ID from form
    treatment_id = request.form.get('treatment_id')
    
    if not treatment_id:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': 'Missing treatment ID'
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get treatment details
    treatment_data = get_treatment_by_id(treatment_id)
    
    if not treatment_data:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': 'Treatment not found'
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Add to session
    success, message, added = add_treatment(treatment_data)
    
    if is_ajax_request:
        return jsonify({
            'success': success,
            'message': message,
            'added': added,
            'selected_treatments': get_session_treatments(),
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment_from_session():
    """Remove a treatment from the session"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Get treatment ID from form
    treatment_id = request.form.get('treatment_id')
    
    if not treatment_id:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': 'Missing treatment ID'
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Remove from session
    success, message = remove_treatment(treatment_id)
    
    if is_ajax_request:
        return jsonify({
            'success': success,
            'message': message,
            'selected_treatments': get_session_treatments(),
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/update-quantity', methods=['POST'])
def update_quantity():
    """Update the quantity of a treatment"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Get treatment ID and quantity from form
    treatment_id = request.form.get('treatment_id')
    quantity = request.form.get('quantity', 1)
    
    try:
        quantity = int(quantity)
    except ValueError:
        quantity = 1
    
    if not treatment_id:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': 'Missing treatment ID'
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Update quantity in session
    success, message = update_treatment_quantity(treatment_id, quantity)
    
    if is_ajax_request:
        return jsonify({
            'success': success,
            'message': message,
            'selected_treatments': get_session_treatments(),
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))