from flask import Blueprint, request, jsonify
from services.treatment_service import TreatmentService
from utils.session_manager import SessionManager
import json

api_routes = Blueprint('api', __name__)

@api_routes.route('/treatment/<treatment_id>', methods=['GET'])
def get_treatment(treatment_id):
    """Get details for a specific treatment"""
    # Get treatment details
    treatment = TreatmentService.get_treatment(treatment_id)
    
    if not treatment:
        return jsonify({'error': 'Treatment not found'}), 404
    
    return jsonify(treatment)

@api_routes.route('/quote-summary', methods=['GET'])
def get_quote_summary():
    """Get summary of the current quote"""
    # Get current quote data
    selected_treatments = SessionManager.get_selected_treatments()
    promo_code = SessionManager.get_promo_code()
    promo_details = SessionManager.get_promo_details()
    
    # Calculate totals
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'selected_treatments': selected_treatments,
        'treatment_count': len(selected_treatments),
        'promo_code': promo_code,
        'promo_details': promo_details,
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    })

@api_routes.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the current quote"""
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    if not treatment_id:
        return jsonify({'error': 'No treatment ID provided'}), 400
    
    # Get treatment details
    treatment = TreatmentService.get_treatment(treatment_id)
    
    if not treatment:
        return jsonify({'error': 'Treatment not found'}), 404
    
    # Add to session
    SessionManager.add_treatment(treatment)
    
    # Return updated quote summary
    selected_treatments = SessionManager.get_selected_treatments()
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'message': f'Added {treatment["name"]} to your quote',
        'selected_treatments': selected_treatments,
        'treatment_count': len(selected_treatments),
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    })

@api_routes.route('/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the current quote"""
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    if not treatment_id:
        return jsonify({'error': 'No treatment ID provided'}), 400
    
    # Remove from session
    SessionManager.remove_treatment(treatment_id)
    
    # Return updated quote summary
    selected_treatments = SessionManager.get_selected_treatments()
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'message': 'Treatment removed from your quote',
        'selected_treatments': selected_treatments,
        'treatment_count': len(selected_treatments),
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    })

@api_routes.route('/update-quantity', methods=['POST'])
def update_quantity():
    """Update the quantity of a treatment in the current quote"""
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    quantity = data.get('quantity', 1)
    
    if not treatment_id:
        return jsonify({'error': 'No treatment ID provided'}), 400
    
    # Ensure quantity is at least 1
    quantity = max(1, int(quantity))
    
    # Get treatment details to include in response
    treatment = TreatmentService.get_treatment(treatment_id)
    
    if not treatment:
        return jsonify({'error': 'Treatment not found'}), 404
    
    # Update quantity in session
    SessionManager.update_treatment_quantity(treatment_id, quantity)
    
    # Return updated quote summary
    selected_treatments = SessionManager.get_selected_treatments()
    subtotal = SessionManager.get_subtotal()
    discount = SessionManager.get_discount_amount()
    total = SessionManager.get_total()
    
    return jsonify({
        'message': f'Updated quantity for {treatment["name"]}',
        'selected_treatments': selected_treatments,
        'treatment_count': len(selected_treatments),
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    })

@api_routes.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate PDF quote"""
    quote_id = request.json.get('quote_id')
    
    if not quote_id:
        return jsonify({'error': 'No quote ID provided'}), 400
    
    # Generate PDF for the quote
    pdf_url = TreatmentService.generate_pdf_quote(quote_id)
    
    return jsonify({
        'success': True,
        'pdf_url': pdf_url
    })