"""
Promo Routes for Dental Quote System
Handles promotional code and special offers endpoints
"""
from flask import Blueprint, request, jsonify, current_app
from utils.session_manager import SessionManager

# Create a Blueprint
bp = Blueprint('promo_routes', __name__)

# Get session manager instance
session_manager = SessionManager()

@bp.route('/api/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """Apply promo code to current quote"""
    # Get promo service from app context
    promo_service = current_app.config['promo_service']
    
    # Get promo code from request
    data = request.get_json()
    promo_code = data.get('promo_code', '').strip()
    
    if not promo_code:
        return jsonify({'success': False, 'message': 'No promo code provided'})
    
    # Get current selected treatments and total amount
    selected_treatments = session_manager.get_selected_treatments()
    treatment_ids = [t['id'] for t in selected_treatments]
    totals = session_manager.calculate_totals()
    subtotal = totals['subtotal']
    
    # Calculate discount
    discount_result = promo_service.calculate_discount(
        promo_code, 
        subtotal, 
        treatment_ids
    )
    
    if discount_result['success']:
        # Apply promo code to session
        session_manager.apply_promo_code(
            promo_code, 
            discount_result['promo_details']
        )
        
        # Recalculate totals
        new_totals = session_manager.calculate_totals()
        
        return jsonify({
            'success': True,
            'message': discount_result['message'],
            'discount_amount': discount_result['discount_amount'],
            'totals': new_totals
        })
    else:
        return jsonify({
            'success': False,
            'message': discount_result['message']
        })

@bp.route('/api/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """Remove promo code from current quote"""
    # Remove promo code from session
    session_manager.remove_promo_code()
    
    # Recalculate totals
    new_totals = session_manager.calculate_totals()
    
    return jsonify({
        'success': True,
        'message': 'Promo code removed',
        'totals': new_totals
    })

@bp.route('/api/special-offers', methods=['GET'])
def get_special_offers():
    """Get active special offers"""
    # Get promo service from app context
    promo_service = current_app.config['promo_service']
    
    # Get active promotions
    active_promos = promo_service.get_active_promotions()
    
    return jsonify({
        'success': True,
        'offers': active_promos
    })

@bp.route('/special-offers')
def special_offers_page():
    """Special offers page"""
    # Get promo service from app context
    promo_service = current_app.config['promo_service']
    
    # Get active promotions
    active_promos = promo_service.get_active_promotions()
    
    return render_template('promo/special_offers.html', offers=active_promos)

@bp.route('/api/apply-special-offer', methods=['POST'])
def apply_special_offer():
    """Apply special offer by ID and redirect to quote builder"""
    # Get data from request
    data = request.get_json()
    offer_id = data.get('offer_id')
    
    if not offer_id:
        return jsonify({'success': False, 'message': 'No offer ID provided'})
    
    # Get promo service from app context
    promo_service = current_app.config['promo_service']
    
    # Get offer by ID
    offer = promo_service.get_promotion_by_id(offer_id)
    
    if not offer:
        return jsonify({'success': False, 'message': 'Offer not found'})
    
    # Add applicable treatments to session if specified
    if offer.get('applicable_treatments'):
        treatment_service = current_app.config['treatment_service']
        for treatment_id in offer['applicable_treatments']:
            treatment = treatment_service.get_treatment_by_id(treatment_id)
            if treatment:
                session_manager.add_treatment(treatment)
    
    # Apply promo code
    session_manager.apply_promo_code(offer['promo_code'], offer)
    
    return jsonify({
        'success': True,
        'message': 'Special offer applied successfully',
        'redirect': '/quote-builder'
    })