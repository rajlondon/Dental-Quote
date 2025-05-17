"""
Promo Service for Dental Quote System

Handles validation and application of promo codes and special offers.
"""

class PromoService:
    """
    Static class to handle promo code validation and special offer management.
    """
    
    # Valid promo codes with their details
    VALID_PROMO_CODES = {
        'SUMMER15': {'code': 'SUMMER15', 'type': 'percentage', 'value': 15, 'description': 'Summer discount 15% off'},
        'DENTAL25': {'code': 'DENTAL25', 'type': 'percentage', 'value': 25, 'description': 'Dental Special 25% off'},
        'NEWPATIENT': {'code': 'NEWPATIENT', 'type': 'percentage', 'value': 20, 'description': 'New Patient 20% off'},
        'TEST10': {'code': 'TEST10', 'type': 'percentage', 'value': 10, 'description': 'Test discount 10% off'},
        'FREECONSULT': {'code': 'FREECONSULT', 'type': 'fixed', 'value': 0, 'description': 'Free dental consultation'},
        'LUXHOTEL20': {'code': 'LUXHOTEL20', 'type': 'percentage', 'value': 20, 'description': 'Luxury Hotel Package 20% off'},
        'IMPLANTCROWN30': {'code': 'IMPLANTCROWN30', 'type': 'percentage', 'value': 30, 'description': 'Implant + Crown Bundle 30% off'},
        'FREEWHITE': {'code': 'FREEWHITE', 'type': 'product', 'value': 0, 'description': 'Free teeth whitening with any implant purchase'}
    }
    
    # Special offers with details
    SPECIAL_OFFERS = [
        {
            'id': 'free-consult',
            'title': 'Free Consultation Package',
            'description': 'Schedule a free dental consultation with one of our top specialists',
            'clinic_name': 'DentGroup International',
            'image': '/images/clinics/dentgroup.jpg',
            'promo_code': 'FREECONSULT',
            'valid_until': '2025-12-31',
            'treatments': ['Dental Consultation']
        },
        {
            'id': 'hotel-deal',
            'title': 'Premium Hotel Deal',
            'description': 'Get 20% off on all treatments plus 3 nights at a luxury hotel',
            'clinic_name': 'Istanbul Dental Clinic',
            'image': '/images/offers/premium-hotel-new.png',
            'promo_code': 'LUXHOTEL20',
            'valid_until': '2025-08-30',
            'treatments': ['All Treatments']
        },
        {
            'id': 'implant-crown',
            'title': 'Dental Implant + Crown Bundle',
            'description': 'Save 30% on our implant and crown package',
            'clinic_name': 'Premium Dental Spa',
            'image': '/images/treatments/illustrations/dental-implants1.png',
            'promo_code': 'IMPLANTCROWN30',
            'valid_until': '2025-09-15',
            'treatments': ['Dental Implant', 'Dental Crown']
        },
        {
            'id': 'airport-transfer',
            'title': 'Luxury Airport Transfer',
            'description': 'Book any treatment over $1000 and get free luxury airport transfers',
            'clinic_name': 'VIP Dental Care',
            'image': '/images/accommodations/premium-hotel.jpg',
            'promo_code': 'TEST10',
            'valid_until': '2025-10-31',
            'treatments': ['Premium Treatments']
        },
        {
            'id': 'free-whitening',
            'title': 'Free Teeth Whitening',
            'description': 'Get free teeth whitening with any dental implant treatment',
            'clinic_name': 'Bright Smile Dental',
            'image': '/images/treatments/illustrations/veneers-and-crowns.png',
            'promo_code': 'FREEWHITE',
            'valid_until': '2025-11-30',
            'treatments': ['Teeth Whitening', 'Dental Implant']
        }
    ]
    
    @staticmethod
    def validate_promo_code(code):
        """
        Validate a promo code
        
        Args:
            code (str): The promo code to validate
            
        Returns:
            dict: Promo details if valid, None if invalid
        """
        # Clean and normalize the code
        if not code:
            return None
            
        cleaned_code = code.strip().upper()
        
        # Check if code exists
        if cleaned_code in PromoService.VALID_PROMO_CODES:
            return PromoService.VALID_PROMO_CODES[cleaned_code]
        
        return None
    
    @staticmethod
    def get_all_special_offers():
        """
        Get all available special offers
        
        Returns:
            list: List of special offer details
        """
        return PromoService.SPECIAL_OFFERS
    
    @staticmethod
    def get_special_offer_by_id(offer_id):
        """
        Get a special offer by ID
        
        Args:
            offer_id (str): The ID of the special offer
            
        Returns:
            dict: Special offer details if found, None if not found
        """
        for offer in PromoService.SPECIAL_OFFERS:
            if offer['id'] == offer_id:
                return offer
        
        return None
    
    @staticmethod
    def get_special_offer_by_promo_code(promo_code):
        """
        Get a special offer by promo code
        
        Args:
            promo_code (str): The promo code to look for
            
        Returns:
            dict: Special offer details if found, None if not found
        """
        if not promo_code:
            return None
            
        cleaned_code = promo_code.strip().upper()
        
        for offer in PromoService.SPECIAL_OFFERS:
            if offer['promo_code'] == cleaned_code:
                return offer
        
        return None
    
    @staticmethod
    def calculate_discount(subtotal, promo_details):
        """
        Calculate discount amount based on promo details
        
        Args:
            subtotal (float): The subtotal before discount
            promo_details (dict): Promo code details
            
        Returns:
            float: Discount amount
        """
        if not promo_details:
            return 0
        
        if promo_details['type'] == 'percentage':
            return (subtotal * promo_details['value']) / 100
        elif promo_details['type'] == 'fixed':
            return min(promo_details['value'], subtotal)
        
        # For 'product' type promos (like free whitening), no direct discount
        return 0