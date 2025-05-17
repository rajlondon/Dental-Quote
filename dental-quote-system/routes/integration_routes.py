"""
Integration Routes Module

This module provides API endpoints for the frontend to integrate with the quote system.
These routes are used by the React application to fetch and manipulate quote data.
"""

from flask import Blueprint, request, jsonify, session, current_app
from services.treatment_service import TreatmentService
from services.email_service import EmailService  
from services.clinic_service import ClinicService
from services.patient_service import PatientService
from services.session_manager import SessionManager
from utils.auth_utils import login_required, admin_required, clinic_required, patient_required
import json
import os
from datetime import datetime

# Create a blueprint
integration_blueprint = Blueprint('integration', __name__, url_prefix='/api/integration')

# Mock data for testing when services are not fully implemented
MOCK_QUOTES = [
    {
        "id": "q1",
        "status": "pending",
        "created_at": "2025-05-01T10:30:00Z",
        "patient_id": "p1",
        "patient_name": "John Smith",
        "patient_email": "john@example.com",
        "patient_phone": "+1 555-123-4567",
        "clinic_id": "c1",
        "clinic_name": "Istanbul Dental Center",
        "promo_code": "SUMMER15",
        "discount_percent": 15,
        "subtotal": 1500,
        "discount_amount": 225,
        "total": 1275,
        "treatments": [
            {
                "id": "t1",
                "name": "Dental Implant",
                "description": "Titanium implant with crown",
                "category": "Implants",
                "price": 800,
                "quantity": 1
            },
            {
                "id": "t2",
                "name": "Professional Cleaning",
                "description": "Deep cleaning and polishing",
                "category": "Hygiene",
                "price": 150,
                "quantity": 1
            },
            {
                "id": "t3",
                "name": "Porcelain Veneer",
                "description": "Front tooth veneer",
                "category": "Cosmetic",
                "price": 550,
                "quantity": 1
            }
        ]
    },
    {
        "id": "q2",
        "status": "confirmed",
        "created_at": "2025-04-28T14:20:00Z",
        "patient_id": "p2",
        "patient_name": "Emma Johnson",
        "patient_email": "emma@example.com",
        "patient_phone": "+1 555-987-6543",
        "clinic_id": "c2",
        "clinic_name": "Antalya Smile Clinic",
        "promo_code": None,
        "discount_percent": 0,
        "subtotal": 2200,
        "discount_amount": 0,
        "total": 2200,
        "treatments": [
            {
                "id": "t4",
                "name": "Full Mouth Rehabilitation",
                "description": "Complete dental makeover",
                "category": "Comprehensive",
                "price": 2200,
                "quantity": 1
            }
        ]
    }
]

