"""
API Routes for Dental Quote System
Handles AJAX requests for quote functionality
"""

from flask import Blueprint, request, jsonify
from utils.session_manager import (
    get_session_data, add_treatment, remove_treatment, 
    update_treatment_quantity, apply_promo_code, remove_promo_code
)
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize blueprint
api_routes = Blueprint('api_routes', __name__, url_prefix='/api')

# Service instances
treatment_service = TreatmentService()
promo_service = PromoService()

@api_routes.route('/add-treatment', methods=['POST'])
def add_treatment_to_quote():
    """
    Add a treatment to the current quote
    """
    data = request.json
    treatment_id = data.get('treatment_id')
    
    # Validate treatment ID
    if not treatment_id:
        return jsonify({
            'success': False,
            'message': 'Treatment ID is required'
        }), 400
    
    # Get treatment data
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found'
        }), 404
    
    # Add treatment to quote in session
    result = add_treatment(treatment)
    
    return jsonify({
        'success': True,
        'message': f"{treatment['name']} added to your quote",
        'selected_treatments': result['selected_treatments'],
        'totals': result['totals']
    })

@api_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment_from_quote():
    """
    Remove a treatment from the current quote
    """
    data = request.json
    treatment_id = data.get('treatment_id')
    
    # Validate treatment ID
    if not treatment_id:
        return jsonify({
            'success': False,
            'message': 'Treatment ID is required'
        }), 400
    
    # Remove treatment from quote in session
    result = remove_treatment(treatment_id)
    
    return jsonify({
        'success': True,
        'message': 'Treatment removed from your quote',
        'selected_treatments': result['selected_treatments'],
        'totals': result['totals']
    })

@api_routes.route('/update-treatment-quantity', methods=['POST'])
def update_treatment_quantity_in_quote():
    """
    Update the quantity of a treatment in the current quote
    """
    data = request.json
    treatment_id = data.get('treatment_id')
    quantity = data.get('quantity')
    
    # Validate input
    if not treatment_id:
        return jsonify({
            'success': False,
            'message': 'Treatment ID is required'
        }), 400
    
    if not quantity or quantity < 1:
        return jsonify({
            'success': False,
            'message': 'Quantity must be at least 1'
        }), 400
    
    # Update treatment quantity in session
    result = update_treatment_quantity(treatment_id, quantity)
    
    return jsonify({
        'success': True,
        'message': 'Treatment quantity updated',
        'selected_treatments': result['selected_treatments'],
        'totals': result['totals']
    })

@api_routes.route('/apply-promo-code', methods=['POST'])
def apply_promo_code_to_quote():
    """
    Apply a promotional code to the current quote
    """
    data = request.json
    promo_code = data.get('promo_code')
    
    # Validate promo code
    if not promo_code:
        return jsonify({
            'success': False,
            'message': 'Promo code is required'
        }), 400
    
    # Get current session data
    session_data = get_session_data()
    selected_treatments = session_data.get('selected_treatments', [])
    
    # Check if there are selected treatments
    if not selected_treatments:
        return jsonify({
            'success': False,
            'message': 'Please select at least one treatment before applying a promo code'
        }), 400
    
    # Check if the promo code is valid
    if not promo_service.is_valid_promo_code(promo_code):
        return jsonify({
            'success': False,
            'message': 'Invalid or expired promo code'
        }), 400
    
    # Get promotion details
    promotion = promo_service.get_promotion_by_code(promo_code)
    
    # Apply promo code to session
    result = promo_service.apply_promo_code(promo_code, selected_treatments)
    
    if not result.get('success'):
        return jsonify(result), 400
    
    # Apply promo code to session
    totals = apply_promo_code(promo_code, promotion)
    
    return jsonify({
        'success': True,
        'message': 'Promo code applied successfully',
        'totals': totals
    })

@api_routes.route('/remove-promo-code', methods=['POST'])
def remove_promo_code_from_quote():
    """
    Remove the promotional code from the current quote
    """
    # Remove promo code from session
    totals = remove_promo_code()
    
    return jsonify({
        'success': True,
        'message': 'Promo code removed',
        'totals': totals
    })

@api_routes.route('/apply-special-offer', methods=['POST'])
def apply_special_offer_to_quote():
    """
    Apply a special offer to the current quote
    """
    data = request.json
    offer_id = data.get('offer_id')
    
    # Validate offer ID
    if not offer_id:
        return jsonify({
            'success': False,
            'message': 'Offer ID is required'
        }), 400
    
    # Get offer details
    offer = promo_service.get_promotion_by_id(offer_id)
    
    if not offer:
        return jsonify({
            'success': False,
            'message': 'Offer not found'
        }), 404
    
    # Get applicable treatments
    applicable_treatments = offer.get('applicable_treatments', [])
    treatments_to_add = []
    
    if applicable_treatments:
        treatments_to_add = treatment_service.get_treatments_by_ids(applicable_treatments)
    
    # Add treatments to quote
    session_data = get_session_data()
    for treatment in treatments_to_add:
        # Check if treatment is already in the quote
        existing = next(
            (t for t in session_data.get('selected_treatments', []) if t.get('id') == treatment.get('id')), 
            None
        )
        
        if not existing:
            add_treatment(treatment)
    
    # Apply promo code from the offer
    promo_code = offer.get('promo_code')
    if promo_code:
        apply_promo_code(promo_code, offer)
    
    return jsonify({
        'success': True,
        'message': 'Special offer applied successfully',
        'redirect': '/quote-builder'
    })

@api_routes.route('/get-eligible-promotions', methods=['GET'])
def get_eligible_promotions():
    """
    Get promotions eligible for the current quote
    """
    # Get current session data
    session_data = get_session_data()
    selected_treatments = session_data.get('selected_treatments', [])
    
    # Get eligible promotions
    eligible_promotions = promo_service.get_eligible_promotions_for_treatments(selected_treatments)
    
    return jsonify({
        'success': True,
        'promotions': eligible_promotions
    })