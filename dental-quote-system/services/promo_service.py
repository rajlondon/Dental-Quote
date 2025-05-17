import json
import os
import uuid
from datetime import datetime
from flask import current_app
from .treatment_service import TreatmentService

class PromoService:
    """
    Service class to handle promo codes and special offers
    """
    
    @classmethod
    def get_active_offers(cls):
        """
        Get all active special offers
        
        Returns:
            list: List of active special offers
        """
        all_offers = cls._load_offers()
        
        # Filter to include only active offers
        active_offers = [
            offer for offer in all_offers 
            if offer.get('is_active', False) and offer.get('admin_approved', False)
        ]
        
        return active_offers
    
    @classmethod
    def get_featured_offers(cls):
        """
        Get featured special offers for homepage
        
        Returns:
            list: List of featured special offers
        """
        all_offers = cls.get_active_offers()
        
        # Filter to include only offers marked for homepage display
        featured = [offer for offer in all_offers if offer.get('homepage_display', False)]
        
        # If no offers are marked for homepage, return a few active ones
        if not featured and all_offers:
            featured = all_offers[:3]
        
        return featured
    
    @classmethod
    def get_offer_by_id(cls, offer_id):
        """
        Get a special offer by ID
        
        Args:
            offer_id (str): The offer ID
            
        Returns:
            dict: The special offer or None if not found
        """
        all_offers = cls._load_offers()
        
        # Find offer by ID
        for offer in all_offers:
            if offer.get('id') == offer_id:
                return offer
        
        return None
    
    @classmethod
    def get_treatments_for_offer(cls, offer):
        """
        Get the treatments applicable for a special offer
        
        Args:
            offer (dict): The special offer
            
        Returns:
            list: List of applicable treatments
        """
        if not offer or not offer.get('applicable_treatments'):
            return []
        
        # Get treatments by IDs
        treatment_ids = offer.get('applicable_treatments', [])
        return TreatmentService.get_treatments_by_ids(treatment_ids)
    
    @classmethod
    def get_treatment_by_id(cls, treatment_id):
        """
        Get a treatment by ID
        
        Args:
            treatment_id (str): The treatment ID
            
        Returns:
            dict: The treatment or None if not found
        """
        return TreatmentService.get_treatment(treatment_id)
    
    @classmethod
    def validate_promo_code(cls, code, treatments):
        """
        Validate a promotional code
        
        Args:
            code (str): The promotional code to validate
            treatments (list): List of selected treatment IDs
            
        Returns:
            dict: Validation result with keys:
                 - valid (bool): Whether the code is valid
                 - message (str): Message explaining validation result
                 - details (dict): Details about the promotion if valid
        """
        if not code:
            return {
                'valid': False,
                'message': 'Please enter a promotional code.',
                'details': None
            }
        
        # Convert code to uppercase for case-insensitive comparison
        code = code.upper()
        
        # Load promo codes
        promo_codes = cls._load_promo_codes()
        
        # Find matching promo code
        promo = cls._find_promo_code(code, promo_codes)
        
        if not promo:
            return {
                'valid': False,
                'message': f'The promotional code "{code}" is not valid.',
                'details': None
            }
        
        # Check if promo code is active
        if not promo.get('is_active', False):
            return {
                'valid': False,
                'message': f'The promotional code "{code}" is not currently active.',
                'details': None
            }
        
        # Check promo code start/end dates
        now = datetime.now().isoformat()
        start_date = promo.get('start_date')
        end_date = promo.get('end_date')
        
        if start_date and start_date > now:
            return {
                'valid': False,
                'message': f'The promotional code "{code}" is not yet active.',
                'details': None
            }
        
        if end_date and end_date < now:
            return {
                'valid': False,
                'message': f'The promotional code "{code}" has expired.',
                'details': None
            }
        
        # Check if treatments meet requirements
        if promo.get('applicable_treatments') and treatments:
            # Check if any selected treatment is applicable for this promo
            applicable_treatments = promo.get('applicable_treatments', [])
            has_applicable_treatment = any(t_id in applicable_treatments for t_id in treatments)
            
            if not has_applicable_treatment:
                applicable_names = []
                for t_id in applicable_treatments:
                    treatment = TreatmentService.get_treatment(t_id)
                    if treatment:
                        applicable_names.append(treatment.get('name'))
                
                treatment_list = ', '.join(applicable_names)
                return {
                    'valid': False,
                    'message': f'This code is only valid for specific treatments: {treatment_list}.',
                    'details': None
                }
        
        # Check if minimum total value is met
        if promo.get('min_total_value') and treatments:
            # Calculate total value of selected treatments
            treatment_objects = []
            for t_id in treatments:
                treatment = TreatmentService.get_treatment(t_id)
                if treatment:
                    treatment_objects.append(treatment)
            
            total_value = sum(t.get('price', 0) for t in treatment_objects)
            
            if total_value < promo.get('min_total_value'):
                min_value = promo.get('min_total_value')
                return {
                    'valid': False,
                    'message': f'This code requires a minimum purchase of ${min_value}.',
                    'details': None
                }
        
        # Code is valid, return the details
        return {
            'valid': True,
            'message': 'Promotional code applied successfully!',
            'details': {
                'code': code,
                'title': promo.get('title', 'Special Offer'),
                'description': promo.get('description', ''),
                'discount_type': promo.get('discount_type', 'percentage'),
                'discount_value': promo.get('discount_value', 0),
                'applicable_treatments': promo.get('applicable_treatments', [])
            }
        }
    
    @classmethod
    def _find_promo_code(cls, code, promo_codes):
        """
        Find a promo code in the list
        
        Args:
            code (str): The code to find
            promo_codes (list): List of promo codes
            
        Returns:
            dict: The promo code or None if not found
        """
        # First check exact match
        for promo in promo_codes:
            if promo.get('code', '').upper() == code:
                return promo
        
        # Then check offers
        all_offers = cls._load_offers()
        for offer in all_offers:
            if offer.get('promo_code', '').upper() == code:
                # Convert offer to promo code format
                return {
                    'code': offer.get('promo_code'),
                    'title': offer.get('title'),
                    'description': offer.get('description'),
                    'discount_type': offer.get('discount_type', 'percentage'),
                    'discount_value': offer.get('discount_value', 0),
                    'applicable_treatments': offer.get('applicable_treatments', []),
                    'is_active': offer.get('is_active', False),
                    'start_date': offer.get('start_date'),
                    'end_date': offer.get('end_date'),
                    'min_total_value': offer.get('min_total_value')
                }
        
        return None
    
    @classmethod
    def _load_offers(cls):
        """
        Load special offers from data
        
        Returns:
            list: List of special offers
        """
        # Sample offer data
        return [
            {
                'id': 'a9f87e54-3c21-4f89-bc6d-1c2a1dfb76e9',
                'clinic_id': '5',
                'title': 'Free Teeth Whitening',
                'description': 'Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.',
                'discount_type': 'fixed_amount',
                'discount_value': 150,
                'applicable_treatments': ['Veneers', 'Crowns', 'Hollywood Smile'],
                'start_date': '2025-05-17T15:15:35.290Z',
                'end_date': '2025-08-17T15:15:35.290Z',
                'promo_code': 'FREEWHITE',
                'terms_conditions': 'Minimum of 4 veneers or crowns required. Not combinable with other offers.',
                'banner_image': '/static/images/offers/teeth_whitening.png',
                'is_active': True,
                'admin_approved': True,
                'commission_percentage': 12,
                'promotion_level': 'standard',
                'homepage_display': False,
                'created_at': '2025-05-17T15:15:35.290Z',
                'updated_at': '2025-05-17T15:15:35.290Z',
                'admin_reviewed_at': '2025-05-17T15:15:35.290Z',
                'treatment_price_gbp': 150,
                'treatment_price_usd': 195
            },
            {
                'id': 'ac36590b-b0dc-434e-ba74-d42ab2485e81',
                'clinic_id': '1',
                'title': 'Free Consultation Package',
                'description': 'Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.',
                'discount_type': 'percentage',
                'discount_value': 100,
                'applicable_treatments': ['dental_implant_standard', 'porcelain_veneers', 'full_mouth_reconstruction'],
                'start_date': '2025-05-17T15:15:35.290Z',
                'end_date': '2025-08-17T15:15:35.290Z',
                'promo_code': 'FREECONSULT',
                'terms_conditions': 'Applicable for new patients only. One consultation per patient.',
                'banner_image': '/static/images/offers/consultation.jpg',
                'is_active': True,
                'admin_approved': True,
                'commission_percentage': 20,
                'promotion_level': 'premium',
                'homepage_display': True,
                'created_at': '2025-05-17T15:15:35.290Z',
                'updated_at': '2025-05-17T15:15:35.290Z',
                'admin_reviewed_at': '2025-05-17T15:15:35.290Z',
                'treatment_price_gbp': 75,
                'treatment_price_usd': 95
            },
            {
                'id': '134cdb0f-e783-47f5-a502-70e3960f7246',
                'clinic_id': '2',
                'title': 'Premium Hotel Deal',
                'description': 'Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.',
                'discount_type': 'percentage',
                'discount_value': 20,
                'applicable_treatments': ['dental_implant_standard', 'porcelain_veneers', 'dental_crowns'],
                'start_date': '2025-05-17T15:15:35.290Z',
                'end_date': '2025-08-17T15:15:35.290Z',
                'promo_code': 'LUXHOTEL20',
                'terms_conditions': 'Minimum treatment value of $1000 required. Subject to hotel availability.',
                'banner_image': '/static/images/offers/hotel_deal.png',
                'is_active': True,
                'admin_approved': True,
                'commission_percentage': 20,
                'promotion_level': 'premium',
                'homepage_display': True,
                'created_at': '2025-05-17T15:15:35.290Z',
                'updated_at': '2025-05-17T15:15:35.290Z',
                'admin_reviewed_at': '2025-05-17T15:15:35.290Z',
                'treatment_price_gbp': 250,
                'treatment_price_usd': 325
            },
            {
                'id': '3e6a315d-9d9f-4b56-97da-4b3d4b4b5367',
                'clinic_id': '3',
                'title': 'Dental Implant + Crown Bundle',
                'description': 'Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.',
                'discount_type': 'percentage',
                'discount_value': 30,
                'applicable_treatments': ['dental_implant_standard', 'dental_crowns'],
                'start_date': '2025-05-17T15:15:35.290Z',
                'end_date': '2025-07-17T15:15:35.290Z',
                'promo_code': 'IMPLANTCROWN30',
                'terms_conditions': 'Valid for single tooth implant and crown combinations only.',
                'banner_image': '/static/images/offers/implant_crown.png',
                'is_active': True,
                'admin_approved': True,
                'commission_percentage': 18,
                'promotion_level': 'featured',
                'homepage_display': True,
                'created_at': '2025-05-17T15:15:35.290Z',
                'updated_at': '2025-05-17T15:15:35.290Z',
                'admin_reviewed_at': '2025-05-17T15:15:35.290Z',
                'treatment_price_gbp': 1200,
                'treatment_price_usd': 1550
            },
            {
                'id': '72e65d76-4cd5-4fd2-9323-8c35f3a9b9f0',
                'clinic_id': '4',
                'title': 'Luxury Airport Transfer',
                'description': 'Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.',
                'discount_type': 'fixed_amount',
                'discount_value': 80,
                'applicable_treatments': ['full_mouth_reconstruction', 'hollywood_smile', 'all_on_4_implants'],
                'start_date': '2025-05-17T15:15:35.290Z',
                'end_date': '2025-09-17T15:15:35.290Z',
                'promo_code': 'LUXTRAVEL',
                'terms_conditions': 'Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.',
                'banner_image': '/static/images/offers/airport_transfer.jpg',
                'is_active': True,
                'admin_approved': True,
                'commission_percentage': 15,
                'promotion_level': 'featured',
                'homepage_display': True,
                'created_at': '2025-05-17T15:15:35.290Z',
                'updated_at': '2025-05-17T15:15:35.290Z',
                'admin_reviewed_at': '2025-05-17T15:15:35.290Z',
                'treatment_price_gbp': 180,
                'treatment_price_usd': 230
            }
        ]
    
    @classmethod
    def _load_promo_codes(cls):
        """
        Load promotional codes from data
        
        Returns:
            list: List of promotional codes
        """
        # Sample promo code data
        return [
            {
                'code': 'SUMMER15',
                'title': 'Summer Special',
                'description': 'Get 15% off all dental treatments this summer',
                'discount_type': 'percentage',
                'discount_value': 15,
                'applicable_treatments': [],
                'is_active': True,
                'start_date': '2025-05-01T00:00:00.000Z',
                'end_date': '2025-08-31T23:59:59.000Z',
                'min_total_value': 0
            },
            {
                'code': 'DENTAL25',
                'title': 'Dental Discount',
                'description': 'Save 25% on selected dental procedures',
                'discount_type': 'percentage',
                'discount_value': 25,
                'applicable_treatments': [
                    'dental_implant_standard',
                    'porcelain_veneers', 
                    'dental_crowns'
                ],
                'is_active': True,
                'start_date': '2025-01-01T00:00:00.000Z',
                'end_date': '2025-12-31T23:59:59.000Z',
                'min_total_value': 500
            },
            {
                'code': 'NEWPATIENT',
                'title': 'New Patient Discount',
                'description': 'New patients receive 20% off their first treatment',
                'discount_type': 'percentage',
                'discount_value': 20,
                'applicable_treatments': [],
                'is_active': True,
                'start_date': None,
                'end_date': None,
                'min_total_value': 0
            },
            {
                'code': 'TEST10',
                'title': 'Test Discount',
                'description': 'Test promotional code for 10% off',
                'discount_type': 'percentage',
                'discount_value': 10,
                'applicable_treatments': [],
                'is_active': True,
                'start_date': None,
                'end_date': None,
                'min_total_value': 0
            }
        ]