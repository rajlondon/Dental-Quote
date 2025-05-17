import logging
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, abort, session, flash

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

# Route handlers
@promo_routes_bp.route('/special-offers')
def special_offers():
    """Display a list of all active special offers."""
    active_offers = promo_service.get_active_special_offers()
    return render_template('promo/special_offers.html', offers=active_offers)

@promo_routes_bp.route('/special-offer/<offer_id>')
def special_offer_detail(offer_id):
    """Display details for a specific special offer."""
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
    Start a new quote with a specific special offer.
    This resets the session and adds the offer's treatments automatically.
    """
    # Reset the session to start fresh
    SessionManager.reset_session()
    
    # Set the special offer ID in the session
    SessionManager.set_special_offer_id(offer_id)
    
    # Get the offer details
    offer = promo_service.get_special_offer_by_id(offer_id)
    
    if not offer:
        flash('Special offer not found.', 'error')
        return redirect(url_for('promo_routes.special_offers'))
    
    # Apply the promo code if there is one
    if offer.get('promo_code'):
        promo = promo_service.get_promo_code_by_code(offer['promo_code'])
        if promo:
            # Validate the promo code first - we'll skip subtotal check since it's a new quote
            validation = promo_service.validate_promo_code(offer['promo_code'])
            
            if validation['valid']:
                SessionManager.apply_promo_code(offer['promo_code'], 0)  # Start with 0 discount
    
    # Redirect to the quote builder
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes_bp.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply a promo code to the current quote."""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get the promo code from the form
    promo_code = request.form.get('promo_code', '').strip()
    
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'No promo code provided.'})
        flash('Please enter a promo code.', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
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
        
        # Apply the promo code to the session
        SessionManager.apply_promo_code(promo_code, discount_amount)
        
        # Increment usage count for the promo code
        promo_service.increment_usage_count(promo['id'])
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'message': 'Promo code applied successfully!',
                'discount_amount': discount_amount,
                'new_total': subtotal - discount_amount
            })
        
        flash('Promo code applied successfully!', 'success')
    else:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': validation['message']})
        
        flash(validation['message'], 'error')
    
    return redirect(url_for('page_routes.quote_builder'))

@promo_routes_bp.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove the applied promo code from the current quote."""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Remove the promo code from the session
    SessionManager.remove_promo_code()
    
    # Recalculate totals
    totals = SessionManager.calculate_totals()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'message': 'Promo code removed.',
            'new_total': totals['total']
        })
    
    flash('Promo code removed.', 'info')
    return redirect(url_for('page_routes.quote_builder'))