"""
Integration Routes Module
Provides API endpoints for integration with external systems
"""
import logging
import json
from flask import Blueprint, request, jsonify
from utils.session_manager import get_session_treatments, get_quote_totals, get_patient_info, get_applied_promo_code, get_promo_details

logger = logging.getLogger(__name__)

# Create blueprint
integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/get-quote-data', methods=['GET'])
def get_quote_data():
    """Get the current quote data
    
    Returns:
        JSON: Quote data
    """
    # Get quote data from session
    treatments = get_session_treatments()
    totals = get_quote_totals()
    patient_info = get_patient_info()
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    
    # Return JSON response
    return jsonify({
        'success': True,
        'data': {
            'treatments': treatments,
            'totals': totals,
            'patient_info': patient_info,
            'promo_code': promo_code,
            'promo_details': promo_details
        }
    })

@integration_routes.route('/submit-quote', methods=['POST'])
def submit_quote():
    """Submit a quote to the external system
    
    Returns:
        JSON: Result with quote reference number
    """
    # Get quote data from session
    treatments = get_session_treatments()
    totals = get_quote_totals()
    patient_info = get_patient_info()
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    
    if not treatments:
        return jsonify({
            'success': False,
            'message': 'No treatments selected'
        })
    
    if not patient_info:
        return jsonify({
            'success': False,
            'message': 'Patient information not provided'
        })
    
    # TODO: Connect to external system and save quote
    # For testing, we'll generate a reference number
    import uuid
    import datetime
    
    quote_reference = f"QT-{datetime.datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Return success response
    return jsonify({
        'success': True,
        'message': 'Quote submitted successfully',
        'reference': quote_reference,
        'data': {
            'treatments': treatments,
            'totals': totals,
            'patient_info': patient_info,
            'promo_code': promo_code,
            'promo_details': promo_details
        }
    })

@integration_routes.route('/get-package-by-promo', methods=['GET'])
def get_package_by_promo():
    """Get a treatment package associated with a promo code
    
    Returns:
        JSON: Package details
    """
    # Get promo code from query string
    promo_code = request.args.get('promo_code')
    
    if not promo_code:
        return jsonify({
            'success': False,
            'message': 'Missing promo code'
        })
    
    # Get promo details
    from services.promo_service import get_promotion_by_code
    promotion = get_promotion_by_code(promo_code)
    
    if not promotion:
        return jsonify({
            'success': False,
            'message': f"Promo code '{promo_code}' not found."
        })
    
    # Get applicable treatments
    from services.treatment_service import get_treatment_by_id
    
    applicable_treatments = promotion.get('applicable_treatments', [])
    treatments = []
    
    for treatment_id in applicable_treatments:
        treatment = get_treatment_by_id(treatment_id)
        if treatment:
            treatments.append(treatment)
    
    # Create package details
    package = {
        'name': promotion['title'],
        'description': promotion['description'],
        'discount_type': promotion['discount_type'],
        'discount_value': promotion['discount_value'],
        'treatments': treatments
    }
    
    return jsonify({
        'success': True,
        'package': package
    })