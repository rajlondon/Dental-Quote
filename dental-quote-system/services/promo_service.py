"""
Promo Service Module
Provides functions and data for handling promotional codes
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Define available promo codes
PROMO_CODES = {
    "SUMMER15": {
        "code": "SUMMER15",
        "discount_type": "percentage",
        "discount_value": 15,
        "min_purchase": 100,
        "max_discount": 500,
        "applicable_treatments": None,  # Applies to all treatments
        "description": "15% off your dental treatment when spending $100 or more",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Summer Special Discount",
        "banner_image": "/static/images/promos/summer.jpg",
        "terms_conditions": "Cannot be combined with other offers. Valid once per patient."
    },
    "DENTAL25": {
        "code": "DENTAL25",
        "discount_type": "percentage",
        "discount_value": 25,
        "min_purchase": 1000,
        "max_discount": 1000,
        "applicable_treatments": None,  # Applies to all treatments
        "description": "Save 25% on any dental treatment over $1,000",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Big Savings Discount",
        "banner_image": "/static/images/promos/dental25.jpg",
        "terms_conditions": "Cannot be combined with other offers. Valid on first visit only."
    },
    "NEWPATIENT": {
        "code": "NEWPATIENT",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_purchase": 0,
        "max_discount": 300,
        "applicable_treatments": None,  # Applies to all treatments
        "description": "20% discount for new patients on their first treatment",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "New Patient Welcome Discount",
        "banner_image": "/static/images/promos/newpatient.jpg",
        "terms_conditions": "For first-time patients only. Cannot be combined with other offers."
    },
    "TEST10": {
        "code": "TEST10",
        "discount_type": "percentage",
        "discount_value": 10,
        "min_purchase": 0,
        "max_discount": 1000,
        "applicable_treatments": None,  # Applies to all treatments
        "description": "10% test discount code for any treatment",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Test Discount",
        "banner_image": "/static/images/promos/default.jpg",
        "terms_conditions": "Test purposes only."
    },
    "FREECONSULT": {
        "code": "FREECONSULT",
        "discount_type": "fixed_amount",
        "discount_value": 75,
        "min_purchase": 0,
        "max_discount": 75,
        "applicable_treatments": [
            "dental_implant_standard", 
            "porcelain_veneers", 
            "full_mouth_reconstruction"
        ],
        "description": "Free consultation worth $75 with selected treatments",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Free Consultation Package",
        "banner_image": "/static/images/promos/freeconsult.jpg",
        "terms_conditions": "Applicable for new patients only. One consultation per patient."
    },
    "LUXHOTEL20": {
        "code": "LUXHOTEL20",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_purchase": 1000,
        "max_discount": 500,
        "applicable_treatments": [
            "dental_implant_standard", 
            "porcelain_veneers", 
            "dental_crowns"
        ],
        "description": "Save up to 20% on premium hotels with your dental treatment booking",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Premium Hotel Deal",
        "banner_image": "/static/images/promos/luxhotel.jpg",
        "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability."
    },
    "IMPLANTCROWN30": {
        "code": "IMPLANTCROWN30",
        "discount_type": "percentage",
        "discount_value": 30,
        "min_purchase": 0,
        "max_discount": 1000,
        "applicable_treatments": [
            "dental_implant_standard", 
            "dental_crowns"
        ],
        "description": "Get a special bundle price when combining dental implant with a crown",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Dental Implant + Crown Bundle",
        "banner_image": "/static/images/promos/implantcrown.jpg",
        "terms_conditions": "Valid for single tooth implant and crown combinations only."
    },
    "FREEWHITE": {
        "code": "FREEWHITE",
        "discount_type": "fixed_amount",
        "discount_value": 150,
        "min_purchase": 800,
        "max_discount": 150,
        "applicable_treatments": [
            "porcelain_veneers", 
            "dental_crowns", 
            "hollywood_smile"
        ],
        "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "active": True,
        "title": "Free Teeth Whitening",
        "banner_image": "/static/images/promos/freewhite.jpg",
        "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers."
    }
}

def get_promotion_by_code(promo_code):
    """Get a promotion by its code"""
    if not promo_code:
        return None
    
    # Standardize the code
    promo_code = promo_code.strip().upper()
    
    # Check if the code exists
    promotion = PROMO_CODES.get(promo_code)
    
    if not promotion:
        return None
    
    # Check if the promotion is active
    if not promotion.get('active', False):
        return None
    
    # Check if the promotion is within date range
    current_date = datetime.now().strftime('%Y-%m-%d')
    if promotion.get('start_date') and promotion.get('end_date'):
        if current_date < promotion['start_date'] or current_date > promotion['end_date']:
            return None
    
    return promotion

def validate_promo_code(promo_code, subtotal):
    """Validate a promo code"""
    # Get the promotion details
    promotion = get_promotion_by_code(promo_code)
    
    # If no promotion found or not active
    if not promotion:
        return {
            'valid': False,
            'message': f"Promo code '{promo_code}' is invalid or expired"
        }
    
    # Check minimum purchase requirement
    min_purchase = promotion.get('min_purchase', 0)
    if subtotal < min_purchase:
        return {
            'valid': False,
            'message': f"This promo code requires a minimum purchase of ${min_purchase}"
        }
    
    return {
        'valid': True,
        'message': f"Promo code '{promo_code}' is valid",
        'promotion': promotion
    }

def calculate_discount(promo_code, treatments, subtotal):
    """Calculate discount amount for a promo code"""
    # Get the promotion details
    promotion = get_promotion_by_code(promo_code)
    
    # Default return values
    result = {
        'promo_code': promo_code,
        'promo_details': promotion,
        'discount_amount': 0,
        'discount_type': promotion.get('discount_type') if promotion else None,
        'applied_to': []
    }
    
    # If no valid promotion or no treatments, return zero discount
    if not promotion or not treatments:
        return result
    
    # Get applicable treatments
    applicable_treatments = promotion.get('applicable_treatments')
    
    # Calculate discount based on type
    discount_type = promotion.get('discount_type')
    discount_value = promotion.get('discount_value', 0)
    max_discount = promotion.get('max_discount', float('inf'))
    
    # Filter treatments that are applicable for this promotion
    eligible_items = []
    eligible_subtotal = 0
    
    for treatment in treatments:
        treatment_id = treatment.get('id')
        
        # If no specific treatment restrictions or this treatment is applicable
        if not applicable_treatments or treatment_id in applicable_treatments:
            treatment_subtotal = treatment.get('price', 0) * treatment.get('quantity', 1)
            eligible_items.append({
                'id': treatment_id,
                'name': treatment.get('name'),
                'amount': treatment_subtotal
            })
            eligible_subtotal += treatment_subtotal
    
    # Calculate discount amount
    discount_amount = 0
    
    if discount_type == 'percentage':
        discount_amount = (eligible_subtotal * discount_value) / 100
    elif discount_type == 'fixed_amount':
        discount_amount = discount_value if eligible_subtotal > 0 else 0
    
    # Cap the discount at the maximum allowed
    if discount_amount > max_discount:
        discount_amount = max_discount
    
    # Round to 2 decimal places
    discount_amount = round(discount_amount, 2)
    
    # Update result
    result['discount_amount'] = discount_amount
    result['applied_to'] = eligible_items
    
    logger.info(f"Calculated discount for {promo_code}: ${discount_amount}")
    return result

def get_active_promotions():
    """Get all active promotions"""
    current_date = datetime.now().strftime('%Y-%m-%d')
    active_promos = []
    
    for code, promo in PROMO_CODES.items():
        # Check if the promotion is active and within date range
        if (promo.get('active', False) and
            current_date >= promo.get('start_date', '2000-01-01') and
            current_date <= promo.get('end_date', '2100-12-31')):
            active_promos.append(promo)
    
    return active_promos