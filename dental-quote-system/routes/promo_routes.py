"""
Promo Routes Module
Handles promotional code routes for the dental quote system
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import uuid
import json
from datetime import datetime

# Import utilities
from utils.session_manager import apply_promo_code, remove_promo_code

# Create blueprint
promo_routes = Blueprint('promo_routes', __name__)

# Valid promo codes with details
PROMO_CODES = {
    'SUMMER15': {
        'code': 'SUMMER15',
        'type': 'percentage',
        'value': 15,
        'description': 'Summer Special: 15% off all dental treatments'
    },
    'DENTAL25': {
        'code': 'DENTAL25',
        'type': 'percentage',
        'value': 25,
        'description': 'Dental Health Month: 25% off all treatments'
    },
    'NEWPATIENT': {
        'code': 'NEWPATIENT',
        'type': 'percentage',
        'value': 20,
        'description': 'New Patient Special: 20% off your first treatment'
    },
    'TEST10': {
        'code': 'TEST10',
        'type': 'percentage',
        'value': 10,
        'description': 'Test Discount: 10% off your total'
    },
    'FREECONSULT': {
        'code': 'FREECONSULT',
        'type': 'fixed',
        'value': 50,
        'description': 'Free Consultation (up to $50 value)'
    },
    'LUXHOTEL20': {
        'code': 'LUXHOTEL20',
        'type': 'percentage',
        'value': 20,
        'description': 'Premium Hotel Deal: 20% off select treatments'
    },
    'IMPLANTCROWN30': {
        'code': 'IMPLANTCROWN30',
        'type': 'percentage',
        'value': 30,
        'description': 'Implant + Crown Bundle: 30% off combined procedures'
    },
    'FREEWHITE': {
        'code': 'FREEWHITE',
        'type': 'fixed',
        'value': 150,
        'description': 'Free Teeth Whitening with Veneer or Crown Treatments'
    }
}

# Mock data for special offers
SPECIAL_OFFERS = [
    {
        'id': 'offer-1',
        'title': 'Summer Smile Special',
        'description': 'Get 15% off all dental treatments during our summer promotion.',
        'clinic_name': 'DentGroup Istanbul',
        'promo_code': 'SUMMER15',
        'image': '/static/images/offer-placeholder.jpg',
        'treatments': ['Dental Cleaning', 'Teeth Whitening', 'Dental Crowns'],
        'valid_until': 'August 31, 2025'
    },
    {
        'id': 'offer-2',
        'title': 'New Patient Discount',
        'description': 'First-time patients receive 20% off any treatment package.',
        'clinic_name': 'Istanbul Dental Care',
        'promo_code': 'NEWPATIENT',
        'image': '/static/images/offer-placeholder.jpg',
        'treatments': ['Dental Examination', 'X-Rays', 'Treatment Plan'],
        'valid_until': 'December 31, 2025'
    },
    {
        'id': 'offer-3',
        'title': 'Implant + Crown Bundle',
        'description': 'Save 30% when combining dental implant with crown treatment.',
        'clinic_name': 'Maltepe Dental Clinic',
        'promo_code': 'IMPLANTCROWN30',
        'image': '/static/images/offer-placeholder.jpg',
        'treatments': ['Dental Implant', 'Porcelain Crown', 'Abutment'],
        'valid_until': 'July 31, 2025'
    },
    {
        'id': 'offer-4',
        'title': 'Free Consultation Package',
        'description': 'Book any treatment and get a free consultation worth $50.',
        'clinic_name': 'Dentakay Istanbul',
        'promo_code': 'FREECONSULT',
        'image': '/static/images/offer-placeholder.jpg',
        'treatments': ['Dental Examination', 'X-Rays', 'Treatment Plan'],
        'valid_until': 'October 15, 2025'
    },
    {
        'id': 'offer-5',
        'title': 'Premium Hotel Deal',
        'description': 'Get 20% off select treatments and enjoy discounted stays at luxury hotels.',
        'clinic_name': 'DentGroup Istanbul',
        'promo_code': 'LUXHOTEL20',
        'image': '/static/images/offer-placeholder.jpg',
        'treatments': ['Dental Implants', 'Porcelain Veneers', 'Full Mouth Restoration'],
        'valid_until': 'September 30, 2025'
    }
]

# Special offers page
@promo_routes.route('/special-offers')
def special_offers_page():
    """Render special offers page."""
    return render_template('promo/special_offers.html', offers=SPECIAL_OFFERS)

# Apply promo code route
@promo_routes.route('/apply-promo-code', methods=['POST'])
def apply_promo_code_route():
    """Apply promo code to quote."""
    code = request.form.get('promo_code', '').strip().upper()
    
    # Check if code exists
    if code in PROMO_CODES:
        # Apply promo code to session
        apply_promo_code(code, PROMO_CODES[code])
        flash(f'Promo code {code} applied successfully!', 'success')
    else:
        flash('Invalid promo code. Please try again.', 'error')
    
    # If this is an AJAX request, return JSON response
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if code in PROMO_CODES:
            return json.dumps({
                'success': True,
                'message': f'Promo code {code} applied successfully!',
                'promo_details': PROMO_CODES[code]
            })
        else:
            return json.dumps({
                'success': False,
                'message': 'Invalid promo code. Please try again.'
            })
    
    # Otherwise redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

# Remove promo code route
@promo_routes.route('/remove-promo-code', methods=['POST'])
def remove_promo_code_route():
    """Remove promo code from quote."""
    remove_promo_code()
    flash('Promo code removed.', 'success')
    
    # If this is an AJAX request, return JSON response
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return json.dumps({
            'success': True,
            'message': 'Promo code removed.'
        })
    
    # Otherwise redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))