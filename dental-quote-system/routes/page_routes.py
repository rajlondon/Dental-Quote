"""
Page Routes Module
Handles page rendering and navigation
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from utils.session_manager import (
    get_treatments, add_treatment, remove_treatment, update_treatment_quantity,
    get_promo_code, get_promo_details, calculate_totals, set_patient_info, get_patient_info,
    set_quote_id, get_quote_id, export_session_data, clear_session
)
from services.treatment_service import (
    get_all_treatments, get_popular_treatments, get_treatment_by_id, 
    get_treatment_categories, get_treatments_by_category
)
from services.promo_service import get_active_promotions
import uuid
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/')
def index():
    """Render the homepage"""
    # Get popular treatments for display
    popular_treatments = get_popular_treatments()
    
    return render_template('index.html', popular_treatments=popular_treatments)

@page_routes.route('/quote-builder', methods=['GET', 'POST'])
def quote_builder():
    """Render the quote builder page and handle treatment selection"""
    # Get all treatments categorized
    all_treatments = get_all_treatments()
    categories = get_treatment_categories()
    categorized_treatments = {}
    
    for category in categories:
        categorized_treatments[category] = get_treatments_by_category(category)
    
    # Get selected treatments and calculate totals
    selected_treatments = get_treatments()
    totals = calculate_totals()
    
    # Handle POST requests (treatment selection/removal)
    if request.method == 'POST':
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        action = request.form.get('action')
        treatment_id = request.form.get('treatment_id')
        
        # Add treatment to quote
        if action == 'add' and treatment_id:
            treatment = get_treatment_by_id(treatment_id)
            
            if treatment:
                # Set default quantity if not present
                if 'quantity' not in treatment:
                    treatment['quantity'] = 1
                
                # Add to session
                success = add_treatment(treatment)
                
                if success:
                    if is_ajax:
                        return jsonify({
                            'success': True, 
                            'message': f"{treatment['name']} added to your quote",
                            'treatment': treatment,
                            'totals': calculate_totals()
                        })
                    
                    flash(f"{treatment['name']} added to your quote", "success")
                else:
                    if is_ajax:
                        return jsonify({
                            'success': False, 
                            'message': f"{treatment['name']} is already in your quote"
                        })
                    
                    flash(f"{treatment['name']} is already in your quote", "info")
            else:
                if is_ajax:
                    return jsonify({
                        'success': False, 
                        'message': "Treatment not found"
                    })
                
                flash("Treatment not found", "danger")
        
        # Remove treatment from quote
        elif action == 'remove' and treatment_id:
            removed = remove_treatment(treatment_id)
            
            if removed:
                # Recalculate totals
                new_totals = calculate_totals()
                
                if is_ajax:
                    return jsonify({
                        'success': True, 
                        'message': "Treatment removed from your quote",
                        'totals': new_totals
                    })
                
                flash("Treatment removed from your quote", "info")
            else:
                if is_ajax:
                    return jsonify({
                        'success': False, 
                        'message': "Treatment not found in your quote"
                    })
                
                flash("Treatment not found in your quote", "warning")
        
        # Update treatment quantity
        elif action == 'update_quantity' and treatment_id:
            quantity = request.form.get('quantity', 1)
            
            try:
                quantity = int(quantity)
                if quantity < 1:
                    quantity = 1
            except:
                quantity = 1
            
            updated = update_treatment_quantity(treatment_id, quantity)
            
            if updated:
                # Recalculate totals
                new_totals = calculate_totals()
                
                if is_ajax:
                    return jsonify({
                        'success': True, 
                        'message': "Quantity updated",
                        'totals': new_totals
                    })
                
                flash("Quantity updated", "info")
            else:
                if is_ajax:
                    return jsonify({
                        'success': False, 
                        'message': "Treatment not found in your quote"
                    })
                
                flash("Treatment not found in your quote", "warning")
        
        # Redirect after non-AJAX form submission
        if not is_ajax:
            return redirect(url_for('page_routes.quote_builder'))
    
    # Get promo details for display
    promo_code = get_promo_code()
    promo_details = get_promo_details()
    
    return render_template(
        'quote/quote_builder.html',
        categories=categories,
        categorized_treatments=categorized_treatments,
        selected_treatments=selected_treatments,
        totals=totals,
        promo_code=promo_code,
        promo_details=promo_details
    )

@page_routes.route('/special-offers')
def special_offers():
    """Render the special offers page"""
    promotions = get_active_promotions()
    
    return render_template(
        'promo/special_offers.html',
        promotions=promotions
    )

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Render the patient information form and handle submission"""
    # Check if there are selected treatments
    selected_treatments = get_treatments()
    
    if not selected_treatments:
        flash("Please select at least one treatment before proceeding", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get saved patient info if available
    saved_info = get_patient_info()
    
    # Handle form submission
    if request.method == 'POST':
        # Collect patient information
        patient_info = {
            'first_name': request.form.get('first_name', ''),
            'last_name': request.form.get('last_name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'country': request.form.get('country', ''),
            'preferred_date': request.form.get('preferred_date', ''),
            'comments': request.form.get('comments', ''),
            'contact_method': request.form.get('contact_method', 'email')
        }
        
        # Save to session
        set_patient_info(patient_info)
        
        # Generate a quote ID if not already present
        if not get_quote_id():
            set_quote_id(str(uuid.uuid4()))
        
        # Redirect to review page
        return redirect(url_for('page_routes.review_quote'))
    
    # Calculate totals for display
    totals = calculate_totals()
    
    return render_template(
        'quote/patient_info.html',
        selected_treatments=selected_treatments,
        totals=totals,
        saved_info=saved_info
    )

@page_routes.route('/review-quote')
def review_quote():
    """Render the quote review page"""
    # Check if there are selected treatments and patient info
    selected_treatments = get_treatments()
    patient_info = get_patient_info()
    
    if not selected_treatments:
        flash("Please select at least one treatment before proceeding", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    if not patient_info or not patient_info.get('email'):
        flash("Please provide your contact information", "warning")
        return redirect(url_for('page_routes.patient_info'))
    
    # Get quote ID or generate a new one
    quote_id = get_quote_id()
    if not quote_id:
        quote_id = str(uuid.uuid4())
        set_quote_id(quote_id)
    
    # Calculate totals for display
    totals = calculate_totals()
    
    return render_template(
        'quote/review_quote.html',
        quote_id=quote_id,
        selected_treatments=selected_treatments,
        patient_info=patient_info,
        totals=totals
    )

@page_routes.route('/thank-you')
def thank_you():
    """Render the thank you page after quote submission"""
    # Get quote data for display
    quote_id = get_quote_id()
    patient_info = get_patient_info()
    
    if not quote_id or not patient_info:
        flash("Missing quote information", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Clear session after displaying the thank you page
    quote_data = export_session_data()
    clear_session()
    
    return render_template(
        'quote/thank_you.html',
        quote_id=quote_id,
        patient_info=patient_info
    )

@page_routes.route('/restart-quote')
def restart_quote():
    """Clear the session and start a new quote"""
    clear_session()
    flash("Your quote has been reset. You can start a new one.", "info")
    return redirect(url_for('page_routes.quote_builder'))