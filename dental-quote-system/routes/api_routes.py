import logging
import json
from flask import Blueprint, request, jsonify, session

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

# Treatment management API endpoints
@api_routes_bp.route('/api/treatments', methods=['GET'])
def get_treatments():
    """Return a list of all treatments in JSON format."""
    treatments = treatment_service.get_all_treatments()
    return jsonify(treatments)

@api_routes_bp.route('/api/treatments/<treatment_id>', methods=['GET'])
def get_treatment(treatment_id):
    """Return details for a specific treatment in JSON format."""
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    if not treatment:
        return jsonify({'error': 'Treatment not found'}), 404
    return jsonify(treatment)

@api_routes_bp.route('/api/treatments/category/<category_id>', methods=['GET'])
def get_treatments_by_category(category_id):
    """Return all treatments in a specific category in JSON format."""
    treatments = treatment_service.get_treatments_by_category(category_id)
    return jsonify(treatments)

@api_routes_bp.route('/api/treatments/popular', methods=['GET'])
def get_popular_treatments():
    """Return popular treatments in JSON format."""
    limit = request.args.get('limit', 6, type=int)
    treatments = treatment_service.get_popular_treatments(limit)
    return jsonify(treatments)

@api_routes_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """Return all treatment categories in JSON format."""
    categorized = treatment_service.get_categorized_treatments()
    return jsonify(categorized)

@api_routes_bp.route('/api/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the current quote."""
    # Get the treatment ID from the request
    treatment_id = request.json.get('treatment_id')
    if not treatment_id:
        return jsonify({'success': False, 'message': 'No treatment ID provided'}), 400
    
    # Get the treatment details
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'}), 404
    
    # Add the treatment to the session
    updated_treatments = SessionManager.add_treatment(treatment)
    
    # Recalculate totals
    totals = SessionManager.calculate_totals()
    
    return jsonify({
        'success': True,
        'message': f"{treatment['name']} added to your quote",
        'treatments': updated_treatments,
        'subtotal': totals['subtotal'],
        'discount_amount': totals['discount_amount'],
        'total': totals['total']
    })

@api_routes_bp.route('/api/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the current quote."""
    # Get the treatment ID from the request
    treatment_id = request.json.get('treatment_id')
    if not treatment_id:
        return jsonify({'success': False, 'message': 'No treatment ID provided'}), 400
    
    # Remove the treatment from the session
    updated_treatments = SessionManager.remove_treatment(treatment_id)
    
    # Recalculate totals
    totals = SessionManager.calculate_totals()
    
    return jsonify({
        'success': True,
        'message': 'Treatment removed from your quote',
        'treatments': updated_treatments,
        'subtotal': totals['subtotal'],
        'discount_amount': totals['discount_amount'],
        'total': totals['total']
    })

@api_routes_bp.route('/api/update-quantity', methods=['POST'])
def update_quantity():
    """Update the quantity of a treatment in the current quote."""
    # Get the treatment ID and quantity from the request
    treatment_id = request.json.get('treatment_id')
    quantity = request.json.get('quantity', 1, type=int)
    
    if not treatment_id:
        return jsonify({'success': False, 'message': 'No treatment ID provided'}), 400
    
    # Update the treatment quantity in the session
    updated_treatments = SessionManager.update_treatment_quantity(treatment_id, quantity)
    
    # Recalculate totals
    totals = SessionManager.calculate_totals()
    
    return jsonify({
        'success': True,
        'message': 'Treatment quantity updated',
        'treatments': updated_treatments,
        'subtotal': totals['subtotal'],
        'discount_amount': totals['discount_amount'],
        'total': totals['total']
    })

@api_routes_bp.route('/api/get-quote', methods=['GET'])
def get_quote():
    """Return the current quote data in JSON format."""
    quote_data = SessionManager.get_quote_data()
    return jsonify(quote_data)

# Promo code API endpoints
@api_routes_bp.route('/api/promo-codes', methods=['GET'])
def get_promo_codes():
    """Return a list of all promo codes in JSON format."""
    # This is an admin-only endpoint in a real application
    # would require authentication
    promo_codes = promo_service.get_all_promo_codes()
    return jsonify(promo_codes)

@api_routes_bp.route('/api/active-promo-codes', methods=['GET'])
def get_active_promo_codes():
    """Return a list of active promo codes in JSON format."""
    active_codes = promo_service.get_active_promo_codes()
    return jsonify(active_codes)

@api_routes_bp.route('/api/validate-promo', methods=['POST'])
def validate_promo():
    """Validate a promo code for the current quote."""
    # Get the promo code from the request
    promo_code = request.json.get('promo_code', '').strip()
    
    if not promo_code:
        return jsonify({
            'valid': False,
            'message': 'No promo code provided'
        })
    
    # Get selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    treatment_ids = [t['id'] for t in selected_treatments]
    
    # Calculate subtotal
    totals = SessionManager.calculate_totals()
    subtotal = totals['subtotal']
    
    # Validate the promo code
    validation = promo_service.validate_promo_code(promo_code, subtotal, treatment_ids)
    
    if validation['valid']:
        promo = validation['promo']
        
        # Calculate discount
        discount_amount = promo_service.calculate_discount(promo, subtotal)
        
        validation['discount_amount'] = discount_amount
        validation['new_total'] = subtotal - discount_amount
    
    return jsonify(validation)

# Special offers API endpoints
@api_routes_bp.route('/api/special-offers', methods=['GET'])
def get_special_offers():
    """Return a list of all special offers in JSON format."""
    special_offers = promo_service.get_all_special_offers()
    return jsonify(special_offers)

@api_routes_bp.route('/api/active-special-offers', methods=['GET'])
def get_active_special_offers():
    """Return a list of active special offers in JSON format."""
    active_offers = promo_service.get_active_special_offers()
    return jsonify(active_offers)

@api_routes_bp.route('/api/featured-special-offers', methods=['GET'])
def get_featured_special_offers():
    """Return a list of featured special offers in JSON format."""
    limit = request.args.get('limit', 3, type=int)
    featured_offers = promo_service.get_featured_special_offers(limit)
    return jsonify(featured_offers)

@api_routes_bp.route('/api/special-offer/<offer_id>', methods=['GET'])
def get_special_offer(offer_id):
    """Return details for a specific special offer in JSON format."""
    offer = promo_service.get_special_offer_by_id(offer_id)
    if not offer:
        return jsonify({'error': 'Special offer not found'}), 404
    return jsonify(offer)

# Recommended treatments API endpoint
@api_routes_bp.route('/api/recommended-treatments', methods=['GET'])
def get_recommended_treatments():
    """Return recommended treatments based on currently selected treatments."""
    # Get selected treatment IDs from the session
    selected_treatments = SessionManager.get_selected_treatments()
    treatment_ids = [t['id'] for t in selected_treatments]
    
    # Get recommendations
    recommendations = treatment_service.get_recommended_treatments(treatment_ids)
    
    return jsonify(recommendations)