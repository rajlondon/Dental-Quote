"""
Promotion routes for the MyDentalFly application.
Handles special offers, promo codes, and related functionality.
"""

import logging
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from services.promo_service import PromoService

# Create Blueprint
promo_routes = Blueprint('promo_routes', __name__, url_prefix='/promo')

# Initialize service
promo_service = PromoService()

# Logger
logger = logging.getLogger(__name__)

@promo_routes.route('/special-offers')
def special_offers():
    """Render the special offers page."""
    offers = promo_service.get_all_active_offers()
    return render_template('promo/special_offers.html', offers=offers)

@promo_routes.route('/offer/<offer_id>')
def special_offer_redirect(offer_id):
    """Handle clicks on special offers - adds relevant treatment and promo code to session."""
    offer = promo_service.get_offer_by_id(offer_id)
    
    if not offer:
        flash("Special offer not found or no longer available.", "warning")
        return redirect(url_for('promo_routes.special_offers'))
    
    # Reset session if starting a new quote
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Add applicable treatments to session
    from services.treatment_service import TreatmentService
    treatment_service = TreatmentService()
    
    if offer.get('applicable_treatments'):
        for treatment_id in offer.get('applicable_treatments'):
            treatment = treatment_service.get_treatment_by_id(treatment_id)
            if treatment:
                # Check if treatment is already selected
                existing = next((t for t in session['selected_treatments'] if t['id'] == treatment_id), None)
                if existing:
                    # Increment quantity if already exists
                    existing['quantity'] += 1
                else:
                    # Add new treatment with quantity 1
                    treatment['quantity'] = 1
                    session['selected_treatments'].append(treatment)
    
    # Apply promo code if available
    promo_code = offer.get('promo_code')
    if promo_code:
        session['promo_code'] = promo_code
        flash(f"Promo code {promo_code} applied to your quote.", "success")
    
    flash(f"Special offer '{offer.get('title')}' applied to your quote.", "success")
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/validate/<promo_code>')
def validate_promo_code(promo_code):
    """Validate a promo code and return JSON response."""
    valid, message = promo_service.validate_promo_code(promo_code)
    return {'valid': valid, 'message': message}

@promo_routes.route('/codes')
def promo_codes():
    """Display all available promo codes (for testing/admin purposes)."""
    codes = promo_service.get_all_promo_codes()
    return render_template('promo/promo_codes.html', codes=codes)