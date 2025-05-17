"""
Page Routes Module
Handles main page navigation routes for the dental quote system
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import uuid
import json
from datetime import datetime

# Import utilities
from utils.session_manager import (
    get_treatments, add_treatment, remove_treatment, 
    get_patient_info, update_patient_info, reset_quote,
    calculate_totals
)

# Create blueprint
page_routes = Blueprint('page_routes', __name__)

# Mock data for treatments
TREATMENTS = [
    {
        'id': 'dental-exam',
        'name': 'Dental Examination',
        'description': 'Comprehensive dental check-up including x-rays and consultation.',
        'category': 'Diagnostic',
        'price': 50.00
    },
    {
        'id': 'teeth-cleaning',
        'name': 'Professional Teeth Cleaning',
        'description': 'Deep cleaning to remove plaque and tartar build-up.',
        'category': 'Preventive',
        'price': 80.00
    },
    {
        'id': 'filling-simple',
        'name': 'Simple Filling',
        'description': 'Tooth-colored composite filling for small cavities.',
        'category': 'Restorative',
        'price': 120.00
    },
    {
        'id': 'filling-complex',
        'name': 'Complex Filling',
        'description': 'Larger filling for extensive tooth decay.',
        'category': 'Restorative',
        'price': 180.00
    },
    {
        'id': 'root-canal',
        'name': 'Root Canal Treatment',
        'description': 'Treatment for infected tooth pulp to save the natural tooth.',
        'category': 'Endodontic',
        'price': 500.00
    },
    {
        'id': 'extraction-simple',
        'name': 'Simple Tooth Extraction',
        'description': 'Removal of visible teeth with local anesthesia.',
        'category': 'Surgical',
        'price': 150.00
    },
    {
        'id': 'extraction-surgical',
        'name': 'Surgical Tooth Extraction',
        'description': 'Removal of impacted or broken teeth.',
        'category': 'Surgical',
        'price': 300.00
    },
    {
        'id': 'crown-porcelain',
        'name': 'Porcelain Crown',
        'description': 'Custom-made cap to cover damaged tooth.',
        'category': 'Prosthetic',
        'price': 800.00
    },
    {
        'id': 'veneer-porcelain',
        'name': 'Porcelain Veneer',
        'description': 'Thin layer of porcelain applied to front surface of tooth.',
        'category': 'Cosmetic',
        'price': 900.00
    },
    {
        'id': 'teeth-whitening',
        'name': 'Professional Teeth Whitening',
        'description': 'In-office procedure to remove stains and discoloration.',
        'category': 'Cosmetic',
        'price': 350.00
    },
    {
        'id': 'implant-single',
        'name': 'Dental Implant',
        'description': 'Titanium post surgically placed into jawbone to replace missing tooth.',
        'category': 'Implant',
        'price': 1500.00
    },
    {
        'id': 'bridge-3unit',
        'name': '3-Unit Dental Bridge',
        'description': 'Fixed bridge to replace one or more missing teeth.',
        'category': 'Prosthetic',
        'price': 2000.00
    }
]

# Home page route
@page_routes.route('/')
def index():
    """Render home page."""
    return render_template('index.html')

# Quote builder route
@page_routes.route('/quote-builder')
def quote_builder():
    """Render quote builder page."""
    # Get treatments from session
    treatments = get_treatments()
    
    # Get promo code from query parameter
    promo_code = request.args.get('promo')
    
    # Calculate totals
    subtotal, discount, total = calculate_totals()
    
    return render_template(
        'quote/quote_builder.html',
        available_treatments=TREATMENTS,
        treatments=treatments,
        promo_code=session.get('promo_code'),
        promo_details=session.get('promo_details'),
        subtotal=subtotal,
        discount=discount,
        total=total
    )

# Add treatment route
@page_routes.route('/add-treatment', methods=['POST'])
def add_treatment_route():
    """Add treatment to quote."""
    treatment_id = request.form.get('treatment_id')
    
    # Find treatment in available treatments
    treatment = next((t for t in TREATMENTS if t['id'] == treatment_id), None)
    
    if treatment:
        add_treatment(treatment)
        flash('Treatment added to quote.', 'success')
    else:
        flash('Treatment not found.', 'error')
    
    return redirect(url_for('page_routes.quote_builder'))

# Remove treatment route
@page_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment_route():
    """Remove treatment from quote."""
    treatment_id = request.form.get('treatment_id')
    
    if remove_treatment(treatment_id):
        flash('Treatment removed from quote.', 'success')
    else:
        flash('Treatment not found in quote.', 'error')
    
    return redirect(url_for('page_routes.quote_builder'))

# Patient info route
@page_routes.route('/patient-info', methods=['GET', 'POST'])
def patient_info():
    """Render and process patient info page."""
    # Get treatments from session
    treatments = get_treatments()
    
    # If there are no treatments, redirect to quote builder
    if not treatments:
        flash('Please select at least one treatment before proceeding.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Calculate totals
    subtotal, discount, total = calculate_totals()
    
    if request.method == 'POST':
        # Update patient info in session
        info = {
            'name': request.form.get('name', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'notes': request.form.get('notes', '')
        }
        update_patient_info(info)
        
        # Redirect to review page
        return redirect(url_for('page_routes.review_quote'))
    
    # Get patient info from session
    patient_info = get_patient_info()
    
    return render_template(
        'quote/patient_info.html',
        patient_info=patient_info,
        treatments=treatments,
        promo_details=session.get('promo_details'),
        subtotal=subtotal,
        discount=discount,
        total=total
    )

# Review quote route
@page_routes.route('/review-quote')
def review_quote():
    """Render review quote page."""
    # Get treatments from session
    treatments = get_treatments()
    
    # If there are no treatments, redirect to quote builder
    if not treatments:
        flash('Please select at least one treatment before reviewing your quote.', 'warning')
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get patient info from session
    patient_info = get_patient_info()
    
    # If patient info is incomplete, redirect to patient info page
    if not patient_info.get('name') or not patient_info.get('email') or not patient_info.get('phone'):
        flash('Please complete your information before reviewing your quote.', 'warning')
        return redirect(url_for('page_routes.patient_info'))
    
    # Calculate totals
    subtotal, discount, total = calculate_totals()
    
    return render_template(
        'quote/review_quote.html',
        treatments=treatments,
        patient_info=patient_info,
        promo_details=session.get('promo_details'),
        quote_ref=session.get('quote_ref'),
        subtotal=subtotal,
        discount=discount,
        total=total
    )

# Reset quote route
@page_routes.route('/reset-quote')
def reset_quote_route():
    """Reset quote data and redirect to quote builder."""
    reset_quote()
    flash('Quote has been reset.', 'success')
    return redirect(url_for('page_routes.quote_builder'))