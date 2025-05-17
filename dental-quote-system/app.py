"""
Dental Quote System - Flask Application
A web application for building dental treatment quotes
"""
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import os
import uuid
from datetime import datetime

# Import services and utilities
from services.treatment_service import TreatmentService
from services.promo_service import PromoService
from utils.session_manager import SessionManager

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dental-quote-system-secret-key')

# Set session lifetime
app.config['PERMANENT_SESSION_LIFETIME'] = 60 * 60 * 24 * 7  # 7 days
app.config['SESSION_TYPE'] = 'filesystem'

# Create directory for static images if it doesn't exist
if not os.path.exists(os.path.join(app.static_folder, 'img', 'offers')):
    os.makedirs(os.path.join(app.static_folder, 'img', 'offers'))

# Main routes
@app.route('/')
def index():
    """Homepage route"""
    # Get featured special offers
    special_offers = PromoService.get_special_offers()
    featured_offers = [offer for offer in special_offers if offer.get('featured', False)]
    
    return render_template('index.html', featured_offers=featured_offers)

@app.route('/quote-builder')
def quote_builder():
    """Quote builder page"""
    # Initialize or get session
    SessionManager.initialize_session()
    
    # Get all treatments organized by category
    treatments = TreatmentService.get_all_treatments()
    
    # Get currently selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    selected_treatment_ids = [t['id'] for t in selected_treatments]
    
    # Calculate pricing
    subtotal = TreatmentService.calculate_subtotal(selected_treatments)
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate discount if promo code is applied
    discount = 0
    if promo_code and promo_details:
        discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
    
    # Calculate total
    total = subtotal - discount
    
    return render_template(
        'quote/quote_builder.html', 
        treatments=treatments,
        selected_treatments=selected_treatments,
        selected_treatment_ids=selected_treatment_ids,
        subtotal=subtotal,
        promo_code=promo_code,
        discount=discount,
        total=total
    )

