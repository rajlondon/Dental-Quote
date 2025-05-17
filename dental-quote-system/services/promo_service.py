"""
Promo Code Service for Dental Quote System
Handles promo code validation, application and persistence
"""

import logging
import time

logger = logging.getLogger(__name__)

class PromoService:
    """Service to handle promo code operations"""
    
    # Dictionary of valid promo codes and their discount percentages
    VALID_PROMO_CODES = {
        'SUMMER15': 15,
        'DENTAL25': 25,
        'NEWPATIENT': 20,
        'TEST10': 10,
        'FREECONSULT': 0,  # Special offer, no direct discount
        'LUXHOTEL20': 20,
        'IMPLANTCROWN30': 30,
        'FREEWHITE': 0     # Special offer, no direct discount
    }
    
    # Special offers associated with promo codes
    SPECIAL_OFFERS = {
        'FREECONSULT': {
            'name': 'Free Consultation Package',
            'description': 'Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.',
            'offer_type': 'free_service',
            'value': 'Free consultation (value $75)',
            'treatment_requirements': ['dental_implant_standard', 'porcelain_veneers', 'full_mouth_reconstruction']
        },
        'LUXHOTEL20': {
            'name': 'Premium Hotel Deal',
            'description': 'Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.',
            'offer_type': 'discount',
            'value': '20% off selected hotels',
            'minimum_treatment_value': 1000
        },
        'IMPLANTCROWN30': {
            'name': 'Implant + Crown Package',
            'description': 'Get 30% off when you combine a dental implant with a crown restoration. Our most popular combination treatment.',
            'offer_type': 'combo_discount',
            'value': '30% off implant + crown combo',
            'required_treatments': ['dental_implant_standard', 'dental_crowns']
        },
        'FREEWHITE': {
            'name': 'Free Teeth Whitening',
            'description': 'Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.',
            'offer_type': 'free_service',
            'value': 'Free professional teeth whitening (value $280)',
            'treatment_requirements': ['porcelain_veneers', 'dental_crowns'],
            'minimum_quantity': 4
        }
    }
    
    @classmethod
    def validate_promo_code(cls, promo_code):
        """
        Validate a promo code and return the discount percentage
        
        Args:
            promo_code (str): Promo code to validate
            
        Returns:
            tuple: (is_valid, discount_percentage, error_message)
        """
        if not promo_code:
            return False, 0, "No promo code provided"
        
        promo_code = promo_code.strip().upper()
        
        if promo_code not in cls.VALID_PROMO_CODES:
            return False, 0, "Invalid promo code"
        
        # Get discount percentage
        discount_percent = cls.VALID_PROMO_CODES.get(promo_code, 0)
        
        return True, discount_percent, None
    
    @classmethod
    def get_special_offer_details(cls, promo_code):
        """
        Get special offer details for the promo code, like free consultation or hotel package
        
        Args:
            promo_code (str): Promo code to check
            
        Returns:
            dict: Special offer details or None
        """
        if not promo_code:
            return None
        
        promo_code = promo_code.strip().upper()
        
        # Return special offer details if available
        return cls.SPECIAL_OFFERS.get(promo_code)
    
    @classmethod
    def calculate_discount(cls, subtotal, discount_percent):
        """
        Calculate the discount amount based on subtotal and discount percentage
        
        Args:
            subtotal (float): Total amount before discount
            discount_percent (float): Discount percentage
            
        Returns:
            float: Discount amount
        """
        if subtotal <= 0 or discount_percent <= 0:
            return 0
        
        return (subtotal * discount_percent) / 100
    
    @classmethod
    def apply_discount(cls, subtotal, discount_amount):
        """
        Apply the discount to get the final total
        
        Args:
            subtotal (float): Total amount before discount
            discount_amount (float): Discount amount
            
        Returns:
            float: Final total after discount
        """
        if subtotal <= 0:
            return 0
        
        if discount_amount >= subtotal:
            # Discount can't be more than the subtotal
            return 0
        
        return subtotal - discount_amount
    
    @classmethod
    def is_package_promo(cls, promo_code):
        """
        Check if the promo code is for a treatment package
        
        Args:
            promo_code (str): Promo code to check
            
        Returns:
            bool: True if it's a package promo
        """
        if not promo_code:
            return False
        
        promo_code = promo_code.strip().upper()
        special_offer = cls.get_special_offer_details(promo_code)
        
        if not special_offer:
            return False
        
        return special_offer.get('offer_type') == 'combo_discount'