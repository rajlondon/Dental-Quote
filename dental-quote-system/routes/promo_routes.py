import logging
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize blueprint
promo_routes_bp = Blueprint('promo_routes', __name__)

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

@promo_routes_bp.route('/special-offers')
def special_offers():
    """
    Render the special offers page
    """
    # Get all active special offers
    active_offers = promo_service.get_active_special_offers()
    
    return render_template('promo/special_offers.html',
                          active_offers=active_offers)

@promo_routes_bp.route('/special-offer/<offer_id>')
def special_offer_detail(offer_id):
    """
    Render the detail page for a specific special offer
    """
    # Get the special offer by ID
    offer = promo_service.get_special_offer_by_id(offer_id)
    
    if not offer:
        flash('Special offer not found.', 'error')
        return redirect(url_for('promo_routes.special_offers'))
    
    # Get applicable treatments for this offer
    applicable_treatments = []
    for treatment_id in offer.get('applicable_treatments', []):
        treatment = treatment_service.get_treatment_by_id(treatment_id)
        if treatment:
            applicable_treatments.append(treatment)
    
    return render_template('promo/special_offer_detail.html',
                          offer=offer,
                          applicable_treatments=applicable_treatments)

@promo_routes_bp.route('/start-with-offer/<offer_id>')
def start_with_offer(offer_id):
    """
    Start a new quote with a specific special offer
    """
    # Get the special offer by ID
    offer = promo_service.get_special_offer_by_id(offer_id)
    
    if not offer:
        flash('Special offer not found.', 'error')
        return redirect(url_for('promo_routes.special_offers'))
    
    # Reset the session to start fresh
    SessionManager.reset_session()
    
    # Apply the promo code from the special offer
    if offer.get('promo_code'):
        SessionManager.set_promo_code(offer.get('promo_code'), offer)
    
    # Redirect to the quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes_bp.route('/apply-promo', methods=['POST'])
def apply_promo():
    """
    Apply a promotional code to the current quote
    """
    promo_code = request.form.get('promo_code')
    
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'No promo code provided'})
        else:
            flash('No promo code provided.', 'warning')
            return redirect(url_for('page_routes.quote_builder'))
    
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    subtotal = quote_data.get('subtotal', 0)
    
    # Get selected treatments IDs
    selected_treatments = SessionManager.get_selected_treatments()
    treatment_ids = [t.get('id') for t in selected_treatments]
    
    # Validate the promo code
    validation_result = promo_service.validate_promo_code(promo_code, subtotal, treatment_ids)
    
    if not validation_result.get('valid'):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': validation_result.get('message')})
        else:
            flash(validation_result.get('message'), 'error')
            return redirect(url_for('page_routes.quote_builder'))
    
    # Get promo details
    promo_details = validation_result.get('promo_details')
    
    # Apply the promo code to the session
    SessionManager.set_promo_code(promo_code, promo_details)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Promo code applied successfully',
            'promo_code': promo_code,
            'promo_details': promo_details,
            'subtotal': quote_data.get('subtotal', 0),
            'discount_amount': quote_data.get('discount_amount', 0),
            'total': quote_data.get('total', 0)
        })
    else:
        flash('Promo code applied successfully.', 'success')
        return redirect(url_for('page_routes.quote_builder'))

@promo_routes_bp.route('/remove-promo', methods=['POST'])
def remove_promo():
    """
    Remove a promotional code from the current quote
    """
    # Remove the promo code from the session
    SessionManager.remove_promo_code()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # Get updated quote data
        quote_data = SessionManager.get_quote_data()
        
        return jsonify({
            'success': True, 
            'message': 'Promo code removed successfully',
            'subtotal': quote_data.get('subtotal', 0),
            'discount_amount': quote_data.get('discount_amount', 0),
            'total': quote_data.get('total', 0)
        })
    else:
        flash('Promo code removed successfully.', 'success')
        return redirect(url_for('page_routes.quote_builder'))