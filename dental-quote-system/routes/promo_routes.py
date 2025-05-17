"""
Promo Routes Module
Handles routes for promo code application and special offers
"""
import logging
from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from services.promo_service import validate_promo_code, calculate_discount, get_active_promotions
from utils.session_manager import apply_promo_code, remove_promo_code, get_session_treatments, get_quote_totals

logger = logging.getLogger(__name__)

# Create blueprint
promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/special-offers')
def special_offers():
    """Render the special offers page"""
    # Get active promotions
    active_promotions = get_active_promotions()
    
    return render_template(
        'promo/special_offers.html',
        promotions=active_promotions
    )

@promo_routes.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply a promo code to the quote"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Get promo code from form
    promo_code = request.form.get('promo_code')
    
    if not promo_code:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': 'Missing promo code'
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get selected treatments and calculate subtotal
    selected_treatments = get_session_treatments()
    subtotal = sum(treatment['price'] * treatment.get('quantity', 1) for treatment in selected_treatments)
    
    # Validate promo code
    validation = validate_promo_code(promo_code, subtotal)
    
    if not validation['valid']:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': validation['message']
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Calculate discount
    discount_result = calculate_discount(promo_code, selected_treatments, subtotal)
    
    if not discount_result['success']:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': discount_result['message']
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Apply promo code to session
    apply_promo_code(
        promo_code, 
        discount_result['discount'],
        discount_result['promo_details']
    )
    
    if is_ajax_request:
        return jsonify({
            'success': True,
            'message': f"Promo code '{promo_code}' applied successfully!",
            'discount': discount_result['discount'],
            'promo_details': discount_result['promo_details'],
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove a promo code from the quote"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Remove promo code from session
    remove_promo_code()
    
    if is_ajax_request:
        return jsonify({
            'success': True,
            'message': "Promo code removed successfully!",
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))