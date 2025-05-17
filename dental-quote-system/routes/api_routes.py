from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from services.treatment_service import TreatmentService
from utils.session_manager import SessionManager
import json

api_routes_bp = Blueprint('api_routes', __name__)

@api_routes_bp.route('/api/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the current quote"""
    data = request.get_json()
    
    if not data or 'treatment_id' not in data:
        return jsonify({'success': False, 'message': 'Invalid request'})
    
    treatment_id = data['treatment_id']
    treatment = TreatmentService.get_treatment(treatment_id)
    
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'})
    
    # Add treatment to session
    SessionManager.add_treatment(treatment)
    
    # Get updated data
    selected_treatments = SessionManager.get_selected_treatments()
    subtotal = SessionManager.get_subtotal()
    discount_amount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'success': True,
        'treatments': selected_treatments,
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    })

@api_routes_bp.route('/api/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the current quote"""
    data = request.get_json()
    
    if not data or 'treatment_id' not in data:
        return jsonify({'success': False, 'message': 'Invalid request'})
    
    treatment_id = data['treatment_id']
    
    # Remove treatment from session
    SessionManager.remove_treatment(treatment_id)
    
    # Get updated data
    selected_treatments = SessionManager.get_selected_treatments()
    subtotal = SessionManager.get_subtotal()
    discount_amount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'success': True,
        'treatments': selected_treatments,
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    })

@api_routes_bp.route('/api/update-quantity', methods=['POST'])
def update_quantity():
    """Update the quantity of a treatment in the current quote"""
    data = request.get_json()
    
    if not data or 'treatment_id' not in data or 'quantity' not in data:
        return jsonify({'success': False, 'message': 'Invalid request'})
    
    treatment_id = data['treatment_id']
    quantity = int(data['quantity'])
    
    if quantity < 1:
        quantity = 1
    
    # Update treatment quantity in session
    SessionManager.update_treatment_quantity(treatment_id, quantity)
    
    # Get updated data
    selected_treatments = SessionManager.get_selected_treatments()
    subtotal = SessionManager.get_subtotal()
    discount_amount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'success': True,
        'treatments': selected_treatments,
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    })

@api_routes_bp.route('/api/get-treatment/<treatment_id>')
def get_treatment(treatment_id):
    """Get details for a specific treatment"""
    treatment = TreatmentService.get_treatment(treatment_id)
    
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'})
    
    return jsonify({
        'success': True,
        'treatment': treatment
    })

@api_routes_bp.route('/api/get-quote-summary')
def get_quote_summary():
    """Get summary of the current quote"""
    selected_treatments = SessionManager.get_selected_treatments()
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    subtotal = SessionManager.get_subtotal()
    discount_amount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'success': True,
        'treatments': selected_treatments,
        'promo_code': promo_code,
        'promo_details': promo_details,
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    })

@api_routes_bp.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate PDF quote"""
    quote_id = request.form.get('quote_id')
    
    if not quote_id:
        return jsonify({'success': False, 'message': 'Quote ID is required'})
    
    pdf_url = TreatmentService.generate_pdf_quote(quote_id)
    
    if not pdf_url:
        return jsonify({'success': False, 'message': 'Failed to generate PDF'})
    
    return jsonify({
        'success': True,
        'pdf_url': pdf_url
    })