"""
Promo Service Module
Handles promo code validation and processing
"""
import logging
import json
import os
import datetime
from decimal import Decimal

logger = logging.getLogger(__name__)

def get_active_promotions():
    """Get all active promotions
    
    Returns:
        list: Active promotions
    """
    promotions = _load_promotions()
    
    # Filter for active promotions
    current_date = datetime.datetime.now().isoformat()
    
    active_promotions = [
        promo for promo in promotions 
        if promo['is_active'] and 
        promo['start_date'] <= current_date and 
        promo['end_date'] >= current_date
    ]
    
    return active_promotions

def get_promotion_by_code(promo_code):
    """Get a promotion by its code
    
    Args:
        promo_code (str): Promotion code
        
    Returns:
        dict: Promotion details or None
    """
    promotions = _load_promotions()
    
    # Find the promotion with matching code
    for promo in promotions:
        if promo['promo_code'].upper() == promo_code.upper():
            return promo
    
    return None

def validate_promo_code(promo_code, subtotal=0):
    """Validate a promo code
    
    Args:
        promo_code (str): Promo code to validate
        subtotal (float): Current quote subtotal
        
    Returns:
        dict: Validation results with keys:
            - valid: bool
            - message: str
            - promo_details: dict or None
    """
    # Make sure promo_code is a string
    if not isinstance(promo_code, str):
        return {
            'valid': False,
            'message': 'Invalid promo code format.',
            'promo_details': None
        }
    
    # Convert to uppercase for case-insensitive comparison
    promo_code = promo_code.upper()
    
    # Get promotion by code
    promotion = get_promotion_by_code(promo_code)
    
    if not promotion:
        return {
            'valid': False,
            'message': f"Promo code '{promo_code}' not found.",
            'promo_details': None
        }
    
    # Check if promotion is active
    current_date = datetime.datetime.now().isoformat()
    
    if not promotion['is_active']:
        return {
            'valid': False,
            'message': f"Promo code '{promo_code}' is not active.",
            'promo_details': None
        }
    
    if promotion['start_date'] > current_date:
        return {
            'valid': False,
            'message': f"Promo code '{promo_code}' is not yet valid.",
            'promo_details': None
        }
    
    if promotion['end_date'] < current_date:
        return {
            'valid': False,
            'message': f"Promo code '{promo_code}' has expired.",
            'promo_details': None
        }
    
    # Check minimum purchase requirement
    min_purchase = promotion.get('min_purchase', 0)
    if min_purchase > 0 and subtotal < min_purchase:
        return {
            'valid': False,
            'message': f"Minimum purchase of ${min_purchase} required to use this promo code.",
            'promo_details': None
        }
    
    # If we got here, the promo code is valid
    promo_details = {
        'code': promo_code,
        'discount_type': promotion['discount_type'],
        'discount_value': promotion['discount_value'],
        'description': promotion['description'],
        'applicable_treatments': promotion.get('applicable_treatments', [])
    }
    
    return {
        'valid': True,
        'message': f"Promo code '{promo_code}' is valid.",
        'promo_details': promo_details
    }

def calculate_discount(promo_code, treatments, subtotal=0):
    """Calculate the discount amount for a promo code
    
    Args:
        promo_code (str): Promo code
        treatments (list): List of treatments in the quote
        subtotal (float): Current quote subtotal
        
    Returns:
        dict: Discount calculation results with keys:
            - success: bool
            - message: str
            - discount: float
            - promo_details: dict or None
    """
    # Validate the promo code first
    validation = validate_promo_code(promo_code, subtotal)
    
    if not validation['valid']:
        return {
            'success': False,
            'message': validation['message'],
            'discount': 0,
            'promo_details': None
        }
    
    # Get the promo details
    promo_details = validation['promo_details']
    
    # Calculate discount based on discount type
    discount = 0
    
    if promo_details['discount_type'] == 'percentage':
        discount = (subtotal * promo_details['discount_value']) / 100
    else:  # fixed_amount
        discount = min(subtotal, promo_details['discount_value'])  # Cap at subtotal
    
    return {
        'success': True,
        'message': f"Discount of ${discount:.2f} applied.",
        'discount': round(float(discount), 2),
        'promo_details': promo_details
    }

