"""
Page Routes Module
Handles main page routes for the dental quote system
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, session
from utils.session_manager import (
    get_quote_data, add_treatment, remove_treatment, 
    update_patient_info, reset_quote
)
from services.treatment_service import get_available_treatments
from services.promo_service import get_offers

# Create Blueprint
page_routes = Blueprint('page_routes', __name__)

# Homepage route
@page_routes.route('/')
def index():
    """Render the homepage"""
    return render_template('index.html')

# Quote builder route
@page_routes.route('/quote-builder')
def quote_builder():
    """Render the quote builder page"""
    # Get available treatments
    available_treatments = get_available_treatments()
    
    # Get current quote data
    quote_data = get_quote_data()
    
    return render_template(
        'quote/quote_builder.html',
        available_treatments=available_treatments,
        treatments=quote_data['treatments'],
        subtotal=quote_data['subtotal'],
        discount=quote_data['discount'],
        total=quote_data['total'],
        promo_code=quote_data['promo_code'],
        promo_details=quote_data['promo_details']
    )

# Add treatment route
@page_routes.route('/add-treatment', methods=['POST'])
def add_treatment_route():
    """Add a treatment to the quote"""
    treatment_id = request.form.get('treatment_id')
    
    if not treatment_id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID is required'})
        flash('Treatment ID is required', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get available treatments
    available_treatments = get_available_treatments()
    treatment = next((t for t in available_treatments if t['id'] == treatment_id), None)
    
    if not treatment:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment not found'})
        flash('Treatment not found', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Add treatment to quote
    success = add_treatment(treatment)
    
    if not success:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment already in quote'})
        flash('Treatment already in quote', 'warning')
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
            'promo_code': quote_data['promo_code'],
            'promo_description': quote_data['promo_details']['description'] if quote_data['promo_details'] else None
        })
    
    flash('Treatment added to quote', 'success')
    return redirect(url_for('page_routes.quote_builder'))

# Remove treatment route
@page_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment_route():
    """Remove a treatment from the quote"""
    treatment_id = request.form.get('treatment_id')
    
    if not treatment_id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment ID is required'})
        flash('Treatment ID is required', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Remove treatment from quote
    success = remove_treatment(treatment_id)
    
    if not success:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Treatment not found in quote'})
        flash('Treatment not found in quote', 'error')
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
            'promo_code': quote_data['promo_code'],
            'promo_description': quote_data['promo_details']['description'] if quote_data['promo_details'] else None
        })
    
    flash('Treatment removed from quote', 'success')
    return redirect(url_for('page_routes.quote_builder'))

# Patient information route
@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Render and process the patient information page"""
    quote_data = get_quote_data()
    
    # Check if there are treatments in the quote
    if not quote_data['treatments']:
        flash('Please add treatments to your quote first', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    if request.method == 'POST':
        # Get patient info from form
        patient_info = {
            'name': request.form.get('name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'notes': request.form.get('notes', '')
        }
        
        # Validate required fields
        if not all([patient_info['name'], patient_info['email'], patient_info['phone']]):
            flash('Please fill in all required fields', 'error')
            return render_template(
                'quote/patient_info.html',
                patient_info=patient_info,
                treatments=quote_data['treatments'],
                subtotal=quote_data['subtotal'],
                discount=quote_data['discount'],
                total=quote_data['total'],
                promo_code=quote_data['promo_code'],
                promo_details=quote_data['promo_details']
            )
        
        # Update patient info in session
        update_patient_info(patient_info)
        
        # Redirect to review quote page
        return redirect(url_for('page_routes.review_quote'))
    
    # GET request
    return render_template(
        'quote/patient_info.html',
        patient_info=quote_data['patient_info'],
        treatments=quote_data['treatments'],
        subtotal=quote_data['subtotal'],
        discount=quote_data['discount'],
        total=quote_data['total'],
        promo_code=quote_data['promo_code'],
        promo_details=quote_data['promo_details']
    )

# Review quote route
@page_routes.route('/review-quote')
def review_quote():
    """Render the review quote page"""
    quote_data = get_quote_data()
    
    # Check if there are treatments in the quote
    if not quote_data['treatments']:
        flash('Please add treatments to your quote first', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Check if patient info is filled
    if not quote_data['patient_info'].get('name'):
        flash('Please fill in your information first', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    # Generate a quote reference
    quote_ref = quote_data['quote_id'][:8].upper()
    
    return render_template(
        'quote/review_quote.html',
        quote_ref=quote_ref,
        patient_info=quote_data['patient_info'],
        treatments=quote_data['treatments'],
        subtotal=quote_data['subtotal'],
        discount=quote_data['discount'],
        total=quote_data['total'],
        promo_code=quote_data['promo_code'],
        promo_details=quote_data['promo_details']
    )

# Reset quote route
@page_routes.route('/reset-quote')
def reset_quote_route():
    """Reset the quote"""
    reset_quote()
    flash('Your quote has been reset', 'success')
    return redirect(url_for('page_routes.quote_builder'))