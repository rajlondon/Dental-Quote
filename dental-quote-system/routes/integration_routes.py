from flask import Blueprint, jsonify, request, session
import json
import uuid
from datetime import datetime

integration_bp = Blueprint('integration', __name__, url_prefix='/api/integration')

# Sample data for testing
SAMPLE_QUOTES = [
    {
        "id": "quote-1",
        "createdAt": datetime.now().isoformat(),
        "patientName": "John Doe",
        "patientEmail": "john.doe@example.com",
        "treatments": [
            {
                "id": "treatment-1",
                "name": "Dental Implant",
                "description": "Titanium implant with abutment",
                "price": 1200,
                "quantity": 1,
                "category": "Implants"
            },
            {
                "id": "treatment-2",
                "name": "Porcelain Crown",
                "description": "Premium porcelain crown",
                "price": 800,
                "quantity": 1,
                "category": "Crowns"
            }
        ],
        "subtotal": 2000,
        "discount": 0,
        "total": 2000,
        "currency": "USD",
        "status": "draft",
        "clinicId": "clinic-1",
        "clinicName": "Dental Excellence Clinic"
    },
    {
        "id": "quote-2",
        "createdAt": datetime.now().isoformat(),
        "patientName": "Jane Smith",
        "patientEmail": "jane.smith@example.com",
        "treatments": [
            {
                "id": "treatment-3",
                "name": "Teeth Whitening",
                "description": "Professional whitening treatment",
                "price": 300,
                "quantity": 1,
                "category": "Cosmetic"
            }
        ],
        "subtotal": 300,
        "discount": 0,
        "total": 300,
        "currency": "USD",
        "status": "sent",
        "clinicId": "clinic-2",
        "clinicName": "Smile Dental Spa"
    }
]

SAMPLE_CLINICS = [
    {
        "id": "clinic-1",
        "name": "Dental Excellence Clinic",
        "location": "Istanbul",
        "city": "Istanbul",
        "country": "Turkey",
        "specialty": "Implants, Crowns",
        "address": "123 Dental St, Istanbul",
        "rating": 4.8,
        "logoUrl": "/clinics/logo1.png",
        "contactEmail": "info@dentalexcellence.com",
        "contactPhone": "+90123456789",
        "isActive": True
    },
    {
        "id": "clinic-2",
        "name": "Smile Dental Spa",
        "location": "Antalya",
        "city": "Antalya",
        "country": "Turkey",
        "specialty": "Cosmetic Dentistry",
        "address": "456 Smile Blvd, Antalya",
        "rating": 4.7,
        "logoUrl": "/clinics/logo2.png",
        "contactEmail": "info@smiledentalspa.com",
        "contactPhone": "+90987654321",
        "isActive": True
    }
]

# Promo codes for testing
PROMO_CODES = {
    "SUMMER15": {"type": "percentage", "value": 15},
    "DENTAL25": {"type": "percentage", "value": 25},
    "NEWPATIENT": {"type": "percentage", "value": 20},
    "TEST10": {"type": "percentage", "value": 10},
    "FREECONSULT": {"type": "percentage", "value": 100, "treatments": ["Consultation"]},
    "LUXHOTEL20": {"type": "percentage", "value": 20},
    "IMPLANTCROWN30": {"type": "percentage", "value": 30},
    "FREEWHITE": {"type": "fixed_amount", "value": 150},
    "LUXTRAVEL": {"type": "fixed_amount", "value": 80}
}

def get_quote_by_id(quote_id):
    """Helper function to get a quote by ID"""
    for quote in SAMPLE_QUOTES:
        if quote["id"] == quote_id:
            return quote
    return None

def get_clinic_by_id(clinic_id):
    """Helper function to get a clinic by ID"""
    for clinic in SAMPLE_CLINICS:
        if clinic["id"] == clinic_id:
            return clinic
    return None

def calculate_discount(quote, promo_code):
    """Calculate discount based on promo code"""
    if promo_code not in PROMO_CODES:
        return 0
    
    promo = PROMO_CODES[promo_code]
    
    if promo["type"] == "percentage":
        return (promo["value"] / 100) * quote["subtotal"]
    elif promo["type"] == "fixed_amount":
        return min(promo["value"], quote["subtotal"])  # Don't exceed total
    
    return 0

# Patient portal routes
@integration_bp.route('/patient/quotes', methods=['GET'])
def get_patient_quotes():
    """Get all quotes for the current patient"""
    # In a real app, filter by the current authenticated patient
    return jsonify({
        "success": True,
        "quotes": SAMPLE_QUOTES
    })

