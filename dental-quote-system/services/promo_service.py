"""
Promo Service Module
Handles promotional offers and discount codes
"""
import json
import os
from pathlib import Path
from datetime import datetime

# Get the promotions data path
PROMOTIONS_DATA_PATH = Path(__file__).parent.parent / "data" / "promotions.json"

def load_promotions():
    """Load promotions from JSON file"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(PROMOTIONS_DATA_PATH), exist_ok=True)
        
        # Check if the file exists, if not create a sample one
        if not os.path.exists(PROMOTIONS_DATA_PATH):
            sample_promos = generate_sample_promotions()
            with open(PROMOTIONS_DATA_PATH, 'w') as f:
                json.dump(sample_promos, f, indent=2)
            return sample_promos
        
        # Load the file if it exists
        with open(PROMOTIONS_DATA_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading promotions: {e}")
        return generate_sample_promotions()

def generate_sample_promotions():
    """Generate sample promotions data"""
    current_date = datetime.now().isoformat()
    
    return [
        {
            "id": "summer_special",
            "promo_code": "SUMMER15",
            "title": "Summer Special Discount",
            "description": "Get 15% off on all dental treatments this summer",
            "discount_type": "percentage",
            "discount_value": 15,
            "start_date": current_date,
            "end_date": "2025-09-30T00:00:00Z",
            "minimum_order": 0,
            "is_active": True,
            "clinic_name": "All Partner Clinics",
            "treatments": ["All treatments"],
            "valid_until": "September 30, 2025",
            "image": "/static/images/promos/summer_special.jpg"
        },
        {
            "id": "new_patient",
            "promo_code": "NEWPATIENT",
            "title": "New Patient Offer",
            "description": "First-time patients receive 20% off any treatment package",
            "discount_type": "percentage", 
            "discount_value": 20,
            "start_date": current_date,
            "end_date": "2025-12-31T00:00:00Z",
            "minimum_order": 500,
            "is_active": True,
            "clinic_name": "DentSpa Istanbul",
            "treatments": ["All treatments"],
            "valid_until": "December 31, 2025",
            "image": "/static/images/promos/new_patient.jpg"
        },
        {
            "id": "dental_crown",
            "promo_code": "DENTAL25",
            "title": "Dental Crown Special",
            "description": "25% discount on all dental crown treatments",
            "discount_type": "percentage",
            "discount_value": 25,
            "start_date": current_date,
            "end_date": "2025-08-31T00:00:00Z",
            "minimum_order": 0,
            "is_active": True,
            "clinic_name": "Crown Specialists",
            "treatments": ["Dental Crown", "Full Porcelain Crown", "Zirconia Crown"],
            "valid_until": "August 31, 2025",
            "image": "/static/images/promos/dental_crown.jpg"
        },
        {
            "id": "test_code",
            "promo_code": "TEST10",
            "title": "Test Promotion",
            "description": "10% off for testing purposes",
            "discount_type": "percentage",
            "discount_value": 10,
            "start_date": current_date,
            "end_date": "2025-12-31T00:00:00Z",
            "minimum_order": 0,
            "is_active": True,
            "clinic_name": "Test Clinic",
            "treatments": ["All treatments"],
            "valid_until": "December 31, 2025",
            "image": "/static/images/promos/test_promo.jpg"
        },
        {
            "id": "free_consultation",
            "promo_code": "FREECONSULT",
            "title": "Free Consultation Package",
            "description": "Book a dental treatment and get free pre-consultation and aftercare support",
            "discount_type": "fixed_amount",
            "discount_value": 150,
            "start_date": current_date,
            "end_date": "2025-12-31T00:00:00Z",
            "minimum_order": 1000,
            "is_active": True,
            "clinic_name": "Premium Dental Istanbul",
            "treatments": ["Dental Implant", "Veneers", "Full Mouth Reconstruction"],
            "valid_until": "December 31, 2025",
            "image": "/static/images/promos/free_consultation.jpg"
        },
        {
            "id": "hotel_discount",
            "promo_code": "LUXHOTEL20",
            "title": "Premium Hotel Deal",
            "description": "20% off on premium hotels with your dental treatment booking",
            "discount_type": "percentage",
            "discount_value": 20,
            "start_date": current_date,
            "end_date": "2025-10-31T00:00:00Z",
            "minimum_order": 1000,
            "is_active": True,
            "clinic_name": "Luxury Dental",
            "treatments": ["Dental Implant", "Veneers", "Crowns"],
            "valid_until": "October 31, 2025",
            "image": "/static/images/promos/hotel_discount.jpg"
        },
        {
            "id": "implant_crown_bundle",
            "promo_code": "IMPLANTCROWN30",
            "title": "Implant + Crown Bundle",
            "description": "30% off when combining dental implant with crown treatment",
            "discount_type": "percentage",
            "discount_value": 30,
            "start_date": current_date,
            "end_date": "2025-09-30T00:00:00Z",
            "minimum_order": 0,
            "is_active": True,
            "clinic_name": "Implant Center Istanbul",
            "treatments": ["Dental Implant", "Dental Crown"],
            "valid_until": "September 30, 2025",
            "image": "/static/images/promos/implant_crown.jpg"
        },
        {
            "id": "free_whitening",
            "promo_code": "FREEWHITE",
            "title": "Free Teeth Whitening",
            "description": "Free professional teeth whitening with any veneer or crown package",
            "discount_type": "fixed_amount",
            "discount_value": 200,
            "start_date": current_date,
            "end_date": "2025-08-31T00:00:00Z",
            "minimum_order": 1000,
            "is_active": True,
            "clinic_name": "White Smile Dental",
            "treatments": ["Veneers", "Crowns", "Hollywood Smile"],
            "valid_until": "August 31, 2025",
            "image": "/static/images/promos/free_whitening.jpg"
        }
    ]

def get_active_promotions():
    """Get all active promotions"""
    promotions = load_promotions()
    
    # Filter for active promotions only
    active = [promo for promo in promotions if promo.get('is_active', False)]
    
    return active

def get_promotion_by_code(promo_code):
    """Get a promotion by its promo code"""
    if not promo_code:
        return None
        
    promotions = load_promotions()
    
    # Find the matching promo code (case insensitive)
    for promo in promotions:
        if promo.get('promo_code', '').upper() == promo_code.upper() and promo.get('is_active', False):
            return promo
    
    return None

def validate_promo_code(promo_code, subtotal=0):
    """Validate a promo code and return status and message"""
    if not promo_code:
        return False, "No promo code provided"
    
    # Get the promotion
    promotion = get_promotion_by_code(promo_code)
    
    # Check if promo code exists
    if not promotion:
        return False, f"Promo code '{promo_code}' is invalid or expired"
    
    # Check if promotion is active
    is_active = promotion.get('is_active', False) if promotion else False
    if not is_active:
        return False, f"Promo code '{promo_code}' has expired"
    
    # Check minimum order value
    minimum_order = float(promotion.get('minimum_order', 0)) if promotion else 0
    if minimum_order > 0 and float(subtotal) < minimum_order:
        return False, f"This promo code requires a minimum order of ${minimum_order}"
    
    return True, "Promo code applied successfully"

def apply_promo_code(promo_code, subtotal=0):
    """Apply a promo code and return the discount details"""
    # Validate the promo code
    is_valid, message = validate_promo_code(promo_code, subtotal)
    
    if not is_valid:
        return {
            'success': False,
            'message': message,
            'promo_details': None
        }
    
    # Get the promotion details
    promo_details = get_promotion_by_code(promo_code)
    
    # Calculate the discount
    discount_type = promo_details.get('discount_type', '') if promo_details else ''
    discount_value = float(promo_details.get('discount_value', 0)) if promo_details else 0
    
    discount_amount = 0
    subtotal_float = float(subtotal)
    if discount_type == 'percentage':
        discount_amount = subtotal_float * (discount_value / 100)
    elif discount_type == 'fixed_amount':
        discount_amount = min(discount_value, subtotal_float)  # Don't allow negative totals
    
    # Return success response
    return {
        'success': True,
        'message': f"Promo code '{promo_code}' applied successfully",
        'promo_details': promo_details,
        'discount_amount': round(discount_amount, 2)
    }