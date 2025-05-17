"""
Promo Routes for Dental Quote System
Handles promotion-related routes and actions
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash

promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/special-offers')
def special_offers():
    """Special Offers Page"""
    promo_service = request.app.config.get('promo_service')
    
    # Get all special offers
    promotions = promo_service.get_all_special_offers()
    
    return render_template(
        'promo/special_offers.html',
        promotions=promotions
    )

@promo_routes.route('/offer/<promo_code>')
def offer_redirect(promo_code):
    """Redirect from offer to quote builder with promo code"""
    # Validate promo code
    promo_service = request.app.config.get('promo_service')
    promo = promo_service.validate_promo_code(promo_code)
    
    if not promo:
        flash('Invalid promotion code', 'error')
        return redirect(url_for('promo_routes.special_offers'))
    
    # Redirect to quote builder with promo code
    return redirect(url_for('page_routes.quote_builder', promo=promo_code))