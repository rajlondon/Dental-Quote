"""
Page Routes for Dental Quote System
Handles rendering pages and processing form submissions
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from utils.session_manager import SessionManager
from services.promo_service import PromoService

page_routes = Blueprint('page_routes', __name__)

# Mock data for treatments
AVAILABLE_TREATMENTS = [
    {
        'id': 'clean',
        'name': 'Dental Cleaning',
        'description': 'Professional cleaning to remove plaque and tartar',
        'category': 'Preventive',
        'price': 90.00
    },
    {
        'id': 'whitening',
        'name': 'Teeth Whitening',
        'description': 'Professional whitening treatment for a brighter smile',
        'category': 'Cosmetic',
        'price': 150.00
    },
    {
        'id': 'filling',
        'name': 'Dental Filling',
        'description': 'Restore damaged teeth with composite fillings',
        'category': 'Restorative',
        'price': 120.00
    },
    {
        'id': 'extraction',
        'name': 'Tooth Extraction',
        'description': 'Simple extraction of damaged or decayed tooth',
        'category': 'Surgical',
        'price': 180.00
    },
    {
        'id': 'rootcanal',
        'name': 'Root Canal Therapy',
        'description': 'Treat infected pulp and save your natural tooth',
        'category': 'Endodontic',
        'price': 650.00
    },
    {
        'id': 'crown',
        'name': 'Dental Crown',
        'description': 'Porcelain crown to restore shape and function',
        'category': 'Restorative',
        'price': 850.00
    },
    {
        'id': 'bridge',
        'name': 'Dental Bridge',
        'description': 'Fixed bridge to replace missing teeth',
        'category': 'Prosthetic',
        'price': 1200.00
    },
    {
        'id': 'implant',
        'name': 'Dental Implant',
        'description': 'Titanium implant with crown for tooth replacement',
        'category': 'Prosthetic',
        'price': 2500.00
    },
    {
        'id': 'veneer',
        'name': 'Porcelain Veneer',
        'description': 'Thin porcelain shell to improve appearance',
        'category': 'Cosmetic',
        'price': 950.00
    },
    {
        'id': 'denture',
        'name': 'Full Denture',
        'description': 'Complete denture for full arch restoration',
        'category': 'Prosthetic',
        'price': 1800.00
    }
]

@page_routes.route('/')
def index():
    """Render the home page"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    return render_template('index.html')

@page_routes.route('/quote-builder')
def quote_builder():
    """Render the quote builder page"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get promo code from URL parameter (if any)
    promo_code = request.args.get('promo')
    
    # If promo code provided in URL, validate and apply it
    if promo_code:
        promo_details = PromoService.validate_promo_code(promo_code)
        if promo_details:
            # Apply valid promo code to session
            SessionManager.apply_promo_code(promo_details)
            flash(f'Promo code "{promo_code}" applied successfully!', 'success')
        else:
            flash(f'Invalid promo code: {promo_code}', 'error')
    
    # Get current session data
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    
    return render_template(
        'quote/quote_builder.html',
        available_treatments=AVAILABLE_TREATMENTS,
        treatments=treatments,
        promo_details=promo_details,
        promo_code=promo_code if promo_code else ''
    )

@page_routes.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the quote"""
    treatment_id = request.form.get('treatment_id')
    
    # Find the treatment in available treatments
    treatment = next((t for t in AVAILABLE_TREATMENTS if t['id'] == treatment_id), None)
    
    if not treatment:
        flash('Treatment not found', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Add to session
    added = SessionManager.add_treatment(treatment)
    
    if added:
        flash(f'Added {treatment["name"]} to your quote', 'success')
    else:
        flash(f'{treatment["name"]} is already in your quote', 'info')
    
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the quote"""
    treatment_id = request.form.get('treatment_id')
    
    # Remove from session
    removed = SessionManager.remove_treatment(treatment_id)
    
    if removed:
        flash('Treatment removed from your quote', 'success')
    else:
        flash('Treatment not found in your quote', 'error')
    
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Handle patient information page"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Handle form submission
    if request.method == 'POST':
        patient_info = {
            'name': request.form.get('name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'notes': request.form.get('notes', '')
        }
        
        # Store in session
        SessionManager.update_patient_info(patient_info)
        
        flash('Patient information saved', 'success')
        return redirect(url_for('page_routes.review_quote'))
    
    # For GET request, show the form
    current_info = SessionManager.get_patient_info()
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate totals
    subtotal = sum(t.get('price', 0) for t in treatments)
    discount = 0
    
    if promo_details:
        if promo_details.get('type') == 'percentage':
            discount = (subtotal * promo_details.get('value', 0)) / 100
        else:
            discount = min(promo_details.get('value', 0), subtotal)
    
    total = max(0, subtotal - discount)
    
    return render_template(
        'quote/patient_info.html',
        treatments=treatments,
        promo_details=promo_details,
        patient_info=current_info,
        subtotal=subtotal,
        discount=discount,
        total=total
    )

@page_routes.route('/review-quote')
def review_quote():
    """Render the quote review page"""
    # Initialize session if needed
    SessionManager.initialize_session()
    
    # Get session data
    treatments = SessionManager.get_treatments()
    promo_details = SessionManager.get_promo_details()
    patient_info = SessionManager.get_patient_info()
    
    # Calculate totals
    subtotal = sum(t.get('price', 0) for t in treatments)
    discount = 0
    
    if promo_details:
        if promo_details.get('type') == 'percentage':
            discount = (subtotal * promo_details.get('value', 0)) / 100
        else:
            discount = min(promo_details.get('value', 0), subtotal)
    
    total = max(0, subtotal - discount)
    
    # Generate quote reference
    import random
    import string
    quote_ref = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    return render_template(
        'quote/review_quote.html',
        treatments=treatments,
        promo_details=promo_details,
        patient_info=patient_info,
        subtotal=subtotal,
        discount=discount,
        total=total,
        quote_ref=quote_ref
    )

@page_routes.route('/reset-quote')
def reset_quote():
    """Reset the entire quote"""
    # Reset session
    SessionManager.reset_session()
    
    flash('Quote has been reset', 'info')
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/session-status')
def session_status():
    """Check session status"""
    return jsonify(SessionManager.get_session_metadata())