import logging
import json
import os
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class TreatmentService:
    """
    Service for handling dental treatments and their categories
    """
    
    def __init__(self):
        """
        Initialize the TreatmentService
        Load treatments and categories from JSON data files
        """
        self.treatments = []
        self.categories = []
        self.load_data()
    
    def load_data(self) -> None:
        """
        Load treatments and categories from JSON data files
        Creates sample data if files don't exist
        """
        # Get data directory path
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        
        # Create data directory if it doesn't exist
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # Load treatments
        treatments_file = os.path.join(data_dir, 'treatments.json')
        if os.path.exists(treatments_file):
            try:
                with open(treatments_file, 'r') as f:
                    self.treatments = json.load(f)
            except Exception as e:
                logger.error(f"Error loading treatments: {e}")
                self.treatments = self._create_sample_treatments()
        else:
            self.treatments = self._create_sample_treatments()
            self._save_treatments()
        
        # Load categories
        categories_file = os.path.join(data_dir, 'categories.json')
        if os.path.exists(categories_file):
            try:
                with open(categories_file, 'r') as f:
                    self.categories = json.load(f)
            except Exception as e:
                logger.error(f"Error loading categories: {e}")
                self.categories = self._create_sample_categories()
        else:
            self.categories = self._create_sample_categories()
            self._save_categories()
    
    def _save_treatments(self) -> None:
        """
        Save treatments to JSON file
        """
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        treatments_file = os.path.join(data_dir, 'treatments.json')
        try:
            with open(treatments_file, 'w') as f:
                json.dump(self.treatments, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving treatments: {e}")
    
    def _save_categories(self) -> None:
        """
        Save categories to JSON file
        """
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        categories_file = os.path.join(data_dir, 'categories.json')
        try:
            with open(categories_file, 'w') as f:
                json.dump(self.categories, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving categories: {e}")
    
    def _create_sample_treatments(self) -> List[Dict[str, Any]]:
        """
        Create sample treatment data
        """
        return [
            {
                "id": "dental_implant_standard",
                "name": "Dental Implant (Standard)",
                "description": "Titanium dental implant with abutment and crown",
                "price": 850,
                "duration_days": 5,
                "recovery_time": "7-10 days",
                "category_id": "implants",
                "image": "images/treatments/dental_implant.jpg"
            },
            {
                "id": "dental_implant_premium",
                "name": "Dental Implant (Premium)",
                "description": "Premium dental implant with custom abutment and porcelain crown",
                "price": 1200,
                "duration_days": 5,
                "recovery_time": "7-10 days",
                "category_id": "implants",
                "image": "images/treatments/premium_implant.jpg"
            },
            {
                "id": "all_on_4_implants",
                "name": "All-on-4 Implants",
                "description": "Full arch restoration with 4 dental implants",
                "price": 5500,
                "duration_days": 7,
                "recovery_time": "10-14 days",
                "category_id": "implants",
                "image": "images/treatments/all_on_4.jpg"
            },
            {
                "id": "porcelain_veneers",
                "name": "Porcelain Veneers",
                "description": "Custom-made porcelain shells to cover the front of teeth",
                "price": 350,
                "duration_days": 5,
                "recovery_time": "1-2 days",
                "category_id": "cosmetic",
                "image": "images/treatments/veneers.jpg"
            },
            {
                "id": "teeth_whitening",
                "name": "Professional Teeth Whitening",
                "description": "In-office professional teeth whitening treatment",
                "price": 250,
                "duration_days": 1,
                "recovery_time": "Same day",
                "category_id": "cosmetic",
                "image": "images/treatments/whitening.jpg"
            },
            {
                "id": "hollywood_smile",
                "name": "Hollywood Smile",
                "description": "Complete smile makeover with veneers or crowns",
                "price": 3200,
                "duration_days": 7,
                "recovery_time": "3-5 days",
                "category_id": "cosmetic",
                "image": "images/treatments/hollywood_smile.jpg"
            },
            {
                "id": "dental_crowns",
                "name": "Dental Crown",
                "description": "Porcelain or zirconia crown to restore damaged teeth",
                "price": 300,
                "duration_days": 3,
                "recovery_time": "1-2 days",
                "category_id": "restorative",
                "image": "images/treatments/crown.jpg"
            },
            {
                "id": "root_canal",
                "name": "Root Canal Treatment",
                "description": "Endodontic treatment to remove infected pulp",
                "price": 275,
                "duration_days": 2,
                "recovery_time": "1-2 days",
                "category_id": "restorative",
                "image": "images/treatments/root_canal.jpg"
            },
            {
                "id": "dental_bridge",
                "name": "Dental Bridge",
                "description": "Fixed bridge to replace missing teeth",
                "price": 750,
                "duration_days": 5,
                "recovery_time": "2-3 days",
                "category_id": "restorative",
                "image": "images/treatments/bridge.jpg"
            },
            {
                "id": "full_mouth_reconstruction",
                "name": "Full Mouth Reconstruction",
                "description": "Complete restoration of all teeth in both jaws",
                "price": 8500,
                "duration_days": 14,
                "recovery_time": "2-3 weeks",
                "category_id": "reconstructive",
                "image": "images/treatments/full_mouth.jpg"
            },
            {
                "id": "bone_graft",
                "name": "Bone Graft",
                "description": "Procedure to restore bone loss in the jaw",
                "price": 450,
                "duration_days": 1,
                "recovery_time": "7-10 days",
                "category_id": "reconstructive",
                "image": "images/treatments/bone_graft.jpg"
            },
            {
                "id": "sinus_lift",
                "name": "Sinus Lift",
                "description": "Procedure to add bone to the upper jaw in the molar area",
                "price": 950,
                "duration_days": 1,
                "recovery_time": "7-10 days",
                "category_id": "reconstructive",
                "image": "images/treatments/sinus_lift.jpg"
            }
        ]
    
    def _create_sample_categories(self) -> List[Dict[str, Any]]:
        """
        Create sample treatment categories
        """
        return [
            {
                "id": "implants",
                "name": "Dental Implants",
                "description": "Permanent tooth replacements that look and function like natural teeth",
                "image": "images/categories/implants.jpg"
            },
            {
                "id": "cosmetic",
                "name": "Cosmetic Dentistry",
                "description": "Treatments focused on improving the appearance of your smile",
                "image": "images/categories/cosmetic.jpg"
            },
            {
                "id": "restorative",
                "name": "Restorative Dentistry",
                "description": "Procedures to repair and restore damaged or missing teeth",
                "image": "images/categories/restorative.jpg"
            },
            {
                "id": "reconstructive",
                "name": "Reconstructive Dentistry",
                "description": "Advanced procedures to rebuild oral structure and function",
                "image": "images/categories/reconstructive.jpg"
            }
        ]
    
    def get_all_treatments(self) -> List[Dict[str, Any]]:
        """
        Get all treatments
        """
        return self.treatments
    
    def get_treatment_by_id(self, treatment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific treatment by its ID
        """
        for treatment in self.treatments:
            if treatment.get('id') == treatment_id:
                return treatment
        return None
    
    def get_treatments_by_category(self, category_id: str) -> List[Dict[str, Any]]:
        """
        Get all treatments in a specific category
        """
        return [t for t in self.treatments if t.get('category_id') == category_id]
    
    def get_popular_treatments(self, limit: int = 6) -> List[Dict[str, Any]]:
        """
        Get popular treatments (for demonstration, returns a subset of treatments)
        In a real application, this would use analytics data to determine popularity
        """
        popular_ids = [
            "dental_implant_standard", 
            "porcelain_veneers", 
            "teeth_whitening", 
            "hollywood_smile", 
            "dental_crowns", 
            "all_on_4_implants"
        ]
        
        popular = []
        for treatment_id in popular_ids:
            treatment = self.get_treatment_by_id(treatment_id)
            if treatment:
                popular.append(treatment)
        
        return popular[:limit]
    
    def get_all_categories(self) -> List[Dict[str, Any]]:
        """
        Get all treatment categories
        """
        return self.categories
    
    def get_category_by_id(self, category_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific category by its ID
        """
        for category in self.categories:
            if category.get('id') == category_id:
                return category
        return None
    
    def get_categorized_treatments(self) -> Dict[str, Dict[str, Any]]:
        """
        Get treatments organized by category
        Returns a dictionary with category_id as key and category info + treatments as value
        """
        result = {}
        
        for category in self.categories:
            category_id = category.get('id')
            
            # Get treatments for this category
            category_treatments = self.get_treatments_by_category(category_id)
            
            # Create a new dict with category info and treatments
            result[category_id] = {
                "id": category_id,
                "name": category.get('name'),
                "description": category.get('description'),
                "image": category.get('image'),
                "treatments": category_treatments
            }
        
        return result