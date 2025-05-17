"""
Promo service for the MyDentalFly application.
Provides functionality for managing promotional offers and promo codes.
"""

import logging
import json
import os
from datetime import datetime
from flask import current_app

logger = logging.getLogger(__name__)

class PromoService:
    """Service for handling promotional offers and promo codes."""
    
    def __init__(self):
        """Initialize the promo service with promotional data."""
        self.offers = self._load_offers()
        self.promo_codes = self._load_promo_codes()
    
    def _load_offers(self):
        """Load promotional offers from file or initialize with defaults."""
        try:
            # In a production environment, this would come from a database
            # For demo purposes, we'll use hardcoded data
            return [
                {
                    "id": "ac36590b-b0dc-434e-ba74-d42ab2485e81",
                    "title": "Free Consultation Package",
                    "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
                    "discount_type": "percentage",
                    "discount_value": 100,
                    "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
                    "start_date": "2025-05-17T15:15:35.290Z",
                    "end_date": "2025-08-17T15:15:35.290Z",
                    "promo_code": "FREECONSULT",
                    "terms_conditions": "Applicable for new patients only. One consultation per patient.",
                    "banner_image": "images/offers/free-consultation.jpg",
                    "is_active": True,
                    "admin_approved": True
                },
                {
                    "id": "134cdb0f-e783-47f5-a502-70e3960f7246",
                    "title": "Premium Hotel Deal",
                    "description": "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
                    "discount_type": "percentage",
                    "discount_value": 20,
                    "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
                    "start_date": "2025-05-17T15:15:35.290Z",
                    "end_date": "2025-08-17T15:15:35.290Z",
                    "promo_code": "LUXHOTEL20",
                    "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
                    "banner_image": "images/offers/premium-hotel.jpg",
                    "is_active": True,
                    "admin_approved": True
                },
                {
                    "id": "3e6a315d-9d9f-4b56-97da-4b3d4b4b5367",
                    "title": "Dental Implant + Crown Bundle",
                    "description": "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
                    "discount_type": "percentage",
                    "discount_value": 30,
                    "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                    "start_date": "2025-05-17T15:15:35.290Z",
                    "end_date": "2025-07-17T15:15:35.290Z",
                    "promo_code": "IMPLANTCROWN30",
                    "terms_conditions": "Valid for single tooth implant and crown combinations only.",
                    "banner_image": "images/offers/implant-crown-bundle.jpg",
                    "is_active": True,
                    "admin_approved": True
                },
                {
                    "id": "72e65d76-4cd5-4fd2-9323-8c35f3a9b9f0",
                    "title": "Luxury Airport Transfer",
                    "description": "Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.",
                    "discount_type": "fixed_amount",
                    "discount_value": 80,
                    "applicable_treatments": ["full_mouth_reconstruction", "hollywood_smile", "all_on_4_implants"],
                    "start_date": "2025-05-17T15:15:35.290Z",
                    "end_date": "2025-09-17T15:15:35.290Z",
                    "promo_code": "LUXTRAVEL",
                    "terms_conditions": "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.",
                    "banner_image": "images/offers/airport-transfer.jpg",
                    "is_active": True,
                    "admin_approved": True
                },
                {
                    "id": "a9f87e54-3c21-4f89-bc6d-1c2a1dfb76e9",
                    "title": "Free Teeth Whitening",
                    "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.",
                    "discount_type": "fixed_amount",
                    "discount_value": 150,
                    "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"],
                    "start_date": "2025-05-17T15:15:35.290Z",
                    "end_date": "2025-08-17T15:15:35.290Z",
                    "promo_code": "FREEWHITE",
                    "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
                    "banner_image": "images/offers/teeth-whitening.jpg",
                    "is_active": True,
                    "admin_approved": True
                }
            ]
        except Exception as e:
            logger.error(f"Error loading promotional offers: {str(e)}")
            return []
    
    def _load_promo_codes(self):
        """Load promo codes from file or initialize with defaults."""
        try:
            # In a production environment, this would come from a database
            # For demo purposes, we'll use hardcoded data
            return [
                {
                    "code": "SUMMER15",
                    "discount_type": "percentage",
                    "discount_value": 15,
                    "start_date": "2025-05-01",
                    "end_date": "2025-08-31",
                    "min_order_value": 0,
                    "max_discount": None,
                    "is_active": True,
                    "description": "Summer special offer - 15% off any treatment"
                },
                {
                    "code": "DENTAL25",
                    "discount_type": "percentage",
                    "discount_value": 25,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 2000,
                    "max_discount": 1000,
                    "is_active": True,
                    "description": "Premium discount for high-value treatments - 25% off (max $1000)"
                },
                {
                    "code": "NEWPATIENT",
                    "discount_type": "percentage",
                    "discount_value": 20,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 0,
                    "max_discount": 500,
                    "is_active": True,
                    "description": "New patient welcome discount - 20% off your first treatment"
                },
                {
                    "code": "TEST10",
                    "discount_type": "percentage",
                    "discount_value": 10,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 0,
                    "max_discount": None,
                    "is_active": True,
                    "description": "Test promo code - 10% off any treatment"
                },
                {
                    "code": "FREECONSULT",
                    "discount_type": "percentage",
                    "discount_value": 100,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 0,
                    "max_discount": 75,
                    "is_active": True,
                    "description": "Free consultation package with your treatment"
                },
                {
                    "code": "LUXHOTEL20",
                    "discount_type": "percentage",
                    "discount_value": 20,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 1000,
                    "max_discount": 250,
                    "is_active": True,
                    "description": "20% discount on premium hotel bookings with your treatment"
                },
                {
                    "code": "IMPLANTCROWN30",
                    "discount_type": "percentage",
                    "discount_value": 30,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 0,
                    "max_discount": None,
                    "is_active": True,
                    "description": "30% off dental implant and crown bundle"
                },
                {
                    "code": "LUXTRAVEL",
                    "discount_type": "fixed_amount",
                    "discount_value": 80,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 2000,
                    "max_discount": None,
                    "is_active": True,
                    "description": "$80 credit towards luxury airport transfer"
                },
                {
                    "code": "FREEWHITE",
                    "discount_type": "fixed_amount",
                    "discount_value": 150,
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                    "min_order_value": 1000,
                    "max_discount": None,
                    "is_active": True,
                    "description": "Free teeth whitening session (worth $150) with veneer or crown packages"
                }
            ]
        except Exception as e:
            logger.error(f"Error loading promo codes: {str(e)}")
            return []
    
    def get_all_active_offers(self):
        """Get all active promotional offers."""
        now = datetime.utcnow().isoformat()
        return [
            offer for offer in self.offers
            if offer.get('is_active', False) 
            and offer.get('admin_approved', False)
            and offer.get('start_date', None) <= now
            and offer.get('end_date', None) >= now
        ]
    
    def get_featured_offers(self, limit=3):
        """Get featured promotional offers."""
        active_offers = self.get_all_active_offers()
        return active_offers[:limit]
    
    def get_offer_by_id(self, offer_id):
        """Get a specific promotional offer by ID."""
        for offer in self.offers:
            if offer.get('id') == offer_id:
                return offer
        return None
    
    def get_all_promo_codes(self):
        """Get all promo codes."""
        return self.promo_codes
    
    def get_active_promo_codes(self):
        """Get all active promo codes."""
        now = datetime.utcnow().strftime('%Y-%m-%d')
        return [
            code for code in self.promo_codes
            if code.get('is_active', False)
            and code.get('start_date', '2000-01-01') <= now
            and code.get('end_date', '2100-01-01') >= now
        ]
    
    def get_promo_by_code(self, promo_code):
        """Get a specific promo code info."""
        promo_code = promo_code.upper()
        for code in self.promo_codes:
            if code.get('code').upper() == promo_code:
                return code
        return None
    
    def validate_promo_code(self, promo_code):
        """Validate a promo code and return (valid, message)."""
        if not promo_code:
            return False, "No promo code provided"
        
        promo_code = promo_code.upper()
        promo = self.get_promo_by_code(promo_code)
        
        if not promo:
            return False, f"Promo code {promo_code} not found"
        
        if not promo.get('is_active', False):
            return False, f"Promo code {promo_code} is not active"
        
        now = datetime.utcnow().strftime('%Y-%m-%d')
        if promo.get('start_date') > now:
            return False, f"Promo code {promo_code} is not yet valid"
        
        if promo.get('end_date') < now:
            return False, f"Promo code {promo_code} has expired"
        
        return True, f"Promo code {promo_code} is valid"
    
    def calculate_discount(self, promo_code, treatments, subtotal):
        """Calculate discount amount based on promo code."""
        promo_code = promo_code.upper()
        promo = self.get_promo_by_code(promo_code)
        
        if not promo:
            return 0
        
        # Check minimum order value
        min_order_value = promo.get('min_order_value', 0)
        if subtotal < min_order_value:
            return 0
        
        # Calculate discount
        discount_amount = 0
        if promo.get('discount_type') == 'percentage':
            discount_percentage = promo.get('discount_value', 0)
            discount_amount = subtotal * (discount_percentage / 100)
        elif promo.get('discount_type') == 'fixed_amount':
            discount_amount = promo.get('discount_value', 0)
        
        # Apply maximum discount if specified
        max_discount = promo.get('max_discount')
        if max_discount is not None and discount_amount > max_discount:
            discount_amount = max_discount
        
        return discount_amount
    
    def get_promo_details(self, promo_code):
        """Get details about a promo code."""
        return self.get_promo_by_code(promo_code)