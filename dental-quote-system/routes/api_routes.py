"""
API routes for the MyDentalFly application.
Handles AJAX requests from the frontend for dynamic updates.
"""

import logging
import json
from flask import Blueprint, request, jsonify, session
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Create Blueprint
api_routes = Blueprint('api_routes', __name__, url_prefix='/api')

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Logger
logger = logging.getLogger(__name__)

@api_routes.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the quote."""
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    if not treatment_id:
        return jsonify({'error': 'Treatment ID is required'}), 400
    
    # Get treatment details
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    if not treatment:
        return jsonify({'error': 'Treatment not found'}), 404
    
    # Initialize session if not present
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Check if treatment is already in selected treatments
    existing_treatment = next((t for t in session['selected_treatments'] if t['id'] == treatment_id), None)
    
    if existing_treatment:
        # Increment quantity if already in quote
        existing_treatment['quantity'] += 1
    else:
        # Add treatment to selected treatments
        treatment['quantity'] = 1
        session['selected_treatments'].append(treatment)
    
    # Calculate new totals
    promo_code = session.get('promo_code')
    quote_totals = calculate_quote_totals(session['selected_treatments'], promo_code)
    
    return jsonify({
        'selected_treatments': session['selected_treatments'],
        'totals': quote_totals
    })

@api_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the quote."""
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    if not treatment_id:
        return jsonify({'error': 'Treatment ID is required'}), 400
    
    # Ensure session is initialized
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Remove treatment from selected treatments
    session['selected_treatments'] = [t for t in session['selected_treatments'] if t['id'] != treatment_id]
    
    # Calculate new totals
    promo_code = session.get('promo_code')
    quote_totals = calculate_quote_totals(session['selected_treatments'], promo_code)
    
    return jsonify({
        'selected_treatments': session['selected_treatments'],
        'totals': quote_totals
    })

@api_routes.route('/update-treatment-quantity', methods=['POST'])
def update_treatment_quantity():
    """Update the quantity of a treatment in the quote."""
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    quantity = data.get('quantity')
    
    if not treatment_id or not quantity:
        return jsonify({'error': 'Treatment ID and quantity are required'}), 400
    
    try:
        quantity = int(quantity)
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be greater than 0'}), 400
    except ValueError:
        return jsonify({'error': 'Quantity must be a valid number'}), 400
    
    # Ensure session is initialized
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Update quantity
    treatment = next((t for t in session['selected_treatments'] if t['id'] == treatment_id), None)
    if treatment:
        treatment['quantity'] = quantity
    
    # Calculate new totals
    promo_code = session.get('promo_code')
    quote_totals = calculate_quote_totals(session['selected_treatments'], promo_code)
    
    return jsonify({
        'selected_treatments': session['selected_treatments'],
        'totals': quote_totals
    })

@api_routes.route('/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """Apply a promo code to the quote."""
    data = request.get_json()
    promo_code = data.get('promo_code')
    
    if not promo_code:
        return jsonify({'error': 'Promo code is required'}), 400
    
    # Validate promo code
    valid, message = promo_service.validate_promo_code(promo_code)
    if not valid:
        return jsonify({'error': 'Invalid promo code', 'message': message}), 400
    
    # Apply promo code
    session['promo_code'] = promo_code
    
    # Calculate new totals
    selected_treatments = session.get('selected_treatments', [])
    quote_totals = calculate_quote_totals(selected_treatments, promo_code)
    
    return jsonify({
        'selected_treatments': selected_treatments,
        'promo_code': promo_code,
        'totals': quote_totals,
        'message': f'Promo code {promo_code} applied successfully'
    })

@api_routes.route('/remove-promo-code', methods=['POST'])
def remove_promo_code():
    """Remove the applied promo code from the quote."""
    # Remove promo code
    session.pop('promo_code', None)
    
    # Calculate new totals
    selected_treatments = session.get('selected_treatments', [])
    quote_totals = calculate_quote_totals(selected_treatments, None)
    
    return jsonify({
        'selected_treatments': selected_treatments,
        'promo_code': None,
        'totals': quote_totals,
        'message': 'Promo code removed successfully'
    })

@api_routes.route('/get-quote-data', methods=['GET'])
def get_quote_data():
    """Get the current quote data."""
    selected_treatments = session.get('selected_treatments', [])
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info', {})
    
    # Calculate totals
    quote_totals = calculate_quote_totals(selected_treatments, promo_code)
    
    return jsonify({
        'selected_treatments': selected_treatments,
        'promo_code': promo_code,
        'patient_info': patient_info,
        'totals': quote_totals
    })

@api_routes.route('/treatments', methods=['GET'])
def get_treatments():
    """Get all available treatments."""
    treatments = treatment_service.get_all_treatments()
    return jsonify(treatments)

@api_routes.route('/treatments/<treatment_id>', methods=['GET'])
def get_treatment(treatment_id):
    """Get a specific treatment by ID."""
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    if treatment:
        return jsonify(treatment)
    return jsonify({'error': 'Treatment not found'}), 404

@api_routes.route('/treatments/categories', methods=['GET'])
def get_treatment_categories():
    """Get all treatment categories."""
    categories = treatment_service.get_treatment_categories()
    return jsonify(categories)

@api_routes.route('/promos', methods=['GET'])
def get_promos():
    """Get all active promotional offers."""
    promos = promo_service.get_all_active_offers()
    return jsonify(promos)

@api_routes.route('/promos/<promo_id>', methods=['GET'])
def get_promo(promo_id):
    """Get a specific promotional offer by ID."""
    promo = promo_service.get_offer_by_id(promo_id)
    if promo:
        return jsonify(promo)
    return jsonify({'error': 'Promotion not found'}), 404

def calculate_quote_totals(treatments, promo_code=None):
    """Calculate quote totals with or without a promo code."""
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in treatments)
    
    # Apply promo code discount if available
    discount_amount = 0
    if promo_code:
        discount_amount = promo_service.calculate_discount(promo_code, treatments, subtotal)
    
    total = subtotal - discount_amount
    
    return {
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    }