"""
Promo Routes Module
Handles promotional code operations
"""
from flask import Blueprint, request, jsonify, render_template
from utils.session_manager import apply_promo_code, remove_promo_code, get_quote_totals
from services.promo_service import get_active_promotions, get_promotion_by_code
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply a promo code to the current quote"""
    # Check if the request is AJAX
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Get the promo code from the form data
    promo_code = request.form.get('promo_code', '').strip().upper()
    
    if not promo_code:
        if is_ajax:
            return jsonify({
                'success': False,
                'message': 'Please enter a promo code'
            })
        return render_template('quote/quote_builder.html', error='Please enter a promo code')
    
    # Try to apply the promo code
    result = apply_promo_code(promo_code)
    
    if len(result) == 3:  # Success case returns 3 values
        success, message, promo_result = result
        
        # Calculate the updated totals
        totals = get_quote_totals()
        
        if is_ajax:
            return jsonify({
                'success': True,
                'message': message,
                'promo_details': promo_result.get('promo_details'),
                'discount_amount': promo_result.get('discount_amount'),
                'totals': totals
            })
    else:
        success, message = result
        
        if is_ajax:
            return jsonify({
                'success': False,
                'message': message
            })
    
    # For non-AJAX requests, redirect back to the quote builder page
    return render_template('quote/quote_builder.html', 
                          success_message=message if success else None, 
                          error=message if not success else None)

@promo_routes.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove the applied promo code from the current quote"""
    # Check if the request is AJAX
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    # Try to remove the promo code
    success, message = remove_promo_code()
    
    # Calculate the updated totals
    totals = get_quote_totals()
    
    if is_ajax:
        return jsonify({
            'success': success,
            'message': message,
            'totals': totals
        })
    
    # For non-AJAX requests, redirect back to the quote builder page
    return render_template('quote/quote_builder.html', 
                          success_message=message if success else None, 
                          error=message if not success else None)
                          
@promo_routes.route('/check-promo', methods=['GET'])
def check_promo():
    """Check if a promo code is valid without applying it"""
    promo_code = request.args.get('code', '').strip().upper()
    
    if not promo_code:
        return jsonify({
            'valid': False,
            'message': 'No promo code provided'
        })
    
    promotion = get_promotion_by_code(promo_code)
    
    if promotion:
        return jsonify({
            'valid': True,
            'message': 'Valid promo code',
            'promo_details': promotion
        })
    else:
        return jsonify({
            'valid': False,
            'message': f"Promo code '{promo_code}' is invalid or expired"
        })

@promo_routes.route('/active-promotions', methods=['GET'])
def get_promotions():
    """Get a list of all active promotions"""
    promotions = get_active_promotions()
    
    return jsonify({
        'success': True,
        'promotions': promotions
    })