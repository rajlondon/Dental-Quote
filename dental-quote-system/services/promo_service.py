"""
Promo Service for Dental Quote System
Handles promo codes and special offers
"""
import json
import os
from pathlib import Path
from datetime import datetime

class PromoService:
    """
    Service class for handling promotional codes and special offers
    Provides methods to validate, apply, and manage promotions
    """
    
    def __init__(self):
        """Initialize the promo service with sample data"""
        self.data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'promotions.json')
        self.promotions = self._load_promotions()
    
    def _load_promotions(self):
        """Load promotions from JSON file or use sample data if file doesn't exist"""
        # Create data directory if it doesn't exist
        Path(os.path.join(os.path.dirname(__file__), '..', 'data')).mkdir(parents=True, exist_ok=True)
        
        # Check if data file exists
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading promotions file: {e}")
                return self._get_sample_promotions()
        else:
            # Create file with sample data
            sample_data = self._get_sample_promotions()
            self._save_promotions(sample_data)
            return sample_data
    
    def _save_promotions(self, promotions):
        """Save promotions to JSON file"""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(promotions, f, indent=4)
            return True
        except Exception as e:
            print(f"Error saving promotions: {e}")
            return False
    
    def _get_sample_promotions(self):
        """Get sample promotions data"""
        return [
            {
                "id": "summer15_promo",
                "promo_code": "SUMMER15",
                "title": "Summer Special Discount",
                "description": "Get 15% off on all dental treatments this summer",
                "discount_type": "percentage",
                "discount_value": 15,
                "start_date": "2025-05-01",
                "end_date": "2025-08-31",
                "is_active": True,
                "minimum_purchase": 0,
                "applicable_treatments": [],  # Empty means all treatments
                "terms_conditions": "Valid for all treatments. Cannot be combined with other offers.",
                "banner_image": "images/summer-promo.jpg"
            },
            {
                "id": "dental25_promo",
                "promo_code": "DENTAL25",
                "title": "Premium Treatment Discount",
                "description": "25% off on premium dental treatments",
                "discount_type": "percentage",
                "discount_value": 25,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 1000,
                "applicable_treatments": ["dental_implant_premium", "hollywood_smile", "full_mouth_reconstruction"],
                "terms_conditions": "Valid for premium treatments only. Minimum purchase of $1000 required.",
                "banner_image": "images/premium-promo.jpg"
            },
            {
                "id": "newpatient_promo",
                "promo_code": "NEWPATIENT",
                "title": "New Patient Special",
                "description": "Get 20% off on your first dental treatment as a new patient",
                "discount_type": "percentage",
                "discount_value": 20,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 0,
                "applicable_treatments": [],  # Empty means all treatments
                "terms_conditions": "Valid for new patients only. One-time use per patient.",
                "banner_image": "images/new-patient-promo.jpg"
            },
            {
                "id": "test10_promo",
                "promo_code": "TEST10",
                "title": "Test Discount",
                "description": "10% off for testing purposes",
                "discount_type": "percentage",
                "discount_value": 10,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 0,
                "applicable_treatments": [],  # Empty means all treatments
                "terms_conditions": "For testing purposes only.",
                "banner_image": "images/test-promo.jpg"
            },
            {
                "id": "freeconsult_promo",
                "promo_code": "FREECONSULT",
                "title": "Free Consultation Package",
                "description": "Book a dental treatment and get free pre-consultation and aftercare support",
                "discount_type": "fixed_amount",
                "discount_value": 75,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 500,
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "full_mouth_reconstruction"],
                "terms_conditions": "Applicable for new patients only. One consultation per patient.",
                "banner_image": "images/free-consult-promo.jpg"
            },
            {
                "id": "luxhotel20_promo",
                "promo_code": "LUXHOTEL20",
                "title": "Premium Hotel Deal",
                "description": "Save up to 20% on premium hotels with your dental treatment booking",
                "discount_type": "percentage",
                "discount_value": 20,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 1000,
                "applicable_treatments": ["dental_implant_standard", "porcelain_veneers", "dental_crowns"],
                "terms_conditions": "Minimum treatment value of $1000 required. Subject to hotel availability.",
                "banner_image": "images/hotel-promo.jpg"
            },
            {
                "id": "implantcrown30_promo",
                "promo_code": "IMPLANTCROWN30",
                "title": "Dental Implant + Crown Bundle",
                "description": "Get a special bundle price when combining dental implant with a crown",
                "discount_type": "percentage",
                "discount_value": 30,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 0,
                "applicable_treatments": ["dental_implant_standard", "dental_crowns"],
                "terms_conditions": "Valid for single tooth implant and crown combinations only.",
                "banner_image": "images/implant-crown-promo.jpg"
            },
            {
                "id": "freewhite_promo",
                "promo_code": "FREEWHITE",
                "title": "Free Teeth Whitening",
                "description": "Receive a complimentary professional teeth whitening session with any veneer or crown treatment package",
                "discount_type": "fixed_amount",
                "discount_value": 150,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "is_active": True,
                "minimum_purchase": 0,
                "applicable_treatments": ["porcelain_veneers", "dental_crowns", "hollywood_smile"],
                "terms_conditions": "Minimum of 4 veneers or crowns required. Not combinable with other offers.",
                "banner_image": "images/whitening-promo.jpg"
            }
        ]
    
    def get_all_promotions(self):
        """Get all promotions"""
        return self.promotions
    
    def get_active_promotions(self):
        """Get active promotions only"""
        today = datetime.today().strftime('%Y-%m-%d')
        return [
            promo for promo in self.promotions
            if promo['is_active'] 
            and promo['start_date'] <= today 
            and promo['end_date'] >= today
        ]
    
    def get_promotion_by_id(self, promo_id):
        """Get promotion by ID"""
        for promo in self.promotions:
            if promo['id'] == promo_id:
                return promo
        return None
    
    def get_promotion_by_code(self, promo_code):
        """Get promotion by promo code"""
        if not promo_code:
            return None
            
        # Normalize promo code (uppercase, no spaces)
        promo_code = promo_code.strip().upper()
        
        for promo in self.promotions:
            if promo['promo_code'].upper() == promo_code:
                return promo
        return None
    
    def validate_promo_code(self, promo_code, total_amount=0, treatments=None):
        """
        Validate a promo code with optional amount and treatments
        
        Args:
            promo_code (str): Promo code to validate
            total_amount (float, optional): Total purchase amount
            treatments (list, optional): List of treatment IDs
            
        Returns:
            dict: Validation result with 'valid' status and 'message'
        """
        if not promo_code:
            return {'valid': False, 'message': 'No promo code provided'}
        
        # Get promotion by code
        promo = self.get_promotion_by_code(promo_code)
        
        # If no promotion found
        if not promo:
            return {'valid': False, 'message': 'Invalid promo code'}
        
        # Check if promotion is active
        if not promo['is_active']:
            return {'valid': False, 'message': 'This promotion is not active'}
        
        # Check date validity
        today = datetime.today().strftime('%Y-%m-%d')
        if today < promo['start_date'] or today > promo['end_date']:
            return {'valid': False, 'message': 'This promotion has expired or not yet active'}
        
        # Check minimum purchase if applicable
        if promo['minimum_purchase'] > 0 and total_amount < promo['minimum_purchase']:
            return {
                'valid': False, 
                'message': f"Minimum purchase of ${promo['minimum_purchase']} required"
            }
        
        # Check applicable treatments if specified
        if promo['applicable_treatments'] and treatments:
            # Check if any of the selected treatments are applicable
            applicable_match = False
            for treatment_id in treatments:
                if treatment_id in promo['applicable_treatments']:
                    applicable_match = True
                    break
            
            if not applicable_match:
                return {
                    'valid': False, 
                    'message': 'This promo code is not applicable to selected treatments'
                }
        
        # All checks passed
        return {'valid': True, 'message': 'Promo code applied successfully'}
    
    def calculate_discount(self, promo_code, total_amount, treatments=None):
        """
        Calculate discount amount based on promo code
        
        Args:
            promo_code (str): Promo code to apply
            total_amount (float): Total purchase amount
            treatments (list, optional): List of treatment IDs
            
        Returns:
            dict: Discount calculation result
        """
        # Validate promo code first
        validation = self.validate_promo_code(promo_code, total_amount, treatments)
        if not validation['valid']:
            return {
                'success': False,
                'message': validation['message'],
                'discount_amount': 0
            }
        
        # Get promotion details
        promo = self.get_promotion_by_code(promo_code)
        
        # Calculate discount based on type
        discount_amount = 0
        if promo['discount_type'] == 'percentage':
            discount_amount = total_amount * (promo['discount_value'] / 100)
        elif promo['discount_type'] == 'fixed_amount':
            discount_amount = min(promo['discount_value'], total_amount)
        
        return {
            'success': True,
            'message': 'Discount applied successfully',
            'discount_amount': round(discount_amount, 2),
            'promo_details': promo
        }
    
    def add_promotion(self, promo_data):
        """Add a new promotion"""
        # Generate ID if not provided
        if 'id' not in promo_data:
            promo_data['id'] = f"{promo_data['promo_code'].lower()}_promo"
        
        # Add to promotions list
        self.promotions.append(promo_data)
        
        # Save to file
        self._save_promotions(self.promotions)
        
        return promo_data
    
    def update_promotion(self, promo_id, promo_data):
        """Update an existing promotion"""
        for i, promo in enumerate(self.promotions):
            if promo['id'] == promo_id:
                # Update promotion data
                self.promotions[i] = {**promo, **promo_data}
                
                # Save to file
                self._save_promotions(self.promotions)
                
                return self.promotions[i]
        
        return None  # Promotion not found
    
    def delete_promotion(self, promo_id):
        """Delete a promotion"""
        for i, promo in enumerate(self.promotions):
            if promo['id'] == promo_id:
                # Remove promotion
                deleted_promo = self.promotions.pop(i)
                
                # Save to file
                self._save_promotions(self.promotions)
                
                return deleted_promo
        
        return None  # Promotion not found
    
    def get_featured_promotions(self, limit=3):
        """Get featured promotions for homepage"""
        active_promos = self.get_active_promotions()
        
        # Sort by discount value (higher first)
        sorted_promos = sorted(
            active_promos, 
            key=lambda p: p['discount_value'] * (100 if p['discount_type'] == 'fixed_amount' else 1),
            reverse=True
        )
        
        # Return limited number of promotions
        return sorted_promos[:limit]