"""
Dental Quote System - MyDentalFly

A Flask application for generating dental treatment quotes with
support for promotional codes and special offers.
"""

import os
import uuid
import json
from datetime import datetime
from flask import (
    Flask, 
    render_template, 
    request, 
    redirect, 
    url_for, 
    session, 
    jsonify, 
    flash
)

from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'mydentalfly-quote-system-secret')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600 * 24 * 7  # 1 week

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Helper function to initialize session data
def initialize_session(reset=False):
    """Initialize or reset the session data for the quote"""
    if 'quote' not in session or reset:
        session['quote'] = {
            'selected_treatments': [],
            'promo_code': None,
            'promo_details': None,
            'selected_offer': None,
            'patient_info': None,
            'quote_id': None
        }
        session.modified = True

# Routes
@app.route('/')
def index():
    """Homepage route"""
    # Get featured special offers
    special_offers = promo_service.get_featured_offers()
    # Get popular treatments
    popular_treatments = treatment_service.get_popular_treatments()
    
    return render_template('index.html', 
                          special_offers=special_offers,
                          popular_treatments=popular_treatments)

@app.route('/quote-builder')
def quote_builder():
    """Quote builder starting page"""
    # Initialize session data if not already done
    initialize_session(reset=request.args.get('reset', False))
    
    # Get all treatments grouped by category
    categorized_treatments = treatment_service.get_treatments_by_category()
    
    # Get session data for the view
    selected_treatments = session['quote']['selected_treatments']
    promo_code = session['quote']['promo_code']
    promo_details = session['quote']['promo_details']
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal(selected_treatments)
    discount = SessionManager.get_discount_amount(subtotal, promo_details)
    total = SessionManager.get_total(subtotal, discount)
    
    return render_template('quote/quote_builder.html',
                          categorized_treatments=categorized_treatments,
                          selected_treatments=selected_treatments,
                          subtotal=subtotal,
                          discount=discount,
                          total=total,
                          promo_code=promo_code,
                          promo_details=promo_details,
                          show_progress_bar=True,
                          current_step=1)

@app.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the quote"""
    initialize_session()
    
    treatment_id = request.form.get('treatment_id')
    if not treatment_id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID is required'})
        flash('Treatment ID is required', 'error')
        return redirect(url_for('quote_builder'))
    
    # Get treatment details
    treatment = treatment_service.get_treatment(treatment_id)
    if not treatment:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment not found'})
        flash('Treatment not found', 'error')
        return redirect(url_for('quote_builder'))
    
    # Add to selected treatments or update quantity if already selected
    selected_treatments = session['quote']['selected_treatments']
    found = False
    for t in selected_treatments:
        if t['id'] == treatment_id:
            t['quantity'] += 1
            found = True
            break
            
    if not found:
        treatment['quantity'] = 1
        selected_treatments.append(treatment)
    
    session.modified = True
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal(selected_treatments)
    promo_details = session['quote']['promo_details']
    discount = SessionManager.get_discount_amount(subtotal, promo_details)
    total = SessionManager.get_total(subtotal, discount)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Treatment added to quote',
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    flash('Treatment added to quote', 'success')
    return redirect(url_for('quote_builder'))

@app.route('/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the quote"""
    initialize_session()
    
    treatment_id = request.form.get('treatment_id')
    if not treatment_id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID is required'})
        flash('Treatment ID is required', 'error')
        return redirect(url_for('quote_builder'))
    
    # Remove from selected treatments
    selected_treatments = session['quote']['selected_treatments']
    session['quote']['selected_treatments'] = [t for t in selected_treatments if t['id'] != treatment_id]
    session.modified = True
    
    # Calculate totals
    selected_treatments = session['quote']['selected_treatments']
    subtotal = SessionManager.get_subtotal(selected_treatments)
    promo_details = session['quote']['promo_details']
    discount = SessionManager.get_discount_amount(subtotal, promo_details)
    total = SessionManager.get_total(subtotal, discount)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Treatment removed from quote',
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    flash('Treatment removed from quote', 'success')
    return redirect(url_for('quote_builder'))

