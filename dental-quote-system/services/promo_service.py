import logging
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class PromoService:
    """
    Service for handling promotional codes and special offers
    """
    
    def __init__(self):
        """
        Initialize the PromoService
        Load promo codes and special offers from JSON data files
        """
        self.promo_codes = []
        self.special_offers = []
        self.load_data()
    
    def load_data(self) -> None:
        """
        Load promo codes and special offers from JSON data files
        Creates sample data if files don't exist
        """
        # Get data directory path
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        
        # Create data directory if it doesn't exist
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # Load promo codes
        promo_codes_file = os.path.join(data_dir, 'promo_codes.json')
        if os.path.exists(promo_codes_file):
            try:
                with open(promo_codes_file, 'r') as f:
                    self.promo_codes = json.load(f)
            except Exception as e:
                logger.error(f"Error loading promo codes: {e}")
                self.promo_codes = self._create_sample_promo_codes()
        else:
            self.promo_codes = self._create_sample_promo_codes()
            self._save_promo_codes()
        
        # Load special offers
        special_offers_file = os.path.join(data_dir, 'special_offers.json')
        if os.path.exists(special_offers_file):
            try:
                with open(special_offers_file, 'r') as f:
                    self.special_offers = json.load(f)
            except Exception as e:
                logger.error(f"Error loading special offers: {e}")
                self.special_offers = self._create_sample_special_offers()
        else:
            self.special_offers = self._create_sample_special_offers()
            self._save_special_offers()
    
    def _save_promo_codes(self) -> None:
        """
        Save promo codes to JSON file
        """
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        promo_codes_file = os.path.join(data_dir, 'promo_codes.json')
        try:
            with open(promo_codes_file, 'w') as f:
                json.dump(self.promo_codes, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving promo codes: {e}")
    
    def _save_special_offers(self) -> None:
        """
        Save special offers to JSON file
        """
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        special_offers_file = os.path.join(data_dir, 'special_offers.json')
        try:
            with open(special_offers_file, 'w') as f:
                json.dump(self.special_offers, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving special offers: {e}")
    
    def _create_sample_promo_codes(self) -> List[Dict[str, Any]]:
        """
        Create sample promo code data
        """
        now = datetime.utcnow().isoformat()
        return [
            {
                "id": str(uuid.uuid4()),
                "code": "SUMMER15",
                "discount_type": "percentage",
                "discount_value": 15,
                "description": "15% off all dental treatments for summer",
                "start_date": now,
                "end_date": "2025-12-31T23:59:59",
                "is_active": True,
                "min_order_value": 0,
                "max_discount_amount": 500,
                "usage_limit": 1000,
                "current_usage": 0,
                "applicable_treatments": [],  # Empty means applicable to all treatments
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "code": "DENTAL25",
                "discount_type": "percentage",
                "discount_value": 25,
                "description": "25% off selected dental procedures",
                "start_date": now,
                "end_date": "2025-12-31T23:59:59",
                "is_active": True,
                "min_order_value": 1000,
                "max_discount_amount": 1000,
                "usage_limit": 500,
                "current_usage": 0,
                "applicable_treatments": ["dental_implant_standard", "dental_implant_premium", "dental_crowns"],
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "code": "NEWPATIENT",
                "discount_type": "percentage",
                "discount_value": 20,
                "description": "20% off for new patients",
                "start_date": now,
                "end_date": "2025-12-31T23:59:59",
                "is_active": True,
                "min_order_value": 0,
                "max_discount_amount": 750,
                "usage_limit": 2000,
                "current_usage": 0,
                "applicable_treatments": [],  # Empty means applicable to all treatments
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "code": "TEST10",
                "discount_type": "percentage",
                "discount_value": 10,
                "description": "10% off for testing",
                "start_date": now,
                "end_date": "2025-12-31T23:59:59",
                "is_active": True,
                "min_order_value": 0,
                "max_discount_amount": 100,
                "usage_limit": 10000,
                "current_usage": 0,
                "applicable_treatments": [],  # Empty means applicable to all treatments
                "created_at": now,
                "updated_at": now
            }
        ]
    
    def _create_sample_special_offers(self) -> List[Dict[str, Any]]:
        """
        Create sample special offer data
        """
        now = datetime.utcnow().isoformat()
        three_months_later = "2025-08-17T15:15:35.290Z"
        two_months_later = "2025-07-17T15:15:35.290Z"
        four_months_later = "2025-09-17T15:15:35.290Z"
        
        return [
            {
                "id": "ac36590b-b0dc-434e-ba74-d42ab2485e81",
                "clinic_id": "1",
                "title": "Free Consultation Package",
                "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
                "discount_type": "percentage",
                "discount_value": 100,
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
                "start_date": now,
                "end_date": three_months_later,
                "promo_code": "FREECONSULT",
                "terms_conditions": "Applicable for new patients only. One consultation per patient.",
                "banner_image": "/cached-images/70717ea08ff903f399dd8cdf7bbe2d5a.jpg",
                "is_active": True,
                "admin_approved": True,
                "commission_percentage": 20,
                "promotion_level": "premium",
                "homepage_display": True,
                "created_at": now,
                "updated_at": now,
                "admin_reviewed_at": now,
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
                "start_date": now,
                "end_date": three_months_later,
                "promo_code": "LUXHOTEL20",
                "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
                "banner_image": "/cached-images/dbfdaf3bddf4b064773f3e7e2c6b4290.png",
                "is_active": True,
                "admin_approved": True,
                "commission_percentage": 20,
                "promotion_level": "premium",
                "homepage_display": True,
                "created_at": now,
                "updated_at": now,
                "admin_reviewed_at": now,
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
                "start_date": now,
                "end_date": two_months_later,
                "promo_code": "IMPLANTCROWN30",
                "terms_conditions": "Valid for single tooth implant and crown combinations only.",
                "banner_image": "/cached-images/0f840f271c2825eaf4b1b8e89e2d105f.png",
                "is_active": True,
                "admin_approved": True,
                "commission_percentage": 18,
                "promotion_level": "featured",
                "homepage_display": True,
                "created_at": now,
                "updated_at": now,
                "admin_reviewed_at": now,
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
                "start_date": now,
                "end_date": four_months_later,
                "promo_code": "LUXTRAVEL",
                "terms_conditions": "Minimum treatment value of $2000 required. 48-hour advance booking required for transfers.",
                "banner_image": "/cached-images/ba010d660e29ec67e208a6b7d3910201.jpg",
                "is_active": True,
                "admin_approved": True,
                "commission_percentage": 15,
                "promotion_level": "featured",
                "homepage_display": True,
                "created_at": now,
                "updated_at": now,
                "admin_reviewed_at": now,
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
                "start_date": now,
                "end_date": three_months_later,
                "promo_code": "FREEWHITE",
                "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
                "banner_image": "/cached-images/0f998c597de98e30c9da16e4f6587a96.png",
                "is_active": True,
                "admin_approved": True,
                "commission_percentage": 12,
                "promotion_level": "standard",
                "homepage_display": False,
                "created_at": now,
                "updated_at": now,
                "admin_reviewed_at": now,
                "treatment_price_gbp": 150,
                "treatment_price_usd": 195
            }
        ]
    
    def get_all_promo_codes(self) -> List[Dict[str, Any]]:
        """
        Get all promo codes
        """
        return self.promo_codes
    
    def get_active_promo_codes(self) -> List[Dict[str, Any]]:
        """
        Get all active promo codes
        """
        now = datetime.utcnow().isoformat()
        return [
            p for p in self.promo_codes 
            if p.get('is_active') and p.get('start_date') <= now and p.get('end_date') >= now
        ]
    
    def get_promo_code_by_id(self, promo_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific promo code by its ID
        """
        for promo in self.promo_codes:
            if promo.get('id') == promo_id:
                return promo
        return None
    
    def get_promo_code_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific promo code by its code value
        Case-insensitive search
        """
        for promo in self.promo_codes:
            if promo.get('code', '').upper() == code.upper():
                return promo
        return None
    
    def validate_promo_code(self, code: str, order_value: float = 0, treatments: List[str] = None) -> Dict[str, Any]:
        """
        Validate a promo code and return validation result
        """
        result = {
            'valid': False,
            'message': 'Invalid promo code',
            'promo_details': None
        }
        
        if not code or not code.strip():
            result['message'] = 'No promo code provided'
            return result
        
        # Find the promo code
        promo = self.get_promo_code_by_code(code)
        
        if not promo:
            result['message'] = 'Promo code not found'
            return result
        
        # Check if the promo is active
        if not promo.get('is_active'):
            result['message'] = 'Promo code is inactive'
            return result
        
        # Check dates
        now = datetime.utcnow().isoformat()
        if promo.get('start_date') > now:
            result['message'] = 'Promo code is not yet valid'
            return result
        
        if promo.get('end_date') < now:
            result['message'] = 'Promo code has expired'
            return result
        
        # Check usage limit
        if promo.get('usage_limit') and promo.get('current_usage', 0) >= promo.get('usage_limit'):
            result['message'] = 'Promo code usage limit has been reached'
            return result
        
        # Check minimum order value
        if promo.get('min_order_value', 0) > order_value:
            result['message'] = f"Minimum order value of ${promo.get('min_order_value')} not met"
            return result
        
        # Check if the promo code is applicable to the selected treatments
        applicable_treatments = promo.get('applicable_treatments', [])
        if applicable_treatments and treatments:
            if not any(t in applicable_treatments for t in treatments):
                result['message'] = 'Promo code is not applicable to selected treatments'
                return result
        
        # If we've made it this far, the promo code is valid
        result['valid'] = True
        result['message'] = 'Promo code is valid'
        result['promo_details'] = promo
        
        return result
    
    def apply_promo_code(self, code: str, order_value: float = 0, treatments: List[str] = None) -> Dict[str, Any]:
        """
        Apply a promo code and return the discount amount and updated total
        """
        result = {
            'success': False,
            'message': '',
            'original_value': order_value,
            'discount_amount': 0,
            'final_value': order_value,
            'promo_details': None
        }
        
        # Validate the promo code
        validation = self.validate_promo_code(code, order_value, treatments)
        
        if not validation['valid']:
            result['message'] = validation['message']
            return result
        
        # Get the promo details
        promo = validation['promo_details']
        
        # Calculate the discount
        discount_amount = 0
        
        if promo.get('discount_type') == 'percentage':
            discount_amount = (order_value * promo.get('discount_value', 0)) / 100
        elif promo.get('discount_type') == 'fixed_amount':
            discount_amount = promo.get('discount_value', 0)
        
        # Apply maximum discount limit if specified
        if promo.get('max_discount_amount') and discount_amount > promo.get('max_discount_amount'):
            discount_amount = promo.get('max_discount_amount')
        
        # Ensure discount doesn't exceed the order value
        if discount_amount > order_value:
            discount_amount = order_value
        
        # Calculate the final value
        final_value = order_value - discount_amount
        
        # Update the result
        result['success'] = True
        result['message'] = 'Promo code applied successfully'
        result['discount_amount'] = discount_amount
        result['final_value'] = final_value
        result['promo_details'] = promo
        
        # Increment usage counter
        self._increment_promo_usage(promo.get('id'))
        
        return result
    
    def _increment_promo_usage(self, promo_id: str) -> None:
        """
        Increment the usage counter for a promo code
        """
        for promo in self.promo_codes:
            if promo.get('id') == promo_id:
                promo['current_usage'] = promo.get('current_usage', 0) + 1
                
                # Update the updated_at timestamp
                promo['updated_at'] = datetime.utcnow().isoformat()
                
                self._save_promo_codes()
                break
    
    def get_all_special_offers(self) -> List[Dict[str, Any]]:
        """
        Get all special offers
        """
        return self.special_offers
    
    def get_active_special_offers(self) -> List[Dict[str, Any]]:
        """
        Get all active special offers
        """
        now = datetime.utcnow().isoformat()
        return [
            o for o in self.special_offers 
            if o.get('is_active') and o.get('start_date') <= now and o.get('end_date') >= now
        ]
    
    def get_featured_special_offers(self, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Get featured special offers for the homepage
        """
        now = datetime.utcnow().isoformat()
        featured = [
            o for o in self.special_offers 
            if o.get('is_active') and o.get('homepage_display') and o.get('start_date') <= now and o.get('end_date') >= now
        ]
        
        # Sort by promotion level (premium > featured > standard)
        def sort_by_level(offer):
            if offer.get('promotion_level') == 'premium':
                return 0
            elif offer.get('promotion_level') == 'featured':
                return 1
            else:
                return 2
        
        featured.sort(key=sort_by_level)
        
        return featured[:limit]
    
    def get_special_offer_by_id(self, offer_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a special offer by its ID
        """
        for offer in self.special_offers:
            if offer.get('id') == offer_id:
                return offer
        return None
    
    def get_special_offer_by_promo_code(self, promo_code: str) -> Optional[Dict[str, Any]]:
        """
        Get a special offer by its promo code
        Case-insensitive search
        """
        for offer in self.special_offers:
            if offer.get('promo_code', '').upper() == promo_code.upper():
                return offer
        return None