@app.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Patient information form"""
    # Check if there are selected treatments
    selected_treatments = SessionManager.get_selected_treatments()
    if not selected_treatments:
        return redirect(url_for('quote_builder'))
    
    if request.method == 'POST':
        # Collect patient information
        patient_info = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'preferred_dates': request.form.get('preferred_dates'),
            'accommodation_needed': 'accommodation_needed' in request.form,
            'airport_transfer_needed': 'airport_transfer_needed' in request.form,
            'additional_notes': request.form.get('additional_notes')
        }
        
        # Save patient information to session
        SessionManager.set_patient_info(patient_info)
        
        # Redirect to review page
        return redirect(url_for('review_quote'))
    
    # Get existing patient info if any
    patient_info = SessionManager.get_patient_info() or {}
    
    # Calculate pricing
    subtotal = TreatmentService.calculate_subtotal(selected_treatments)
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate discount if promo code is applied
    discount = 0
    if promo_code and promo_details:
        discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
    
    # Calculate total
    total = subtotal - discount
    
    # List of countries for the dropdown
    countries = [
        'United Kingdom', 'Germany', 'France', 'Netherlands', 'Ireland', 
        'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 
        'Austria', 'Switzerland', 'Italy', 'Spain', 'Portugal',
        'Other'
    ]
    
    return render_template(
        'quote/patient_info.html',
        countries=countries,
        patient_info=patient_info,
        selected_treatments=selected_treatments,
        subtotal=subtotal,
        promo_code=promo_code,
        discount=discount,
        total=total
    )

@app.route('/review-quote')
def review_quote():
    """Review quote page"""
    # Check if there are selected treatments and patient info
    selected_treatments = SessionManager.get_selected_treatments()
    patient_info = SessionManager.get_patient_info()
    
    if not selected_treatments:
        return redirect(url_for('quote_builder'))
    
    if not patient_info:
        return redirect(url_for('patient_info'))
    
    # Calculate pricing
    subtotal = TreatmentService.calculate_subtotal(selected_treatments)
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate discount if promo code is applied
    discount = 0
    if promo_code and promo_details:
        discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
    
    # Calculate total
    total = subtotal - discount
    
    # Generate a quote ID if not already present
    quote_id = SessionManager.get_quote_id()
    if not quote_id:
        quote_id = f"MDF-{str(uuid.uuid4())[:8].upper()}"
        SessionManager.set_quote_id(quote_id)
    
    return render_template(
        'quote/review_quote.html',
        quote_id=quote_id,
        patient_info=patient_info,
        selected_treatments=selected_treatments,
        subtotal=subtotal,
        promo_code=promo_code,
        discount=discount,
        total=total
    )

@app.route('/confirmation')
def confirmation():
    """Confirmation page after quote is submitted"""
    # Check if there's a quote ID
    quote_id = SessionManager.get_quote_id()
    
    if not quote_id:
        return redirect(url_for('index'))
    
    # Get data for display
    selected_treatments = SessionManager.get_selected_treatments()
    patient_info = SessionManager.get_patient_info()
    
    # Check required data
    if not selected_treatments or not patient_info:
        return redirect(url_for('index'))
    
    # Calculate pricing
    subtotal = TreatmentService.calculate_subtotal(selected_treatments)
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate discount and savings percentage
    discount = 0
    savings_percent = 0
    
    if promo_code and promo_details:
        discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
        if subtotal > 0:
            savings_percent = round((discount / subtotal) * 100)
    
    # Calculate total
    total = subtotal - discount
    
    # Clear session for new quote after displaying confirmation
    # This ensures the confirmation can be viewed but then starts fresh
    # SessionManager.initialize_session(reset=True)
    
    return render_template(
        'quote/confirmation.html',
        quote_id=quote_id,
        patient_info=patient_info,
        selected_treatments=selected_treatments,
        subtotal=subtotal,
        promo_code=promo_code,
        promo_details=promo_details,
        discount=discount,
        savings_percent=savings_percent,
        total=total
    )

@app.route('/special-offers')
def special_offers():
    """Special offers page"""
    # Get all special offers
    offers = PromoService.get_special_offers()
    
    return render_template('quote/special_offers.html', offers=offers)

@app.route('/apply-offer/<offer_id>')
def apply_offer(offer_id):
    """Apply a special offer from the offers page"""
    # Get all offers and find the selected one
    offers = PromoService.get_special_offers()
    selected_offer = None
    
    for offer in offers:
        if offer['id'] == offer_id:
            selected_offer = offer
            break
    
    if not selected_offer:
        return redirect(url_for('special_offers'))
    
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get promo code from the offer
    promo_code = selected_offer.get('promo_code')
    
    # Add any required treatments from the offer
    # Example: Some offers may require specific treatments to be added
    
    # Redirect to quote builder with applied promo code
    return redirect(url_for('quote_builder', promo_code=promo_code))

# API routes for AJAX interactions
@app.route('/api/add-treatment', methods=['POST'])
def api_add_treatment():
    """API endpoint to add a treatment"""
    try:
        data = request.get_json()
        treatment_id = data.get('treatment_id')
        
        # Get treatment details
        treatment = TreatmentService.get_treatment_by_id(treatment_id)
        if not treatment:
            return jsonify({'success': False, 'message': 'Treatment not found'})
        
        # Add treatment to session
        SessionManager.add_treatment(treatment)
        
        # Get updated data for response
        selected_treatments = SessionManager.get_selected_treatments()
        subtotal = TreatmentService.calculate_subtotal(selected_treatments)
        promo_code = SessionManager.get_promo_code()
        promo_details = SessionManager.get_promo_details()
        
        discount = 0
        if promo_code and promo_details:
            discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
        
        total = subtotal - discount
        
        return jsonify({
            'success': True,
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/remove-treatment', methods=['POST'])
def api_remove_treatment():
    """API endpoint to remove a treatment"""
    try:
        data = request.get_json()
        treatment_id = data.get('treatment_id')
        
        # Remove treatment from session
        SessionManager.remove_treatment(treatment_id)
        
        # Get updated data for response
        selected_treatments = SessionManager.get_selected_treatments()
        subtotal = TreatmentService.calculate_subtotal(selected_treatments)
        promo_code = SessionManager.get_promo_code()
        promo_details = SessionManager.get_promo_details()
        
        discount = 0
        if promo_code and promo_details:
            discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
        
        total = subtotal - discount
        
        return jsonify({
            'success': True,
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/update-quantity', methods=['POST'])
def api_update_quantity():
    """API endpoint to update treatment quantity"""
    try:
        data = request.get_json()
        treatment_id = data.get('treatment_id')
        quantity = int(data.get('quantity', 1))
        
        # Validate quantity
        if quantity <= 0:
            return jsonify({'success': False, 'message': 'Quantity must be greater than zero'})
        
        # Update quantity in session
        SessionManager.update_treatment_quantity(treatment_id, quantity)
        
        # Get updated data for response
        selected_treatments = SessionManager.get_selected_treatments()
        subtotal = TreatmentService.calculate_subtotal(selected_treatments)
        promo_code = SessionManager.get_promo_code()
        promo_details = SessionManager.get_promo_details()
        
        discount = 0
        if promo_code and promo_details:
            discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
        
        total = subtotal - discount
        
        return jsonify({
            'success': True,
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/apply-promo-code', methods=['POST'])
def api_apply_promo_code():
    """API endpoint to apply a promo code"""
    try:
        data = request.get_json()
        promo_code = data.get('promo_code', '').strip().upper()
        
        if not promo_code:
            return jsonify({'success': False, 'message': 'Please enter a promo code'})
        
        # Get current selected treatments and subtotal
        selected_treatments = SessionManager.get_selected_treatments()
        subtotal = TreatmentService.calculate_subtotal(selected_treatments)
        
        # Validate promo code
        validation = PromoService.validate_promo_code(promo_code, selected_treatments, subtotal)
        
        if not validation['valid']:
            return jsonify({'success': False, 'message': validation['message']})
        
        # Apply promo code if valid
        promo_details = validation['promo_details']
        SessionManager.set_promo_code(promo_code, promo_details)
        
        # Check if this promo code adds a special treatment
        if promo_details.get('add_treatment'):
            # Add the special treatment (e.g., free consultation)
            special_treatment = promo_details['add_treatment']
            # Check if it's already added to avoid duplicates
            existing_ids = [t['id'] for t in selected_treatments]
            if special_treatment['id'] not in existing_ids:
                SessionManager.add_treatment(special_treatment)
                selected_treatments = SessionManager.get_selected_treatments()
        
        # Calculate discount
        discount = PromoService.calculate_discount(subtotal, promo_details, selected_treatments)
        total = subtotal - discount
        
        return jsonify({
            'success': True,
            'message': validation['message'],
            'promo_code': promo_code,
            'discount': discount,
            'total': total,
            'selected_treatments': selected_treatments,
            'subtotal': subtotal
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error applying promo code: {str(e)}'})

@app.route('/api/remove-promo-code', methods=['POST'])
def api_remove_promo_code():
    """API endpoint to remove a promo code"""
    try:
        # Get current promo details
        promo_code = SessionManager.get_promo_code()
        promo_details = SessionManager.get_promo_details()
        
        # Check if a special treatment was added by this promo code
        if promo_details and promo_details.get('add_treatment'):
            special_treatment_id = promo_details['add_treatment']['id']
            # Remove the special treatment
            SessionManager.remove_treatment(special_treatment_id)
        
        # Remove promo code from session
        SessionManager.remove_promo_code()
        
        # Recalculate pricing
        selected_treatments = SessionManager.get_selected_treatments()
        subtotal = TreatmentService.calculate_subtotal(selected_treatments)
        
        # No discount since promo code was removed
        discount = 0
        total = subtotal
        
        return jsonify({
            'success': True,
            'message': 'Promo code removed successfully',
            'selected_treatments': selected_treatments,
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error removing promo code: {str(e)}'})

# Static content routes
@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Contact page"""
    return render_template('contact.html')

@app.route('/faq')
def faq():
    """FAQ page"""
    return render_template('faq.html')

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    """404 Error handler"""
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """500 Error handler"""
    return render_template('errors/500.html'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)