@app.route('/update-quantity', methods=['POST'])
def update_quantity():
    """Update the quantity of a treatment in the quote"""
    initialize_session()
    
    treatment_id = request.form.get('treatment_id')
    quantity = request.form.get('quantity')
    
    if not treatment_id or not quantity:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID and quantity are required'})
        flash('Treatment ID and quantity are required', 'error')
        return redirect(url_for('quote_builder'))
    
    try:
        quantity = int(quantity)
        if quantity < 1:
            raise ValueError("Quantity must be at least 1")
    except ValueError:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Invalid quantity'})
        flash('Invalid quantity', 'error')
        return redirect(url_for('quote_builder'))
    
    # Update quantity
    selected_treatments = session['quote']['selected_treatments']
    for t in selected_treatments:
        if t['id'] == treatment_id:
            t['quantity'] = quantity
            break
    
    session.modified = True
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal(selected_treatments)
    promo_details = session['quote']['promo_details']
    discount = SessionManager.get_discount_amount(subtotal, promo_details)
    total = SessionManager.get_total(subtotal, discount)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Quantity updated',
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    flash('Quantity updated', 'success')
    return redirect(url_for('quote_builder'))

@app.route('/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """Apply a promotional code to the quote"""
    initialize_session()
    
    promo_code = request.form.get('promo_code')
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Promo code is required'})
        flash('Promo code is required', 'error')
        return redirect(url_for('quote_builder'))
    
    # Calculate current subtotal
    selected_treatments = session['quote']['selected_treatments']
    subtotal = SessionManager.get_subtotal(selected_treatments)
    
    # Validate promo code
    result = promo_service.validate_promo_code(promo_code, subtotal)
    if not result['valid']:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': result['message']})
        flash(result['message'], 'error')
        return redirect(url_for('quote_builder'))
    
    # Apply promo code
    session['quote']['promo_code'] = promo_code
    session['quote']['promo_details'] = result['details']
    session.modified = True
    
    # Calculate totals with discount
    discount = SessionManager.get_discount_amount(subtotal, result['details'])
    total = SessionManager.get_total(subtotal, discount)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Promo code applied successfully',
            'promo_code': promo_code,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    flash('Promo code applied successfully', 'success')
    return redirect(url_for('quote_builder'))

@app.route('/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """Remove the promotional code from the quote"""
    initialize_session()
    
    # Remove promo code
    session['quote']['promo_code'] = None
    session['quote']['promo_details'] = None
    SessionManager.clear_promo_code(session)
    
    # Calculate totals without discount
    selected_treatments = session['quote']['selected_treatments']
    subtotal = SessionManager.get_subtotal(selected_treatments)
    discount = 0
    total = subtotal
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Promo code removed',
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    flash('Promo code removed', 'success')
    return redirect(url_for('quote_builder'))

@app.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Patient information page"""
    initialize_session()
    
    # Ensure there are treatments selected
    selected_treatments = session['quote']['selected_treatments']
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding', 'error')
        return redirect(url_for('quote_builder'))
    
    # If form is submitted, save patient info
    if request.method == 'POST':
        patient_info = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'preferred_month': request.form.get('preferred_month'),
            'stay_duration': request.form.get('stay_duration'),
            'accommodation_help': 'accommodation_help' in request.form,
            'transport_help': 'transport_help' in request.form,
            'translator_help': 'translator_help' in request.form,
            'allergies': request.form.get('allergies'),
            'medications': request.form.get('medications'),
            'comments': request.form.get('comments'),
            'receive_updates': 'receive_updates' in request.form,
            'contact_consent': 'contact_consent' in request.form
        }
        
        session['quote']['patient_info'] = patient_info
        session.modified = True
        
        return redirect(url_for('review_quote'))
    
    # Get countries for the dropdown
    countries = treatment_service.get_countries()
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal(selected_treatments)
    promo_details = session['quote']['promo_details']
    discount = SessionManager.get_discount_amount(subtotal, promo_details)
    total = SessionManager.get_total(subtotal, discount)
    
    return render_template('quote/patient_info.html',
                          selected_treatments=selected_treatments,
                          subtotal=subtotal,
                          discount=discount,
                          total=total,
                          promo_code=session['quote']['promo_code'],
                          promo_details=promo_details,
                          patient_info=session['quote']['patient_info'],
                          countries=countries,
                          show_progress_bar=True,
                          current_step=2)

@app.route('/review-quote', methods=['GET', 'POST'])
def review_quote():
    """Review quote page"""
    initialize_session()
    
    # Ensure there are treatments selected and patient info
    selected_treatments = session['quote']['selected_treatments']
    patient_info = session['quote']['patient_info']
    
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding', 'error')
        return redirect(url_for('quote_builder'))
        
    if not patient_info:
        flash('Please provide your information before proceeding', 'error')
        return redirect(url_for('patient_info'))
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal(selected_treatments)
    promo_details = session['quote']['promo_details']
    discount = SessionManager.get_discount_amount(subtotal, promo_details)
    total = SessionManager.get_total(subtotal, discount)
    
    return render_template('quote/review_quote.html',
                          selected_treatments=selected_treatments,
                          subtotal=subtotal,
                          discount=discount,
                          total=total,
                          promo_code=session['quote']['promo_code'],
                          promo_details=promo_details,
                          patient_info=patient_info,
                          show_progress_bar=True,
                          current_step=3)

@app.route('/confirm-quote', methods=['POST'])
def confirm_quote():
    """Confirm and submit the quote"""
    initialize_session()
    
    # Ensure user agreed to terms
    if 'terms_agree' not in request.form:
        flash('You must agree to the terms and conditions', 'error')
        return redirect(url_for('review_quote'))
    
    # Save the quote to database
    quote_data = {
        'selected_treatments': session['quote']['selected_treatments'],
        'promo_code': session['quote']['promo_code'],
        'promo_details': session['quote']['promo_details'],
        'patient_info': session['quote']['patient_info'],
        'subtotal': SessionManager.get_subtotal(session['quote']['selected_treatments']),
        'discount': SessionManager.get_discount_amount(
            SessionManager.get_subtotal(session['quote']['selected_treatments']), 
            session['quote']['promo_details']
        ),
        'total': SessionManager.get_total(
            SessionManager.get_subtotal(session['quote']['selected_treatments']),
            SessionManager.get_discount_amount(
                SessionManager.get_subtotal(session['quote']['selected_treatments']), 
                session['quote']['promo_details']
            )
        ),
        'date_created': datetime.now().isoformat(),
        'selected_offer': session['quote']['selected_offer']
    }
    
    # Save to database and get quote ID
    quote_id = treatment_service.save_quote(quote_data)
    
    # Update session with quote ID
    SessionManager.set_quote_id(session, quote_id)
    
    # Redirect to confirmation page
    return redirect(url_for('confirmation'))

@app.route('/confirmation')
def confirmation():
    """Confirmation page after quote submission"""
    initialize_session()
    
    # Get quote from database using the ID
    quote_id = session['quote']['quote_id']
    if not quote_id:
        flash('Something went wrong. Please try again.', 'error')
        return redirect(url_for('quote_builder'))
    
    quote = treatment_service.get_quote(quote_id)
    if not quote:
        flash('Quote not found. Please try again.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Generate reference number
    quote_reference = f"MDF-{quote_id[:8].upper()}"
    
    return render_template('quote/confirmation.html',
                          quote_reference=quote_reference,
                          selected_treatments=quote['selected_treatments'],
                          subtotal=quote['subtotal'],
                          discount=quote['discount'],
                          total=quote['total'],
                          promo_code=quote['promo_code'],
                          show_progress_bar=True,
                          current_step=4)

@app.route('/special-offers')
def special_offers():
    """Special offers page"""
    # Get all active special offers
    special_offers = promo_service.get_active_offers()
    
    return render_template('quote/special_offers.html', 
                          special_offers=special_offers)

@app.route('/special-offer/<offer_id>')
def special_offer_details(offer_id):
    """Special offer details page"""
    # Get offer details
    offer = promo_service.get_offer_by_id(offer_id)
    if not offer:
        flash('Special offer not found', 'error')
        return redirect(url_for('special_offers'))
    
    # Get treatments included in the offer
    treatments = promo_service.get_treatments_for_offer(offer)
    
    return render_template('quote/special_offer_details.html',
                          offer=offer,
                          treatments=treatments)

@app.route('/apply-special-offer/<offer_id>')
def apply_special_offer(offer_id):
    """Apply a special offer to the quote"""
    initialize_session(reset=True)
    
    # Get offer details
    offer = promo_service.get_offer_by_id(offer_id)
    if not offer:
        flash('Special offer not found', 'error')
        return redirect(url_for('special_offers'))
    
    # Set the selected offer in the session
    SessionManager.set_selected_offer(session, offer)
    
    # Add treatments to the quote
    if offer.get('applicable_treatments'):
        for treatment_id in offer['applicable_treatments']:
            treatment = promo_service.get_treatment_by_id(treatment_id)
            if treatment:
                treatment['quantity'] = 1
                session['quote']['selected_treatments'].append(treatment)
    
    # Apply promo code if available
    if offer.get('promo_code'):
        # Calculate current subtotal
        selected_treatments = session['quote']['selected_treatments']
        subtotal = SessionManager.get_subtotal(selected_treatments)
        
        # Validate and apply promo code
        result = promo_service.validate_promo_code(offer['promo_code'], subtotal)
        if result['valid']:
            session['quote']['promo_code'] = offer['promo_code']
            session['quote']['promo_details'] = result['details']
    
    session.modified = True
    
    # Redirect to quote builder
    flash(f"Special offer '{offer['title']}' applied", 'success')
    return redirect(url_for('quote_builder'))

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    return render_template('errors/500.html'), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))