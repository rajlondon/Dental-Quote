"""
Integration Routes for Dental Quote System
Handles API endpoints for integration with other systems
"""

from flask import Blueprint, request, jsonify

integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/get-quote-data', methods=['GET'])
def get_quote_data():
    """API endpoint to get current quote data"""
    session_manager = request.app.config.get('session_manager')
    
    # Get full quote data
    quote_data = session_manager.get_full_quote()
    
    return jsonify({
        'success': True,
        'data': quote_data
    })

@integration_routes.route('/get-treatment-categories', methods=['GET'])
def get_treatment_categories():
    """API endpoint to get treatment categories"""
    treatment_service = request.app.config.get('treatment_service')
    
    # Get categorized treatments
    categories = treatment_service.get_categorized_treatments()
    
    return jsonify({
        'success': True,
        'data': categories
    })

@integration_routes.route('/get-treatment-details/<treatment_id>', methods=['GET'])
def get_treatment_details(treatment_id):
    """API endpoint to get details of a specific treatment"""
    treatment_service = request.app.config.get('treatment_service')
    
    # Get treatment details
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': treatment
    })

@integration_routes.route('/validate-promo', methods=['POST'])
def validate_promo():
    """API endpoint to validate a promo code"""
    promo_service = request.app.config.get('promo_service')
    session_manager = request.app.config.get('session_manager')
    
    # Get promo code from request
    promo_code = request.json.get('promo_code')
    if not promo_code:
        return jsonify({
            'success': False,
            'message': 'Promo code is required'
        }), 400
    
    # Validate promo code
    promo_details = promo_service.validate_promo_code(promo_code)
    if not promo_details:
        return jsonify({
            'success': False,
            'message': 'Invalid promo code'
        }), 400
    
    # Check if treatments in quote are eligible for this promo
    treatments = session_manager.get_selected_treatments()
    if not promo_service.check_promo_eligibility(promo_details, treatments):
        return jsonify({
            'success': False,
            'message': 'This promo code is not applicable to your selected treatments'
        }), 400
    
    return jsonify({
        'success': True,
        'data': promo_details
    })

@integration_routes.route('/save-quote', methods=['POST'])
def save_quote():
    """API endpoint to save quote to an external system"""
    session_manager = request.app.config.get('session_manager')
    
    # Get the full quote data
    quote_data = session_manager.get_full_quote()
    
    # Check if patient info is provided
    if not quote_data.get('patient_info'):
        return jsonify({
            'success': False,
            'message': 'Patient information is required'
        }), 400
    
    # Check if treatments are selected
    if not quote_data.get('treatments'):
        return jsonify({
            'success': False,
            'message': 'No treatments selected'
        }), 400
    
    # Generate a quote ID (this would normally save to a database)
    import os
    quote_id = f"Q{os.urandom(4).hex().upper()}"
    
    # In a real implementation, this would save to a database
    # db.save_quote(quote_data)
    
    return jsonify({
        'success': True,
        'message': 'Quote saved successfully',
        'quote_id': quote_id
    })