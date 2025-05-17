"""
Promo Routes for Dental Quote System
Handles API endpoints for promo code operations
"""

from flask import Blueprint, request, jsonify, flash, redirect, url_for, render_template
import logging
from services.promo_service import PromoService
from utils.session_manager import SessionManager

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/api/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """Apply a promo code to the current session"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Get promo code from request
    promo_code = request.form.get('promo_code')
    
    # Check if promo code was provided
    if not promo_code:
        error_msg = 'No promo code provided'
        
        # Handle XHR requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': error_msg})
        
        # Handle regular form submission
        flash(error_msg)
        return redirect(url_for('page_routes.quote_builder'))
    
    # Validate promo code
    promo_details = PromoService.validate_promo_code(promo_code)
    
    if not promo_details:
        error_msg = 'Invalid promo code'
        
        # Handle XHR requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': error_msg})
        
        # Handle regular form submission
        flash(error_msg)
        return redirect(url_for('page_routes.quote_builder'))
    
    # Store promo code in session
    SessionManager.store_promo_code(promo_details['code'], promo_details['value'])
    
    # Handle XHR requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'promo': {
                'code': promo_details['code'],
                'discount_type': promo_details['type'],
                'discount_value': promo_details['value'],
                'description': promo_details['description']
            }
        })
    
    # Handle regular form submission
    flash(f"Promo code '{promo_code}' applied successfully!")
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/api/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """Remove the applied promo code from the session"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Remove promo code from session
    SessionManager.remove_promo_code()
    
    # Handle XHR requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True})
    
    # Handle regular form submission
    flash("Promo code removed")
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/api/validate-promo-code/<code>')
def validate_promo_code(code):
    """Validate a promo code without applying it"""
    # Validate promo code
    promo_details = PromoService.validate_promo_code(code)
    
    if not promo_details:
        return jsonify({
            'valid': False,
            'message': 'Invalid promo code'
        })
    
    return jsonify({
        'valid': True,
        'code': promo_details['code'],
        'discount_type': promo_details['type'],
        'discount_value': promo_details['value'],
        'description': promo_details['description']
    })

@promo_routes.route('/api/special-offers')
def get_special_offers_api():
    """API endpoint to get all special offers"""
    offers = PromoService.get_special_offers()
    return jsonify({
        'success': True,
        'offers': offers
    })

@promo_routes.route('/special-offers')
def special_offers_page():
    """Page to display all special offers"""
    # Ensure session is initialized
    SessionManager.initialize_session()
    
    # Get offers
    offers = PromoService.get_special_offers()
    
    # Render special offers page
    return render_template('promo/special_offers.html', offers=offers)