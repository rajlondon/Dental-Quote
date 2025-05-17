"""
Promo Code Routes for Dental Quote System
Handles promo code application, validation, and removal
"""

from flask import Blueprint, request, redirect, url_for, jsonify, flash, session
import logging
from utils.session_manager import SessionManager
from services.promo_service import PromoService

logger = logging.getLogger(__name__)

# Create blueprint
promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """Apply a promo code and store in session"""
    promo_code = request.form.get('promo_code', '').strip().upper()
    
    if not promo_code:
        flash("Please enter a promo code.", "error")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Validate the promo code
    is_valid, discount_percent, error_message = PromoService.validate_promo_code(promo_code)
    
    if not is_valid:
        flash(error_message, "error")
        return redirect(url_for('page_routes.quote_builder'))
    
    # Store promo code details in session
    promo_details = {
        'promo_code': promo_code,
        'discount_percent': discount_percent
    }
    
    SessionManager.store_promo_details(promo_details)
    
    # Get special offer details if applicable
    special_offer = PromoService.get_special_offer_details(promo_code)
    
    if special_offer:
        flash(f"Applied: {special_offer.get('name')} - {special_offer.get('description')}", "success")
    else:
        flash(f"Promo code {promo_code} applied for {discount_percent}% discount!", "success")
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """Remove a promo code from session"""
    # Remove promo code details from session
    SessionManager.remove_promo_details()
    
    flash("Promo code removed.", "info")
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes.route('/api/validate-promo', methods=['POST'])
def validate_promo_api():
    """API endpoint to validate a promo code and return discount info"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        promo_code = data.get('promo_code', '').strip().upper()
        
        if not promo_code:
            return jsonify({
                'success': False,
                'error': 'No promo code provided'
            }), 400
        
        # Validate the promo code
        is_valid, discount_percent, error_message = PromoService.validate_promo_code(promo_code)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            }), 400
        
        # Get special offer details if applicable
        special_offer = PromoService.get_special_offer_details(promo_code)
        
        # Return validation result
        return jsonify({
            'success': True,
            'data': {
                'promo_code': promo_code,
                'discount_percent': discount_percent,
                'special_offer': special_offer
            }
        })
    except Exception as e:
        logger.exception("Error validating promo code via API")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@promo_routes.route('/special-offers')
def special_offers():
    """Display page with all special offers"""
    # For demonstration, we'll create some sample special offers
    offers = [
        {
            'id': 'FREECONSULT',
            'name': 'Free Consultation Package',
            'description': 'Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.',
            'discount_type': 'other',
            'discount_value': 'Free consultation',
            'applicable_treatments': ['Dental Implants', 'Porcelain Veneers', 'Full Mouth Reconstruction'],
            'terms': 'Applicable for new patients only. One consultation per patient.',
            'promo_code': 'FREECONSULT'
        },
        {
            'id': 'LUXHOTEL20',
            'name': 'Premium Hotel Deal',
            'description': 'Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.',
            'discount_type': 'percentage',
            'discount_value': '20%',
            'applicable_treatments': ['Dental Implants', 'Porcelain Veneers', 'Dental Crowns'],
            'terms': 'Minimum treatment value of $1000 required. Subject to hotel availability.',
            'promo_code': 'LUXHOTEL20'
        },
        {
            'id': 'IMPLANTCROWN30',
            'name': 'Implant + Crown Package',
            'description': 'Get 30% off when you combine a dental implant with a crown restoration. Our most popular combination treatment.',
            'discount_type': 'percentage',
            'discount_value': '30%',
            'applicable_treatments': ['Dental Implants', 'Dental Crowns'],
            'terms': 'Must include at least one implant and one crown in the same treatment plan.',
            'promo_code': 'IMPLANTCROWN30'
        },
        {
            'id': 'FREEWHITE',
            'name': 'Free Teeth Whitening',
            'description': 'Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.',
            'discount_type': 'other',
            'discount_value': 'Free teeth whitening',
            'applicable_treatments': ['Porcelain Veneers', 'Dental Crowns', 'Hollywood Smile'],
            'terms': 'Minimum of 4 veneers or crowns required. Not combinable with other offers.',
            'promo_code': 'FREEWHITE'
        }
    ]
    
    return render_template('promo/special_offers.html', offers=offers)