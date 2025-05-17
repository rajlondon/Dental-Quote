"""
Integration Routes for Dental Quote System
Handles third-party service integrations like sending emails, generating PDFs, etc.
"""
from flask import Blueprint, request, jsonify, current_app, render_template
from utils.session_manager import SessionManager
import os
import json
from datetime import datetime

# Create a Blueprint
bp = Blueprint('integration_routes', __name__)

# Get session manager instance
session_manager = SessionManager()

@bp.route('/api/send-quote-email', methods=['POST'])
def send_quote_email():
    """Send quote details via email"""
    # This would typically use a service like SendGrid, Mailjet, etc.
    # For this example, we'll just return success
    
    # Get data from request
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'})
    
    # Get quote data
    quote_data = session_manager.get_quote_summary()
    
    # For a real implementation, this is where we would send the email
    # You would use a service like:
    # - SendGrid (sendgrid.send_mail)
    # - SMTP (smtplib)
    # - AWS SES
    
    return jsonify({
        'success': True,
        'message': f'Quote would be sent to {email} in production environment'
    })

@bp.route('/api/generate-quote-pdf', methods=['POST'])
def generate_quote_pdf():
    """Generate PDF quote document"""
    # This would typically use a library like weasyprint, xhtml2pdf, etc.
    # For this example, we'll just return sample data
    
    # Get quote data
    quote_data = session_manager.get_quote_summary()
    
    # Generate a timestamp for the quote number
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    quote_number = f"QUOTE-{timestamp}"
    
    # For a real implementation, we would:
    # 1. Render an HTML template with the quote data
    # 2. Convert the HTML to PDF using a library
    # 3. Save the PDF to the server
    # 4. Return the URL to the PDF
    
    return jsonify({
        'success': True,
        'message': 'PDF quote generated',
        'quote_number': quote_number,
        'pdf_url': f'/static/quotes/{quote_number}.pdf'
    })

@bp.route('/api/save-quote', methods=['POST'])
def save_quote():
    """Save quote data to backend system"""
    # In a production environment, this would save to a database
    # For this example, we'll save to a JSON file
    
    # Get quote data
    quote_data = session_manager.get_quote_summary()
    
    # Generate a timestamp for the quote ID
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    quote_id = f"Q{timestamp}"
    
    # Add quote ID and timestamp
    quote_data['quote_id'] = quote_id
    quote_data['created_at'] = datetime.now().isoformat()
    
    try:
        # Create quotes directory if it doesn't exist
        quotes_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'quotes')
        os.makedirs(quotes_dir, exist_ok=True)
        
        # Save quote to JSON file
        quote_file = os.path.join(quotes_dir, f"{quote_id}.json")
        with open(quote_file, 'w') as f:
            json.dump(quote_data, f, indent=4)
        
        return jsonify({
            'success': True,
            'message': 'Quote saved successfully',
            'quote_id': quote_id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving quote: {str(e)}'
        })

@bp.route('/api/treatments', methods=['GET'])
def get_treatments():
    """Get all treatments as JSON"""
    # Get treatment service from app context
    treatment_service = current_app.config['treatment_service']
    
    # Get all treatments
    treatments = treatment_service.get_all_treatments()
    
    return jsonify({
        'success': True,
        'treatments': treatments
    })

@bp.route('/api/treatment/<treatment_id>', methods=['GET'])
def get_treatment(treatment_id):
    """Get specific treatment as JSON"""
    # Get treatment service from app context
    treatment_service = current_app.config['treatment_service']
    
    # Get treatment by ID
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    
    if not treatment:
        return jsonify({
            'success': False,
            'message': 'Treatment not found'
        }), 404
    
    return jsonify({
        'success': True,
        'treatment': treatment
    })

@bp.route('/api/add-treatment', methods=['POST'])
def add_treatment_to_quote():
    """Add a treatment to the current quote"""
    # Get treatment ID from request
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    if not treatment_id:
        return jsonify({'success': False, 'message': 'Treatment ID is required'})
    
    # Get treatment service from app context
    treatment_service = current_app.config['treatment_service']
    
    # Get treatment by ID
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'})
    
    # Add treatment to session
    session_manager.add_treatment(treatment)
    
    # Get updated quote data
    quote_totals = session_manager.calculate_totals()
    selected_treatments = session_manager.get_selected_treatments()
    
    return jsonify({
        'success': True,
        'message': f"Added {treatment['name']} to your quote",
        'treatment': treatment,
        'selected_treatments': selected_treatments,
        'totals': quote_totals
    })

@bp.route('/api/remove-treatment', methods=['POST'])
def remove_treatment_from_quote():
    """Remove a treatment from the current quote"""
    # Get treatment ID from request
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    if not treatment_id:
        return jsonify({'success': False, 'message': 'Treatment ID is required'})
    
    # Remove treatment from session
    session_manager.remove_treatment(treatment_id)
    
    # Get updated quote data
    quote_totals = session_manager.calculate_totals()
    selected_treatments = session_manager.get_selected_treatments()
    
    return jsonify({
        'success': True,
        'message': 'Treatment removed from your quote',
        'selected_treatments': selected_treatments,
        'totals': quote_totals
    })

@bp.route('/api/update-treatment-quantity', methods=['POST'])
def update_treatment_quantity():
    """Update the quantity of a treatment in the current quote"""
    # Get data from request
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    quantity = data.get('quantity', 1)
    
    if not treatment_id:
        return jsonify({'success': False, 'message': 'Treatment ID is required'})
    
    # Convert quantity to integer and ensure it's at least 1
    try:
        quantity = max(1, int(quantity))
    except ValueError:
        return jsonify({'success': False, 'message': 'Quantity must be a number'})
    
    # Update treatment quantity in session
    success = session_manager.update_treatment_quantity(treatment_id, quantity)
    
    if not success:
        return jsonify({'success': False, 'message': 'Treatment not found in your quote'})
    
    # Get updated quote data
    quote_totals = session_manager.calculate_totals()
    selected_treatments = session_manager.get_selected_treatments()
    
    return jsonify({
        'success': True,
        'message': 'Treatment quantity updated',
        'selected_treatments': selected_treatments,
        'totals': quote_totals
    })