@integration_bp.route('/patient/quotes/<quote_id>', methods=['GET'])
def get_patient_quote(quote_id):
    """Get a specific quote for the current patient"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    return jsonify({
        "success": True,
        "quote": quote
    })

@integration_bp.route('/patient/quotes/<quote_id>/apply-promo', methods=['POST'])
def apply_patient_promo(quote_id):
    """Apply a promo code to a quote"""
    data = request.json
    promo_code = data.get('promoCode')
    
    if not promo_code:
        return jsonify({
            "success": False,
            "message": "Promo code is required"
        }), 400
    
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    if promo_code not in PROMO_CODES:
        return jsonify({
            "success": False,
            "message": "Invalid promo code"
        }), 400
    
    # Make a copy of the quote to avoid modifying the original
    updated_quote = json.loads(json.dumps(quote))
    
    # Calculate and apply discount
    discount = calculate_discount(quote, promo_code)
    updated_quote["discount"] = discount
    updated_quote["total"] = updated_quote["subtotal"] - discount
    updated_quote["promoCode"] = promo_code
    
    # In a real app, save the updated quote to the database
    # For this demo, we update the sample data
    for i, q in enumerate(SAMPLE_QUOTES):
        if q["id"] == quote_id:
            SAMPLE_QUOTES[i] = updated_quote
    
    return jsonify({
        "success": True,
        "quote": updated_quote
    })

@integration_bp.route('/patient/quotes/<quote_id>/remove-promo', methods=['POST'])
def remove_patient_promo(quote_id):
    """Remove a promo code from a quote"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    # Make a copy of the quote to avoid modifying the original
    updated_quote = json.loads(json.dumps(quote))
    
    # Remove promo code and reset discount
    if "promoCode" in updated_quote:
        del updated_quote["promoCode"]
    
    updated_quote["discount"] = 0
    updated_quote["total"] = updated_quote["subtotal"]
    
    # In a real app, save the updated quote to the database
    # For this demo, we update the sample data
    for i, q in enumerate(SAMPLE_QUOTES):
        if q["id"] == quote_id:
            SAMPLE_QUOTES[i] = updated_quote
    
    return jsonify({
        "success": True,
        "quote": updated_quote
    })

@integration_bp.route('/patient/quotes/<quote_id>/update-treatment', methods=['POST'])
def update_patient_treatment_quantity(quote_id):
    """Update treatment quantity in a quote"""
    data = request.json
    treatment_id = data.get('treatmentId')
    quantity = data.get('quantity')
    
    if not treatment_id or not quantity:
        return jsonify({
            "success": False,
            "message": "Treatment ID and quantity are required"
        }), 400
    
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    # Make a copy of the quote to avoid modifying the original
    updated_quote = json.loads(json.dumps(quote))
    
    # Update treatment quantity
    treatment_found = False
    for treatment in updated_quote["treatments"]:
        if treatment["id"] == treatment_id:
            treatment["quantity"] = int(quantity)
            treatment_found = True
            break
    
    if not treatment_found:
        return jsonify({
            "success": False,
            "message": "Treatment not found in quote"
        }), 404
    
    # Recalculate subtotal
    subtotal = sum(t["price"] * t["quantity"] for t in updated_quote["treatments"])
    updated_quote["subtotal"] = subtotal
    
    # Recalculate discount if promo code is applied
    if "promoCode" in updated_quote:
        discount = calculate_discount(updated_quote, updated_quote["promoCode"])
        updated_quote["discount"] = discount
    else:
        updated_quote["discount"] = 0
    
    # Update total
    updated_quote["total"] = updated_quote["subtotal"] - updated_quote["discount"]
    
    # In a real app, save the updated quote to the database
    # For this demo, we update the sample data
    for i, q in enumerate(SAMPLE_QUOTES):
        if q["id"] == quote_id:
            SAMPLE_QUOTES[i] = updated_quote
    
    return jsonify({
        "success": True,
        "quote": updated_quote
    })

@integration_bp.route('/patient/quotes/<quote_id>/remove-treatment', methods=['POST'])
def remove_patient_treatment(quote_id):
    """Remove a treatment from a quote"""
    data = request.json
    treatment_id = data.get('treatmentId')
    
    if not treatment_id:
        return jsonify({
            "success": False,
            "message": "Treatment ID is required"
        }), 400
    
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    # Make a copy of the quote to avoid modifying the original
    updated_quote = json.loads(json.dumps(quote))
    
    # Remove treatment
    updated_quote["treatments"] = [t for t in updated_quote["treatments"] if t["id"] != treatment_id]
    
    # Recalculate subtotal
    subtotal = sum(t["price"] * t["quantity"] for t in updated_quote["treatments"])
    updated_quote["subtotal"] = subtotal
    
    # Recalculate discount if promo code is applied
    if "promoCode" in updated_quote:
        discount = calculate_discount(updated_quote, updated_quote["promoCode"])
        updated_quote["discount"] = discount
    else:
        updated_quote["discount"] = 0
    
    # Update total
    updated_quote["total"] = updated_quote["subtotal"] - updated_quote["discount"]
    
    # In a real app, save the updated quote to the database
    # For this demo, we update the sample data
    for i, q in enumerate(SAMPLE_QUOTES):
        if q["id"] == quote_id:
            SAMPLE_QUOTES[i] = updated_quote
    
    return jsonify({
        "success": True,
        "quote": updated_quote
    })

