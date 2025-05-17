"""
Promo Routes for Dental Quote System
Handles API endpoints for promo code operations
"""

from flask import Blueprint, request, jsonify, render_template
from utils.session_manager import SessionManager
from services.promo_service import PromoService

promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/api/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """API endpoint to apply a promo code"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get promo code from request
    promo_code = request.form.get('promo_code', '').strip()
    
    if not promo_code:
        return jsonify({
            'success': False,
            'error': 'No promo code provided'
        })
    
    # Validate promo code
    promo_details = PromoService.validate_promo_code(promo_code)
    
    if not promo_details:
        return jsonify({
            'success': False,
            'error': f'Invalid promo code: {promo_code}'
        })
    
    # Apply promo code to session
    SessionManager.apply_promo_code(promo_details)
    
    return jsonify({
        'success': True,
        'message': f'Promo code {promo_code} applied successfully',
        'promo': promo_details
    })

@promo_routes.route('/api/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """API endpoint to remove a promo code"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Remove promo code from session
    SessionManager.remove_promo_code()
    
    return jsonify({
        'success': True,
        'message': 'Promo code removed successfully'
    })

@promo_routes.route('/api/validate-promo-code/<code>')
def validate_promo_code(code):
    """API endpoint to validate a promo code"""
    # Validate promo code
    promo_details = PromoService.validate_promo_code(code)
    
    if not promo_details:
        return jsonify({
            'valid': False,
            'error': f'Invalid promo code: {code}'
        })
    
    return jsonify({
        'valid': True,
        'promo': promo_details
    })

@promo_routes.route('/api/session-status')
def session_status():
    """API endpoint to check session status"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get session metadata
    metadata = SessionManager.get_session_metadata()
    
    return jsonify(metadata)

@promo_routes.route('/special-offers')
def special_offers_page():
    """Render the special offers page"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get all special offers
    offers = PromoService.get_all_special_offers()
    
    return render_template('promo/special_offers.html', offers=offers)

@promo_routes.route('/api/special-offers')
def get_special_offers():
    """API endpoint to get all special offers"""
    # Get all special offers
    offers = PromoService.get_all_special_offers()
    
    return jsonify({
        'success': True,
        'offers': offers
    })