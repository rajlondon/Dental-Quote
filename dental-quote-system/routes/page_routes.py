"""
Page Routes Module
Handles page rendering and navigation
"""
from flask import Blueprint, request, redirect, url_for, render_template, jsonify, session
from utils.session_manager import (initialize_session, add_treatment, remove_treatment, 
                                  update_treatment_quantity, get_quote_totals, 
                                  get_treatments, get_promo_code, clear_session,
                                  save_patient_info)
from services.treatment_service import (get_treatment_categories, get_categorized_treatments,
                                       get_treatment_by_id)
from services.promo_service import get_active_promotions, get_promotion_by_code
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Render the homepage"""
    # Initialize session if not already done
    initialize_session()
    
    # Get active promotions for the homepage carousel
    promotions = get_active_promotions()
    
    # Get popular treatment categories
    categories = get_treatment_categories()
    categorized_treatments = get_categorized_treatments()
    
    # Prepare data for homepage
    featured_categories = categories[:4]  # Show top 4 categories on homepage
    featured_treatments = []
    
    # Get 2 treatments from each featured category
    for category in featured_categories:
        if category in categorized_treatments and len(categorized_treatments[category]) > 0:
            featured_treatments.extend(categorized_treatments[category][:2])
    
    return render_template('index.html', 
                          promotions=promotions,
                          featured_categories=featured_categories,
                          featured_treatments=featured_treatments)

@page_routes.route('/quote-builder', methods=['GET', 'POST'])
def quote_builder():
    """Render the quote builder page and handle treatment selection"""
    # Initialize session if not already done
    initialize_session()
    
    # Handle POST requests (adding/removing treatments)
    if request.method == 'POST':
        # Check if the request is AJAX
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        treatment_id = request.form.get('treatment_id')
        action = request.form.get('action', 'add')
        
        if action == 'add':
            success, message = add_treatment(treatment_id)
        elif action == 'remove':
            success, message = remove_treatment(treatment_id)
        elif action == 'update_quantity':
            quantity = request.form.get('quantity', 1)
            success, message = update_treatment_quantity(treatment_id, quantity)
        
        # For AJAX requests, return JSON response
        if is_ajax:
            return jsonify({
                'success': success,
                'message': message,
                'totals': get_quote_totals()
            })
    
    # Get treatment categories and treatments
    categories = get_treatment_categories()
    categorized_treatments = get_categorized_treatments()
    
    # Get currently selected treatments
    selected_treatments = get_treatments()
    
    # Calculate totals
    totals = get_quote_totals()
    
    # Get current promo code
    promo_code = get_promo_code()
    
    return render_template('quote/quote_builder.html',
                          categories=categories,
                          categorized_treatments=categorized_treatments,
                          selected_treatments=selected_treatments,
                          totals=totals,
                          promo_code=promo_code)

@page_routes.route('/special-offers')
def special_offers():
    """Render the special offers page"""
    # Initialize session if not already done
    initialize_session()
    
    # Get active promotions/offers
    promotions = get_active_promotions()
    
    return render_template('promo/special_offers.html', 
                          promotions=promotions)

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Render the patient information form and handle submission"""
    # Initialize session if not already done
    initialize_session()
    
    # Get selected treatments
    selected_treatments = get_treatments()
    
    # Redirect to quote builder if no treatments selected
    if not selected_treatments:
        return redirect(url_for('page_routes.quote_builder'))
    
    # Handle form submission
    if request.method == 'POST':
        # Get form data
        patient_data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'travel_month': request.form.get('travel_month'),
            'message': request.form.get('message', '')
        }
        
        # Validate form data
        errors = {}
        if not patient_data['name']:
            errors['name'] = 'Please enter your name'
        if not patient_data['email']:
            errors['email'] = 'Please enter your email'
        if not patient_data['phone']:
            errors['phone'] = 'Please enter your phone number'
        
        if errors:
            return render_template('quote/patient_info.html',
                                  patient_data=patient_data,
                                  errors=errors)
        
        # Save patient info to session
        success, message = save_patient_info(patient_data)
        
        # Redirect to review page
        if success:
            return redirect(url_for('page_routes.review_quote'))
    
    # Calculate totals
    totals = get_quote_totals()
    
    return render_template('quote/patient_info.html',
                          selected_treatments=selected_treatments,
                          totals=totals)

@page_routes.route('/review-quote')
def review_quote():
    """Render the quote review page"""
    # Initialize session if not already done
    initialize_session()
    
    # Get selected treatments
    selected_treatments = get_treatments()
    
    # Redirect to quote builder if no treatments selected
    if not selected_treatments:
        return redirect(url_for('page_routes.quote_builder'))
    
    # Calculate totals
    totals = get_quote_totals()
    
    # Get patient info
    patient_info = session.get('patient_info', {})
    
    # Get current promo code
    promo_code = get_promo_code()
    promo_details = None
    if promo_code:
        promo_details = get_promotion_by_code(promo_code)
    
    # Get quote ID
    quote_id = session.get('quote_id')
    
    return render_template('quote/review_quote.html',
                          selected_treatments=selected_treatments,
                          totals=totals,
                          patient_info=patient_info,
                          promo_code=promo_code,
                          promo_details=promo_details,
                          quote_id=quote_id)

@page_routes.route('/thank-you')
def thank_you():
    """Render the thank you page after quote submission"""
    # Initialize session if not already done
    initialize_session()
    
    # Get quote ID and patient info
    quote_id = session.get('quote_id')
    patient_info = session.get('patient_info', {})
    
    # Redirect to homepage if no quote ID or patient info
    if not quote_id or not patient_info:
        return redirect(url_for('page_routes.index'))
    
    return render_template('quote/thank_you.html',
                          quote_id=quote_id,
                          patient_info=patient_info)

@page_routes.route('/restart-quote')
def restart_quote():
    """Clear the session and start a new quote"""
    success, message = clear_session()
    return redirect(url_for('page_routes.quote_builder'))