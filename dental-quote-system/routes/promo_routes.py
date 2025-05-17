"""
Promo Routes Module
Handles promotional code application and validation
"""
from flask import Blueprint, request, redirect, url_for, flash, jsonify
from utils.session_manager import set_promo_code, remove_promo_code, get_treatments, calculate_totals
from services.promo_service import get_promotion_by_code, validate_promo_code, apply_promo_code

# Create Blueprint
promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply a promo code to the quote"""
    promo_code = request.form.get('promo_code', '').strip().upper()
    
    # Get selected treatments from session
    treatments = get_treatments()
    
    # Calculate subtotal
    subtotal = calculate_totals()['subtotal']
    
    # Handle AJAX requests
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # If no promo code provided
    if not promo_code:
        if is_ajax:
            return jsonify({
                'success': False,
                'message': "Please enter a promo code"
            })
        flash("Please enter a promo code", "warning")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Apply the promo code
    result = apply_promo_code(promo_code, subtotal)
    
    if result['success']:
        # Save to session
        set_promo_code(promo_code, result['promo_details'])
        
        # Calculate updated totals
        totals = calculate_totals()
        
        if is_ajax:
            return jsonify({
                'success': True,
                'message': result['message'],
                'promo_details': result['promo_details'],
                'totals': totals
            })
        
        flash(result['message'], "success")
    else:
        if is_ajax:
            return jsonify({
                'success': False,
                'message': result['message']
            })
        
        flash(result['message'], "danger")
    
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove a promo code from the quote"""
    # Remove promo code from session
    remove_promo_code()
    
    # Calculate updated totals
    totals = calculate_totals()
    
    # Handle AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'message': "Promo code removed",
            'totals': totals
        })
    
    flash("Promo code removed", "info")
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/validate-promo/<promo_code>', methods=['GET'])
def validate_promo(promo_code):
    """Validate a promo code via API"""
    if not promo_code:
        return jsonify({
            'valid': False,
            'message': "No promo code provided"
        })
    
    # Calculate subtotal for validation
    subtotal = calculate_totals()['subtotal']
    
    # Validate the promo code
    is_valid, message = validate_promo_code(promo_code, subtotal)
    
    # Get promotion details if valid
    promo_details = None
    if is_valid:
        promo_details = get_promotion_by_code(promo_code)
    
    return jsonify({
        'valid': is_valid,
        'message': message,
        'promo_details': promo_details
    })