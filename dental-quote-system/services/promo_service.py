"""
Promo Code Service for Dental Quote System
Handles promo code validation, application and persistence
"""

import logging
import time

logger = logging.getLogger(__name__)

# Available promo codes and their discount percentages
PROMO_CODES = {
    'SUMMER15': 15,
    'DENTAL25': 25,
    'NEWPATIENT': 20,
    'TEST10': 10,
    'FREECONSULT': 100,  # Special code for free consultation
    'LUXHOTEL20': 20,    # Hotel package discount
    'IMPLANTCROWN30': 30, # Implant+Crown package discount
    'FREEWHITE': 100     # Free whitening with other treatments
}

class PromoService:
    """Service to handle promo code operations"""
    
    @staticmethod
    def validate_promo_code(promo_code):
        """
        Validate a promo code and return the discount percentage
        
        Args:
            promo_code (str): Promo code to validate
            
        Returns:
            tuple: (is_valid, discount_percentage, error_message)
        """
        if not promo_code:
            return False, 0, "No promo code provided"
        
        # Convert to uppercase for case-insensitive comparison
        normalized_code = promo_code.strip().upper()
        
        if normalized_code in PROMO_CODES:
            discount = PROMO_CODES[normalized_code]
            logger.info(f"Valid promo code: {normalized_code} with {discount}% discount")
            return True, discount, None
        else:
            logger.warning(f"Invalid promo code attempted: {normalized_code}")
            return False, 0, "Invalid promo code"
    
    @staticmethod
    def get_special_offer_details(promo_code):
        """
        Get special offer details for the promo code, like free consultation or hotel package
        
        Args:
            promo_code (str): Promo code to check
            
        Returns:
            dict: Special offer details or None
        """
        if not promo_code:
            return None
            
        normalized_code = promo_code.strip().upper()
        
        special_offers = {
            'FREECONSULT': {
                'type': 'service',
                'name': 'Free Consultation',
                'description': 'Includes pre-treatment consultation and post-treatment check-up'
            },
            'LUXHOTEL20': {
                'type': 'accommodation',
                'name': 'Premium Hotel Deal',
                'description': 'Save 20% on premium hotels with your dental treatment'
            },
            'IMPLANTCROWN30': {
                'type': 'package',
                'name': 'Implant + Crown Bundle',
                'description': 'Special bundle price for dental implant with crown'
            },
            'FREEWHITE': {
                'type': 'treatment',
                'name': 'Free Teeth Whitening',
                'description': 'Complimentary teeth whitening with veneer or crown package'
            }
        }
        
        return special_offers.get(normalized_code)
    
    @staticmethod
    def calculate_discount(subtotal, discount_percent):
        """
        Calculate the discount amount based on subtotal and discount percentage
        
        Args:
            subtotal (float): Total amount before discount
            discount_percent (float): Discount percentage
            
        Returns:
            float: Discount amount
        """
        if not discount_percent:
            return 0
            
        return (subtotal * discount_percent) / 100
    
    @staticmethod
    def apply_discount(subtotal, discount_amount):
        """
        Apply the discount to get the final total
        
        Args:
            subtotal (float): Total amount before discount
            discount_amount (float): Discount amount
            
        Returns:
            float: Final total after discount
        """
        return max(0, subtotal - discount_amount)
    
    @staticmethod
    def is_package_promo(promo_code):
        """
        Check if the promo code is for a treatment package
        
        Args:
            promo_code (str): Promo code to check
            
        Returns:
            bool: True if it's a package promo
        """
        if not promo_code:
            return False
            
        package_promos = ['IMPLANTCROWN30', 'LUXHOTEL20', 'FREEWHITE']
        normalized_code = promo_code.strip().upper()
        
        return normalized_code in package_promos