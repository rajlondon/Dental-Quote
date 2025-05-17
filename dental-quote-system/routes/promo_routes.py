"""
Promo Routes Module
Defines the routes for promotion and promo code handling
"""
import logging
from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from services.promo_service import get_active_promotions, get_promotion_by_code
from utils.session_manager import apply_promo_code, remove_promo_code, get_quote_totals, get_promo_details

logger = logging.getLogger(__name__)

# Create blueprint
promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/special-offers')
def special_offers():
    """Render the special offers page"""
    # Get active promotions
    promotions = get_active_promotions()
    
    return render_template(
        'promo/special_offers.html',
        promotions=promotions
    )

@promo_routes.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply a promo code"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Get promo code from form
    promo_code = request.form.get('promo_code')
    
    if not promo_code:
        if is_ajax_request:
            return jsonify({
                'success': False,
                'message': 'Please enter a promo code'
            })
        return redirect(url_for('page_routes.quote_builder'))
    
    # Apply promo code
    success, message = apply_promo_code(promo_code)
    
    # Get promo details for the response
    promo_details = get_promo_details() if success else None
    
    if is_ajax_request:
        return jsonify({
            'success': success,
            'message': message,
            'promo_details': promo_details,
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove a promo code"""
    # Check if AJAX request
    is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Remove promo code
    success, message = remove_promo_code()
    
    if is_ajax_request:
        return jsonify({
            'success': success,
            'message': message,
            'totals': get_quote_totals()
        })
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/promotion/<promo_code>')
def view_promotion(promo_code):
    """View a specific promotion"""
    # Get the promotion details
    promotion = get_promotion_by_code(promo_code)
    
    if not promotion:
        # Promotion not found, redirect to special offers
        return redirect(url_for('promo_routes.special_offers'))
    
    return render_template(
        'promo/promotion_details.html',
        promotion=promotion
    )