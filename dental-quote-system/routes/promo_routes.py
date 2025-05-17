from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, session
from services.promo_service import PromoService
from utils.session_manager import SessionManager
import json

promo_routes_bp = Blueprint('promo_routes', __name__)

@promo_routes_bp.route('/special-offers')
def special_offers():
    """Show all special offers"""
    all_offers = PromoService.get_active_offers()
    
    # Group offers by category
    categorized_offers = {}
    for offer in all_offers:
        if offer.get('promotion_level') not in categorized_offers:
            categorized_offers[offer.get('promotion_level')] = []
        
        categorized_offers[offer.get('promotion_level')].append(offer)
    
    return render_template('promo/special_offers.html', 
                         categorized_offers=categorized_offers)

@promo_routes_bp.route('/special-offer/<offer_id>')
def special_offer_detail(offer_id):
    """Show details for a specific offer"""
    offer = PromoService.get_offer_by_id(offer_id)
    
    if not offer:
        flash('Special offer not found.', 'error')
        return redirect(url_for('promo_routes.special_offers'))
    
    # Get related treatments
    related_treatments = []
    if offer.get('applicable_treatments'):
        related_treatments = PromoService.get_treatments_for_offer(offer)
    
    return render_template('promo/special_offer_detail.html',
                           offer=offer,
                           related_treatments=related_treatments)

@promo_routes_bp.route('/start-with-offer/<offer_id>')
def start_with_offer(offer_id):
    """Start a quote with a special offer pre-applied"""
    offer = PromoService.get_offer_by_id(offer_id)
    
    if not offer:
        flash('Special offer not found.', 'error')
        return redirect(url_for('promo_routes.special_offers'))
    
    # Reset session for a new quote
    SessionManager.initialize_session(reset=True)
    
    # Apply the promo code if the offer has one
    if offer.get('promo_code'):
        promo_code = offer.get('promo_code')
        validation = PromoService.validate_promo_code(promo_code, [])
        
        if validation['valid']:
            SessionManager.set_promo_code(promo_code, validation['details'])
            flash(f'Special offer "{offer["title"]}" has been applied to your quote.', 'success')
        else:
            flash(validation['message'], 'warning')
    
    # Pre-select treatments if applicable
    if offer.get('applicable_treatments'):
        for treatment_id in offer.get('applicable_treatments'):
            treatment = PromoService.get_treatment_by_id(treatment_id)
            if treatment:
                SessionManager.add_treatment(treatment)
    
    # Redirect to quote builder
    return redirect(url_for('page_routes.start_quote'))

@promo_routes_bp.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply promo code to the current quote"""
    promo_code = request.form.get('promo_code')
    
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'message': 'Please enter a valid promotional code.'
            })
        
        flash('Please enter a valid promotional code.', 'warning')
        return redirect(url_for('page_routes.start_quote'))
    
    # Get selected treatments for validation
    treatments = [t['id'] for t in SessionManager.get_selected_treatments()]
    
    # Validate the promo code
    validation = PromoService.validate_promo_code(promo_code, treatments)
    
    if validation['valid']:
        # Save promo code to session
        SessionManager.set_promo_code(promo_code, validation['details'])
        subtotal = SessionManager.get_subtotal()
        discount_amount = SessionManager.get_discount_amount()
        total = SessionManager.get_total()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'message': 'Promotional code applied successfully!',
                'subtotal': subtotal,
                'discount_amount': discount_amount,
                'total': total
            })
        
        flash('Promotional code applied successfully!', 'success')
    else:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'message': validation['message']
            })
        
        flash(validation['message'], 'warning')
    
    return redirect(url_for('page_routes.start_quote'))

@promo_routes_bp.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove applied promo code"""
    # Clear promo code from session
    SessionManager.clear_promo_code()
    
    # Recalculate totals
    subtotal = SessionManager.get_subtotal()
    discount_amount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'message': 'Promotional code removed.',
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total
        })
    
    flash('Promotional code removed.', 'info')
    return redirect(url_for('page_routes.start_quote'))

@promo_routes_bp.route('/select-special-offer', methods=['POST'])
def select_special_offer():
    """AJAX endpoint to select a special offer"""
    offer_id = request.form.get('offer_id')
    
    if not offer_id:
        return jsonify({'success': False, 'message': 'Invalid offer selection.'})
    
    # Store selected offer in session
    SessionManager.set_selected_offer(offer_id)
    
    # Return redirect URL
    return jsonify({
        'success': True,
        'redirect': url_for('promo_routes.start_with_offer', offer_id=offer_id)
    })