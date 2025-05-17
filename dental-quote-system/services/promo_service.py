"""
Promotional Service for Dental Quote System

This module provides functionality for handling promotional codes
and special offers, including validation, discount calculation, 
and offer management.
"""

from typing import Dict, List, Any, Optional, Union
import json
import os
from datetime import datetime


class PromoService:
    """
    Service class to manage promotional codes and special offers
    """
    
    # Sample promo codes
    SAMPLE_PROMO_CODES = {
        "SUMMER15": {
            "code": "SUMMER15",
            "description": "Summer Special: 15% off all treatments",
            "discount_type": "percentage",
            "discount_value": 15,
            "applicable_treatments": [],  # Empty means applies to all treatments
            "minimum_order": 0,
            "expiration_date": "2025-09-30",
            "is_active": True,
            "max_uses": 1000,
            "current_uses": 0
        },
        "DENTAL25": {
            "code": "DENTAL25",
            "description": "Premium Offer: 25% off your dental treatments",
            "discount_type": "percentage",
            "discount_value": 25,
            "applicable_treatments": [],
            "minimum_order": 1000,  # Minimum order of $1000
            "expiration_date": "2025-12-31",
            "is_active": True,
            "max_uses": 500,
            "current_uses": 0
        },
        "NEWPATIENT": {
            "code": "NEWPATIENT",
            "description": "New Patient Welcome: 20% off your first treatment",
            "discount_type": "percentage",
            "discount_value": 20,
            "applicable_treatments": [],
            "minimum_order": 0,
            "expiration_date": "2025-12-31",
            "is_active": True,
            "max_uses": 1,  # Only one use per patient
            "current_uses": 0
        },
        "TEST10": {
            "code": "TEST10",
            "description": "Test Promotion: 10% off any treatment",
            "discount_type": "percentage",
            "discount_value": 10,
            "applicable_treatments": [],
            "minimum_order": 0,
            "expiration_date": "2025-12-31",
            "is_active": True,
            "max_uses": None,  # Unlimited uses
            "current_uses": 0
        },
        "FREECONSULT": {
            "code": "FREECONSULT",
            "description": "Free consultation with any major treatment",
            "discount_type": "percentage",
            "discount_value": 100,  # 100% off (free)
            "applicable_treatments": ["dental_examination"],  # Only applies to examination
            "minimum_order": 500,  # Minimum order of $500 on other treatments
            "expiration_date": "2025-12-31",
            "is_active": True,
            "max_uses": 1,
            "current_uses": 0
        },
        "LUXHOTEL20": {
            "code": "LUXHOTEL20",
            "description": "20% discount on premium hotels when booking dental treatments",
            "discount_type": "percentage",
            "discount_value": 20,
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
            "minimum_order": 1000,
            "expiration_date": "2025-08-31",
            "is_active": True,
            "max_uses": 500,
            "current_uses": 0
        },
        "IMPLANTCROWN30": {
            "code": "IMPLANTCROWN30",
            "description": "30% off when booking both implant and crown treatments",
            "discount_type": "percentage",
            "discount_value": 30,
            "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
            "minimum_order": 0,
            "expiration_date": "2025-07-31",
            "is_active": True,
            "max_uses": 300,
            "current_uses": 0
        },
        "FREEWHITE": {
            "code": "FREEWHITE",
            "description": "Free teeth whitening with veneer or crown packages",
            "discount_type": "fixed_amount",
            "discount_value": 200,  # Cost of teeth whitening
            "applicable_treatments": ["teeth_whitening"],
            "minimum_order": 1200,  # Minimum order of $1200 on veneers or crowns
            "expiration_date": "2025-12-31",
            "is_active": True,
            "max_uses": 200,
            "current_uses": 0
        }
    }
    
    # Sample special offers
    SAMPLE_SPECIAL_OFFERS = [
        {
            "id": "ac36590b-b0dc-434e-ba74-d42ab2485e81",
            "clinic_id": "1",
            "title": "Free Consultation Package",
            "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
            "discount_type": "percentage",
            "discount_value": 100,  # 100% off (free)
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
            "start_date": "2025-05-17T15:15:35.290Z",
            "end_date": "2025-08-17T15:15:35.290Z",
            "promo_code": "FREECONSULT",
            "terms_conditions": "Applicable for new patients only. One consultation per patient.",
            "banner_image": "/cached-images/70717ea08ff903f399dd8cdf7bbe2d5a.jpg",
            "is_active": True,
            "admin_approved": True,
            "commission_percentage": 20,
            "promotion_level": "premium",
            "homepage_display": True,
            "created_at": "2025-05-17T15:15:35.290Z",
            "updated_at": "2025-05-17T15:15:35.290Z",
            "admin_reviewed_at": "2025-05-17T15:15:35.290Z",
            "treatment_price_gbp": 75,
            "treatment_price_usd": 95
        },
        {
            "id": "134cdb0f-e783-47f5-a502-70e3960f7246",
            "clinic_id": "2",
            "title": "Premium Hotel Deal",
            "description": "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
            "discount_type": "percentage",
            "discount_value": 20,
            "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
            "start_date": "2025-05-17T15:15:35.290Z",
            "end_date": "2025-08-17T15:15:35.290Z",
            "promo_code": "LUXHOTEL20",
            "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
            "banner_image": "/cached-images/dbfdaf3bddf4b064773f3e7e2c6b4290.png",
            "is_active": True,
            "admin_approved": True,
            "commission_percentage": 20,
            "promotion_level": "premium",
            "homepage_display": True,
            "created_at": "2025-05-17T15:15:35.290Z",
            "updated_at": "2025-05-17T15:15:35.290Z",
            "admin_reviewed_at": "2025-05-17T15:15:35.290Z",
            "treatment_price_gbp": 250,
            "treatment_price_usd": 325
        },
        {
            "id": "3e6a315d-9d9f-4b56-97da-4b3d4b4b5367",
            "clinic_id": "3",
            "title": "Dental Implant + Crown Bundle",
            "description": "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
            "discount_type": "percentage",
            "discount_value": 30,
            "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
            "start_date": "2025-05-17T15:15:35.290Z",
            "end_date": "2025-07-17T15:15:35.290Z",
            "promo_code": "IMPLANTCROWN30",
            "terms_conditions": "Valid for single tooth implant and crown combinations only.",
            "banner_image": "/cached-images/0f840f271c2825eaf4b1b8e89e2d105f.png",
            "is_active": True,
            "admin_approved": True,
            "commission_percentage": 18,
            "promotion_level": "featured",
            "homepage_display": True,
            "created_at": "2025-05-17T15:15:35.290Z",
            "updated_at": "2025-05-17T15:15:35.290Z",
            "admin_reviewed_at": "2025-05-17T15:15:35.290Z",
            "treatment_price_gbp": 1200,
            "treatment_price_usd": 1550
        },
        {
            "id": "72e65d76-4cd5-4fd2-9323-8c35f3a9b9f0",
            "clinic_id": "4",
            "title": "Luxury Airport Transfer",
            "description": "Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.",
            "discount_type": "fixed_amount",
            "discount_value": 80,
            "applicable_treatments": ["full_mouth_reconstruction", "hollywood_smile", "all_on_4_implants"],
            "start_date": "2025-05-17T15:15:35.290Z",
            "end_date": "2025-09-17T15:15:35.290Z",
            "promo_code": "LUXTRAVEL",
            "terms_conditions": "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.",
            "banner_image": "/cached-images/ba010d660e29ec67e208a6b7d3910201.jpg",
            "is_active": True,
            "admin_approved": True,
            "commission_percentage": 15,
            "promotion_level": "featured",
            "homepage_display": True,
            "created_at": "2025-05-17T15:15:35.290Z",
            "updated_at": "2025-05-17T15:15:35.290Z",
            "admin_reviewed_at": "2025-05-17T15:15:35.290Z",
            "treatment_price_gbp": 180,
            "treatment_price_usd": 230
        },
        {
            "id": "a9f87e54-3c21-4f89-bc6d-1c2a1dfb76e9",
            "clinic_id": "5",
            "title": "Free Teeth Whitening",
            "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.",
            "discount_type": "fixed_amount",
            "discount_value": 150,
            "applicable_treatments": ["Veneers", "Crowns", "Hollywood Smile"],
            "start_date": "2025-05-17T15:15:35.290Z",
            "end_date": "2025-08-17T15:15:35.290Z",
            "promo_code": "FREEWHITE",
            "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
            "banner_image": "/cached-images/0f998c597de98e30c9da16e4f6587a96.png",
            "is_active": True,
            "admin_approved": True,
            "commission_percentage": 12,
            "promotion_level": "standard",
            "homepage_display": False,
            "created_at": "2025-05-17T15:15:35.290Z",
            "updated_at": "2025-05-17T15:15:35.290Z",
            "admin_reviewed_at": "2025-05-17T15:15:35.290Z",
            "treatment_price_gbp": 150,
            "treatment_price_usd": 195
        }
    ]
    
    @classmethod
    def get_all_promo_codes(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get all promotional codes
        
        Returns:
            Dictionary of promo code dictionaries keyed by code
        """
        # In a production environment, this would fetch from a database
        # For now, we return the sample data
        return cls.SAMPLE_PROMO_CODES
    
    @classmethod
    def get_promo_code(cls, code: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific promotional code by its code
        
        Args:
            code: The promotional code string
            
        Returns:
            Promotional code dictionary or None if not found
        """
        promo_codes = cls.get_all_promo_codes()
        return promo_codes.get(code.upper())
    
    @classmethod
    def validate_promo_code(cls, code: str, subtotal: float = 0, treatments: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Validate a promotional code for applicability
        
        Args:
            code: The promotional code to validate
            subtotal: The current subtotal amount of the quote
            treatments: List of treatment dictionaries in the quote
            
        Returns:
            Dictionary with validation result and message
        """
        promo_data = cls.get_promo_code(code)
        
        # Check if code exists
        if not promo_data:
            return {
                "success": False,
                "message": "Invalid promotion code. Please check and try again."
            }
        
        # Check if code is active
        if not promo_data.get("is_active", False):
            return {
                "success": False,
                "message": "This promotional code is no longer active."
            }
        
        # Check if code has expired
        expiration_date = promo_data.get("expiration_date")
        if expiration_date:
            try:
                exp_date = datetime.strptime(expiration_date, "%Y-%m-%d")
                if exp_date < datetime.now():
                    return {
                        "success": False,
                        "message": "This promotional code has expired."
                    }
            except (ValueError, TypeError):
                # If date format is invalid, skip expiration check
                pass
        
        # Check usage limits
        max_uses = promo_data.get("max_uses")
        current_uses = promo_data.get("current_uses", 0)
        
        if max_uses is not None and current_uses >= max_uses:
            return {
                "success": False,
                "message": "This promotional code has reached its maximum usage limit."
            }
        
        # Check minimum order amount
        minimum_order = promo_data.get("minimum_order", 0)
        if subtotal < minimum_order:
            return {
                "success": False,
                "message": f"This promotion requires a minimum order of ${minimum_order}."
            }
        
        # Check for applicable treatments
        applicable_treatments = promo_data.get("applicable_treatments", [])
        if applicable_treatments and treatments:
            # Extract treatment IDs from the treatments list
            treatment_ids = [t.get("id") for t in treatments]
            
            # Check if any of the required applicable treatments are in the cart
            if not any(t_id in applicable_treatments for t_id in treatment_ids):
                treatment_names = cls._get_applicable_treatment_names(applicable_treatments)
                return {
                    "success": False,
                    "message": f"This promotion requires at least one of these treatments: {treatment_names}."
                }
        
        # All checks passed
        return {
            "success": True,
            "message": "Promotional code applied successfully!",
            "promo_data": promo_data
        }
    
    @classmethod
    def _get_applicable_treatment_names(cls, treatment_ids: List[str]) -> str:
        """
        Get a comma-separated string of treatment names for display
        
        Args:
            treatment_ids: List of treatment IDs
            
        Returns:
            Comma-separated string of treatment names
        """
        # In a real application, this would look up the names from the treatment service
        treatment_map = {
            "dental_implant_standard": "Standard Dental Implant",
            "dental_implant_premium": "Premium Dental Implant",
            "dental_crowns": "Porcelain Crown",
            "porcelain_veneers": "Porcelain Veneers",
            "teeth_whitening": "Teeth Whitening",
            "root_canal": "Root Canal Treatment",
            "full_mouth_reconstruction": "Full Mouth Reconstruction",
            "dental_bridge": "Dental Bridge",
            "dental_bonding": "Dental Bonding",
            "invisalign_treatment": "Invisalign Treatment",
            "dental_examination": "Dental Examination",
            "tooth_extraction": "Tooth Extraction",
            "bone_grafting": "Bone Grafting",
            "dental_filling": "Dental Filling",
            "professional_cleaning": "Professional Cleaning",
            "hollywood_smile": "Hollywood Smile Makeover",
            "all_on_4_implants": "All-on-4 Implants",
            "wisdom_tooth_removal": "Wisdom Tooth Removal",
            "gum_contouring": "Gum Contouring",
            "dental_sealants": "Dental Sealants"
        }
        
        names = [treatment_map.get(t_id, t_id) for t_id in treatment_ids]
        return ", ".join(names)
    
    @classmethod
    def calculate_discount(cls, promo_data: Dict[str, Any], subtotal: float, treatments: List[Dict[str, Any]]) -> float:
        """
        Calculate the discount amount based on the promotion details
        
        Args:
            promo_data: Promotional code data dictionary
            subtotal: Current subtotal amount
            treatments: List of treatment dictionaries
            
        Returns:
            Discount amount as a float
        """
        if not promo_data:
            return 0.0
        
        discount_type = promo_data.get("discount_type")
        discount_value = promo_data.get("discount_value", 0)
        applicable_treatments = promo_data.get("applicable_treatments", [])
        
        # If no applicable treatments specified, apply to entire subtotal
        if not applicable_treatments:
            if discount_type == "percentage":
                return (discount_value / 100) * subtotal
            elif discount_type == "fixed_amount":
                return min(discount_value, subtotal)  # Can't discount more than the subtotal
            return 0.0
        
        # Otherwise, apply only to applicable treatments
        applicable_subtotal = 0
        for treatment in treatments:
            if treatment.get("id") in applicable_treatments:
                treatment_price = treatment.get("price", 0)
                treatment_quantity = treatment.get("quantity", 1)
                applicable_subtotal += treatment_price * treatment_quantity
        
        if discount_type == "percentage":
            return (discount_value / 100) * applicable_subtotal
        elif discount_type == "fixed_amount":
            return min(discount_value, applicable_subtotal)
        
        return 0.0
    
    @classmethod
    def update_promo_code_usage(cls, code: str) -> bool:
        """
        Increment the usage count for a promo code
        
        Args:
            code: The promotional code
            
        Returns:
            True if successful, False otherwise
        """
        # In a production environment, this would update a database
        # For this mock implementation, we update the in-memory data
        promo_codes = cls.get_all_promo_codes()
        if code.upper() in promo_codes:
            promo_data = promo_codes[code.upper()]
            promo_data["current_uses"] = promo_data.get("current_uses", 0) + 1
            return True
        return False
    
    @classmethod
    def get_all_special_offers(cls) -> List[Dict[str, Any]]:
        """
        Get all special offers
        
        Returns:
            List of special offer dictionaries
        """
        # In a production environment, this would fetch from a database
        return cls.SAMPLE_SPECIAL_OFFERS
    
    @classmethod
    def get_active_special_offers(cls) -> List[Dict[str, Any]]:
        """
        Get all active special offers
        
        Returns:
            List of active special offer dictionaries
        """
        all_offers = cls.get_all_special_offers()
        now = datetime.now().isoformat()
        
        # Filter for active offers within the valid date range
        return [
            offer for offer in all_offers
            if offer.get("is_active", False) and
               offer.get("admin_approved", False) and
               offer.get("start_date", "") <= now and
               offer.get("end_date", "") >= now
        ]
    
    @classmethod
    def get_homepage_special_offers(cls) -> List[Dict[str, Any]]:
        """
        Get special offers that should be displayed on the homepage
        
        Returns:
            List of special offer dictionaries for homepage display
        """
        active_offers = cls.get_active_special_offers()
        
        # Filter for offers marked for homepage display
        return [
            offer for offer in active_offers
            if offer.get("homepage_display", False)
        ]
    
    @classmethod
    def get_special_offer_by_id(cls, offer_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific special offer by ID
        
        Args:
            offer_id: The unique identifier for the special offer
            
        Returns:
            Special offer dictionary or None if not found
        """
        offers = cls.get_all_special_offers()
        for offer in offers:
            if offer.get("id") == offer_id:
                return offer
        return None
    
    @classmethod
    def get_special_offer_by_promo_code(cls, promo_code: str) -> Optional[Dict[str, Any]]:
        """
        Get a special offer associated with a specific promo code
        
        Args:
            promo_code: The promotional code to search for
            
        Returns:
            Special offer dictionary or None if not found
        """
        offers = cls.get_all_special_offers()
        for offer in offers:
            if offer.get("promo_code") == promo_code.upper():
                return offer
        return None
    
    @classmethod
    def validate_special_offer(cls, offer_id: str, subtotal: float = 0, treatments: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Validate if a special offer can be applied
        
        Args:
            offer_id: The ID of the special offer
            subtotal: The current subtotal amount
            treatments: List of treatment dictionaries
            
        Returns:
            Dictionary with validation result and message
        """
        offer = cls.get_special_offer_by_id(offer_id)
        if not offer:
            return {
                "success": False,
                "message": "Invalid special offer."
            }
        
        # Check if offer is active and approved
        if not offer.get("is_active", False) or not offer.get("admin_approved", False):
            return {
                "success": False,
                "message": "This special offer is no longer active."
            }
        
        # Check if offer is within valid date range
        now = datetime.now().isoformat()
        if offer.get("start_date", "") > now or offer.get("end_date", "") < now:
            return {
                "success": False,
                "message": "This special offer has expired or is not yet active."
            }
        
        # Use promo code validation for further checks
        promo_code = offer.get("promo_code")
        if promo_code:
            return cls.validate_promo_code(promo_code, subtotal, treatments)
        
        # If no promo code associated, just validate the offer itself
        return {
            "success": True,
            "message": "Special offer applied successfully!",
            "offer_data": offer
        }