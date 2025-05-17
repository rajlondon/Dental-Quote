"""
PromoService for Dental Quote System
Manages promo codes and promotional offers
"""

import json
import os
from datetime import datetime

class PromoService:
    """
    Handles promo code validation, application and special offers
    """
    
    def __init__(self):
        self.promo_codes = self._load_promo_codes()
        self.special_offers = self._load_special_offers()
    
    def _load_promo_codes(self):
        """Load promo code data"""
        try:
            # Use mock data for now, will be replaced with database or API integration
            return {
                # Percentage-based discounts
                "SUMMER15": {
                    "code": "SUMMER15",
                    "discount_type": "percentage",
                    "discount_value": 15,
                    "description": "Summer special: Get 15% off all treatments",
                    "min_order_value": 0,
                    "applicable_treatments": None,  # All treatments
                    "expiry_date": "2025-09-30",
                    "is_active": True
                },
                "DENTAL25": {
                    "code": "DENTAL25",
                    "discount_type": "percentage",
                    "discount_value": 25,
                    "description": "Premium package: 25% discount on premium dental packages",
                    "min_order_value": 2000,
                    "applicable_treatments": ["dental_implant_premium", "all_on_4_implants", "hollywood_smile", "full_mouth_reconstruction"],
                    "expiry_date": "2025-12-31",
                    "is_active": True
                },
                "NEWPATIENT": {
                    "code": "NEWPATIENT",
                    "discount_type": "percentage",
                    "discount_value": 20,
                    "description": "New patient offer: 20% off your first treatment",
                    "min_order_value": 0,
                    "applicable_treatments": None,
                    "expiry_date": "2025-12-31",
                    "is_active": True
                },
                "TEST10": {
                    "code": "TEST10",
                    "discount_type": "percentage",
                    "discount_value": 10,
                    "description": "Test promo code: 10% off any treatment",
                    "min_order_value": 0,
                    "applicable_treatments": None,
                    "expiry_date": "2025-12-31",
                    "is_active": True
                },
                # Fixed-amount discounts
                "FREECONSULT": {
                    "code": "FREECONSULT",
                    "discount_type": "fixed_amount",
                    "discount_value": 75,
                    "description": "Free consultation (worth $75) with any treatment",
                    "min_order_value": 250,
                    "applicable_treatments": None,
                    "expiry_date": "2025-12-31",
                    "is_active": True
                },
                "LUXHOTEL20": {
                    "code": "LUXHOTEL20",
                    "discount_type": "percentage",
                    "discount_value": 20,
                    "description": "20% off luxury hotel accommodations with dental treatment",
                    "min_order_value": 1000,
                    "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
                    "expiry_date": "2025-08-31",
                    "is_active": True
                },
                "IMPLANTCROWN30": {
                    "code": "IMPLANTCROWN30",
                    "discount_type": "percentage",
                    "discount_value": 30,
                    "description": "30% off when combining dental implant with crown",
                    "min_order_value": 0,
                    "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                    "expiry_date": "2025-07-31",
                    "is_active": True
                },
                "FREEWHITE": {
                    "code": "FREEWHITE",
                    "discount_type": "fixed_amount",
                    "discount_value": 150,
                    "description": "Free teeth whitening (worth $150) with any veneer or crown package",
                    "min_order_value": 1000,
                    "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"],
                    "expiry_date": "2025-12-31",
                    "is_active": True
                }
            }
        except Exception as e:
            print(f"Error loading promo codes: {e}")
            return {}
    
    def _load_special_offers(self):
        """Load special offers data"""
        try:
            # Special offers data will be loaded from database in production
            return [
                {
                    "id": "offer-001",
                    "title": "Dental Implant + Crown Bundle",
                    "description": "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
                    "promo_code": "IMPLANTCROWN30",
                    "banner_image": "/static/images/offers/implant_crown_bundle.jpg",
                    "discount_type": "percentage",
                    "discount_value": 30,
                    "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                    "promotion_level": "featured",
                    "terms_conditions": "Valid for single tooth implant and crown combinations only."
                },
                {
                    "id": "offer-002",
                    "title": "Premium Hotel Deal",
                    "description": "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
                    "promo_code": "LUXHOTEL20",
                    "banner_image": "/static/images/offers/luxury_hotel.jpg",
                    "discount_type": "percentage",
                    "discount_value": 20,
                    "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
                    "promotion_level": "premium",
                    "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability."
                },
                {
                    "id": "offer-003",
                    "title": "Free Consultation Package",
                    "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
                    "promo_code": "FREECONSULT",
                    "banner_image": "/static/images/offers/free_consultation.jpg",
                    "discount_type": "percentage",
                    "discount_value": 100,
                    "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
                    "promotion_level": "premium",
                    "terms_conditions": "Applicable for new patients only. One consultation per patient."
                },
                {
                    "id": "offer-004",
                    "title": "Luxury Airport Transfer",
                    "description": "Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.",
                    "promo_code": "LUXTRAVEL",
                    "banner_image": "/static/images/offers/airport_transfer.jpg",
                    "discount_type": "fixed_amount",
                    "discount_value": 80,
                    "applicable_treatments": ["full_mouth_reconstruction", "hollywood_smile", "all_on_4_implants"],
                    "promotion_level": "featured",
                    "terms_conditions": "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers."
                },
                {
                    "id": "offer-005",
                    "title": "Free Teeth Whitening",
                    "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.",
                    "promo_code": "FREEWHITE",
                    "banner_image": "/static/images/offers/teeth_whitening.jpg",
                    "discount_type": "fixed_amount",
                    "discount_value": 150,
                    "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"],
                    "promotion_level": "standard",
                    "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers."
                }
            ]
        except Exception as e:
            print(f"Error loading special offers: {e}")
            return []
    
    def validate_promo_code(self, code):
        """Validate if a promo code is valid and active"""
        code = code.upper()
        
        # Check if code exists
        if code not in self.promo_codes:
            return None
        
        promo = self.promo_codes[code]
        
        # Check if active
        if not promo['is_active']:
            return None
        
        # Check expiry date
        today = datetime.now().strftime('%Y-%m-%d')
        if promo['expiry_date'] < today:
            return None
        
        return promo
    
    def check_promo_eligibility(self, promo, selected_treatments):
        """Check if the promo code is eligible for the selected treatments"""
        # Empty cart
        if not selected_treatments:
            return False
        
        # Calculate order value
        order_value = sum(t.get('price', 0) * t.get('quantity', 1) for t in selected_treatments)
        
        # Check minimum order value
        if promo['min_order_value'] > order_value:
            return False
        
        # Check if promo is restricted to specific treatments
        if promo['applicable_treatments']:
            # Get IDs of selected treatments
            selected_ids = [t['id'] for t in selected_treatments]
            
            # Check if any applicable treatment is in the selected treatments
            has_applicable_treatment = any(t_id in promo['applicable_treatments'] for t_id in selected_ids)
            
            if not has_applicable_treatment:
                return False
        
        return True
    
    def get_all_promo_codes(self):
        """Get all promo codes"""
        return self.promo_codes
    
    def get_active_promo_codes(self):
        """Get only active promo codes"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        return {
            code: promo for code, promo in self.promo_codes.items()
            if promo['is_active'] and promo['expiry_date'] >= today
        }
    
    def get_all_special_offers(self):
        """Get all special offers"""
        return self.special_offers
    
    def get_featured_offers(self, limit=3):
        """Get featured special offers"""
        # Get offers marked as featured or premium
        featured = [
            offer for offer in self.special_offers 
            if offer['promotion_level'] in ['featured', 'premium']
        ]
        
        return featured[:limit]