"""
Integration Routes Module
Defines the API routes for integration with other systems
"""
import logging
import uuid
import json
from flask import Blueprint, request, jsonify, session
from utils.session_manager import (
    get_session_treatments, get_quote_totals, 
    get_applied_promo_code, get_promo_details, get_patient_info
)

logger = logging.getLogger(__name__)

# Create blueprint
integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/quote-data', methods=['GET'])
def get_quote_data():
    """Get the current quote data as JSON"""
    treatments = get_session_treatments()
    quote_totals = get_quote_totals()
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    patient_info = get_patient_info()
    
    # Generate a unique ID for this quote
    quote_id = str(uuid.uuid4())
    
    # Build the response
    response = {
        'quote_id': quote_id,
        'date_created': session.get('date_created', ''),
        'treatments': treatments,
        'totals': quote_totals,
        'promo_code': promo_code,
        'promo_details': promo_details,
        'patient_info': patient_info
    }
    
    return jsonify(response)

@integration_routes.route('/export-quote', methods=['GET'])
def export_quote():
    """Export the current quote as JSON file"""
    treatments = get_session_treatments()
    quote_totals = get_quote_totals()
    promo_code = get_applied_promo_code()
    promo_details = get_promo_details()
    patient_info = get_patient_info()
    
    # Generate a unique ID for this quote
    quote_id = str(uuid.uuid4())
    
    # Build the response
    response = {
        'quote_id': quote_id,
        'date_created': session.get('date_created', ''),
        'treatments': treatments,
        'totals': quote_totals,
        'promo_code': promo_code,
        'promo_details': promo_details,
        'patient_info': patient_info
    }
    
    # Return the data with appropriate headers for file download
    return jsonify(response)

@integration_routes.route('/treatments', methods=['GET'])
def get_all_treatments_api():
    """API endpoint to get all treatments"""
    from services.treatment_service import get_all_treatments
    
    treatments = get_all_treatments()
    
    return jsonify(treatments)

@integration_routes.route('/promotions', methods=['GET'])
def get_all_promotions_api():
    """API endpoint to get all active promotions"""
    from services.promo_service import get_active_promotions
    
    promotions = get_active_promotions()
    
    return jsonify(promotions)

@integration_routes.route('/validate-promo', methods=['POST'])
def validate_promo_api():
    """API endpoint to validate a promo code"""
    from services.promo_service import validate_promo_code
    
    data = request.json
    
    if not data or 'promo_code' not in data:
        return jsonify({
            'success': False,
            'message': 'Missing promo_code parameter'
        }), 400
    
    promo_code = data.get('promo_code')
    subtotal = data.get('subtotal', 0)
    
    result = validate_promo_code(promo_code, subtotal)
    
    return jsonify(result)

@integration_routes.route('/calculate-discount', methods=['POST'])
def calculate_discount_api():
    """API endpoint to calculate discount for a promo code"""
    from services.promo_service import calculate_discount
    
    data = request.json
    
    if not data or 'promo_code' not in data or 'treatments' not in data:
        return jsonify({
            'success': False,
            'message': 'Missing required parameters'
        }), 400
    
    promo_code = data.get('promo_code')
    treatments = data.get('treatments', [])
    subtotal = data.get('subtotal', 0)
    
    result = calculate_discount(promo_code, treatments, subtotal)
    
    return jsonify(result)