def _load_promotions():
    """Load promotions from JSON file
    
    Returns:
        list: Promotions
    """
    # Use mock promotions for development and testing
    promotions = [
        {
            "id": "1",
            "promo_code": "SUMMER15",
            "title": "Summer Special",
            "description": "Get 15% off on all dental treatments this summer.",
            "discount_type": "percentage",
            "discount_value": 15,
            "min_purchase": 0,
            "applicable_treatments": [],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/summer-special.jpg",
            "terms_conditions": "Cannot be combined with other offers. Valid for all treatments.",
            "promotion_level": "standard",
            "code": "SUMMER15"
        },
        {
            "id": "2",
            "promo_code": "DENTAL25",
            "title": "Premium Dental Package",
            "description": "Save 25% on premium dental packages including implants and veneers.",
            "discount_type": "percentage",
            "discount_value": 25,
            "min_purchase": 1000,
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers"],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/premium-package.jpg",
            "terms_conditions": "Minimum purchase of $1,000 required. Valid for implants and veneers only.",
            "promotion_level": "premium",
            "code": "DENTAL25"
        },
        {
            "id": "3",
            "promo_code": "NEWPATIENT",
            "title": "New Patient Discount",
            "description": "New patients get 20% off their first treatment.",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_purchase": 0,
            "applicable_treatments": [],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/new-patient.jpg",
            "terms_conditions": "Valid for first-time patients only. One use per patient.",
            "promotion_level": "standard",
            "code": "NEWPATIENT"
        },
        {
            "id": "4",
            "promo_code": "TEST10",
            "title": "Test Discount",
            "description": "10% off for testing purposes.",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_purchase": 0,
            "applicable_treatments": [],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/test-promo.jpg",
            "terms_conditions": "For testing purposes only.",
            "promotion_level": "standard",
            "code": "TEST10"
        },
        {
            "id": "5",
            "promo_code": "FREECONSULT",
            "title": "Free Consultation",
            "description": "Book a dental treatment and get a free consultation with our specialists.",
            "discount_type": "fixed_amount",
            "discount_value": 75,
            "min_purchase": 500,
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/free-consult.jpg",
            "terms_conditions": "Minimum purchase of $500 required. One consultation per patient.",
            "promotion_level": "premium",
            "code": "FREECONSULT"
        },
        {
            "id": "6",
            "promo_code": "LUXHOTEL20",
            "title": "Premium Hotel Deal",
            "description": "Save 20% on premium hotels with your dental treatment booking.",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_purchase": 1000,
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/hotel-deal.jpg",
            "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
            "promotion_level": "premium",
            "code": "LUXHOTEL20"
        },
        {
            "id": "7",
            "promo_code": "IMPLANTCROWN30",
            "title": "Implant + Crown Bundle",
            "description": "Save 30% on combined dental implant and crown treatments.",
            "discount_type": "percentage",
            "discount_value": 30,
            "min_purchase": 0,
            "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/implant-crown.jpg",
            "terms_conditions": "Valid only when both implant and crown services are selected.",
            "promotion_level": "featured",
            "code": "IMPLANTCROWN30"
        },
        {
            "id": "8",
            "promo_code": "FREEWHITE",
            "title": "Free Teeth Whitening",
            "description": "Get a free teeth whitening session with any veneer or crown package.",
            "discount_type": "fixed_amount",
            "discount_value": 150,
            "min_purchase": 800,
            "applicable_treatments": ["porcelain_veneers", "dental_crowns"],
            "start_date": "2025-01-01T00:00:00.000Z",
            "end_date": "2025-12-31T23:59:59.999Z",
            "is_active": True,
            "banner_image": "/static/images/promos/teeth-whitening.jpg",
            "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
            "promotion_level": "standard",
            "code": "FREEWHITE"
        }
    ]
    
    return promotions

def _save_promotions(promotions):
    """Save promotions to JSON file
    
    Args:
        promotions (list): Promotions to save
        
    Returns:
        bool: Success
    """
    try:
        promo_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'promotions.json')
        with open(promo_file, 'w') as f:
            json.dump(promotions, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving promotions: {e}")
        return False