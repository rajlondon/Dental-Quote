"""
Dental Quote System

A Flask application for generating dental treatment quotes with
support for promotional codes and special offers.
"""

from flask import Flask, render_template, session, request, redirect, url_for, jsonify, flash
import os
import secrets
from datetime import timedelta
from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize Flask application
app = Flask(__name__)

# Configure application
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(16)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Ensure the static folder exists
os.makedirs(os.path.join(app.root_path, 'static'), exist_ok=True)


# Route handlers
@app.route('/')
def index():
    """Homepage route"""
    # Get special offers for the homepage
    special_offers = PromoService.get_homepage_special_offers()
    
    # Get sample treatments for display
    popular_treatments = TreatmentService.get_all_treatments()[:6]  # Just get first 6 for homepage
    
    return render_template(
        'index.html',
        special_offers=special_offers,
        popular_treatments=popular_treatments
    )


@app.route('/quote-builder')
def quote_builder():
    """Quote builder starting page"""
    # Initialize or reset the quote session
    SessionManager.initialize_session(reset=request.args.get('reset', False))
    
    # Get all treatment categories with their treatments
    categorized_treatments = TreatmentService.get_categorized_treatments()
    
    # Get any pre-selected treatments from the session
    selected_treatments = SessionManager.get_selected_treatments()
    
    # Get pricing information
    pricing = SessionManager.get_pricing()
    
    return render_template(
        'quote/quote_builder.html',
        categorized_treatments=categorized_treatments,
        selected_treatments=selected_treatments,
        subtotal=pricing['subtotal'],
        discount=pricing['discount'],
        total=pricing['total'],
        promo_code=SessionManager.get_promo_code(),
        promo_details=SessionManager.get_promo_details()
    )


