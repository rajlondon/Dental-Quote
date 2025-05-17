"""
Integration Routes for Dental Quote System
Handles API endpoints for integration with other systems
"""

from flask import Blueprint, request, jsonify, session
from utils.session_manager import SessionManager
from services.promo_service import PromoService

integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/api/export-quote-data', methods=['GET'])
def export_quote_data():
    """
    Export the current quote data for integration with other systems
    
    Returns:
        JSON: The complete quote data including treatments, promo, and patient info
    """
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get all session data
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    patient_info = SessionManager.get_patient_info()
    
    # Generate quote reference if needed
    quote_ref = session.get('quote_ref')
    if not quote_ref:
        import random
        import string
        quote_ref = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        session['quote_ref'] = quote_ref
    
    # If there's a special offer, get additional details
    special_offer = None
    if promo_details:
        special_offer = PromoService.get_special_offer_by_promo_code(promo_details.get('code', ''))
    
    # Calculate totals
    subtotal = sum(t.get('price', 0) for t in treatments)
    discount = 0
    
    if promo_details:
        if promo_details.get('type') == 'percentage':
            discount = (subtotal * promo_details.get('value', 0)) / 100
        else:
            discount = min(promo_details.get('value', 0), subtotal)
    
    total = max(0, subtotal - discount)
    
    # Build response
    response = {
        'quote_ref': quote_ref,
        'created_at': session.get('session_meta', {}).get('created'),
        'treatments': treatments,
        'promo': promo_details,
        'patient_info': patient_info,
        'special_offer': special_offer,
        'totals': {
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        }
    }
    
    return jsonify(response)

@integration_routes.route('/api/import-quote-data', methods=['POST'])
def import_quote_data():
    """
    Import quote data from external systems
    
    This endpoint accepts a JSON payload containing treatments, promo code, and patient info
    
    Returns:
        JSON: Success status and imported data
    """
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get import data
    import_data = request.get_json()
    
    if not import_data:
        return jsonify({
            'success': False,
            'error': 'No data provided'
        }), 400
    
    # Clear existing data
    SessionManager.reset_session()
    
    # Import treatments
    if 'treatments' in import_data:
        for treatment in import_data['treatments']:
            SessionManager.add_treatment(treatment)
    
    # Import promo code
    if 'promo_code' in import_data and import_data['promo_code']:
        promo_details = PromoService.validate_promo_code(import_data['promo_code'])
        if promo_details:
            SessionManager.apply_promo_code(promo_details)
    
    # Import patient info
    if 'patient_info' in import_data:
        SessionManager.update_patient_info(import_data['patient_info'])
    
    # Get current data to return
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    patient_info = SessionManager.get_patient_info()
    
    return jsonify({
        'success': True,
        'message': 'Quote data imported successfully',
        'data': {
            'treatments': treatments,
            'promo': promo_details,
            'patient_info': patient_info
        }
    })

@integration_routes.route('/api/quote-summary', methods=['GET'])
def quote_summary():
    """
    Get a summary of the current quote data
    
    Returns:
        JSON: A summary of the quote data
    """
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get session data
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate totals
    subtotal = sum(t.get('price', 0) for t in treatments)
    discount = 0
    
    if promo_details:
        if promo_details.get('type') == 'percentage':
            discount = (subtotal * promo_details.get('value', 0)) / 100
        else:
            discount = min(promo_details.get('value', 0), subtotal)
    
    total = max(0, subtotal - discount)
    
    # Build response
    response = {
        'treatment_count': len(treatments),
        'has_promo': promo_details is not None,
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    }
    
    return jsonify(response)