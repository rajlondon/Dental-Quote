"""
Integration Routes for the Dental Quote System

These routes provide an API for the React frontend to communicate with the Flask backend
for quote management across all portals (admin, clinic, patient).
"""
from flask import Blueprint, request, jsonify, abort, session, send_file
from io import BytesIO
from services.treatment_service import TreatmentService
from services.email_service import EmailService
from services.clinic_service import ClinicService
from services.patient_service import PatientService
from services.session_manager import SessionManager
from utils.auth_utils import admin_required, clinic_required, patient_required
import uuid
import datetime
import os

integration_bp = Blueprint('integration', __name__, url_prefix='/api/integration')

# Helper functions
def get_quote_data(quote):
    """Construct a quote data response for the frontend"""
    if not quote:
        return None
        
    return {
        'id': quote.get('id', str(uuid.uuid4())),
        'status': quote.get('status', 'pending'),
        'created_at': quote.get('created_at', datetime.datetime.now().isoformat()),
        'updated_at': quote.get('updated_at', datetime.datetime.now().isoformat()),
        'patient_info': {
            'name': quote.get('patient_name', ''),
            'email': quote.get('patient_email', ''),
            'phone': quote.get('patient_phone', ''),
            'country': quote.get('patient_country', '')
        },
        'treatments': quote.get('treatments', []),
        'subtotal': quote.get('subtotal', 0),
        'discount_amount': quote.get('discount_amount', 0),
        'total': quote.get('total', 0),
        'currency': quote.get('currency', 'GBP'),
        'promo_code': quote.get('promo_code'),
        'clinic_id': quote.get('clinic_id'),
        'clinic_name': quote.get('clinic_name'),
        'clinic_logo': quote.get('clinic_logo'),
        'special_offer_id': quote.get('special_offer_id'),
        'special_offer_name': quote.get('special_offer_name')
    }

# Admin Portal Routes
@integration_bp.route('/admin/quotes', methods=['GET'])
@admin_required
def get_admin_quotes():
    """Get all quotes for admin"""
    quotes = TreatmentService.get_all_quotes()
    return jsonify([get_quote_data(quote) for quote in quotes])

@integration_bp.route('/admin/quote/<quote_id>', methods=['GET'])
@admin_required
def get_admin_quote(quote_id):
    """Get a specific quote for admin"""
    quote = TreatmentService.get_quote(quote_id)
    if not quote:
        abort(404, 'Quote not found')
    return jsonify(get_quote_data(quote))

@integration_bp.route('/admin/quote/<quote_id>/assign', methods=['POST'])
@admin_required
def assign_quote(quote_id):
    """Assign a quote to a clinic"""
    data = request.json
    clinic_id = data.get('clinic_id')
    
    if not clinic_id:
        abort(400, 'Clinic ID is required')
    
    # Get clinic details
    clinic = ClinicService.get_clinic(clinic_id)
    if not clinic:
        abort(404, 'Clinic not found')
    
    # Update quote with clinic assignment
    result = TreatmentService.assign_quote_to_clinic(
        quote_id, 
        clinic_id,
        clinic.get('name', 'Unknown Clinic'),
        clinic.get('logo_url')
    )
    
    if not result:
        abort(500, 'Failed to assign quote')
    
    return jsonify({'success': True})

@integration_bp.route('/admin/quote/<quote_id>/unassign', methods=['POST'])
@admin_required
def unassign_quote(quote_id):
    """Unassign a quote from a clinic"""
    result = TreatmentService.unassign_quote_from_clinic(quote_id)
    
    if not result:
        abort(500, 'Failed to unassign quote')
    
    return jsonify({'success': True})

# Clinic Portal Routes
@integration_bp.route('/clinic/<clinic_id>/quotes', methods=['GET'])
@clinic_required
def get_clinic_quotes(clinic_id):
    """Get all quotes for a specific clinic"""
    quotes = TreatmentService.get_clinic_quotes(clinic_id)
    return jsonify([get_quote_data(quote) for quote in quotes])

@integration_bp.route('/clinic/<clinic_id>/quote/<quote_id>', methods=['GET'])
@clinic_required
def get_clinic_quote(clinic_id, quote_id):
    """Get a specific quote for a clinic"""
    quote = TreatmentService.get_clinic_quote(clinic_id, quote_id)
    if not quote:
        abort(404, 'Quote not found or not assigned to this clinic')
    return jsonify(get_quote_data(quote))

