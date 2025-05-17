"""
Treatment service for the MyDentalFly application.
Provides functionality for retrieving and managing dental treatments.
"""

import logging
import json
import os
from flask import current_app

logger = logging.getLogger(__name__)

class TreatmentService:
    """Service for handling dental treatment data."""
    
    def __init__(self):
        """Initialize the treatment service with dental treatment data."""
        self.treatments = self._load_treatments()
        self.categories = self._load_categories()
    
    def _load_treatments(self):
        """Load treatment data from file or initialize with defaults."""
        try:
            # In a production environment, this would come from a database
            # For demo purposes, we'll use hardcoded data
            return [
                {
                    "id": "dental_implant_standard",
                    "name": "Standard Dental Implant",
                    "description": "A titanium post surgically placed into the jawbone to support an artificial tooth.",
                    "price": 450,
                    "category_id": "implants",
                    "duration_days": 5,
                    "recovery_time": "3-6 months",
                    "popular": True
                },
                {
                    "id": "dental_implant_premium",
                    "name": "Premium Dental Implant",
                    "description": "High-end implant with advanced biocompatible materials for better integration.",
                    "price": 650,
                    "category_id": "implants",
                    "duration_days": 5,
                    "recovery_time": "3-6 months",
                    "popular": False
                },
                {
                    "id": "porcelain_veneers",
                    "name": "Porcelain Veneers",
                    "description": "Thin shells of porcelain bonded to the front of teeth to improve appearance.",
                    "price": 180,
                    "category_id": "cosmetic",
                    "duration_days": 5,
                    "recovery_time": "1-2 days",
                    "popular": True
                },
                {
                    "id": "teeth_whitening",
                    "name": "Professional Teeth Whitening",
                    "description": "In-office procedure to remove stains and discoloration from teeth.",
                    "price": 150,
                    "category_id": "cosmetic",
                    "duration_days": 1,
                    "recovery_time": "None",
                    "popular": True
                },
                {
                    "id": "dental_crowns",
                    "name": "Dental Crowns",
                    "description": "Custom-fitted caps that restore a tooth's shape, size, and strength.",
                    "price": 200,
                    "category_id": "restorative",
                    "duration_days": 3,
                    "recovery_time": "1-2 days",
                    "popular": True
                },
                {
                    "id": "root_canal",
                    "name": "Root Canal Treatment",
                    "description": "Procedure to treat infection at the center of a tooth.",
                    "price": 300,
                    "category_id": "restorative",
                    "duration_days": 2,
                    "recovery_time": "1-2 days",
                    "popular": False
                },
                {
                    "id": "dental_bridge",
                    "name": "Dental Bridge",
                    "description": "Fixed restoration to replace one or more missing teeth.",
                    "price": 350,
                    "category_id": "restorative",
                    "duration_days": 5,
                    "recovery_time": "1 week",
                    "popular": False
                },
                {
                    "id": "hollywood_smile",
                    "name": "Hollywood Smile",
                    "description": "Complete smile makeover with veneers for all visible teeth.",
                    "price": 2200,
                    "category_id": "cosmetic",
                    "duration_days": 7,
                    "recovery_time": "1 week",
                    "popular": True
                },
                {
                    "id": "all_on_4_implants",
                    "name": "All-on-4 Dental Implants",
                    "description": "Complete arch replacement with just 4 implants per jaw.",
                    "price": 3500,
                    "category_id": "implants",
                    "duration_days": 7,
                    "recovery_time": "2-3 months",
                    "popular": True
                },
                {
                    "id": "full_mouth_reconstruction",
                    "name": "Full Mouth Reconstruction",
                    "description": "Comprehensive treatment to restore all teeth in both jaws.",
                    "price": 5000,
                    "category_id": "restorative",
                    "duration_days": 14,
                    "recovery_time": "1-2 months",
                    "popular": False
                },
                {
                    "id": "invisalign",
                    "name": "Invisalign Clear Aligners",
                    "description": "Transparent, removable aligners to straighten teeth discreetly.",
                    "price": 1800,
                    "category_id": "orthodontics",
                    "duration_days": 3,
                    "recovery_time": "None",
                    "popular": True
                },
                {
                    "id": "metal_braces",
                    "name": "Traditional Metal Braces",
                    "description": "Fixed metal brackets and wires to align teeth.",
                    "price": 1200,
                    "category_id": "orthodontics",
                    "duration_days": 3,
                    "recovery_time": "3-5 days",
                    "popular": False
                }
            ]
                
        except Exception as e:
            logger.error(f"Error loading treatments: {str(e)}")
            return []
    
    def _load_categories(self):
        """Load treatment categories from file or initialize with defaults."""
        try:
            # In a production environment, this would come from a database
            # For demo purposes, we'll use hardcoded data
            return {
                "implants": {
                    "name": "Dental Implants",
                    "description": "Permanent tooth replacements that look and function like natural teeth."
                },
                "cosmetic": {
                    "name": "Cosmetic Dentistry",
                    "description": "Procedures that improve the appearance of your teeth and smile."
                },
                "restorative": {
                    "name": "Restorative Treatments",
                    "description": "Procedures to repair damaged teeth and restore oral function."
                },
                "orthodontics": {
                    "name": "Orthodontic Treatments",
                    "description": "Procedures to straighten teeth and correct bite issues."
                }
            }
        except Exception as e:
            logger.error(f"Error loading categories: {str(e)}")
            return {}
    
    def get_all_treatments(self):
        """Get all treatments."""
        return self.treatments
    
    def get_treatment_by_id(self, treatment_id):
        """Get a specific treatment by ID."""
        for treatment in self.treatments:
            if treatment["id"] == treatment_id:
                return treatment
        return None
    
    def get_treatments_by_category(self, category_id):
        """Get all treatments in a specific category."""
        return [t for t in self.treatments if t["category_id"] == category_id]
    
    def get_popular_treatments(self):
        """Get all popular treatments."""
        return [t for t in self.treatments if t.get("popular", False)]
    
    def get_treatment_categories(self):
        """Get all treatment categories."""
        return self.categories
    
    def get_categorized_treatments(self):
        """Get treatments organized by category."""
        result = {}
        
        for category_id, category in self.categories.items():
            category_treatments = self.get_treatments_by_category(category_id)
            if category_treatments:
                result[category_id] = {
                    "name": category["name"],
                    "description": category["description"],
                    "treatments": category_treatments
                }
        
        return result