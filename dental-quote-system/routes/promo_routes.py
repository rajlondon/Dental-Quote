"""
Promo Routes Module
Handles promotional code routes for the dental quote system
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from utils.session_manager import get_quote_data, apply_promo_code, remove_promo_code
from services.promo_service import verify_promo_code, get_offers

# Create Blueprint
promo_routes = Blueprint('promo_routes', __name__)

# Special offers page route
@promo_routes.route('/special-offers')
def special_offers_page():
    """Render the special offers page"""
    offers = get_offers()
    return render_template('promo/special_offers.html', offers=offers)

# Apply promo code route
@promo_routes.route('/apply-promo-code', methods=['POST'])
def apply_promo_code_route():
    """Apply a promo code to the quote"""
    promo_code = request.form.get('promo_code')
    
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Promo code is required'})
        flash('Promo code is required', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Verify promo code
    promo_details = verify_promo_code(promo_code)
    
    if not promo_details:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Invalid promo code'})
        flash('Invalid promo code', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Apply promo code to quote
    apply_promo_code(promo_code, promo_details)
    
    # Get updated quote data
    quote_data = get_quote_data()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'treatments': quote_data['treatments'],
            'subtotal': quote_data['subtotal'],
            'discount': quote_data['discount'],
            'total': quote_data['total'],
            'promo_code': quote_data['promo_code'],
            'promo_description': promo_details.get('description', '')
        })
    
    flash(f'Promo code "{promo_code}" applied successfully', 'success')
    return redirect(url_for('page_routes.quote_builder'))

# Remove promo code route
@promo_routes.route('/remove-promo-code', methods=['POST'])
def remove_promo_code_route():
    """Remove the applied promo code from the quote"""
    # Remove promo code from quote
    success = remove_promo_code()
    
    if not success:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'No promo code applied'})
        flash('No promo code applied', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get updated quote data
    quote_data = get_quote_data()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'treatments': quote_data['treatments'],
            'subtotal': quote_data['subtotal'],
            'discount': quote_data['discount'],
            'total': quote_data['total'],
            'promo_code': None,
            'promo_description': None
        })
    
    flash('Promo code removed', 'success')
    return redirect(url_for('page_routes.quote_builder'))