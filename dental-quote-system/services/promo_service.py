"""
Promo Service for Dental Quote System

This service handles promo code management including:
- Validation of promo codes
- Applying discounts based on promo codes
- Managing special offers
"""

class PromoService:
    """
    Service for promo code validation and management
    
    This class handles all promo code-related operations, ensuring
    consistent behavior across all application areas.
    """
    
    # Available promo codes with their discount values
    PROMO_CODES = {
        'SUMMER15': {'type': 'percentage', 'value': 15, 'description': 'Summer Special - 15% off all treatments'},
        'DENTAL25': {'type': 'percentage', 'value': 25, 'description': 'Premium Discount - 25% off your quote'},
        'NEWPATIENT': {'type': 'percentage', 'value': 20, 'description': 'New Patient Special - 20% off your first treatment'},
        'TEST10': {'type': 'percentage', 'value': 10, 'description': 'Test Discount - 10% off all services'},
        'FREECONSULT': {'type': 'fixed', 'value': 100, 'description': 'Free Consultation ($100 value)'},
        'LUXHOTEL20': {'type': 'percentage', 'value': 20, 'description': 'Luxury Hotel Partner - 20% discount'},
        'IMPLANTCROWN30': {'type': 'percentage', 'value': 30, 'description': 'Implant & Crown Package - 30% off'},
        'FREEWHITE': {'type': 'fixed', 'value': 150, 'description': 'Free Whitening Treatment ($150 value)'}
    }
    
    # Special offers data
    SPECIAL_OFFERS = [
        {
            'id': 'offer1',
            'name': 'Premium Dental Package',
            'description': 'Get 25% off all premium dental services including implants, crowns, and veneers',
            'promo_code': 'DENTAL25',
            'image_url': '/static/images/premium-dental.jpg',
            'discount_type': 'percentage',
            'discount_value': 25,
            'terms': 'Valid for all treatments. Cannot be combined with other offers. Expires December 31, 2025.'
        },
        {
            'id': 'offer2',
            'name': 'New Patient Welcome',
            'description': 'New patients receive 20% off their first treatment plan',
            'promo_code': 'NEWPATIENT',
            'image_url': '/static/images/new-patient.jpg',
            'discount_type': 'percentage',
            'discount_value': 20,
            'terms': 'Valid for new patients only. One-time use. Expires December 31, 2025.'
        },
        {
            'id': 'offer3',
            'name': 'Free Consultation',
            'description': 'Book a free dental consultation (valued at $100)',
            'promo_code': 'FREECONSULT',
            'image_url': '/static/images/consultation.jpg',
            'discount_type': 'fixed',
            'discount_value': 100,
            'terms': 'One consultation per patient. Booking required. Subject to availability.'
        },
        {
            'id': 'offer4',
            'name': 'Summer Special',
            'description': 'Enjoy 15% off all dental treatments this summer',
            'promo_code': 'SUMMER15',
            'image_url': '/static/images/summer-special.jpg',
            'discount_type': 'percentage',
            'discount_value': 15,
            'terms': 'Valid for treatments booked before August 31, 2025. Cannot be combined with other offers.'
        },
        {
            'id': 'offer5',
            'name': 'Implant & Crown Package',
            'description': 'Save 30% on implant and crown package treatments',
            'promo_code': 'IMPLANTCROWN30',
            'image_url': '/static/images/implant-crown.jpg',
            'discount_type': 'percentage',
            'discount_value': 30,
            'terms': 'Valid for combined implant and crown treatments only. Limited time offer.'
        }
    ]
    
    @classmethod
    def validate_promo_code(cls, code):
        """
        Validate a promo code
        
        Args:
            code (str): Promo code to validate
            
        Returns:
            dict|None: Promo details if valid, None if invalid
        """
        # Standardize the code format
        formatted_code = code.strip().upper()
        
        # Check if code exists
        if formatted_code in cls.PROMO_CODES:
            promo_details = cls.PROMO_CODES[formatted_code]
            
            return {
                'code': formatted_code,
                'type': promo_details['type'],
                'value': promo_details['value'],
                'description': promo_details['description']
            }
        
        return None
    
    @classmethod
    def calculate_discount(cls, promo_details, subtotal):
        """
        Calculate discount based on promo details and subtotal
        
        Args:
            promo_details (dict): Promo code details
            subtotal (float): Order subtotal
            
        Returns:
            float: Discount amount
        """
        if not promo_details:
            return 0
        
        if promo_details['type'] == 'percentage':
            # Percentage discount
            return (subtotal * promo_details['value']) / 100
        else:
            # Fixed amount discount
            return min(promo_details['value'], subtotal)
    
    @classmethod
    def get_all_special_offers(cls):
        """
        Get all available special offers
        
        Returns:
            list: List of special offers
        """
        return cls.SPECIAL_OFFERS
    
    @classmethod
    def get_special_offer_by_id(cls, offer_id):
        """
        Get a special offer by ID
        
        Args:
            offer_id (str): ID of the special offer
            
        Returns:
            dict|None: Special offer details if found, None otherwise
        """
        for offer in cls.SPECIAL_OFFERS:
            if offer['id'] == offer_id:
                return offer
        
        return None
    
    @classmethod
    def get_special_offer_by_promo_code(cls, promo_code):
        """
        Get a special offer by promo code
        
        Args:
            promo_code (str): Promo code to search for
            
        Returns:
            dict|None: Special offer details if found, None otherwise
        """
        formatted_code = promo_code.strip().upper()
        
        for offer in cls.SPECIAL_OFFERS:
            if offer['promo_code'] == formatted_code:
                return offer
        
        return None
    
    @classmethod
    def get_special_offer_details(cls, offer_id=None, promo_code=None):
        """
        Get special offer details by either ID or promo code
        
        Args:
            offer_id (str, optional): ID of the special offer
            promo_code (str, optional): Promo code associated with the offer
            
        Returns:
            dict|None: Special offer details if found, None otherwise
        """
        if offer_id:
            return cls.get_special_offer_by_id(offer_id)
        
        if promo_code:
            return cls.get_special_offer_by_promo_code(promo_code)
        
        return None