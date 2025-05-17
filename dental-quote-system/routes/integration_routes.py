"""
Integration Routes for Dental Quote System
Handles integration with external systems and services
"""

from flask import Blueprint, request, jsonify
from utils.session_manager import get_session_data
from services.treatment_service import TreatmentService
from services.promo_service import PromoService
import json
import os

# Initialize blueprint
integration_routes = Blueprint('integration_routes', __name__, url_prefix='/api/integration')

# Service instances
treatment_service = TreatmentService()
promo_service = PromoService()

@integration_routes.route('/export-quote', methods=['POST'])
def export_quote():
    """
    Export the current quote to a JSON file
    """
    # Get current session data
    session_data = get_session_data()
    
    # Extract quote data
    quote_data = {
        'selected_treatments': session_data.get('selected_treatments', []),
        'promo_code': session_data.get('promo_code'),
        'promo_details': session_data.get('promo_details'),
        'quote_totals': session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        }),
        'patient_info': session_data.get('patient_info', {})
    }
    
    try:
        # Ensure exports directory exists
        exports_dir = os.path.join(os.path.dirname(__file__), '../exports')
        os.makedirs(exports_dir, exist_ok=True)
        
        # Generate file name
        import uuid
        from datetime import datetime
        
        quote_id = session_data.get('quote_id', str(uuid.uuid4())[:8].upper())
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        file_name = f"quote_{quote_id}_{timestamp}.json"
        
        # Save to file
        file_path = os.path.join(exports_dir, file_name)
        
        with open(file_path, 'w') as file:
            json.dump(quote_data, file, indent=4)
        
        return jsonify({
            'success': True,
            'message': 'Quote exported successfully',
            'file_name': file_name,
            'file_path': file_path
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error exporting quote: {str(e)}'
        }), 500

@integration_routes.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generate a PDF version of the quote
    
    Note: Actual PDF generation would require a PDF library like pdfkit or weasyprint
    For this demo, we'll just return success with a message
    """
    # Get current session data
    session_data = get_session_data()
    
    # Extract quote data
    quote_data = {
        'selected_treatments': session_data.get('selected_treatments', []),
        'promo_code': session_data.get('promo_code'),
        'promo_details': session_data.get('promo_details'),
        'quote_totals': session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        }),
        'patient_info': session_data.get('patient_info', {})
    }
    
    # In a real implementation, we would use a PDF library to generate the PDF
    # For this demo, we'll just return success with a message
    
    return jsonify({
        'success': True,
        'message': 'PDF generation would happen here in a real implementation',
        'quote_data': quote_data
    })

@integration_routes.route('/send-email', methods=['POST'])
def send_email():
    """
    Send the quote to the patient's email
    
    Note: Actual email sending would require an email library or service
    For this demo, we'll just return success with a message
    """
    # Get current session data
    session_data = get_session_data()
    
    # Get patient email
    patient_info = session_data.get('patient_info', {})
    email = patient_info.get('email')
    
    if not email:
        return jsonify({
            'success': False,
            'message': 'Patient email not found'
        }), 400
    
    # In a real implementation, we would send an email here
    # For this demo, we'll just return success with a message
    
    return jsonify({
        'success': True,
        'message': f'Email would be sent to {email} in a real implementation'
    })

@integration_routes.route('/save-to-crm', methods=['POST'])
def save_to_crm():
    """
    Save the quote and patient information to a CRM system
    
    Note: Actual CRM integration would require API calls to the CRM system
    For this demo, we'll just return success with a message
    """
    # Get current session data
    session_data = get_session_data()
    
    # Extract quote data
    quote_data = {
        'selected_treatments': session_data.get('selected_treatments', []),
        'promo_code': session_data.get('promo_code'),
        'promo_details': session_data.get('promo_details'),
        'quote_totals': session_data.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        }),
        'patient_info': session_data.get('patient_info', {})
    }
    
    # In a real implementation, we would make API calls to the CRM system
    # For this demo, we'll just return success with a message
    
    return jsonify({
        'success': True,
        'message': 'Quote would be saved to CRM in a real implementation',
        'quote_data': quote_data
    })