# Patient Portal Routes
@integration_bp.route('/patient/<patient_id>/quotes', methods=['GET'])
@patient_required
def get_patient_quotes(patient_id):
    """Get all quotes for a specific patient"""
    quotes = TreatmentService.get_patient_quotes(patient_id)
    return jsonify([get_quote_data(quote) for quote in quotes])

@integration_bp.route('/patient/<patient_id>/quote/<quote_id>', methods=['GET'])
@patient_required
def get_patient_quote(patient_id, quote_id):
    """Get a specific quote for a patient"""
    quote = TreatmentService.get_patient_quote(patient_id, quote_id)
    if not quote:
        abort(404, 'Quote not found or not belongs to this patient')
    return jsonify(get_quote_data(quote))

# Common Quote Operations
@integration_bp.route('/quote/<quote_id>/status', methods=['POST'])
def update_quote_status(quote_id):
    """Update the status of a quote"""
    data = request.json
    status = data.get('status')
    
    if not status:
        abort(400, 'Status is required')
    
    if status not in ['pending', 'assigned', 'in_progress', 'completed', 'accepted', 'rejected']:
        abort(400, 'Invalid status')
    
    result = TreatmentService.update_quote_status(quote_id, status)
    
    if not result:
        abort(500, 'Failed to update quote status')
    
    return jsonify({'success': True})

@integration_bp.route('/quote/<quote_id>/email', methods=['POST'])
def send_quote_email(quote_id):
    """Send a quote by email"""
    data = request.json
    email = data.get('email')
    
    if not email:
        abort(400, 'Email is required')
    
    quote = TreatmentService.get_quote(quote_id)
    if not quote:
        abort(404, 'Quote not found')
    
    # Generate PDF
    pdf_bytes = TreatmentService.generate_pdf_quote(quote_id)
    
    # Send email with PDF attachment
    success = EmailService.send_quote_email(
        email,
        f"Your Dental Treatment Quote {quote_id}",
        "Please find attached your dental treatment quote.",
        pdf_bytes
    )
    
    if not success:
        abort(500, 'Failed to send email')
    
    return jsonify({'success': True})

@integration_bp.route('/quote/<quote_id>/request-appointment', methods=['POST'])
def request_appointment(quote_id):
    """Request an appointment for a quote"""
    quote = TreatmentService.get_quote(quote_id)
    if not quote:
        abort(404, 'Quote not found')
    
    # Update quote status
    TreatmentService.update_quote_status(quote_id, 'in_progress')
    
    # Send notification to clinic
    if quote.get('clinic_id'):
        clinic = ClinicService.get_clinic(quote.get('clinic_id'))
        
        if clinic and clinic.get('email'):
            EmailService.send_appointment_request_notification(
                clinic.get('email'),
                quote_id,
                quote.get('patient_name', 'A patient'),
                quote.get('patient_email'),
                quote.get('patient_phone')
            )
    
    return jsonify({'success': True})

@integration_bp.route('/quote/<quote_id>/pdf', methods=['GET'])
def download_quote_pdf(quote_id):
    """Download a quote as PDF"""
    quote = TreatmentService.get_quote(quote_id)
    if not quote:
        abort(404, 'Quote not found')
    
    # Generate PDF
    pdf_bytes = TreatmentService.generate_pdf_quote(quote_id)
    
    # Send as downloadable file
    buffer = BytesIO(pdf_bytes)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"dental_quote_{quote_id}.pdf"
    )

@integration_bp.route('/quote/<quote_id>/treatment/<treatment_id>', methods=['POST'])
def update_treatment_quantity(quote_id, treatment_id):
    """Update the quantity of a treatment in a quote"""
    data = request.json
    quantity = data.get('quantity')
    
    if not quantity or not isinstance(quantity, int) or quantity < 1:
        abort(400, 'Valid quantity is required')
    
    result = TreatmentService.update_treatment_quantity(quote_id, treatment_id, quantity)
    
    if not result:
        abort(500, 'Failed to update treatment quantity')
    
    return jsonify({'success': True})

@integration_bp.route('/quote/<quote_id>/treatment/<treatment_id>', methods=['DELETE'])
def remove_treatment(quote_id, treatment_id):
    """Remove a treatment from a quote"""
    result = TreatmentService.remove_treatment(quote_id, treatment_id)
    
    if not result:
        abort(500, 'Failed to remove treatment')
    
    return jsonify({'success': True})