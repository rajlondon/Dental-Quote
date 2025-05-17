"""
Page Routes Module
Handles page rendering and navigation
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from utils.session_manager import (get_treatments, add_treatment, remove_treatment, 
                                  get_patient_info, set_patient_info, 
                                  get_promo_code, get_promo_details,
                                  calculate_totals, clear_session)
from services.treatment_service import load_treatments, get_treatment_categories, get_treatment_by_id, get_popular_treatments
from services.promo_service import get_active_promotions
from datetime import datetime, timedelta
import uuid

# Create Blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Homepage"""
    # Get popular treatments for homepage
    popular_treatments = get_popular_treatments(limit=6)
    
    # Get current date for quotes
    now = datetime.now()
    
    return render_template('index.html', 
                          popular_treatments=popular_treatments,
                          now=now)

@page_routes.route('/quote-builder', methods=['GET', 'POST'])
def quote_builder():
    """Quote builder page"""
    # Load all available treatments
    available_treatments = load_treatments()
    
    # Get treatment categories for filtering
    categories = get_treatment_categories()
    
    # Get selected treatments from session
    selected_treatments = get_treatments()
    
    # Get totals
    totals = calculate_totals()
    
    # Get promo code info
    promo_code = get_promo_code()
    promo_details = get_promo_details()
    
    # For AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if request.method == 'POST':
            treatment_id = request.form.get('treatment_id')
            action = request.form.get('action', 'add')
            
            if action == 'add' and treatment_id:
                treatment = get_treatment_by_id(treatment_id)
                if treatment:
                    success = add_treatment(treatment)
                    if success:
                        return jsonify({
                            'success': True,
                            'message': f"{treatment['name']} added to your quote",
                            'treatment': treatment,
                            'totals': calculate_totals()
                        })
                    else:
                        return jsonify({
                            'success': False,
                            'message': f"{treatment['name']} is already in your quote"
                        })
            
            elif action == 'remove' and treatment_id:
                success = remove_treatment(treatment_id)
                if success:
                    return jsonify({
                        'success': True,
                        'message': "Treatment removed from your quote",
                        'totals': calculate_totals()
                    })
                else:
                    return jsonify({
                        'success': False,
                        'message': "Treatment not found in your quote"
                    })
        
        # Return JSON data for AJAX requests
        return jsonify({
            'selected_treatments': selected_treatments,
            'totals': totals,
            'promo_code': promo_code,
            'promo_details': promo_details
        })
    
    # Get the current date and expiry date
    now = datetime.now()
    expires = now + timedelta(days=30)  # Quote valid for 30 days
    
    # Create a unique quote reference
    quote_ref = f"MDF-{uuid.uuid4().hex[:8].upper()}"
    
    return render_template('quote/quote_builder.html',
                          available_treatments=available_treatments,
                          categories=categories,
                          selected_treatments=selected_treatments,
                          subtotal=totals['subtotal'],
                          discount=totals['discount'],
                          total=totals['total'],
                          promo_code=promo_code,
                          promo_details=promo_details,
                          now=now,
                          expires=expires,
                          quote_ref=quote_ref)

@page_routes.route('/special-offers')
def special_offers():
    """Special offers page"""
    # Get all active promotions
    offers = get_active_promotions()
    
    return render_template('promo/special_offers.html', offers=offers)

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Patient information page"""
    # Get selected treatments from session
    treatments = get_treatments()
    
    # If no treatments selected, redirect to quote builder
    if not treatments:
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get current patient info
    patient_info = get_patient_info()
    
    # Get promo code info
    promo_code = get_promo_code()
    promo_details = get_promo_details()
    
    # Get totals
    totals = calculate_totals()
    
    # Handle form submission
    if request.method == 'POST':
        # Update patient info
        updated_info = {
            'name': request.form.get('name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'notes': request.form.get('notes', '')
        }
        
        # Save to session
        set_patient_info(updated_info)
        
        # Redirect to review page
        return redirect(url_for('page_routes.review_quote'))
    
    return render_template('quote/patient_info.html',
                          patient_info=patient_info,
                          treatments=treatments,
                          subtotal=totals['subtotal'],
                          discount=totals['discount'],
                          total=totals['total'],
                          promo_code=promo_code,
                          promo_details=promo_details)

@page_routes.route('/review-quote')
def review_quote():
    """Review quote page"""
    # Get selected treatments from session
    treatments = get_treatments()
    
    # If no treatments selected, redirect to quote builder
    if not treatments:
        flash("Please select at least one treatment before proceeding.", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get patient info
    patient_info = get_patient_info()
    
    # If patient info not complete, redirect to patient info page
    if not patient_info.get('name') or not patient_info.get('email') or not patient_info.get('phone'):
        flash("Please complete your information before reviewing your quote.", "warning")
        return redirect(url_for('page_routes.patient_info'))
    
    # Get promo code info
    promo_code = get_promo_code()
    promo_details = get_promo_details()
    
    # Get totals
    totals = calculate_totals()
    
    # Get the current date and expiry date
    now = datetime.now()
    expires = now + timedelta(days=30)  # Quote valid for 30 days
    
    # Create a unique quote reference
    quote_ref = f"MDF-{uuid.uuid4().hex[:8].upper()}"
    
    return render_template('quote/review_quote.html',
                          patient_info=patient_info,
                          treatments=treatments,
                          subtotal=totals['subtotal'],
                          discount=totals['discount'],
                          total=totals['total'],
                          promo_code=promo_code,
                          promo_details=promo_details,
                          now=now,
                          expires=expires,
                          quote_ref=quote_ref)

@page_routes.route('/reset-quote')
def reset_quote():
    """Reset the quote and start over"""
    # Clear session data
    clear_session()
    
    flash("Your quote has been reset. Start a new quote below.", "info")
    return redirect(url_for('page_routes.quote_builder'))