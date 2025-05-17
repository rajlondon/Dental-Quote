import logging
import os
import json
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, render_template, send_file, abort
from io import BytesIO

from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize blueprint
integration_routes_bp = Blueprint('integration_routes', __name__)

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Integration routes for connecting with external systems
@integration_routes_bp.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generate a PDF version of the current quote.
    This would typically use a PDF generation library like xhtml2pdf or pdfkit.
    For this demo, we'll just return a sample PDF file.
    """
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    
    # In a real application, we would generate a PDF here
    # using the quote data. For this demo, we'll just return a JSON response.
    return jsonify({
        'success': True,
        'message': 'PDF generation would happen here in a real application',
        'quote_data': quote_data
    })

@integration_routes_bp.route('/api/send-to-email', methods=['POST'])
def send_to_email():
    """
    Send the quote to the patient's email.
    This would typically use an email sending library like smtplib or a service like SendGrid.
    For this demo, we'll just return a success message.
    """
    # Get email from request
    email = request.json.get('email')
    if not email:
        return jsonify({'success': False, 'message': 'No email provided'}), 400
    
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    
    # In a real application, we would send an email here
    # using the quote data. For this demo, we'll just return a JSON response.
    return jsonify({
        'success': True,
        'message': f'Quote would be sent to {email} in a real application',
        'quote_data': quote_data
    })

@integration_routes_bp.route('/api/save-to-crm', methods=['POST'])
def save_to_crm():
    """
    Save the quote to a CRM system.
    This would typically use an API client to connect to a CRM like Salesforce or HubSpot.
    For this demo, we'll just return a success message.
    """
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    
    # Generate a unique reference for the quote
    quote_reference = f"Q{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    # In a real application, we would send data to a CRM here
    # using the quote data. For this demo, we'll just return a JSON response.
    return jsonify({
        'success': True,
        'message': 'Quote would be saved to CRM in a real application',
        'reference': quote_reference,
        'quote_data': quote_data
    })

@integration_routes_bp.route('/api/book-appointment', methods=['POST'])
def book_appointment():
    """
    Book an appointment for the patient.
    This would typically integrate with a scheduling system or calendar API.
    For this demo, we'll just return a success message.
    """
    # Get appointment data from request
    date = request.json.get('date')
    time = request.json.get('time')
    
    if not date or not time:
        return jsonify({'success': False, 'message': 'Date and time are required'}), 400
    
    # Get patient info from session
    patient = SessionManager.get_patient_info()
    
    # In a real application, we would book an appointment here
    # using the patient data and requested date/time.
    # For this demo, we'll just return a JSON response.
    return jsonify({
        'success': True,
        'message': f'Appointment would be booked for {date} at {time} in a real application',
        'patient': patient
    })

@integration_routes_bp.route('/api/export-to-json', methods=['GET'])
def export_to_json():
    """Export the current quote data as a downloadable JSON file."""
    # Get quote data
    quote_data = SessionManager.get_quote_data()
    
    # Convert to JSON
    json_data = json.dumps(quote_data, indent=2, default=str)
    
    # Create file-like object
    mem = BytesIO()
    mem.write(json_data.encode('utf-8'))
    mem.seek(0)
    
    # Generate a filename
    filename = f"quote_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    
    return send_file(
        mem,
        mimetype='application/json',
        as_attachment=True,
        download_name=filename
    )