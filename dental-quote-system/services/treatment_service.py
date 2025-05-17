import logging
import json
import os
import uuid
from datetime import datetime
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
        now = datetime.utcnow().isoformat()
        return [
            {
                "id": "dental_implant_standard",
                "name": "Dental Implant (Standard)",
                "description": "Standard dental implant procedure including titanium implant and abutment.",
                "category_id": "implants",
                "price": 750,
                "currency": "USD",
                "duration_minutes": 90,
                "image_url": "/static/images/treatments/dental_implant_standard.jpg",
                "popular": True,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "dental_implant_premium",
                "name": "Dental Implant (Premium)",
                "description": "Premium dental implant with higher grade materials and extended warranty.",
                "category_id": "implants",
                "price": 950,
                "currency": "USD",
                "duration_minutes": 120,
                "image_url": "/static/images/treatments/dental_implant_premium.jpg",
                "popular": True,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "all_on_4_implants",
                "name": "All-on-4 Implants",
                "description": "Four implants supporting a full arch of fixed teeth, ideal for complete tooth loss.",
                "category_id": "implants",
                "price": 7500,
                "currency": "USD",
                "duration_minutes": 240,
                "image_url": "/static/images/treatments/all_on_4_implants.jpg",
                "popular": True,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "dental_crowns",
                "name": "Dental Crown",
                "description": "Custom-made crown to restore a damaged or weakened tooth.",
                "category_id": "restorative",
                "price": 450,
                "currency": "USD",
                "duration_minutes": 60,
                "image_url": "/static/images/treatments/dental_crown.jpg",
                "popular": True,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "porcelain_veneers",
                "name": "Porcelain Veneers",
                "description": "Custom-made thin shells designed to cover the front surface of teeth.",
                "category_id": "cosmetic",
                "price": 550,
                "currency": "USD",
                "duration_minutes": 90,
                "image_url": "/static/images/treatments/porcelain_veneers.jpg",
                "popular": True,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "teeth_whitening",
                "name": "Professional Teeth Whitening",
                "description": "In-clinic teeth whitening treatment for a brighter smile.",
                "category_id": "cosmetic",
                "price": 250,
                "currency": "USD",
                "duration_minutes": 60,
                "image_url": "/static/images/treatments/teeth_whitening.jpg",
                "popular": True,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "root_canal",
                "name": "Root Canal Treatment",
                "description": "Procedure to treat infection at the center of a tooth.",
                "category_id": "restorative",
                "price": 600,
                "currency": "USD",
                "duration_minutes": 90,
                "image_url": "/static/images/treatments/root_canal.jpg",
                "popular": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "dental_bridge",
                "name": "Dental Bridge",
                "description": "Fixed replacement for missing teeth using adjacent teeth as anchors.",
                "category_id": "restorative",
                "price": 850,
                "currency": "USD",
                "duration_minutes": 120,
                "image_url": "/static/images/treatments/dental_bridge.jpg",
                "popular": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "hollywood_smile",
                "name": "Hollywood Smile",
                "description": "Complete smile makeover with veneers for a perfect, celebrity-like smile.",
                "category_id": "cosmetic",
                "price": 5000,
                "currency": "USD",
                "duration_minutes": 240,
                "image_url": "/static/images/treatments/hollywood_smile.jpg",
                "popular": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "full_mouth_reconstruction",
                "name": "Full Mouth Reconstruction",
                "description": "Comprehensive treatment to rebuild or restore all teeth in both jaws.",
                "category_id": "restorative",
                "price": 12000,
                "currency": "USD",
                "duration_minutes": 480,
                "image_url": "/static/images/treatments/full_mouth_reconstruction.jpg",
                "popular": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "dental_examination",
                "name": "Comprehensive Dental Examination",
                "description": "Complete dental checkup including X-rays and consultation.",
                "category_id": "general",
                "price": 80,
                "currency": "USD",
                "duration_minutes": 45,
                "image_url": "/static/images/treatments/dental_examination.jpg",
                "popular": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "professional_cleaning",
                "name": "Professional Dental Cleaning",
                "description": "Deep cleaning procedure to remove plaque and tartar.",
                "category_id": "general",
                "price": 100,
                "currency": "USD",
                "duration_minutes": 60,
                "image_url": "/static/images/treatments/professional_cleaning.jpg",
                "popular": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
        ]
    
    def _create_sample_categories(self) -> List[Dict[str, Any]]:
        """
        Create sample treatment categories
        """
        now = datetime.utcnow().isoformat()
        return [
            {
                "id": "implants",
                "name": "Dental Implants",
                "description": "Long-lasting tooth replacement solutions anchored to the jawbone.",
                "order": 1,
                "icon": "tooth",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "cosmetic",
                "name": "Cosmetic Dentistry",
                "description": "Procedures designed to improve the appearance of your smile.",
                "order": 2,
                "icon": "smile",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "restorative",
                "name": "Restorative Treatments",
                "description": "Procedures to restore damaged or missing teeth to full function.",
                "order": 3,
                "icon": "wrench",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "id": "general",
                "name": "General Dentistry",
                "description": "Routine dental care to maintain oral health.",
                "order": 4,
                "icon": "check-circle",
                "is_active": True,
                "created_at": now,
                "updated_at": now
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
        return [
            t for t in self.treatments 
            if t.get('category_id') == category_id and t.get('is_active', False)
        ]
    
    def get_popular_treatments(self, limit: int = 6) -> List[Dict[str, Any]]:
        """
        Get popular treatments (for demonstration, returns a subset of treatments)
        In a real application, this would use analytics data to determine popularity
        """
        popular = [t for t in self.treatments if t.get('popular', False) and t.get('is_active', False)]
        return popular[:limit]
    
    def get_all_categories(self) -> List[Dict[str, Any]]:
        """
        Get all treatment categories
        """
        return sorted(self.categories, key=lambda c: c.get('order', 999))
    
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
        
        # Get active categories
        active_categories = [c for c in self.categories if c.get('is_active', False)]
        
        # Sort categories by order
        sorted_categories = sorted(active_categories, key=lambda c: c.get('order', 999))
        
        # For each category, get its treatments
        for category in sorted_categories:
            category_id = category.get('id')
            if category_id:
                treatments = self.get_treatments_by_category(category_id)
                result[category_id] = {
                    'category': category,
                    'treatments': treatments
                }
        
        return result