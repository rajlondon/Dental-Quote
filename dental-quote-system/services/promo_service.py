"""
Promo Service Module
Handles promotional offers and discount codes
"""
import json
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Promotions data file path
PROMOTIONS_DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'promotions.json')

def load_promotions():
    """Load promotions from JSON file or generate sample data if file doesn't exist"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(PROMOTIONS_DATA_FILE), exist_ok=True)
    
    # If file doesn't exist, generate sample data
    if not os.path.exists(PROMOTIONS_DATA_FILE):
        logger.info("Promotions data file not found. Generating sample data.")
        promotions = generate_sample_promotions()
        save_promotions(promotions)
        return promotions
    
    # Load from file
    try:
        with open(PROMOTIONS_DATA_FILE, 'r') as file:
            promotions = json.load(file)
        logger.info(f"Loaded {len(promotions)} promotions from file")
        return promotions
    except Exception as e:
        logger.error(f"Error loading promotions from file: {e}")
        promotions = generate_sample_promotions()
        save_promotions(promotions)
        return promotions

def save_promotions(promotions):
    """Save promotions to JSON file"""
    try:
        with open(PROMOTIONS_DATA_FILE, 'w') as file:
            json.dump(promotions, file, indent=2)
        logger.info(f"Saved {len(promotions)} promotions to file")
        return True
    except Exception as e:
        logger.error(f"Error saving promotions to file: {e}")
        return False

def generate_sample_promotions():
    """Generate sample promotions data"""
    now = datetime.now().isoformat()
    
    promotions = [
        {
            "id": "summer15",
            "code": "SUMMER15",
            "description": "Summer Special: 15% off all dental treatments",
            "discount_type": "percentage",
            "discount_value": 15,
            "minimum_order": 0,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 0,
            "current_uses": 0,
            "applicable_treatments": []  # Empty array means applicable to all treatments
        },
        {
            "id": "dental25",
            "code": "DENTAL25",
            "description": "Dental Tourism Discount: 25% off for international patients",
            "discount_type": "percentage",
            "discount_value": 25,
            "minimum_order": 1000,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 100,
            "current_uses": 0,
            "applicable_treatments": []
        },
        {
            "id": "newpatient",
            "code": "NEWPATIENT",
            "description": "New Patient Special: 20% off your first treatment",
            "discount_type": "percentage",
            "discount_value": 20,
            "minimum_order": 0,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 0,
            "current_uses": 0,
            "applicable_treatments": []
        },
        {
            "id": "test10",
            "code": "TEST10",
            "description": "Test promotion code: 10% off all treatments",
            "discount_type": "percentage",
            "discount_value": 10,
            "minimum_order": 0,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 0,
            "current_uses": 0,
            "applicable_treatments": []
        },
        {
            "id": "freeconsult",
            "code": "FREECONSULT",
            "description": "Free dental consultation with any treatment",
            "discount_type": "fixed_amount",
            "discount_value": 100,
            "minimum_order": 500,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 0,
            "current_uses": 0,
            "applicable_treatments": []
        },
        {
            "id": "luxhotel20",
            "code": "LUXHOTEL20",
            "description": "20% off luxury hotel stay with dental treatment",
            "discount_type": "percentage",
            "discount_value": 20,
            "minimum_order": 1000,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 50,
            "current_uses": 0,
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"]
        },
        {
            "id": "implantcrown30",
            "code": "IMPLANTCROWN30",
            "description": "30% off when combining dental implant with crown",
            "discount_type": "percentage",
            "discount_value": 30,
            "minimum_order": 0,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 0,
            "current_uses": 0,
            "applicable_treatments": ["dental_implant_standard", "dental_crowns"]
        },
        {
            "id": "freewhite",
            "code": "FREEWHITE",
            "description": "Free teeth whitening with veneer or crown package",
            "discount_type": "fixed_amount",
            "discount_value": 200,
            "minimum_order": 1200,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "is_active": True,
            "max_uses": 0,
            "current_uses": 0,
            "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"]
        }
    ]
    
    # Add special offers (used for displaying promotions on the special offers page)
    special_offers = [
        {
            "id": "special_offer_1",
            "title": "Free Consultation Package",
            "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
            "promo_code": "FREECONSULT",
            "discount_type": "fixed_amount",
            "discount_value": 100,
            "banner_image": "/static/images/promos/free_consultation.jpg",
            "is_active": True,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "terms_conditions": "Applicable for new patients only. One consultation per patient.",
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"]
        },
        {
            "id": "special_offer_2",
            "title": "Premium Hotel Deal",
            "description": "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
            "promo_code": "LUXHOTEL20",
            "discount_type": "percentage",
            "discount_value": 20,
            "banner_image": "/static/images/promos/luxury_hotel.jpg",
            "is_active": True,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"]
        },
        {
            "id": "special_offer_3",
            "title": "Dental Implant + Crown Bundle",
            "description": "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
            "promo_code": "IMPLANTCROWN30",
            "discount_type": "percentage",
            "discount_value": 30,
            "banner_image": "/static/images/promos/implant_crown_bundle.jpg",
            "is_active": True,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "terms_conditions": "Valid for single tooth implant and crown combinations only.",
            "applicable_treatments": ["dental_implant_standard", "dental_crowns"]
        },
        {
            "id": "special_offer_4",
            "title": "Free Teeth Whitening",
            "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.",
            "promo_code": "FREEWHITE",
            "discount_type": "fixed_amount",
            "discount_value": 200,
            "banner_image": "/static/images/promos/free_whitening.jpg",
            "is_active": True,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
            "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"]
        },
        {
            "id": "special_offer_5",
            "title": "Luxury Airport Transfer",
            "description": "Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.",
            "promo_code": "LUXTRAVEL",
            "discount_type": "fixed_amount",
            "discount_value": 80,
            "banner_image": "/static/images/promos/airport_transfer.jpg",
            "is_active": True,
            "start_date": now,
            "end_date": "2025-12-31T00:00:00",
            "terms_conditions": "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.",
            "applicable_treatments": ["full_mouth_reconstruction", "hollywood_smile", "all_on_4_implants"]
        }
    ]
    
    # Combine promotions and special offers
    all_promotions = {
        "promo_codes": promotions,
        "special_offers": special_offers
    }
    
    return all_promotions

def get_active_promotions():
    """Get all active promotions"""
    promotions = load_promotions()
    
    # Handle the case where promotions might be a dictionary with keys
    if isinstance(promotions, dict) and 'special_offers' in promotions:
        offers = promotions.get('special_offers', [])
        return [offer for offer in offers if offer.get('is_active', False)]
    
    # Handle direct list of promotions (older format)
    return [promo for promo in promotions if promo.get('is_active', False)]

def get_promotion_by_code(promo_code):
    """Get a promotion by its promo code"""
    if not promo_code:
        return None
    
    promotions = load_promotions()
    
    # Handle the case where promotions might be a dictionary with keys
    if isinstance(promotions, dict):
        # Check promo_codes first
        for promo in promotions.get('promo_codes', []):
            if promo.get('code', '').upper() == promo_code.upper() and promo.get('is_active', False):
                return promo
        
        # Then check special_offers
        for offer in promotions.get('special_offers', []):
            if offer.get('promo_code', '').upper() == promo_code.upper() and offer.get('is_active', False):
                return offer
    else:
        # Handle direct list of promotions (older format)
        for promo in promotions:
            if (promo.get('code', '').upper() == promo_code.upper() or 
                promo.get('promo_code', '').upper() == promo_code.upper()) and promo.get('is_active', False):
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
        'message': "Promo code applied successfully",
        'promo_details': promo_details,
        'discount_amount': discount_amount
    }