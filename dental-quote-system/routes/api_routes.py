import logging
from flask import Blueprint, request, jsonify
from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize blueprint
api_routes_bp = Blueprint('api_routes', __name__)

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

@api_routes_bp.route('/api/add-treatment', methods=['POST'])
def add_treatment():
    """
    Add a treatment to the quote
    """
    data = request.get_json()
    
    if not data or 'treatment_id' not in data:
        return jsonify({
            'success': False,
            'message': 'Invalid request. Treatment ID is required.'
        }), 400
    
    treatment_id = data.get('treatment_id')
    
    # Get the treatment details
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found.'
        }), 404
    
    # Add the treatment to the session
    SessionManager.add_treatment(treatment)
    
    # Get updated data for response
    selected_treatments = SessionManager.get_selected_treatments()
    quote_data = SessionManager.get_quote_data()
    
    return jsonify({
        'success': True,
        'message': f'{treatment.get("name")} added to your quote.',
        'treatments': selected_treatments,
        'subtotal': quote_data.get('subtotal', 0),
        'discount_amount': quote_data.get('discount_amount', 0),
        'total': quote_data.get('total', 0)
    })

@api_routes_bp.route('/api/remove-treatment', methods=['POST'])
def remove_treatment():
    """
    Remove a treatment from the quote
    """
    data = request.get_json()
    
    if not data or 'treatment_id' not in data:
        return jsonify({
            'success': False,
            'message': 'Invalid request. Treatment ID is required.'
        }), 400
    
    treatment_id = data.get('treatment_id')
    
    # Find the treatment in the selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    treatment = next((t for t in selected_treatments if t.get('id') == treatment_id), None)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found in your quote.'
        }), 404
    
    # Remove the treatment from the session
    SessionManager.remove_treatment(treatment_id)
    
    # Get updated data for response
    selected_treatments = SessionManager.get_selected_treatments()
    quote_data = SessionManager.get_quote_data()
    
    return jsonify({
        'success': True,
        'message': f'{treatment.get("name")} removed from your quote.',
        'treatments': selected_treatments,
        'subtotal': quote_data.get('subtotal', 0),
        'discount_amount': quote_data.get('discount_amount', 0),
        'total': quote_data.get('total', 0)
    })

@api_routes_bp.route('/api/update-quantity', methods=['POST'])
def update_quantity():
    """
    Update the quantity of a treatment in the quote
    """
    data = request.get_json()
    
    if not data or 'treatment_id' not in data or 'quantity' not in data:
        return jsonify({
            'success': False,
            'message': 'Invalid request. Treatment ID and quantity are required.'
        }), 400
    
    treatment_id = data.get('treatment_id')
    quantity = int(data.get('quantity', 1))
    
    # Find the treatment in the selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    treatment = next((t for t in selected_treatments if t.get('id') == treatment_id), None)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found in your quote.'
        }), 404
    
    # Update the quantity in the session
    SessionManager.update_treatment_quantity(treatment_id, quantity)
    
    # Get updated data for response
    selected_treatments = SessionManager.get_selected_treatments()
    quote_data = SessionManager.get_quote_data()
    
    return jsonify({
        'success': True,
        'message': f'Quantity updated to {quantity}.',
        'treatments': selected_treatments,
        'subtotal': quote_data.get('subtotal', 0),
        'discount_amount': quote_data.get('discount_amount', 0),
        'total': quote_data.get('total', 0)
    })

@api_routes_bp.route('/api/get-quote-data', methods=['GET'])
def get_quote_data():
    """
    Get the current quote data
    """
    # Get data from session
    quote_data = SessionManager.get_quote_data()
    selected_treatments = SessionManager.get_selected_treatments()
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    return jsonify({
        'success': True,
        'quote_data': quote_data,
        'treatments': selected_treatments,
        'promo_code': promo_code,
        'promo_details': promo_details
    })

@api_routes_bp.route('/api/get-treatment/<treatment_id>', methods=['GET'])
def get_treatment(treatment_id):
    """
    Get details for a specific treatment
    """
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found.'
        }), 404
    
    return jsonify({
        'success': True,
        'treatment': treatment
    })

@api_routes_bp.route('/api/get-all-treatments', methods=['GET'])
def get_all_treatments():
    """
    Get all available treatments
    """
    treatments = treatment_service.get_all_treatments()
    
    return jsonify({
        'success': True,
        'treatments': treatments
    })

@api_routes_bp.route('/api/get-categorized-treatments', methods=['GET'])
def get_categorized_treatments():
    """
    Get treatments organized by category
    """
    categorized_treatments = treatment_service.get_categorized_treatments()
    
    return jsonify({
        'success': True,
        'categorized_treatments': categorized_treatments
    })