import logging
import json
import os
import uuid
from typing import Dict, List, Any, Optional, Union

logger = logging.getLogger(__name__)

class TreatmentService:
    """
    Service for managing dental treatments, including retrieving treatment details,
    categorizing treatments, and providing treatment recommendations.
    """
    
    def __init__(self):
        """Initialize the TreatmentService."""
        self.treatments = self._load_treatments()
        self.categories = self._load_categories()
    
    def _load_treatments(self) -> List[Dict[str, Any]]:
        """
        Load treatments from the data file.
        If the file doesn't exist, return default treatments.
        """
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            treatments_path = os.path.join(data_dir, 'treatments.json')
            
            if os.path.exists(treatments_path):
                with open(treatments_path, 'r') as f:
                    return json.load(f)
            else:
                # If the file doesn't exist, create it with default treatments
                default_treatments = self._get_default_treatments()
                with open(treatments_path, 'w') as f:
                    json.dump(default_treatments, f, indent=2)
                return default_treatments
        except Exception as e:
            logger.error(f"Error loading treatments: {str(e)}")
            return self._get_default_treatments()
    
    def _load_categories(self) -> Dict[str, Dict[str, Any]]:
        """
        Load treatment categories from the data file.
        If the file doesn't exist, return default categories.
        """
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            categories_path = os.path.join(data_dir, 'categories.json')
            
            if os.path.exists(categories_path):
                with open(categories_path, 'r') as f:
                    return json.load(f)
            else:
                # If the file doesn't exist, create it with default categories
                default_categories = self._get_default_categories()
                with open(categories_path, 'w') as f:
                    json.dump(default_categories, f, indent=2)
                return default_categories
        except Exception as e:
            logger.error(f"Error loading categories: {str(e)}")
            return self._get_default_categories()
    
    def _get_default_treatments(self) -> List[Dict[str, Any]]:
        """Return a list of default treatments if data cannot be loaded."""
        return [
            {
                "id": "dental_implant_standard",
                "name": "Standard Dental Implant",
                "description": "Titanium implant with porcelain crown, providing a natural-looking and durable replacement for a missing tooth.",
                "price": 695,
                "category_id": "implants",
                "duration_days": 5,
                "recovery_time": "5-7 days",
                "is_popular": True
            },
            {
                "id": "dental_implant_premium",
                "name": "Premium Dental Implant",
                "description": "Premium implant using advanced materials with lifetime warranty, offering superior aesthetics and longevity.",
                "price": 895,
                "category_id": "implants",
                "duration_days": 5,
                "recovery_time": "5-7 days",
                "is_popular": False
            },
            {
                "id": "porcelain_veneers",
                "name": "Porcelain Veneers",
                "description": "Thin porcelain shells that cover the front surface of teeth to improve appearance, providing a natural look and feel.",
                "price": 350,
                "category_id": "cosmetic",
                "duration_days": 3,
                "recovery_time": "1-2 days",
                "is_popular": True
            },
            {
                "id": "teeth_whitening",
                "name": "Professional Teeth Whitening",
                "description": "Advanced in-clinic whitening procedure that dramatically enhances your smile by removing stains and discoloration.",
                "price": 250,
                "category_id": "cosmetic",
                "duration_days": 1,
                "recovery_time": "None",
                "is_popular": True
            },
            {
                "id": "dental_crowns",
                "name": "Dental Crowns",
                "description": "Custom-made porcelain crown that restores the strength, shape, and appearance of a damaged tooth.",
                "price": 320,
                "category_id": "restorative",
                "duration_days": 3,
                "recovery_time": "1-2 days",
                "is_popular": True
            },
            {
                "id": "root_canal",
                "name": "Root Canal Treatment",
                "description": "Procedure to treat infected pulp in a tooth by removing infection and protecting the tooth from future infection.",
                "price": 380,
                "category_id": "restorative",
                "duration_days": 2,
                "recovery_time": "2-3 days",
                "is_popular": False
            },
            {
                "id": "dental_bridge",
                "name": "Dental Bridge",
                "description": "Fixed dental restoration used to replace one or more missing teeth by joining an artificial tooth to adjacent teeth.",
                "price": 650,
                "category_id": "restorative",
                "duration_days": 4,
                "recovery_time": "2-3 days",
                "is_popular": False
            },
            {
                "id": "hollywood_smile",
                "name": "Hollywood Smile",
                "description": "Complete smile makeover using a combination of veneers, crowns, and whitening to achieve a perfect 'Hollywood' smile.",
                "price": 2200,
                "category_id": "cosmetic",
                "duration_days": 7,
                "recovery_time": "3-5 days",
                "is_popular": True
            },
            {
                "id": "all_on_4_implants",
                "name": "All-on-4 Dental Implants",
                "description": "Complete arch replacement using just 4 implants, providing a permanent solution for multiple missing teeth.",
                "price": 4500,
                "category_id": "implants",
                "duration_days": 7,
                "recovery_time": "7-10 days",
                "is_popular": False
            },
            {
                "id": "full_mouth_reconstruction",
                "name": "Full Mouth Reconstruction",
                "description": "Comprehensive treatment plan involving multiple procedures to restore all teeth in both upper and lower jaws.",
                "price": 6500,
                "category_id": "restorative",
                "duration_days": 14,
                "recovery_time": "10-14 days",
                "is_popular": False
            },
            {
                "id": "invisalign",
                "name": "Invisalign Clear Aligners",
                "description": "Transparent, removable aligners that gradually straighten teeth without the look of traditional braces.",
                "price": 1950,
                "category_id": "orthodontics",
                "duration_days": 3,
                "recovery_time": "None",
                "is_popular": True
            },
            {
                "id": "metal_braces",
                "name": "Traditional Metal Braces",
                "description": "Standard metal braces for effective teeth straightening, suitable for complex orthodontic issues.",
                "price": 1600,
                "category_id": "orthodontics",
                "duration_days": 3,
                "recovery_time": "2-3 days",
                "is_popular": False
            }
        ]
    
    def _get_default_categories(self) -> Dict[str, Dict[str, Any]]:
        """Return default treatment categories if data cannot be loaded."""
        return {
            "implants": {
                "name": "Dental Implants",
                "description": "Permanent replacements for missing teeth that look, feel, and function like natural teeth.",
                "order": 1,
                "treatments": []  # Will be populated dynamically
            },
            "cosmetic": {
                "name": "Cosmetic Dentistry",
                "description": "Procedures focused on improving the appearance of your smile through various treatments.",
                "order": 2,
                "treatments": []  # Will be populated dynamically
            },
            "restorative": {
                "name": "Restorative Treatments",
                "description": "Treatments to repair or replace damaged teeth and restore proper dental function.",
                "order": 3,
                "treatments": []  # Will be populated dynamically
            },
            "orthodontics": {
                "name": "Orthodontics",
                "description": "Treatments to align and straighten teeth, improving both appearance and function.",
                "order": 4,
                "treatments": []  # Will be populated dynamically
            }
        }
    
    def get_all_treatments(self) -> List[Dict[str, Any]]:
        """Retrieve all available treatments."""
        return self.treatments
    
    def get_popular_treatments(self, limit: int = 6) -> List[Dict[str, Any]]:
        """Retrieve popular treatments for display on the homepage."""
        popular = [t for t in self.treatments if t.get('is_popular', False)]
        return popular[:limit]
    
    def get_treatment_by_id(self, treatment_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific treatment by its ID."""
        for treatment in self.treatments:
            if treatment['id'] == treatment_id:
                return treatment
        return None
    
    def get_treatments_by_category(self, category_id: str) -> List[Dict[str, Any]]:
        """Retrieve all treatments in a specific category."""
        return [t for t in self.treatments if t['category_id'] == category_id]
    
    def get_categorized_treatments(self) -> Dict[str, Dict[str, Any]]:
        """
        Organize treatments by category for display in the quote builder.
        Returns a dictionary with category IDs as keys and category objects as values.
        Each category object includes the treatments that belong to it.
        """
        categorized = self.categories.copy()
        
        # Populate the treatments list for each category
        for treatment in self.treatments:
            category_id = treatment['category_id']
            if category_id in categorized:
                if 'treatments' not in categorized[category_id]:
                    categorized[category_id]['treatments'] = []
                categorized[category_id]['treatments'].append(treatment)
        
        # Sort categories by their order field
        return dict(sorted(categorized.items(), key=lambda x: x[1].get('order', 99)))
    
    def get_recommended_treatments(self, selected_treatment_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Generate treatment recommendations based on currently selected treatments.
        This can be used to suggest complementary treatments.
        """
        # Simple recommendation logic based on treatment categories
        if not selected_treatment_ids:
            return []
        
        # Get categories of selected treatments
        selected_categories = set()
        for treatment_id in selected_treatment_ids:
            treatment = self.get_treatment_by_id(treatment_id)
            if treatment:
                selected_categories.add(treatment['category_id'])
        
        # Recommend treatments from the same categories (but not already selected)
        recommendations = []
        for treatment in self.treatments:
            if (treatment['category_id'] in selected_categories and 
                treatment['id'] not in selected_treatment_ids):
                recommendations.append(treatment)
        
        # Limit to top 3 recommendations
        return recommendations[:3]