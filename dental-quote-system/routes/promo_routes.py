"""
Promo Routes for Dental Quote System
Handles promotional offers and special offers page
"""

from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from utils.session_manager import get_session_data, apply_special_offer
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize blueprint
promo_routes = Blueprint('promo_routes', __name__)

# Service instances
treatment_service = TreatmentService()
promo_service = PromoService()

@promo_routes.route('/special-offers')
def special_offers_page():
    """
    Render the special offers page
    """
    # Get all active promotions
    offers = promo_service.get_active_promotions()
    
    return render_template('promo/special_offers.html', offers=offers)

@promo_routes.route('/promo/<promo_code>')
def promo_code_redirect(promo_code):
    """
    Handle promo code links and redirects
    
    This route handles direct links with promo codes and redirects to the quote builder
    with the promo code pre-applied
    """
    # Validate promo code
    if not promo_service.is_valid_promo_code(promo_code):
        # Invalid promo code, redirect to special offers page with error
        return redirect(url_for('promo_routes.special_offers_page'))
    
    # Store promo code in session for auto-apply in quote builder
    session_data = get_session_data()
    session_data['auto_apply_promo'] = promo_code
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/offer/<offer_id>')
def special_offer_redirect(offer_id):
    """
    Handle special offer links and redirects
    
    This route handles direct links to special offers and redirects to the quote builder
    with the offer pre-applied
    """
    # Get offer details
    offer = promo_service.get_promotion_by_id(offer_id)
    
    if not offer:
        # Invalid offer ID, redirect to special offers page
        return redirect(url_for('promo_routes.special_offers_page'))
    
    # Store offer ID in session for auto-apply in quote builder
    session_data = get_session_data()
    session_data['auto_apply_offer'] = offer_id
    
    # Apply special offer to quote
    apply_special_offer(offer_id, offer)
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))