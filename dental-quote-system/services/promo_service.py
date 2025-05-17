"""
Promotion Service for Dental Quote System
Manages promotional offers and discount codes
"""

import json
import os
import uuid
from datetime import datetime

class PromoService:
    """
    Service for managing promotional offers and discount codes
    """
    
    def __init__(self):
        """
        Initialize the promotion service
        
        Loads promotion data from JSON file or creates sample data if not available
        """
        self.promotions = []
        self.promo_codes = {}
        
        # Load promotions from data file if available
        self._load_promotions()
        
        # If no promotions were loaded, create sample data
        if not self.promotions:
            self._create_sample_promotions()
    
    def _load_promotions(self):
        """
        Load promotions from JSON data file
        """
        try:
            # Attempt to load from data file
            data_file = os.path.join(os.path.dirname(__file__), '../data/promotions.json')
            
            if os.path.exists(data_file):
                with open(data_file, 'r') as file:
                    data = json.load(file)
                    self.promotions = data.get('promotions', [])
                    self.promo_codes = data.get('promo_codes', {})
                
                return True
        except Exception as e:
            print(f"Error loading promotions: {e}")
        
        return False
    
    def _create_sample_promotions(self):
        """
        Create sample promotion data
        """
        # Create sample promotional offers
        self.promotions = [
            {
                "id": "summer2025",
                "title": "Summer 2025 Special",
                "description": "Get 15% off all dental treatments this summer. Limited time offer!",
                "discount_type": "percentage",
                "discount_value": 15,
                "applicable_treatments": [],  # Empty means applies to all treatments
                "minimum_purchase": 0,
                "start_date": "2025-06-01",
                "end_date": "2025-08-31",
                "promo_code": "SUMMER15",
                "terms_conditions": "Cannot be combined with other offers. Valid for treatments booked by August 31, 2025.",
                "banner_image": "images/promos/summer_special.jpg",
                "is_active": True
            },
            {
                "id": "new_patient_2025",
                "title": "New Patient Discount",
                "description": "New patients receive 20% off their first dental treatment. Welcome to our clinic!",
                "discount_type": "percentage",
                "discount_value": 20,
                "applicable_treatments": [],  # Empty means applies to all treatments
                "minimum_purchase": 0,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "promo_code": "NEWPATIENT",
                "terms_conditions": "Valid for first-time patients only. Cannot be combined with other offers.",
                "banner_image": "images/promos/new_patient.jpg",
                "is_active": True
            },
            {
                "id": "implant_special",
                "title": "Dental Implant + Crown Bundle",
                "description": "Get a special bundle price when combining dental implant with a crown. Save up to 30% compared to individual procedures.",
                "discount_type": "percentage",
                "discount_value": 30,
                "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                "minimum_purchase": 0,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "promo_code": "IMPLANTCROWN30",
                "terms_conditions": "Valid for single tooth implant and crown combinations only.",
                "banner_image": "images/promos/implant_crown.jpg",
                "is_active": True
            },
            {
                "id": "hotel_deal",
                "title": "Premium Hotel Deal",
                "description": "Save up to 20% on premium hotels with your dental treatment booking. Enjoy luxury accommodations while you receive top-quality dental care.",
                "discount_type": "percentage",
                "discount_value": 20,
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
                "minimum_purchase": 1000,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "promo_code": "LUXHOTEL20",
                "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
                "banner_image": "images/promos/hotel_deal.jpg",
                "is_active": True
            },
            {
                "id": "free_consultation",
                "title": "Free Consultation Package",
                "description": "Book a dental treatment and get free pre-consultation and aftercare support with our experienced dental specialists.",
                "discount_type": "fixed_amount",
                "discount_value": 120,  # Value of the consultation
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
                "minimum_purchase": 0,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "promo_code": "FREECONSULT",
                "terms_conditions": "Applicable for new patients only. One consultation per patient.",
                "banner_image": "images/promos/free_consult.jpg",
                "is_active": True
            },
            {
                "id": "testing_discount",
                "title": "Test Discount",
                "description": "10% off for testing purposes",
                "discount_type": "percentage",
                "discount_value": 10,
                "applicable_treatments": [],
                "minimum_purchase": 0,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "promo_code": "TEST10",
                "terms_conditions": "For testing purposes only.",
                "banner_image": "images/promos/test_discount.jpg",
                "is_active": True
            }
        ]
        
        # Create promo code dictionary for easy lookup
        for promo in self.promotions:
            if promo.get('promo_code'):
                self.promo_codes[promo.get('promo_code')] = promo
        
        # Save sample data to file
        self._save_promotions()
    
    def _save_promotions(self):
        """
        Save promotions data to JSON file
        """
        try:
            # Ensure data directory exists
            data_dir = os.path.join(os.path.dirname(__file__), '../data')
            os.makedirs(data_dir, exist_ok=True)
            
            # Save to data file
            data_file = os.path.join(data_dir, 'promotions.json')
            
            with open(data_file, 'w') as file:
                json.dump({
                    'promotions': self.promotions,
                    'promo_codes': self.promo_codes
                }, file, indent=4)
            
            return True
        except Exception as e:
            print(f"Error saving promotions: {e}")
        
        return False
    
    def get_all_promotions(self):
        """
        Get all available promotions
        
        Returns:
            list: List of all promotions
        """
        return self.promotions
    
    def get_active_promotions(self):
        """
        Get all active promotions
        
        Returns:
            list: List of active promotions
        """
        today = datetime.now().strftime('%Y-%m-%d')
        
        return [
            p for p in self.promotions
            if p.get('is_active') and p.get('start_date') <= today and p.get('end_date') >= today
        ]
    
    def get_promotion_by_id(self, promotion_id):
        """
        Get a promotion by its ID
        
        Args:
            promotion_id (str): The ID of the promotion
            
        Returns:
            dict: The promotion data or None if not found
        """
        for promotion in self.promotions:
            if promotion.get('id') == promotion_id:
                return promotion
        
        return None
    
    def get_promotion_by_code(self, promo_code):
        """
        Get a promotion by its promo code
        
        Args:
            promo_code (str): The promotional code
            
        Returns:
            dict: The promotion data or None if not found
        """
        return self.promo_codes.get(promo_code.upper())
    
    def is_valid_promo_code(self, promo_code):
        """
        Check if a promo code is valid and active
        
        Args:
            promo_code (str): The promotional code to check
            
        Returns:
            bool: True if the code is valid and active, False otherwise
        """
        if not promo_code:
            return False
        
        promotion = self.get_promotion_by_code(promo_code.upper())
        
        if not promotion:
            return False
        
        # Check if promotion is active and within date range
        today = datetime.now().strftime('%Y-%m-%d')
        return (
            promotion.get('is_active', False) and
            promotion.get('start_date', '') <= today and
            promotion.get('end_date', '') >= today
        )
    
    def apply_promo_code(self, promo_code, selected_treatments):
        """
        Apply a promo code to selected treatments
        
        Args:
            promo_code (str): The promotional code to apply
            selected_treatments (list): List of selected treatments
            
        Returns:
            dict: Result containing success status, message, and discount details
        """
        if not promo_code:
            return {
                'success': False,
                'message': 'No promo code provided'
            }
        
        promotion = self.get_promotion_by_code(promo_code.upper())
        
        if not promotion:
            return {
                'success': False,
                'message': 'Invalid promo code'
            }
        
        # Check if promotion is active and within date range
        today = datetime.now().strftime('%Y-%m-%d')
        if not (
            promotion.get('is_active', False) and
            promotion.get('start_date', '') <= today and
            promotion.get('end_date', '') >= today
        ):
            return {
                'success': False,
                'message': 'This promotion is no longer valid'
            }
        
        # Calculate subtotal of selected treatments
        subtotal = sum(
            treatment.get('price', 0) * treatment.get('quantity', 1) 
            for treatment in selected_treatments
        )
        
        # Check minimum purchase requirement
        minimum_purchase = promotion.get('minimum_purchase', 0)
        if minimum_purchase > 0 and subtotal < minimum_purchase:
            return {
                'success': False,
                'message': f'Minimum purchase of ${minimum_purchase} required for this promotion'
            }
        
        # Check applicable treatments
        applicable_treatments = promotion.get('applicable_treatments', [])
        if applicable_treatments:
            # Check if any selected treatment is applicable
            has_applicable_treatments = any(
                treatment.get('id') in applicable_treatments
                for treatment in selected_treatments
            )
            
            if not has_applicable_treatments:
                # Get names of applicable treatments for error message
                from services.treatment_service import TreatmentService
                treatment_service = TreatmentService()
                applicable_names = []
                
                for treatment_id in applicable_treatments:
                    treatment = treatment_service.get_treatment_by_id(treatment_id)
                    if treatment:
                        applicable_names.append(treatment.get('name'))
                
                return {
                    'success': False,
                    'message': f'This promotion is only applicable to the following treatments: {", ".join(applicable_names)}'
                }
        
        # Calculate discount
        discount_type = promotion.get('discount_type')
        discount_value = promotion.get('discount_value', 0)
        discount_amount = 0
        
        if discount_type == 'percentage':
            discount_amount = subtotal * (discount_value / 100)
        elif discount_type == 'fixed_amount':
            discount_amount = discount_value
            # Ensure discount doesn't exceed subtotal
            discount_amount = min(discount_amount, subtotal)
        
        # Calculate total after discount
        total = subtotal - discount_amount
        
        return {
            'success': True,
            'message': 'Promotion applied successfully',
            'promotion': promotion,
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total
        }
    
    def get_featured_promotions(self, limit=3):
        """
        Get featured promotions for display on homepage
        
        Args:
            limit (int): Maximum number of promotions to return
            
        Returns:
            list: List of featured promotions
        """
        active_promotions = self.get_active_promotions()
        
        # Sort by discount value (higher first)
        sorted_promotions = sorted(
            active_promotions, 
            key=lambda p: p.get('discount_value', 0), 
            reverse=True
        )
        
        return sorted_promotions[:limit]
    
    def get_eligible_promotions_for_treatments(self, selected_treatments):
        """
        Get promotions that are eligible for the selected treatments
        
        Args:
            selected_treatments (list): List of selected treatments
            
        Returns:
            list: List of eligible promotions
        """
        if not selected_treatments:
            return []
        
        active_promotions = self.get_active_promotions()
        eligible_promotions = []
        
        # Calculate subtotal
        subtotal = sum(
            treatment.get('price', 0) * treatment.get('quantity', 1) 
            for treatment in selected_treatments
        )
        
        # Get IDs of selected treatments
        selected_treatment_ids = [t.get('id') for t in selected_treatments]
        
        for promotion in active_promotions:
            # Check minimum purchase requirement
            minimum_purchase = promotion.get('minimum_purchase', 0)
            if minimum_purchase > 0 and subtotal < minimum_purchase:
                continue
            
            # Check applicable treatments
            applicable_treatments = promotion.get('applicable_treatments', [])
            if applicable_treatments:
                # Check if any selected treatment is applicable
                has_applicable_treatments = any(
                    treatment_id in applicable_treatments
                    for treatment_id in selected_treatment_ids
                )
                
                if not has_applicable_treatments:
                    continue
            
            # Promotion is eligible
            eligible_promotions.append(promotion)
        
        return eligible_promotions