@app.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the quote"""
    treatment_id = request.form.get('treatment_id')
    
    if not treatment_id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID is required'})
        flash('Please select a treatment first.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Get treatment details
    treatment = TreatmentService.get_treatment_by_id(treatment_id)
    
    if not treatment:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment not found'})
        flash('Treatment not found.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Add treatment to the session
    SessionManager.add_treatment(treatment)
    
    # Get updated pricing
    pricing = SessionManager.get_pricing()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # If AJAX request, return JSON response
        return jsonify({
            'success': True,
            'message': f'{treatment["name"]} added to your quote',
            'treatment': treatment,
            'selected_treatments': SessionManager.get_selected_treatments(),
            'subtotal': pricing['subtotal'],
            'discount': pricing['discount'],
            'total': pricing['total']
        })
    
    # Otherwise, redirect to quote builder
    flash(f'{treatment["name"]} added to your quote', 'success')
    return redirect(url_for('quote_builder'))


@app.route('/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the quote"""
    treatment_id = request.form.get('treatment_id')
    
    if not treatment_id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID is required'})
        flash('Treatment ID is required.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Remove treatment from the session
    SessionManager.remove_treatment(treatment_id)
    
    # Get updated pricing
    pricing = SessionManager.get_pricing()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # If AJAX request, return JSON response
        return jsonify({
            'success': True,
            'message': 'Treatment removed from your quote',
            'selected_treatments': SessionManager.get_selected_treatments(),
            'subtotal': pricing['subtotal'],
            'discount': pricing['discount'],
            'total': pricing['total']
        })
    
    # Otherwise, redirect to quote builder
    flash('Treatment removed from your quote', 'success')
    return redirect(url_for('quote_builder'))


@app.route('/update-quantity', methods=['POST'])
def update_quantity():
    """Update the quantity of a treatment in the quote"""
    treatment_id = request.form.get('treatment_id')
    quantity = request.form.get('quantity')
    
    if not treatment_id or not quantity:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID and quantity are required'})
        flash('Treatment ID and quantity are required.', 'error')
        return redirect(url_for('quote_builder'))
    
    try:
        quantity = int(quantity)
        if quantity < 1:
            quantity = 1
    except ValueError:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Quantity must be a number'})
        flash('Quantity must be a number.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Update treatment quantity in the session
    SessionManager.update_treatment_quantity(treatment_id, quantity)
    
    # Get updated pricing
    pricing = SessionManager.get_pricing()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # If AJAX request, return JSON response
        return jsonify({
            'success': True,
            'message': 'Quantity updated',
            'selected_treatments': SessionManager.get_selected_treatments(),
            'subtotal': pricing['subtotal'],
            'discount': pricing['discount'],
            'total': pricing['total']
        })
    
    # Otherwise, redirect to quote builder
    flash('Quantity updated', 'success')
    return redirect(url_for('quote_builder'))


@app.route('/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """Apply a promotional code to the quote"""
    promo_code = request.form.get('promo_code', '').strip().upper()
    
    if not promo_code:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Please enter a promotional code'})
        flash('Please enter a promotional code.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Get current selected treatments and subtotal
    selected_treatments = SessionManager.get_selected_treatments()
    pricing = SessionManager.get_pricing()
    subtotal = pricing['subtotal']
    
    # Validate promo code
    validation_result = PromoService.validate_promo_code(
        promo_code,
        subtotal=subtotal,
        treatments=selected_treatments
    )
    
    if not validation_result['success']:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': validation_result['message']})
        flash(validation_result['message'], 'error')
        return redirect(url_for('quote_builder'))
    
    # Apply the promo code to the session
    promo_data = validation_result.get('promo_data')
    SessionManager.set_promo_code(promo_code, promo_data)
    
    # Get updated pricing
    pricing = SessionManager.get_pricing()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # If AJAX request, return JSON response
        return jsonify({
            'success': True,
            'message': validation_result['message'],
            'subtotal': pricing['subtotal'],
            'discount': pricing['discount'],
            'total': pricing['total'],
            'promo_code': promo_code,
            'promo_details': promo_data
        })
    
    # Otherwise, redirect to quote builder
    flash(validation_result['message'], 'success')
    return redirect(url_for('quote_builder'))


@app.route('/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """Remove the promotional code from the quote"""
    # Remove promo code from the session
    SessionManager.remove_promo_code()
    
    # Get updated pricing
    pricing = SessionManager.get_pricing()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # If AJAX request, return JSON response
        return jsonify({
            'success': True,
            'message': 'Promotional code removed',
            'subtotal': pricing['subtotal'],
            'discount': pricing['discount'],
            'total': pricing['total']
        })
    
    # Otherwise, redirect to quote builder
    flash('Promotional code removed', 'success')
    return redirect(url_for('quote_builder'))


@app.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Patient information page"""
    # Check if there are treatments in the quote
    selected_treatments = SessionManager.get_selected_treatments()
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'error')
        return redirect(url_for('quote_builder'))
    
    if request.method == 'POST':
        # Process form submission
        patient_data = {
            'first_name': request.form.get('first_name'),
            'last_name': request.form.get('last_name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'country': request.form.get('country'),
            'preferred_dates': request.form.get('preferred_dates'),
            'special_requests': request.form.get('special_requests')
        }
        
        # Validation (basic example - would be more extensive in production)
        if not patient_data['first_name'] or not patient_data['email']:
            flash('Please fill in all required fields.', 'error')
            return render_template('quote/patient_info.html', patient_info=patient_data)
        
        # Save patient information to session
        SessionManager.set_patient_info(patient_data)
        
        # Redirect to review page
        return redirect(url_for('review_quote'))
    
    # Display the form
    return render_template(
        'quote/patient_info.html',
        patient_info=SessionManager.get_patient_info()
    )


@app.route('/review-quote')
def review_quote():
    """Review quote page"""
    # Check if there are treatments and patient info in the quote
    selected_treatments = SessionManager.get_selected_treatments()
    patient_info = SessionManager.get_patient_info()
    
    if not selected_treatments:
        flash('Please select at least one treatment before proceeding.', 'error')
        return redirect(url_for('quote_builder'))
    
    if not patient_info:
        flash('Please provide your contact information before proceeding.', 'error')
        return redirect(url_for('patient_info'))
    
    # Get pricing information
    pricing = SessionManager.get_pricing()
    
    return render_template(
        'quote/review_quote.html',
        selected_treatments=selected_treatments,
        patient_info=patient_info,
        subtotal=pricing['subtotal'],
        discount=pricing['discount'],
        total=pricing['total'],
        promo_code=SessionManager.get_promo_code(),
        promo_details=SessionManager.get_promo_details()
    )


@app.route('/confirm-quote', methods=['POST'])
def confirm_quote():
    """Confirm and submit the quote"""
    # Check if there are treatments and patient info in the quote
    selected_treatments = SessionManager.get_selected_treatments()
    patient_info = SessionManager.get_patient_info()
    
    if not selected_treatments or not patient_info:
        flash('Please complete all steps before confirming your quote.', 'error')
        return redirect(url_for('quote_builder'))
    
    # Generate a unique quote reference number
    quote_reference = SessionManager.generate_quote_reference()
    
    # Get the complete quote data
    quote_data = SessionManager.get_complete_quote_data()
    
    # In a production environment, this would save the quote to a database
    # and potentially send confirmation emails to both the patient and clinic
    
    # For this example, we'll just redirect to the confirmation page
    return redirect(url_for('confirmation', reference=quote_reference))


@app.route('/confirmation')
def confirmation():
    """Confirmation page after quote submission"""
    # Get the quote reference from the URL parameters
    quote_reference = request.args.get('reference')
    
    # Check if the reference matches the one in the session
    if not quote_reference or quote_reference != SessionManager.get_quote_reference():
        flash('Invalid quote reference. Please start a new quote.', 'error')
        return redirect(url_for('index'))
    
    # Get the quote data
    quote_data = SessionManager.get_complete_quote_data()
    
    # Reset the session for a new quote after displaying the confirmation
    new_session = False
    
    return render_template(
        'quote/confirmation.html',
        quote_reference=quote_reference,
        quote_data=quote_data,
        new_session=new_session
    )


@app.route('/special-offers')
def special_offers():
    """Special offers page"""
    # Get all active special offers
    active_offers = PromoService.get_active_special_offers()
    
    return render_template(
        'special_offers.html',
        special_offers=active_offers
    )


@app.route('/apply-special-offer/<offer_id>')
def apply_special_offer(offer_id):
    """Apply a special offer to the quote"""
    # Get the special offer
    offer = PromoService.get_special_offer_by_id(offer_id)
    
    if not offer:
        flash('Special offer not found.', 'error')
        return redirect(url_for('special_offers'))
    
    # Initialize the quote session
    SessionManager.initialize_session()
    
    # Get the promo code associated with the offer
    promo_code = offer.get('promo_code')
    
    if promo_code:
        # Get current selected treatments and subtotal
        selected_treatments = SessionManager.get_selected_treatments()
        pricing = SessionManager.get_pricing()
        subtotal = pricing['subtotal']
        
        # Validate promo code
        validation_result = PromoService.validate_promo_code(
            promo_code,
            subtotal=subtotal,
            treatments=selected_treatments
        )
        
        if validation_result['success']:
            # Apply the promo code to the session
            promo_data = validation_result.get('promo_data')
            SessionManager.set_promo_code(promo_code, promo_data)
            flash(f'Special offer "{offer["title"]}" applied to your quote!', 'success')
        else:
            # If the offer has applicable treatments, pre-select those treatments
            applicable_treatments = offer.get('applicable_treatments', [])
            for treatment_id in applicable_treatments:
                treatment = TreatmentService.get_treatment_by_id(treatment_id)
                if treatment:
                    SessionManager.add_treatment(treatment)
            
            # Then try to apply the promo code again
            selected_treatments = SessionManager.get_selected_treatments()
            pricing = SessionManager.get_pricing()
            subtotal = pricing['subtotal']
            
            validation_result = PromoService.validate_promo_code(
                promo_code,
                subtotal=subtotal,
                treatments=selected_treatments
            )
            
            if validation_result['success']:
                # Apply the promo code to the session
                promo_data = validation_result.get('promo_data')
                SessionManager.set_promo_code(promo_code, promo_data)
                flash(f'Special offer "{offer["title"]}" applied to your quote with recommended treatments!', 'success')
            else:
                flash(f'To use this offer: {validation_result["message"]}', 'info')
    
    # Redirect to the quote builder
    return redirect(url_for('quote_builder'))


@app.route('/faq')
def faq():
    """FAQ page"""
    return render_template('faq.html')


@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')


@app.route('/contact')
def contact():
    """Contact page"""
    return render_template('contact.html')


# API routes for AJAX requests
@app.route('/api/treatments')
def api_treatments():
    """API endpoint to get all treatments"""
    treatments = TreatmentService.get_all_treatments()
    return jsonify(treatments)


@app.route('/api/treatment/<treatment_id>')
def api_treatment(treatment_id):
    """API endpoint to get a specific treatment"""
    treatment = TreatmentService.get_treatment_by_id(treatment_id)
    if not treatment:
        return jsonify({'error': 'Treatment not found'}), 404
    return jsonify(treatment)


@app.route('/api/categories')
def api_categories():
    """API endpoint to get all treatment categories"""
    categories = TreatmentService.get_all_categories()
    return jsonify(categories)


@app.route('/api/recommended-treatments/<treatment_id>')
def api_recommended_treatments(treatment_id):
    """API endpoint to get recommended treatments"""
    recommendations = TreatmentService.get_recommended_treatments(treatment_id)
    return jsonify(recommendations)


@app.route('/api/special-offers')
def api_special_offers():
    """API endpoint to get all active special offers"""
    active_offers = PromoService.get_active_special_offers()
    return jsonify(active_offers)


@app.route('/api/quote-state')
def api_quote_state():
    """API endpoint to get the current quote state"""
    quote_data = {
        'selected_treatments': SessionManager.get_selected_treatments(),
        'promo_code': SessionManager.get_promo_code(),
        'promo_details': SessionManager.get_promo_details(),
        'patient_info': SessionManager.get_patient_info(),
        **SessionManager.get_pricing()
    }
    return jsonify(quote_data)


@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    return render_template('errors/500.html'), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))