import logging
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

logger = logging.getLogger(__name__)

class PromoService:
    """
    Service for managing promotional codes and special offers.
    Handles validating promo codes, applying discounts, and retrieving special offers.
    """
    
    def __init__(self):
        """Initialize the PromoService."""
        self.promo_codes = self._load_promo_codes()
        self.special_offers = self._load_special_offers()
    
    def _load_promo_codes(self) -> List[Dict[str, Any]]:
        """
        Load promo codes from the data file.
        If the file doesn't exist, return default promo codes.
        """
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            promo_codes_path = os.path.join(data_dir, 'promo_codes.json')
            
            if os.path.exists(promo_codes_path):
                with open(promo_codes_path, 'r') as f:
                    return json.load(f)
            else:
                # If the file doesn't exist, create it with default promo codes
                default_promo_codes = self._get_default_promo_codes()
                with open(promo_codes_path, 'w') as f:
                    json.dump(default_promo_codes, f, indent=2)
                return default_promo_codes
        except Exception as e:
            logger.error(f"Error loading promo codes: {str(e)}")
            return self._get_default_promo_codes()
    
    def _load_special_offers(self) -> List[Dict[str, Any]]:
        """
        Load special offers from the data file.
        If the file doesn't exist, return default special offers.
        """
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            special_offers_path = os.path.join(data_dir, 'special_offers.json')
            
            if os.path.exists(special_offers_path):
                with open(special_offers_path, 'r') as f:
                    return json.load(f)
            else:
                # If the file doesn't exist, create it with default special offers
                default_special_offers = self._get_default_special_offers()
                with open(special_offers_path, 'w') as f:
                    json.dump(default_special_offers, f, indent=2)
                return default_special_offers
        except Exception as e:
            logger.error(f"Error loading special offers: {str(e)}")
            return self._get_default_special_offers()
    
    def _get_default_promo_codes(self) -> List[Dict[str, Any]]:
        """Return a list of default promo codes if data cannot be loaded."""
        return [
            {
                "id": "promo-001",
                "code": "SUMMER15",
                "description": "Summer Special: 15% off all dental treatments",
                "discount_type": "percentage",
                "discount_value": 15,
                "min_order_value": 0,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": [],  # Empty array means applicable to all treatments
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-002",
                "code": "DENTAL25",
                "description": "25% discount on all dental procedures",
                "discount_type": "percentage",
                "discount_value": 25,
                "min_order_value": 1000,
                "max_discount": 500,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": [],
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-003",
                "code": "NEWPATIENT",
                "description": "New patient special: 20% off your first treatment",
                "discount_type": "percentage",
                "discount_value": 20,
                "min_order_value": 0,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": 1,  # Can only be used once per user
                "usage_count": 0,
                "applicable_treatments": [],
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-004",
                "code": "TEST10",
                "description": "Test promo code: 10% off",
                "discount_type": "percentage",
                "discount_value": 10,
                "min_order_value": 0,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": [],
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-005",
                "code": "FREECONSULT",
                "description": "Free dental consultation with any treatment",
                "discount_type": "fixed_amount",
                "discount_value": 100,
                "min_order_value": 500,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": [],
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-006",
                "code": "LUXHOTEL20",
                "description": "20% off premium hotel packages with dental treatment",
                "discount_type": "percentage",
                "discount_value": 20,
                "min_order_value": 1000,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": [],
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-007",
                "code": "IMPLANTCROWN30",
                "description": "30% off when combining implant and crown treatments",
                "discount_type": "percentage",
                "discount_value": 30,
                "min_order_value": 0,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "promo-008",
                "code": "FREEWHITE",
                "description": "Free teeth whitening with any veneer package",
                "discount_type": "fixed_amount",
                "discount_value": 150,
                "min_order_value": 1000,
                "max_discount": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "is_active": True,
                "usage_limit": None,
                "usage_count": 0,
                "applicable_treatments": ["porcelain_veneers"],
                "created_at": "2025-01-01T00:00:00Z"
            }
        ]
    
    def _get_default_special_offers(self) -> List[Dict[str, Any]]:
        """Return a list of default special offers if data cannot be loaded."""
        return [
            {
                "id": "offer-001",
                "title": "Free Consultation Package",
                "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
                "discount_type": "percentage",
                "discount_value": 100,  # 100% off the consultation fee
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "promo_code": "FREECONSULT",
                "terms_conditions": "Applicable for new patients only. One consultation per patient.",
                "banner_image": "/static/images/offers/free-consultation.jpg",
                "is_active": True,
                "admin_approved": True,
                "promotion_level": "premium",
                "homepage_display": True,
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "offer-002",
                "title": "Premium Hotel Deal",
                "description": "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
                "discount_type": "percentage",
                "discount_value": 20,
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "promo_code": "LUXHOTEL20",
                "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
                "banner_image": "/static/images/offers/hotel-deal.jpg",
                "is_active": True,
                "admin_approved": True,
                "promotion_level": "premium",
                "homepage_display": True,
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "offer-003",
                "title": "Dental Implant + Crown Bundle",
                "description": "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
                "discount_type": "percentage",
                "discount_value": 30,
                "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "promo_code": "IMPLANTCROWN30",
                "terms_conditions": "Valid for single tooth implant and crown combinations only.",
                "banner_image": "/static/images/offers/implant-crown-bundle.jpg",
                "is_active": True,
                "admin_approved": True,
                "promotion_level": "featured",
                "homepage_display": True,
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "offer-004",
                "title": "Luxury Airport Transfer",
                "description": "Complimentary luxury airport transfer with premium vehicles when you book any major dental treatment package.",
                "discount_type": "fixed_amount",
                "discount_value": 80,
                "applicable_treatments": ["full_mouth_reconstruction", "hollywood_smile", "all_on_4_implants"],
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "promo_code": "LUXTRAVEL",
                "terms_conditions": "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.",
                "banner_image": "/static/images/offers/airport-transfer.jpg",
                "is_active": True,
                "admin_approved": True,
                "promotion_level": "featured",
                "homepage_display": True,
                "created_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "offer-005",
                "title": "Free Teeth Whitening",
                "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package.",
                "discount_type": "fixed_amount",
                "discount_value": 150,
                "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"],
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "promo_code": "FREEWHITE",
                "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
                "banner_image": "/static/images/offers/free-whitening.jpg",
                "is_active": True,
                "admin_approved": True,
                "promotion_level": "standard",
                "homepage_display": False,
                "created_at": "2025-01-01T00:00:00Z"
            }
        ]
    
    def get_all_promo_codes(self) -> List[Dict[str, Any]]:
        """Retrieve all available promo codes."""
        return self.promo_codes
    
    def get_active_promo_codes(self) -> List[Dict[str, Any]]:
        """Retrieve only active promo codes."""
        now = datetime.utcnow().isoformat()
        return [
            promo for promo in self.promo_codes
            if promo['is_active'] and
               promo['start_date'] <= now and
               promo['end_date'] >= now
        ]
    
    def get_promo_code_by_id(self, promo_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific promo code by its ID."""
        for promo in self.promo_codes:
            if promo['id'] == promo_id:
                return promo
        return None
    
    def get_promo_code_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific promo code by its code value."""
        if not code:
            return None
            
        code_upper = code.upper()
        for promo in self.promo_codes:
            if promo['code'].upper() == code_upper:
                return promo
        return None
    
    def validate_promo_code(self, code: str, subtotal: float = 0, treatment_ids: List[str] = None) -> Dict[str, Any]:
        """
        Validate a promo code and check if it can be applied.
        Returns a dictionary with validation result and error message if invalid.
        """
        if not code:
            return {
                'valid': False,
                'message': 'No promo code provided'
            }
        
        promo = self.get_promo_code_by_code(code)
        
        if not promo:
            return {
                'valid': False,
                'message': 'Invalid promo code'
            }
        
        # Check if the promo code is active
        if not promo['is_active']:
            return {
                'valid': False,
                'message': 'This promo code is inactive'
            }
        
        # Check date validity
        now = datetime.utcnow().isoformat()
        if promo['start_date'] > now:
            return {
                'valid': False,
                'message': 'This promo code is not active yet'
            }
        
        if promo['end_date'] < now:
            return {
                'valid': False,
                'message': 'This promo code has expired'
            }
        
        # Check minimum order value
        if promo['min_order_value'] > subtotal:
            return {
                'valid': False,
                'message': f"Minimum order value of ${promo['min_order_value']} required"
            }
        
        # Check if the promo code is applicable to the selected treatments
        if promo['applicable_treatments'] and treatment_ids:
            applicable_treatments = promo['applicable_treatments']
            has_applicable_treatment = False
            
            for treatment_id in treatment_ids:
                if treatment_id in applicable_treatments:
                    has_applicable_treatment = True
                    break
            
            if not has_applicable_treatment:
                return {
                    'valid': False,
                    'message': 'This promo code is not applicable to your selected treatments'
                }
        
        # If we made it here, the promo code is valid
        return {
            'valid': True,
            'message': 'Promo code applied successfully',
            'promo': promo
        }
    
    def calculate_discount(self, promo: Dict[str, Any], subtotal: float) -> float:
        """Calculate the discount amount based on the promo code and order subtotal."""
        if not promo or subtotal == 0:
            return 0
        
        discount_amount = 0
        
        if promo['discount_type'] == 'percentage':
            discount_amount = subtotal * (promo['discount_value'] / 100)
        elif promo['discount_type'] == 'fixed_amount':
            discount_amount = promo['discount_value']
        
        # Apply maximum discount limit if defined
        if promo['max_discount'] is not None and discount_amount > promo['max_discount']:
            discount_amount = promo['max_discount']
        
        # Ensure discount doesn't exceed subtotal
        if discount_amount > subtotal:
            discount_amount = subtotal
        
        return discount_amount
    
    def increment_usage_count(self, promo_id: str) -> None:
        """Increment the usage count for a promo code."""
        for promo in self.promo_codes:
            if promo['id'] == promo_id:
                promo['usage_count'] += 1
                break
        
        # Save updated promo codes to file
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            promo_codes_path = os.path.join(data_dir, 'promo_codes.json')
            with open(promo_codes_path, 'w') as f:
                json.dump(self.promo_codes, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving promo codes: {str(e)}")
    
    def get_all_special_offers(self) -> List[Dict[str, Any]]:
        """Retrieve all available special offers."""
        return self.special_offers
    
    def get_active_special_offers(self) -> List[Dict[str, Any]]:
        """Retrieve only active special offers."""
        now = datetime.utcnow().isoformat()
        return [
            offer for offer in self.special_offers
            if offer['is_active'] and offer['admin_approved'] and
               offer['start_date'] <= now and
               offer['end_date'] >= now
        ]
    
    def get_featured_special_offers(self, limit: int = 3) -> List[Dict[str, Any]]:
        """Retrieve featured special offers for display on the homepage."""
        active_offers = self.get_active_special_offers()
        featured = [o for o in active_offers if o.get('homepage_display', False)]
        return featured[:limit]
    
    def get_special_offer_by_id(self, offer_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific special offer by its ID."""
        for offer in self.special_offers:
            if offer['id'] == offer_id:
                return offer
        return None