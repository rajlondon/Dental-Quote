"""
Promo Service Module
Handles promotional codes and special offers for the dental quote system
"""
import datetime

# Predefined promo codes
PROMO_CODES = {
    'SUMMER15': {
        'code': 'SUMMER15',
        'description': 'Summer Discount 15%',
        'discount_type': 'percentage',
        'discount_value': 15,
        'valid_until': datetime.date(2025, 9, 1)
    },
    'DENTAL25': {
        'code': 'DENTAL25',
        'description': 'Dental Care Discount 25%',
        'discount_type': 'percentage',
        'discount_value': 25,
        'valid_until': datetime.date(2025, 12, 31)
    },
    'NEWPATIENT': {
        'code': 'NEWPATIENT',
        'description': 'New Patient Discount 20%',
        'discount_type': 'percentage',
        'discount_value': 20,
        'valid_until': datetime.date(2025, 12, 31)
    },
    'TEST10': {
        'code': 'TEST10',
        'description': 'Test Discount 10%',
        'discount_type': 'percentage',
        'discount_value': 10,
        'valid_until': datetime.date(2025, 12, 31)
    },
    'FREECONSULT': {
        'code': 'FREECONSULT',
        'description': 'Free Consultation Package',
        'discount_type': 'fixed_amount',
        'discount_value': 100,
        'valid_until': datetime.date(2025, 8, 31)
    },
    'LUXHOTEL20': {
        'code': 'LUXHOTEL20',
        'description': 'Premium Hotel Deal 20%',
        'discount_type': 'percentage',
        'discount_value': 20,
        'valid_until': datetime.date(2025, 8, 31)
    },
    'IMPLANTCROWN30': {
        'code': 'IMPLANTCROWN30',
        'description': 'Dental Implant + Crown Bundle 30%',
        'discount_type': 'percentage',
        'discount_value': 30,
        'valid_until': datetime.date(2025, 7, 31)
    },
    'FREEWHITE': {
        'code': 'FREEWHITE',
        'description': 'Free Teeth Whitening',
        'discount_type': 'fixed_amount',
        'discount_value': 150,
        'valid_until': datetime.date(2025, 8, 31)
    },
    'LUXTRAVEL': {
        'code': 'LUXTRAVEL',
        'description': 'Luxury Airport Transfer',
        'discount_type': 'fixed_amount',
        'discount_value': 80,
        'valid_until': datetime.date(2025, 9, 30)
    }
}

# Special offers
SPECIAL_OFFERS = [
    {
        'id': '1',
        'title': 'Free Consultation Package',
        'description': 'Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.',
        'clinic_name': 'DentSpa Istanbul',
        'treatments': ['Dental Implants', 'Veneers', 'Full Mouth Reconstruction'],
        'promo_code': 'FREECONSULT',
        'valid_until': 'August 31, 2025',
        'image': '/static/images/offer-placeholder.jpg'
    },
    {
        'id': '2',
        'title': 'Premium Hotel Deal',
        'description': 'Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.',
        'clinic_name': 'Istanbul Dental Excellence',
        'treatments': ['Dental Implants', 'Veneers', 'Crowns'],
        'promo_code': 'LUXHOTEL20',
        'valid_until': 'August 31, 2025',
        'image': '/static/images/offer-placeholder.jpg'
    },
    {
        'id': '3',
        'title': 'Dental Implant + Crown Bundle',
        'description': 'Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.',
        'clinic_name': 'Maltepe Dental Clinic',
        'treatments': ['Dental Implants', 'Crowns'],
        'promo_code': 'IMPLANTCROWN30',
        'valid_until': 'July 31, 2025',
        'image': '/static/images/offer-placeholder.jpg'
    },
    {
        'id': '4',
        'title': 'Luxury Airport Transfer',
        'description': 'Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.',
        'clinic_name': 'Beyaz Ada Clinic',
        'treatments': ['Full Mouth Reconstruction', 'Hollywood Smile', 'All-on-4 Implants'],
        'promo_code': 'LUXTRAVEL',
        'valid_until': 'September 30, 2025',
        'image': '/static/images/offer-placeholder.jpg'
    },
    {
        'id': '5',
        'title': 'Free Teeth Whitening',
        'description': 'Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.',
        'clinic_name': 'Istanbul Dental Smile',
        'treatments': ['Veneers', 'Crowns', 'Hollywood Smile'],
        'promo_code': 'FREEWHITE',
        'valid_until': 'August 31, 2025',
        'image': '/static/images/offer-placeholder.jpg'
    }
]

def verify_promo_code(code):
    """
    Verify if a promo code is valid and return its details
    
    Args:
        code (str): The promo code to verify
        
    Returns:
        dict or None: The promo code details if valid, None otherwise
    """
    # Convert code to uppercase for case-insensitive comparison
    code = code.upper()
    
    # Check if code exists
    if code not in PROMO_CODES:
        return None
    
    promo = PROMO_CODES[code]
    
    # Check if code is still valid
    today = datetime.date.today()
    if today > promo['valid_until']:
        return None
    
    return promo

def get_offers():
    """
    Get all special offers
    
    Returns:
        list: List of special offers
    """
    return SPECIAL_OFFERS