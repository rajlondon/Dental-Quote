"""
PromoService for dental quote system

This module provides functionality for managing promotional codes
and special offers in the dental quote system.
"""

import json
import os
from datetime import datetime


class PromoService:
    """
    Service for handling promotional codes and special offers.
    Provides methods for code validation, special offer management,
    and treatment recommendation based on promotions.
    """
    
    def __init__(self):
        """Initialize the PromoService with test data"""
        self.promo_codes = self._load_promo_codes()
        self.special_offers = self._load_special_offers()
        self.treatments = self._load_treatments()
    
    def _load_promo_codes(self):
        """
        Load promotional codes from data store
        
        Returns:
            list: List of promotional code objects
        """
        # In a real app, this would load from database
        return [
            {
                'code': 'SUMMER15',
                'discount_type': 'percentage',
                'discount_value': 15,
                'min_order_value': 200,
                'valid_from': '2025-05-01',
                'valid_to': '2025-08-31',
                'description': 'Summer special promotion - 15% off all treatments',
                'is_active': True
            },
            {
                'code': 'DENTAL25',
                'discount_type': 'percentage',
                'discount_value': 25,
                'min_order_value': 500,
                'valid_from': '2025-01-01',
                'valid_to': '2025-12-31',
                'description': '25% discount on premium treatments',
                'is_active': True
            },
            {
                'code': 'NEWPATIENT',
                'discount_type': 'percentage',
                'discount_value': 20,
                'min_order_value': 100,
                'valid_from': '2025-01-01',
                'valid_to': '2025-12-31',
                'description': 'New patient special offer - 20% off your first treatment',
                'is_active': True
            },
            {
                'code': 'TEST10',
                'discount_type': 'percentage',
                'discount_value': 10,
                'min_order_value': 0,
                'valid_from': '2025-01-01',
                'valid_to': '2025-12-31',
                'description': 'Test promotion code - 10% off any treatment',
                'is_active': True
            },
            {
                'code': 'FREECONSULT',
                'discount_type': 'fixed_amount',
                'discount_value': 75,
                'min_order_value': 0,
                'valid_from': '2025-01-01',
                'valid_to': '2025-12-31',
                'description': 'Free initial consultation with any treatment',
                'is_active': True
            },
            {
                'code': 'LUXHOTEL20',
                'discount_type': 'percentage',
                'discount_value': 20,
                'min_order_value': 1000,
                'valid_from': '2025-05-01',
                'valid_to': '2025-08-31',
                'description': '20% discount on premium hotel package with your dental treatment',
                'is_active': True
            },
            {
                'code': 'IMPLANTCROWN30',
                'discount_type': 'percentage',
                'discount_value': 30,
                'min_order_value': 0,
                'valid_from': '2025-05-01',
                'valid_to': '2025-07-31',
                'description': '30% off when combining dental implant with crown',
                'is_active': True,
                'applicable_treatments': ['dental_implant_standard', 'dental_crowns']
            },
            {
                'code': 'FREEWHITE',
                'discount_type': 'fixed_amount',
                'discount_value': 150,
                'min_order_value': 800,
                'valid_from': '2025-05-01',
                'valid_to': '2025-08-31',
                'description': 'Free teeth whitening with veneer or crown treatments',
                'is_active': True,
                'applicable_treatments': ['porcelain_veneers', 'dental_crowns', 'hollywood_smile']
            }
        ]
    
    def _load_special_offers(self):
        """
        Load special offers from data store
        
        Returns:
            list: List of special offer objects
        """
        # In a real app, this would load from database
        return [
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
                'banner_image': '/static/img/offers/consultation.jpg',
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
                'banner_image': '/static/img/offers/hotel.jpg',
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
                'banner_image': '/static/img/offers/implant_crown.jpg',
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
                'banner_image': '/static/img/offers/transfer.jpg',
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
            },
            {
                'id': 'a9f87e54-3c21-4f89-bc6d-1c2a1dfb76e9',
                'clinic_id': '5',
                'title': 'Free Teeth Whitening',
                'description': 'Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.',
                'discount_type': 'fixed_amount',
                'discount_value': 150,
                'applicable_treatments': ['porcelain_veneers', 'dental_crowns', 'hollywood_smile'],
                'start_date': '2025-05-17T15:15:35.290Z',
                'end_date': '2025-08-17T15:15:35.290Z',
                'promo_code': 'FREEWHITE',
                'terms_conditions': 'Minimum of 4 veneers or crowns required. Not combinable with other offers.',
                'banner_image': '/static/img/offers/whitening.jpg',
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
            }
        ]
    
    def _load_treatments(self):
        """
        Load dental treatments from data store
        
        Returns:
            list: List of treatment objects
        """
        # In a real app, this would be loaded from database
        # Here we just include treatments referenced in special offers
        return [
            {
                'id': 'dental_implant_standard',
                'name': 'Dental Implant (Standard)',
                'category': 'implants',
                'description': 'Standard dental implant including implant, abutment, and crown',
                'price_usd': 995,
                'price_gbp': 780,
                'procedure_time': '2-3 hours',
                'recovery_time': '3-6 months',
                'image': '/static/img/treatments/implant.jpg'
            },
            {
                'id': 'dental_crowns',
                'name': 'Dental Crown',
                'category': 'cosmetic',
                'description': 'Porcelain or ceramic crown for damaged or decayed teeth',
                'price_usd': 395,
                'price_gbp': 310,
                'procedure_time': '1-2 hours',
                'recovery_time': '1-2 days',
                'image': '/static/img/treatments/crown.jpg'
            },
            {
                'id': 'porcelain_veneers',
                'name': 'Porcelain Veneer',
                'category': 'cosmetic',
                'description': 'Custom-made porcelain shells that cover the front of teeth',
                'price_usd': 450,
                'price_gbp': 350,
                'procedure_time': '1-2 hours',
                'recovery_time': '1-3 days',
                'image': '/static/img/treatments/veneer.jpg'
            },
            {
                'id': 'full_mouth_reconstruction',
                'name': 'Full Mouth Reconstruction',
                'category': 'restorative',
                'description': 'Comprehensive treatment to rebuild or replace all teeth',
                'price_usd': 12000,
                'price_gbp': 9400,
                'procedure_time': 'Multiple sessions',
                'recovery_time': '1-3 months',
                'image': '/static/img/treatments/reconstruction.jpg'
            },
            {
                'id': 'hollywood_smile',
                'name': 'Hollywood Smile',
                'category': 'cosmetic',
                'description': 'Complete smile makeover including veneers for multiple teeth',
                'price_usd': 3800,
                'price_gbp': 2980,
                'procedure_time': 'Multiple sessions',
                'recovery_time': '1-2 weeks',
                'image': '/static/img/treatments/hollywood.jpg'
            },
            {
                'id': 'all_on_4_implants',
                'name': 'All-on-4 Implants',
                'category': 'implants',
                'description': 'Full arch of fixed teeth supported by only 4 implants',
                'price_usd': 6500,
                'price_gbp': 5100,
                'procedure_time': '1 day procedure',
                'recovery_time': '3-6 months',
                'image': '/static/img/treatments/all_on_4.jpg'
            }
        ]
    
    def get_active_offers(self):
        """
        Get all active special offers
        
        Returns:
            list: List of active special offer objects
        """
        today = datetime.now().isoformat()
        return [
            offer for offer in self.special_offers 
            if offer.get('is_active', False) 
            and offer.get('start_date', '') <= today 
            and offer.get('end_date', '') >= today
        ]
    
    def get_featured_offers(self, limit=3):
        """
        Get featured special offers for homepage
        
        Args:
            limit: Maximum number of offers to return
            
        Returns:
            list: List of featured special offer objects
        """
        active_offers = self.get_active_offers()
        # Sort by promotion level (premium first) and then by discount value (highest first)
        sorted_offers = sorted(
            active_offers,
            key=lambda x: (
                0 if x.get('promotion_level') == 'premium' else 
                1 if x.get('promotion_level') == 'featured' else 2,
                x.get('discount_value', 0) * -1
            )
        )
        # Filter to those marked for homepage display
        homepage_offers = [offer for offer in sorted_offers if offer.get('homepage_display', False)]
        return homepage_offers[:limit]
    
    def get_offer_by_id(self, offer_id):
        """
        Get a special offer by its ID
        
        Args:
            offer_id: The unique identifier for the offer
            
        Returns:
            dict: The special offer object or None if not found
        """
        for offer in self.special_offers:
            if offer.get('id') == offer_id:
                return offer
        return None
    
    def get_treatments_for_offer(self, offer):
        """
        Get the treatments applicable to a special offer
        
        Args:
            offer: The special offer object
            
        Returns:
            list: List of treatment objects applicable to the offer
        """
        if not offer or 'applicable_treatments' not in offer:
            return []
        
        applicable_treatment_ids = offer['applicable_treatments']
        return [
            treatment for treatment in self.treatments
            if treatment['id'] in applicable_treatment_ids
        ]
    
    def get_treatment_by_id(self, treatment_id):
        """
        Get a treatment by its ID
        
        Args:
            treatment_id: The unique identifier for the treatment
            
        Returns:
            dict: The treatment object or None if not found
        """
        for treatment in self.treatments:
            if treatment.get('id') == treatment_id:
                return treatment
        return None
    
    def validate_promo_code(self, code, subtotal):
        """
        Validate a promotional code against requirements
        
        Args:
            code: The promotional code to validate
            subtotal: The current subtotal of the quote
            
        Returns:
            dict: Result object with valid status, message, and promo details
        """
        # Find the promo code
        promo = None
        for p in self.promo_codes:
            if p['code'].upper() == code.upper() and p.get('is_active', False):
                promo = p
                break
        
        if not promo:
            return {
                'valid': False,
                'message': 'Invalid promotional code',
                'details': None
            }
        
        # Check if code has expired
        today = datetime.now().strftime('%Y-%m-%d')
        valid_from = promo.get('valid_from', '2000-01-01')
        valid_to = promo.get('valid_to', '2100-12-31')
        
        if valid_from > today:
            return {
                'valid': False,
                'message': 'This promotional code is not yet active',
                'details': None
            }
        
        if valid_to < today:
            return {
                'valid': False,
                'message': 'This promotional code has expired',
                'details': None
            }
        
        # Check minimum order value
        min_order_value = promo.get('min_order_value', 0)
        if subtotal < min_order_value:
            return {
                'valid': False,
                'message': f'Minimum order value of ${min_order_value} required for this code',
                'details': None
            }
        
        # Code is valid, return promo details
        return {
            'valid': True,
            'message': 'Promotional code applied successfully',
            'details': {
                'code': promo['code'],
                'discount_type': promo['discount_type'],
                'discount_value': promo['discount_value'],
                'description': promo.get('description', '')
            }
        }
    
    def get_recommended_treatments(self, selected_treatment_ids, limit=3):
        """
        Get recommended treatments based on currently selected treatments
        
        Args:
            selected_treatment_ids: List of IDs of currently selected treatments
            limit: Maximum number of recommendations to return
            
        Returns:
            list: List of recommended treatment objects
        """
        if not selected_treatment_ids:
            # If no treatments selected, return popular treatments
            return self.get_popular_treatments(limit)
        
        # Get currently selected treatments
        selected_treatments = [
            t for t in self.treatments 
            if t['id'] in selected_treatment_ids
        ]
        
        # Get categories of selected treatments
        selected_categories = set([t.get('category') for t in selected_treatments])
        
        # Find complementary treatments from the same categories
        complementary = []
        for treatment in self.treatments:
            if (treatment['id'] not in selected_treatment_ids and 
                treatment.get('category') in selected_categories):
                complementary.append(treatment)
        
        # Sort by price (lowest first) and limit results
        complementary.sort(key=lambda x: x.get('price_usd', 0))
        return complementary[:limit]
    
    def get_popular_treatments(self, limit=6):
        """
        Get popular treatments for display on homepage
        
        Args:
            limit: Maximum number of treatments to return
            
        Returns:
            list: List of popular treatment objects
        """
        # In a real app, this would be based on treatment popularity
        # Here we just return a subset of treatments
        return self.treatments[:limit]