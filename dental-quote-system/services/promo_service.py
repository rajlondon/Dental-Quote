"""
Promo Code Service for Dental Quote System
Handles promo code validation, application, and discount calculation
"""

import logging

logger = logging.getLogger(__name__)

class PromoService:
    """
    Service to manage promo codes and calculate discounts
    """
    
    # Available promo codes and their discount values
    PROMO_CODES = {
        'SUMMER15': {'type': 'percentage', 'value': 15, 'description': 'Summer 15% Off'},
        'DENTAL25': {'type': 'percentage', 'value': 25, 'description': 'Dental 25% Off'},
        'NEWPATIENT': {'type': 'percentage', 'value': 20, 'description': 'New Patient 20% Off'},
        'TEST10': {'type': 'percentage', 'value': 10, 'description': 'Test 10% Off'},
        'FREECONSULT': {'type': 'fixed_amount', 'value': 100, 'description': 'Free Consultation ($100 value)'},
        'LUXHOTEL20': {'type': 'percentage', 'value': 20, 'description': 'Luxury Hotel 20% Off'},
        'IMPLANTCROWN30': {'type': 'percentage', 'value': 30, 'description': 'Implant & Crown 30% Off'},
        'FREEWHITE': {'type': 'fixed_amount', 'value': 150, 'description': 'Free Teeth Whitening ($150 value)'}
    }
    
    @staticmethod
    def validate_promo_code(code):
        """
        Validate if a promo code exists and return its discount details
        
        Args:
            code (str): The promo code to validate
            
        Returns:
            dict or None: Promo code details if valid, None otherwise
        """
        if not code:
            return None
            
        # Normalize code to uppercase
        normalized_code = code.strip().upper()
        
        # Check if code exists
        if normalized_code in PromoService.PROMO_CODES:
            promo_details = PromoService.PROMO_CODES[normalized_code].copy()
            promo_details['code'] = normalized_code
            logger.info(f"Valid promo code applied: {normalized_code}")
            return promo_details
            
        logger.warning(f"Invalid promo code attempted: {normalized_code}")
        return None
    
    @staticmethod
    def calculate_discount(promo_details, subtotal):
        """
        Calculate the discount amount based on promo type and subtotal
        
        Args:
            promo_details (dict): Promo code details
            subtotal (float): Current subtotal amount
            
        Returns:
            float: Calculated discount amount
        """
        if not promo_details:
            return 0
            
        discount_type = promo_details.get('type')
        discount_value = promo_details.get('value', 0)
        
        if discount_type == 'percentage':
            # Percentage discount
            discount = (subtotal * discount_value) / 100
            logger.info(f"Applied {discount_value}% discount: ${discount:.2f}")
            return discount
        elif discount_type == 'fixed_amount':
            # Fixed amount discount
            logger.info(f"Applied fixed discount: ${discount_value:.2f}")
            return min(discount_value, subtotal)  # Don't exceed subtotal
        
        return 0
    
    @staticmethod
    def get_special_offers():
        """
        Get list of special offers to display
        
        Returns:
            list: List of special offer dictionaries
        """
        offers = [
            {
                'id': 1,
                'name': 'Summer Special',
                'promo_code': 'SUMMER15',
                'description': 'Get 15% off on all dental treatments this summer!',
                'discount_type': 'percentage',
                'discount_value': '15%',
                'applicable_treatments': ['Dental Cleaning', 'Teeth Whitening', 'Root Canal'],
                'terms': 'Valid through August 31, 2025. Cannot be combined with other offers.',
                'image_url': '/static/images/summer-special.jpg'
            },
            {
                'id': 2,
                'name': 'New Patient Offer',
                'promo_code': 'NEWPATIENT',
                'description': 'New patients receive 20% off on their first treatment!',
                'discount_type': 'percentage',
                'discount_value': '20%',
                'applicable_treatments': ['All Treatments'],
                'terms': 'Available for first-time patients only. ID verification required.',
                'image_url': '/static/images/new-patient.jpg'
            },
            {
                'id': 3,
                'name': 'Free Consultation',
                'promo_code': 'FREECONSULT',
                'description': 'Book any treatment and get a free pre-treatment consultation!',
                'discount_type': 'fixed_amount',
                'discount_value': '$100',
                'applicable_treatments': ['Dental Implants', 'Veneers', 'Full Mouth Reconstruction'],
                'terms': 'One consultation per patient. Must book a qualifying treatment.',
                'image_url': '/static/images/free-consult.jpg'
            },
            {
                'id': 4,
                'name': 'Implant + Crown Bundle',
                'promo_code': 'IMPLANTCROWN30',
                'description': 'Save 30% when bundling dental implant with crown treatments.',
                'discount_type': 'percentage',
                'discount_value': '30%',
                'applicable_treatments': ['Dental Implants', 'Dental Crowns'],
                'terms': 'For single tooth implant and crown combinations only.',
                'image_url': '/static/images/implant-crown.jpg'
            },
            {
                'id': 5,
                'name': 'Luxury Hotel Deal',
                'promo_code': 'LUXHOTEL20',
                'description': 'Get 20% off select luxury hotels with your dental treatment booking.',
                'discount_type': 'percentage',
                'discount_value': '20%',
                'applicable_treatments': ['Dental Implants', 'Veneers', 'Dental Crowns'],
                'terms': 'Minimum treatment value of $1000 required. Subject to hotel availability.',
                'image_url': '/static/images/hotel-deal.jpg'
            },
            {
                'id': 6,
                'name': 'Free Teeth Whitening',
                'promo_code': 'FREEWHITE',
                'description': 'Get a free professional teeth whitening session with any veneer or crown package.',
                'discount_type': 'fixed_amount',
                'discount_value': '$150',
                'applicable_treatments': ['Veneers', 'Crowns', 'Hollywood Smile'],
                'terms': 'Minimum of 4 veneers or crowns required. Not combinable with other offers.',
                'image_url': '/static/images/teeth-whitening.jpg'
            }
        ]
        
        return offers