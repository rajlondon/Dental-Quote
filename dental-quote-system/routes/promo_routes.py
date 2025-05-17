from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from services.treatment_service import TreatmentService
from services.promo_service import PromoService
from utils.session_manager import SessionManager

promo_routes = Blueprint('promo', __name__)

@promo_routes.route('/special-offers')
def special_offers():
    """Show all special offers"""
    # Get active offers
    offers = PromoService.get_active_offers()
    
    return render_template('promo/special_offers.html', offers=offers)

@promo_routes.route('/special-offer/<offer_id>')
def special_offer_detail(offer_id):
    """Show details for a specific offer"""
    # Get offer details
    offer = PromoService.get_offer_by_id(offer_id)
    
    if not offer:
        flash('Offer not found.', 'error')
        return redirect(url_for('promo.special_offers'))
    
    # Get applicable treatments for this offer
    treatments = PromoService.get_treatments_for_offer(offer)
    
    return render_template('promo/offer_detail.html', 
                           offer=offer, 
                           treatments=treatments)

@promo_routes.route('/start-with-offer/<offer_id>')
def start_with_offer(offer_id):
    """Start a quote with a special offer pre-applied"""
    # Get offer details
    offer = PromoService.get_offer_by_id(offer_id)
    
    if not offer:
        flash('Offer not found.', 'error')
        return redirect(url_for('promo.special_offers'))
    
    # Reset session
    SessionManager.initialize_session(reset=True)
    
    # Apply the offer's promo code
    promo_code = offer.get('promo_code')
    if promo_code:
        # Get applicable treatments to check validation
        applicable_treatments = offer.get('applicable_treatments', [])
        
        # Validate the code
        validation = PromoService.validate_promo_code(promo_code, applicable_treatments)
        
        if validation.get('valid'):
            # Save promo code to session
            SessionManager.set_promo_code(promo_code, validation.get('details'))
            
            # Set selected offer in session
            SessionManager.set_selected_offer(offer_id)
            
            flash(f'Special offer "{offer["title"]}" has been applied to your quote.', 'success')
        else:
            flash(validation.get('message', 'Failed to apply the offer.'), 'warning')
    
    # Add any preselected treatments if offer specifies
    for treatment_id in offer.get('applicable_treatments', []):
        treatment = PromoService.get_treatment_by_id(treatment_id)
        if treatment:
            SessionManager.add_treatment(treatment)
    
    # Redirect to quote builder
    return redirect(url_for('pages.quote_builder'))

@promo_routes.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply promo code to the current quote"""
    # Get promo code from form
    promo_code = request.form.get('promo_code', '').strip()
    
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False, 
                'message': 'Please enter a promotional code.'
            })
        else:
            flash('Please enter a promotional code.', 'warning')
            return redirect(url_for('pages.quote_builder'))
    
    # Get treatment IDs for validation
    selected_treatments = SessionManager.get_selected_treatments()
    treatment_ids = [t.get('id') for t in selected_treatments]
    
    # Validate the code
    validation = PromoService.validate_promo_code(promo_code, treatment_ids)
    
    if validation.get('valid'):
        # Save promo code to session
        SessionManager.set_promo_code(promo_code, validation.get('details'))
        
        # Get updated totals
        subtotal = SessionManager.get_subtotal()
        discount = SessionManager.get_discount_amount()
        total = SessionManager.get_total()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'message': 'Promotional code applied successfully!',
                'promo_details': validation.get('details'),
                'subtotal': subtotal,
                'discount': discount,
                'total': total
            })
        else:
            flash('Promotional code applied successfully!', 'success')
            return redirect(url_for('pages.quote_builder'))
    else:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'message': validation.get('message', 'Invalid promotional code.')
            })
        else:
            flash(validation.get('message', 'Invalid promotional code.'), 'warning')
            return redirect(url_for('pages.quote_builder'))

@promo_routes.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove applied promo code"""
    # Clear promo code from session
    SessionManager.clear_promo_code()
    
    # Get updated totals
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'message': 'Promotional code removed.',
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    else:
        flash('Promotional code has been removed.', 'info')
        return redirect(url_for('pages.quote_builder'))

@promo_routes.route('/select-special-offer', methods=['POST'])
def select_special_offer():
    """AJAX endpoint to select a special offer"""
    offer_id = request.form.get('offer_id')
    
    if not offer_id:
        return jsonify({'success': False, 'message': 'No offer selected.'})
    
    # Get offer details
    offer = PromoService.get_offer_by_id(offer_id)
    
    if not offer:
        return jsonify({'success': False, 'message': 'Offer not found.'})
    
    # Set selected offer in session
    SessionManager.set_selected_offer(offer_id)
    
    return jsonify({
        'success': True,
        'message': f'Selected offer: {offer["title"]}',
        'offer': offer
    })