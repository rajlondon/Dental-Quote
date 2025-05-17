"""
Integration Routes Module
Handles API endpoints for integration with external systems
"""
from flask import Blueprint, request, jsonify, session
from utils.session_manager import (
    get_treatments, get_quote_totals, get_promo_code, 
    save_patient_info, generate_quote_id
)
import logging
import json
import uuid

logger = logging.getLogger(__name__)

# Create Blueprint
integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/get-quote-data', methods=['GET'])
def get_quote_data():
    """Get all quote data from the current session"""
    # Get selected treatments
    selected_treatments = get_treatments()
    
    # Get quote totals
    totals = get_quote_totals()
    
    # Get promo code
    promo_code = get_promo_code()
    
    # Get patient info
    patient_info = session.get('patient_info', {})
    
    # Get quote ID
    quote_id = session.get('quote_id')
    
    # Return all data
    return jsonify({
        'success': True,
        'quote_id': quote_id,
        'treatments': selected_treatments,
        'totals': totals,
        'promo_code': promo_code,
        'patient_info': patient_info
    })

@integration_routes.route('/submit-quote', methods=['POST'])
def submit_quote():
    """Submit quote to external system and get quote ID"""
    # Get selected treatments
    selected_treatments = get_treatments()
    
    # Check if there are any treatments selected
    if not selected_treatments:
        return jsonify({
            'success': False,
            'message': 'No treatments selected'
        }), 400
    
    # Get patient info
    patient_info = session.get('patient_info', {})
    
    # Check if patient info is complete
    if not patient_info or not all(k in patient_info for k in ['name', 'email', 'phone']):
        return jsonify({
            'success': False,
            'message': 'Patient information is incomplete'
        }), 400
    
    # Get totals
    totals = get_quote_totals()
    
    # Get promo code
    promo_code = get_promo_code()
    
    # Generate a unique quote ID if not already present
    quote_id = session.get('quote_id')
    if not quote_id:
        quote_id = str(uuid.uuid4())
        session['quote_id'] = quote_id
    
    # Prepare quote data
    quote_data = {
        'quote_id': quote_id,
        'treatments': selected_treatments,
        'totals': totals,
        'promo_code': promo_code,
        'patient_info': patient_info,
        'quote_date': str(datetime.datetime.now())
    }
    
    # For demo purposes, return success without sending to external service
    # In a production environment, this would connect to CRM, email service, etc.
    
    return jsonify({
        'success': True,
        'message': 'Quote submitted successfully',
        'quote_id': quote_id,
        'quote_data': quote_data
    })

@integration_routes.route('/auto-apply-promo', methods=['GET'])
def auto_apply_promo():
    """
    Auto-apply promo code from URL parameter
    This endpoint is used for special offer landing pages and marketing campaigns
    """
    from services.promo_service import get_promotion_by_code
    from utils.session_manager import apply_promo_code
    
    promo_code = request.args.get('code', '').strip().upper()
    
    if not promo_code:
        return jsonify({
            'success': False,
            'message': 'No promo code provided'
        })
    
    # Check if the promo code is valid
    promotion = get_promotion_by_code(promo_code)
    
    if not promotion:
        return jsonify({
            'success': False,
            'message': f"Promo code '{promo_code}' is invalid or expired"
        })
    
    # Try to apply the promo code
    result = apply_promo_code(promo_code)
    
    if len(result) == 3:  # Success case returns 3 values
        success, message, promo_result = result
        return jsonify({
            'success': True,
            'message': message,
            'promo_details': promo_result.get('promo_details')
        })
    else:
        success, message = result
        return jsonify({
            'success': False,
            'message': message
        })

# Import missing dependencies
import datetime