@integration_bp.route('/patient/quotes/<quote_id>/pdf', methods=['GET'])
def get_patient_quote_pdf(quote_id):
    """Get a PDF version of a quote"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    # In a real app, generate and return a PDF
    # For this demo, just return success
    return jsonify({
        "success": True,
        "message": "PDF would be downloaded in a real app"
    })

@integration_bp.route('/patient/quotes/<quote_id>/request-appointment', methods=['POST'])
def request_patient_appointment(quote_id):
    """Request an appointment for a quote"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    # In a real app, create an appointment request
    # For this demo, just return success
    return jsonify({
        "success": True,
        "message": "Appointment request submitted"
    })

# Admin portal routes - simplified versions
@integration_bp.route('/admin/quotes', methods=['GET'])
def get_admin_quotes():
    """Get all quotes for admin"""
    return jsonify({
        "success": True,
        "quotes": SAMPLE_QUOTES
    })

@integration_bp.route('/admin/quotes/<quote_id>', methods=['GET'])
def get_admin_quote(quote_id):
    """Get a specific quote for admin"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    return jsonify({
        "success": True,
        "quote": quote
    })

@integration_bp.route('/admin/clinics', methods=['GET'])
def get_admin_clinics():
    """Get all clinics for admin"""
    return jsonify({
        "success": True,
        "clinics": SAMPLE_CLINICS
    })

@integration_bp.route('/admin/clinics/<clinic_id>', methods=['GET'])
def get_admin_clinic(clinic_id):
    """Get a specific clinic for admin"""
    clinic = get_clinic_by_id(clinic_id)
    
    if not clinic:
        return jsonify({
            "success": False,
            "message": "Clinic not found"
        }), 404
    
    return jsonify({
        "success": True,
        "clinic": clinic
    })

@integration_bp.route('/admin/quotes/<quote_id>/assign-clinic', methods=['POST'])
def assign_clinic_to_quote(quote_id):
    """Assign a clinic to a quote"""
    data = request.json
    clinic_id = data.get('clinicId')
    
    if not clinic_id:
        return jsonify({
            "success": False,
            "message": "Clinic ID is required"
        }), 400
    
    quote = get_quote_by_id(quote_id)
    clinic = get_clinic_by_id(clinic_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    if not clinic:
        return jsonify({
            "success": False,
            "message": "Clinic not found"
        }), 404
    
    # Make a copy of the quote to avoid modifying the original
    updated_quote = json.loads(json.dumps(quote))
    
    # Assign clinic
    updated_quote["clinicId"] = clinic_id
    updated_quote["clinicName"] = clinic["name"]
    
    # In a real app, save the updated quote to the database
    # For this demo, we update the sample data
    for i, q in enumerate(SAMPLE_QUOTES):
        if q["id"] == quote_id:
            SAMPLE_QUOTES[i] = updated_quote
    
    return jsonify({
        "success": True,
        "quote": updated_quote
    })

# Clinic portal routes - simplified versions
@integration_bp.route('/clinic/quotes', methods=['GET'])
def get_clinic_quotes():
    """Get all quotes for the current clinic"""
    # In a real app, filter by the current authenticated clinic
    return jsonify({
        "success": True,
        "quotes": SAMPLE_QUOTES
    })

@integration_bp.route('/clinic/quotes/<quote_id>', methods=['GET'])
def get_clinic_quote(quote_id):
    """Get a specific quote for the current clinic"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    return jsonify({
        "success": True,
        "quote": quote
    })

@integration_bp.route('/clinic/quotes/<quote_id>/send-email', methods=['POST'])
def send_quote_email(quote_id):
    """Send a quote to the patient by email"""
    quote = get_quote_by_id(quote_id)
    
    if not quote:
        return jsonify({
            "success": False,
            "message": "Quote not found"
        }), 404
    
    # In a real app, send an email
    # For this demo, just return success
    return jsonify({
        "success": True,
        "message": f"Email would be sent to {quote['patientEmail']} in a real app"
    })