"""
Promo Service for Dental Quote System
Handles promotional codes and discount calculations
"""

class PromoService:
    """
    Service for managing promotional codes
    - Validates promo codes
    - Calculates discounts
    - Provides promo details
    """
    
    # Available promo codes with their details
    PROMO_CODES = {
        'SUMMER15': {
            'discount_type': 'percentage',
            'discount_value': 15,
            'description': 'Summer Special: 15% off all treatments',
            'min_order_value': 0,
            'applicable_treatments': []  # Empty means applies to all treatments
        },
        'DENTAL25': {
            'discount_type': 'percentage',
            'discount_value': 25,
            'description': 'Premium Discount: 25% off all dental treatments',
            'min_order_value': 500,
            'applicable_treatments': []  # Empty means applies to all treatments
        },
        'NEWPATIENT': {
            'discount_type': 'percentage',
            'discount_value': 20,
            'description': 'New Patient Offer: 20% off your first treatment',
            'min_order_value': 0,
            'applicable_treatments': []  # Empty means applies to all treatments
        },
        'TEST10': {
            'discount_type': 'percentage',
            'discount_value': 10,
            'description': 'Test Promo: 10% off all treatments',
            'min_order_value': 0,
            'applicable_treatments': []  # Empty means applies to all treatments
        },
        'FREECONSULT': {
            'discount_type': 'special',
            'discount_value': 0,  # Special handling required for free consultation
            'description': 'Free dental consultation with any treatment',
            'min_order_value': 300,
            'applicable_treatments': [],
            'add_treatment': {
                'id': 'dental_exam',
                'name': 'Free Dental Consultation',
                'price': 0,
                'original_price': 85.00,
                'description': 'Complete evaluation of oral health, including X-rays and screening.',
                'category': 'special'
            }
        },
        'LUXHOTEL20': {
            'discount_type': 'percentage',
            'discount_value': 20,
            'description': 'Premium Hotel Deal: 20% off premium hotels with dental treatment booking',
            'min_order_value': 1000,
            'applicable_treatments': ['dental_implant_standard', 'porcelain_veneers', 'dental_crowns']
        },
        'IMPLANTCROWN30': {
            'discount_type': 'percentage',
            'discount_value': 30,
            'description': 'Implant + Crown Bundle: 30% discount on dental implant with crown',
            'min_order_value': 0,
            'applicable_treatments': ['dental_implant_standard', 'dental_crowns']
        },
        'FREEWHITE': {
            'discount_type': 'special',
            'discount_value': 0,
            'description': 'Free teeth whitening with any veneer or crown package',
            'min_order_value': 800,
            'applicable_treatments': ['porcelain_veneers', 'dental_crowns', 'hollywood_smile'],
            'add_treatment': {
                'id': 'teeth_whitening',
                'name': 'Free Teeth Whitening',
                'price': 0,
                'original_price': 180.00,
                'description': 'Professional whitening procedure to remove stains and discoloration.',
                'category': 'special'
            }
        }
    }
    
    @staticmethod
    def get_special_offers():
        """Get special offers for display on the special offers page"""
        return [
            {
                'id': 'summer_special',
                'title': 'Summer Special',
                'description': 'Enjoy 15% off all dental treatments. Limited time offer for the summer season.',
                'image': '/static/img/offers/summer_special.jpg',
                'promo_code': 'SUMMER15',
                'expiry_date': 'August 31, 2025',
                'featured': True
            },
            {
                'id': 'implant_crown_bundle',
                'title': 'Implant + Crown Bundle',
                'description': 'Save 30% when combining a dental implant with a crown. Perfect solution for missing teeth.',
                'image': '/static/img/offers/implant_crown.jpg',
                'promo_code': 'IMPLANTCROWN30',
                'expiry_date': 'July 31, 2025',
                'featured': True
            },
            {
                'id': 'free_whitening',
                'title': 'Free Teeth Whitening',
                'description': 'Get a free professional teeth whitening session with any veneer or crown package.',
                'image': '/static/img/offers/free_whitening.jpg',
                'promo_code': 'FREEWHITE',
                'expiry_date': 'December 31, 2025',
                'featured': False
            },
            {
                'id': 'new_patient_offer',
                'title': 'New Patient Offer',
                'description': 'First-time patients receive 20% off their initial treatment. Welcome to our clinic!',
                'image': '/static/img/offers/new_patient.jpg',
                'promo_code': 'NEWPATIENT',
                'expiry_date': 'Ongoing',
                'featured': True
            },
            {
                'id': 'free_consultation',
                'title': 'Free Dental Consultation',
                'description': 'Book any treatment and receive a complimentary dental consultation worth €85.',
                'image': '/static/img/offers/free_consultation.jpg',
                'promo_code': 'FREECONSULT',
                'expiry_date': 'Ongoing',
                'featured': False
            },
            {
                'id': 'premium_hotel',
                'title': 'Premium Hotel Deal',
                'description': 'Enjoy 20% off premium hotel accommodations when booking select dental treatments.',
                'image': '/static/img/offers/hotel_deal.jpg',
                'promo_code': 'LUXHOTEL20',
                'expiry_date': 'October 31, 2025',
                'featured': False
            }
        ]
    
    @staticmethod
    def get_promo_by_code(promo_code):
        """Get promo details by code"""
        if not promo_code:
            return None
        
        return PromoService.PROMO_CODES.get(promo_code.upper())
    
    @staticmethod
    def validate_promo_code(promo_code, selected_treatments=None, subtotal=0):
        """Validate if a promo code can be applied"""
        if not promo_code:
            return {
                'valid': False,
                'message': 'No promo code provided.'
            }
        
        promo_details = PromoService.get_promo_by_code(promo_code)
        
        if not promo_details:
            return {
                'valid': False,
                'message': 'Invalid promo code. Please try again.'
            }
        
        # Check minimum order value
        min_order_value = promo_details.get('min_order_value', 0)
        if subtotal < min_order_value:
            return {
                'valid': False,
                'message': f'This promo code requires a minimum order value of €{min_order_value:.2f}.'
            }
        
        # Check applicable treatments
        applicable_treatments = promo_details.get('applicable_treatments', [])
        if applicable_treatments and selected_treatments:
            # Check if at least one applicable treatment is selected
            found = False
            for treatment in selected_treatments:
                if treatment['id'] in applicable_treatments:
                    found = True
                    break
            
            if not found:
                return {
                    'valid': False,
                    'message': 'This promo code requires specific treatments.'
                }
        
        # All checks passed
        return {
            'valid': True,
            'message': 'Promo code applied successfully!',
            'promo_details': promo_details
        }
    
    @staticmethod
    def calculate_discount(subtotal, promo_details, selected_treatments=None):
        """Calculate discount amount based on promo details"""
        if not promo_details:
            return 0
        
        discount_type = promo_details.get('discount_type')
        discount_value = promo_details.get('discount_value', 0)
        
        if discount_type == 'percentage':
            # Apply percentage discount
            return (subtotal * discount_value) / 100
        elif discount_type == 'fixed_amount':
            # Apply fixed amount discount
            return min(discount_value, subtotal)  # Ensure discount doesn't exceed subtotal
        elif discount_type == 'special':
            # Special handling (e.g., free item)
            # For this case, the discount is typically the value of the free item
            add_treatment = promo_details.get('add_treatment')
            if add_treatment:
                return add_treatment.get('original_price', 0)
            return 0
        
        return 0