# Admin routes
@integration_blueprint.route('/admin/quotes', methods=['GET'])
@admin_required
def get_admin_quotes():
    """Get all quotes for admin dashboard"""
    try:
        # quotes = TreatmentService.get_all_quotes()
        # Use mock data for testing
        quotes = MOCK_QUOTES
        return jsonify({"quotes": quotes})
    except Exception as e:
        current_app.logger.error(f"Error in get_admin_quotes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/admin/quotes/<quote_id>', methods=['GET'])
@admin_required
def get_admin_quote(quote_id):
    """Get specific quote details for admin"""
    try:
        # quote = TreatmentService.get_quote(quote_id)
        # Use mock data for testing
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id), None)
        if not quote:
            return jsonify({"error": "Quote not found"}), 404
        return jsonify({"quote": quote})
    except Exception as e:
        current_app.logger.error(f"Error in get_admin_quote: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/admin/quotes/<quote_id>/assign', methods=['POST'])
@admin_required
def assign_quote(quote_id):
    """Assign a quote to a clinic"""
    try:
        data = request.get_json()
        clinic_id = data.get("clinic_id")
        if not clinic_id:
            return jsonify({"error": "Clinic ID is required"}), 400
            
        # TreatmentService.assign_quote_to_clinic(quote_id, clinic_id)
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Quote {quote_id} assigned to clinic {clinic_id}"})
    except Exception as e:
        current_app.logger.error(f"Error in assign_quote: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/admin/quotes/<quote_id>/unassign', methods=['POST'])
@admin_required
def unassign_quote(quote_id):
    """Unassign a quote from a clinic"""
    try:
        # TreatmentService.unassign_quote_from_clinic(quote_id)
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Quote {quote_id} unassigned from clinic"})
    except Exception as e:
        current_app.logger.error(f"Error in unassign_quote: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Clinic routes
@integration_blueprint.route('/clinic/<clinic_id>/quotes', methods=['GET'])
@clinic_required
def get_clinic_quotes(clinic_id):
    """Get all quotes for a specific clinic"""
    try:
        # quotes = TreatmentService.get_clinic_quotes(clinic_id)
        # Use mock data for testing
        quotes = [q for q in MOCK_QUOTES if q.get("clinic_id") == clinic_id]
        return jsonify({"quotes": quotes})
    except Exception as e:
        current_app.logger.error(f"Error in get_clinic_quotes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/clinic/<clinic_id>/quotes/<quote_id>', methods=['GET'])
@clinic_required
def get_clinic_quote(clinic_id, quote_id):
    """Get specific quote details for a clinic"""
    try:
        # quote = TreatmentService.get_clinic_quote(clinic_id, quote_id)
        # Use mock data for testing
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id and q.get("clinic_id") == clinic_id), None)
        if not quote:
            return jsonify({"error": "Quote not found for this clinic"}), 404
        return jsonify({"quote": quote})
    except Exception as e:
        current_app.logger.error(f"Error in get_clinic_quote: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Patient routes
@integration_blueprint.route('/patient/<patient_id>/quotes', methods=['GET'])
@patient_required
def get_patient_quotes(patient_id):
    """Get all quotes for a specific patient"""
    try:
        # quotes = TreatmentService.get_patient_quotes(patient_id)
        # Use mock data for testing
        quotes = [q for q in MOCK_QUOTES if q.get("patient_id") == patient_id]
        return jsonify({"quotes": quotes})
    except Exception as e:
        current_app.logger.error(f"Error in get_patient_quotes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/patient/<patient_id>/quotes/<quote_id>', methods=['GET'])
@patient_required
def get_patient_quote(patient_id, quote_id):
    """Get specific quote details for a patient"""
    try:
        # quote = TreatmentService.get_patient_quote(patient_id, quote_id)
        # Use mock data for testing
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id and q.get("patient_id") == patient_id), None)
        if not quote:
            return jsonify({"error": "Quote not found for this patient"}), 404
        return jsonify({"quote": quote})
    except Exception as e:
        current_app.logger.error(f"Error in get_patient_quote: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Generic quote actions
@integration_blueprint.route('/quotes/<quote_id>/status', methods=['PUT'])
@login_required
def update_quote_status(quote_id):
    """Update the status of a quote"""
    try:
        data = request.get_json()
        status = data.get("status")
        if not status:
            return jsonify({"error": "Status is required"}), 400
            
        # TreatmentService.update_quote_status(quote_id, status)
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Quote {quote_id} status updated to {status}"})
    except Exception as e:
        current_app.logger.error(f"Error in update_quote_status: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/email', methods=['POST'])
@login_required
def send_quote_email(quote_id):
    """Send a quote via email"""
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email address is required"}), 400
            
        # Get the quote
        # quote = TreatmentService.get_quote(quote_id)
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id), None)
        if not quote:
            return jsonify({"error": "Quote not found"}), 404
            
        # Generate PDF and send email
        # pdf_content = TreatmentService.generate_pdf_quote(quote_id)
        # EmailService.send_quote_email(email, quote, pdf_content)
        
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Quote {quote_id} sent to {email}"})
    except Exception as e:
        current_app.logger.error(f"Error in send_quote_email: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/appointment', methods=['POST'])
@patient_required
def request_appointment(quote_id):
    """Request an appointment for a quote"""
    try:
        # Get the quote
        # quote = TreatmentService.get_quote(quote_id)
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id), None)
        if not quote:
            return jsonify({"error": "Quote not found"}), 404
            
        # Update the quote status
        # TreatmentService.update_quote_status(quote_id, "appointment_requested")
        
        # Notify the clinic (in a real implementation)
        # Send email to clinic about the appointment request
        
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Appointment requested for quote {quote_id}"})
    except Exception as e:
        current_app.logger.error(f"Error in request_appointment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/pdf', methods=['GET'])
@login_required
def download_quote_pdf(quote_id):
    """Download a quote as PDF"""
    try:
        # Get the quote
        # quote = TreatmentService.get_quote(quote_id)
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id), None)
        if not quote:
            return jsonify({"error": "Quote not found"}), 404
            
        # Generate PDF
        # pdf_content = TreatmentService.generate_pdf_quote(quote_id)
        
        # For mock purposes, just return a sample PDF
        from flask import send_file
        import tempfile
        
        # Create a simple PDF with the quote data
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.close()
        
        # Generate a very basic PDF using reportlab
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            c = canvas.Canvas(temp_file.name, pagesize=letter)
            c.setFont("Helvetica", 12)
            
            # Title
            c.setFont("Helvetica-Bold", 18)
            c.drawString(50, 750, f"Dental Quote #{quote['id']}")
            
            # Patient info
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, 700, "Patient Information")
            c.setFont("Helvetica", 12)
            c.drawString(50, 680, f"Name: {quote.get('patient_name', 'N/A')}")
            c.drawString(50, 660, f"Email: {quote.get('patient_email', 'N/A')}")
            c.drawString(50, 640, f"Phone: {quote.get('patient_phone', 'N/A')}")
            
            # Clinic info
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, 600, "Clinic Information")
            c.setFont("Helvetica", 12)
            c.drawString(50, 580, f"Name: {quote.get('clinic_name', 'N/A')}")
            
            # Treatments
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, 540, "Treatments")
            
            y = 520
            for i, treatment in enumerate(quote.get('treatments', [])):
                c.setFont("Helvetica-Bold", 12)
                c.drawString(50, y, f"{treatment.get('name')}")
                y -= 20
                c.setFont("Helvetica", 10)
                c.drawString(50, y, f"Description: {treatment.get('description', 'N/A')}")
                y -= 15
                c.drawString(50, y, f"Category: {treatment.get('category', 'N/A')}")
                y -= 15
                c.drawString(50, y, f"Price: ${treatment.get('price', 0):.2f} x {treatment.get('quantity', 1)} = ${(treatment.get('price', 0) * treatment.get('quantity', 1)):.2f}")
                y -= 25
            
            # Pricing
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y, "Pricing Summary")
            y -= 20
            c.setFont("Helvetica", 12)
            c.drawString(50, y, f"Subtotal: ${quote.get('subtotal', 0):.2f}")
            y -= 20
            
            if quote.get('discount_amount', 0) > 0:
                c.drawString(50, y, f"Discount ({quote.get('discount_percent', 0)}%): -${quote.get('discount_amount', 0):.2f}")
                y -= 20
            
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, f"Total: ${quote.get('total', 0):.2f}")
            
            # Footer
            c.setFont("Helvetica", 10)
            c.drawString(50, 50, f"Generated on {datetime.now().strftime('%Y-%m-%d')} by MyDentalFly")
            
            c.save()
        except ImportError:
            # If reportlab is not available, create a text file with PDF extension
            with open(temp_file.name, 'w') as f:
                f.write(f"Quote #{quote['id']}\n\n")
                f.write(f"Patient: {quote.get('patient_name', 'N/A')}\n")
                f.write(f"Clinic: {quote.get('clinic_name', 'N/A')}\n\n")
                f.write("Treatments:\n")
                for t in quote.get('treatments', []):
                    f.write(f"- {t.get('name')}: ${t.get('price', 0):.2f} x {t.get('quantity', 1)}\n")
                f.write(f"\nSubtotal: ${quote.get('subtotal', 0):.2f}\n")
                if quote.get('discount_amount', 0) > 0:
                    f.write(f"Discount: -${quote.get('discount_amount', 0):.2f}\n")
                f.write(f"Total: ${quote.get('total', 0):.2f}\n")
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=f"quote-{quote_id}.pdf",
            mimetype="application/pdf"
        )
    except Exception as e:
        current_app.logger.error(f"Error in download_quote_pdf: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/treatments/<treatment_id>', methods=['PUT'])
@patient_required
def update_treatment_quantity(quote_id, treatment_id):
    """Update the quantity of a treatment in a quote"""
    try:
        data = request.get_json()
        quantity = data.get("quantity")
        if not quantity or not isinstance(quantity, int) or quantity < 1:
            return jsonify({"error": "Valid quantity is required"}), 400
            
        # TreatmentService.update_treatment_quantity(quote_id, treatment_id, quantity)
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Treatment {treatment_id} quantity updated to {quantity}"})
    except Exception as e:
        current_app.logger.error(f"Error in update_treatment_quantity: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/treatments/<treatment_id>', methods=['DELETE'])
@patient_required
def remove_treatment(quote_id, treatment_id):
    """Remove a treatment from a quote"""
    try:
        # TreatmentService.remove_treatment(quote_id, treatment_id)
        # For mock purposes, just return success
        return jsonify({"success": True, "message": f"Treatment {treatment_id} removed from quote {quote_id}"})
    except Exception as e:
        current_app.logger.error(f"Error in remove_treatment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/promo-code', methods=['POST'])
@login_required
def apply_promo_code(quote_id):
    """Apply a promo code to a quote"""
    try:
        data = request.get_json()
        promo_code = data.get("promo_code")
        if not promo_code:
            return jsonify({"error": "Promo code is required"}), 400
            
        # Get the quote
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id), None)
        if not quote:
            return jsonify({"error": "Quote not found"}), 404
            
        # For mock purposes, simulate promo code application
        discount_percent = 0
        if promo_code == "SUMMER15":
            discount_percent = 15
        elif promo_code == "DENTAL25":
            discount_percent = 25
        elif promo_code == "NEWPATIENT":
            discount_percent = 20
        elif promo_code == "TEST10":
            discount_percent = 10
        elif promo_code == "LUXHOTEL20":
            discount_percent = 20
        elif promo_code == "IMPLANTCROWN30":
            discount_percent = 30
        else:
            return jsonify({"error": "Invalid promo code"}), 400
            
        # Calculate new total
        subtotal = quote.get("subtotal", 0)
        discount_amount = subtotal * (discount_percent / 100)
        total = subtotal - discount_amount
        
        # Updated quote with promo code
        updated_quote = dict(quote)
        updated_quote["promo_code"] = promo_code
        updated_quote["discount_percent"] = discount_percent
        updated_quote["discount_amount"] = discount_amount
        updated_quote["total"] = total
        
        return jsonify({"quote": updated_quote})
    except Exception as e:
        current_app.logger.error(f"Error in apply_promo_code: {str(e)}")
        return jsonify({"error": str(e)}), 500

@integration_blueprint.route('/quotes/<quote_id>/promo-code', methods=['DELETE'])
@login_required
def remove_promo_code(quote_id):
    """Remove a promo code from a quote"""
    try:
        # Get the quote
        quote = next((q for q in MOCK_QUOTES if q["id"] == quote_id), None)
        if not quote:
            return jsonify({"error": "Quote not found"}), 404
            
        # For mock purposes, simulate promo code removal
        updated_quote = dict(quote)
        updated_quote["promo_code"] = None
        updated_quote["discount_percent"] = 0
        updated_quote["discount_amount"] = 0
        updated_quote["total"] = updated_quote["subtotal"]
        
        return jsonify({"quote": updated_quote})
    except Exception as e:
        current_app.logger.error(f"Error in remove_promo_code: {str(e)}")
        return jsonify({"error": str(e)}), 500