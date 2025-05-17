"""
Treatment Service for Dental Quote System

This module provides functionality for retrieving and manipulating dental
treatment data, including fetching all treatments, categorizing them, and
finding specific treatments by ID.
"""

from typing import Dict, List, Any, Optional, Tuple
import json
import os


class TreatmentService:
    """
    Service class to manage dental treatments data
    """
    
    # Default treatment categories with icons
    DEFAULT_CATEGORIES = {
        "implants": {
            "name": "Dental Implants",
            "description": "Permanent replacements for missing teeth, anchored into the jawbone for a natural look and feel.",
            "icon": "tooth"
        },
        "cosmetic": {
            "name": "Cosmetic Dentistry",
            "description": "Treatments focused on improving the appearance of your smile, including whitening, veneers, and bonding.",
            "icon": "smile"
        },
        "restorative": {
            "name": "Restorative Treatments",
            "description": "Services to repair and restore damaged teeth, including crowns, bridges, and fillings.",
            "icon": "crown"
        },
        "orthodontic": {
            "name": "Orthodontic Treatments",
            "description": "Procedures to correct misaligned teeth and jaws, including braces and clear aligners.",
            "icon": "align-center"
        },
        "surgical": {
            "name": "Oral Surgery",
            "description": "Surgical procedures including extractions, bone grafting, and jaw surgery.",
            "icon": "scalpel"
        },
        "full_mouth": {
            "name": "Full Mouth Rehabilitation",
            "description": "Comprehensive treatment plans to restore function and aesthetics to your entire mouth.",
            "icon": "teeth"
        },
        "preventive": {
            "name": "Preventive Care",
            "description": "Regular check-ups, cleanings, and treatments to prevent dental issues.",
            "icon": "shield"
        }
    }
    
    # Sample treatments data
    SAMPLE_TREATMENTS = [
        {
            "id": "dental_implant_standard",
            "name": "Standard Dental Implant",
            "description": "Single titanium dental implant with abutment",
            "price": 650,
            "category_id": "implants",
            "duration_days": 2,
            "recovery_time": "3-6 months"
        },
        {
            "id": "dental_implant_premium",
            "name": "Premium Dental Implant",
            "description": "Premium implant with enhanced osseointegration and lifetime warranty",
            "price": 850,
            "category_id": "implants",
            "duration_days": 2,
            "recovery_time": "3-6 months"
        },
        {
            "id": "dental_crowns",
            "name": "Porcelain Crown",
            "description": "High-quality porcelain crown for damaged teeth",
            "price": 280,
            "category_id": "restorative",
            "duration_days": 1,
            "recovery_time": "1-2 days"
        },
        {
            "id": "porcelain_veneers",
            "name": "Porcelain Veneers",
            "description": "Custom-made porcelain shells to cover front teeth surfaces",
            "price": 300,
            "category_id": "cosmetic",
            "duration_days": 2,
            "recovery_time": "1-2 days"
        },
        {
            "id": "teeth_whitening",
            "name": "Professional Teeth Whitening",
            "description": "In-office professional whitening procedure",
            "price": 200,
            "category_id": "cosmetic",
            "duration_days": 1,
            "recovery_time": "Immediate"
        },
        {
            "id": "root_canal",
            "name": "Root Canal Treatment",
            "description": "Procedure to treat infected pulp and save the tooth",
            "price": 350,
            "category_id": "restorative",
            "duration_days": 1,
            "recovery_time": "1-2 days"
        },
        {
            "id": "full_mouth_reconstruction",
            "name": "Full Mouth Reconstruction",
            "description": "Complete rehabilitation of all teeth in both jaws",
            "price": 8500,
            "category_id": "full_mouth",
            "duration_days": 7,
            "recovery_time": "2-4 weeks"
        },
        {
            "id": "dental_bridge",
            "name": "Dental Bridge (3 units)",
            "description": "Fixed bridge to replace missing teeth",
            "price": 750,
            "category_id": "restorative",
            "duration_days": 2,
            "recovery_time": "1 week"
        },
        {
            "id": "dental_bonding",
            "name": "Dental Bonding",
            "description": "Cosmetic procedure to repair chipped or discolored teeth",
            "price": 150,
            "category_id": "cosmetic",
            "duration_days": 1,
            "recovery_time": "Immediate"
        },
        {
            "id": "invisalign_treatment",
            "name": "Invisalign Treatment",
            "description": "Clear aligners for teeth straightening",
            "price": 2500,
            "category_id": "orthodontic",
            "duration_days": 2,
            "recovery_time": "None, ongoing treatment"
        },
        {
            "id": "dental_examination",
            "name": "Comprehensive Dental Examination",
            "description": "Complete assessment of oral health with x-rays",
            "price": 75,
            "category_id": "preventive",
            "duration_days": 1,
            "recovery_time": "None"
        },
        {
            "id": "tooth_extraction",
            "name": "Tooth Extraction",
            "description": "Removal of damaged or problematic tooth",
            "price": 120,
            "category_id": "surgical",
            "duration_days": 1,
            "recovery_time": "3-7 days"
        },
        {
            "id": "bone_grafting",
            "name": "Bone Grafting",
            "description": "Procedure to add bone material to jaw for implant support",
            "price": 500,
            "category_id": "surgical",
            "duration_days": 1,
            "recovery_time": "2-3 months"
        },
        {
            "id": "dental_filling",
            "name": "Composite Dental Filling",
            "description": "Tooth-colored filling for cavities",
            "price": 100,
            "category_id": "restorative",
            "duration_days": 1,
            "recovery_time": "Immediate"
        },
        {
            "id": "professional_cleaning",
            "name": "Professional Dental Cleaning",
            "description": "Deep cleaning to remove plaque and tartar",
            "price": 80,
            "category_id": "preventive",
            "duration_days": 1,
            "recovery_time": "None"
        },
        {
            "id": "hollywood_smile",
            "name": "Hollywood Smile Makeover",
            "description": "Complete smile transformation with veneers or crowns",
            "price": 4500,
            "category_id": "cosmetic",
            "duration_days": 5,
            "recovery_time": "1-2 weeks"
        },
        {
            "id": "all_on_4_implants",
            "name": "All-on-4 Implants",
            "description": "Full arch restoration with just 4 implants",
            "price": 6500,
            "category_id": "implants",
            "duration_days": 5,
            "recovery_time": "3-6 months"
        },
        {
            "id": "wisdom_tooth_removal",
            "name": "Wisdom Tooth Removal",
            "description": "Surgical extraction of impacted wisdom teeth",
            "price": 250,
            "category_id": "surgical",
            "duration_days": 1,
            "recovery_time": "7-10 days"
        },
        {
            "id": "gum_contouring",
            "name": "Gum Contouring",
            "description": "Reshaping of gum line for cosmetic improvement",
            "price": 300,
            "category_id": "cosmetic",
            "duration_days": 1,
            "recovery_time": "1-2 weeks"
        },
        {
            "id": "dental_sealants",
            "name": "Dental Sealants",
            "description": "Protective coating for molars to prevent decay",
            "price": 60,
            "category_id": "preventive",
            "duration_days": 1,
            "recovery_time": "None"
        }
    ]
    
    @classmethod
    def get_all_treatments(cls) -> List[Dict[str, Any]]:
        """
        Get all available dental treatments
        
        Returns:
            List of treatment dictionaries
        """
        # In a production environment, this would fetch from a database
        # For now, we return the sample data
        return cls.SAMPLE_TREATMENTS
    
    @classmethod
    def get_treatment_by_id(cls, treatment_id: str) -> Optional[Dict[str, Any]]:
        """
        Find a specific treatment by its ID
        
        Args:
            treatment_id: The unique identifier of the treatment
            
        Returns:
            Treatment dictionary or None if not found
        """
        treatments = cls.get_all_treatments()
        for treatment in treatments:
            if treatment["id"] == treatment_id:
                return treatment
        return None
    
    @classmethod
    def get_treatments_by_category(cls, category_id: str) -> List[Dict[str, Any]]:
        """
        Get all treatments belonging to a specific category
        
        Args:
            category_id: The category identifier
            
        Returns:
            List of treatment dictionaries in the specified category
        """
        treatments = cls.get_all_treatments()
        return [t for t in treatments if t.get("category_id") == category_id]
    
    @classmethod
    def get_all_categories(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get all treatment categories
        
        Returns:
            Dictionary of category dictionaries keyed by category ID
        """
        # In a production environment, this would fetch from a database
        return cls.DEFAULT_CATEGORIES
    
    @classmethod
    def get_category_by_id(cls, category_id: str) -> Optional[Dict[str, Any]]:
        """
        Find a specific category by its ID
        
        Args:
            category_id: The unique identifier of the category
            
        Returns:
            Category dictionary or None if not found
        """
        categories = cls.get_all_categories()
        return categories.get(category_id)
    
    @classmethod
    def get_categorized_treatments(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get treatments organized by categories
        
        Returns:
            Dictionary with category data and associated treatments
        """
        treatments = cls.get_all_treatments()
        categories = cls.get_all_categories()
        
        result = {}
        
        for category_id, category_data in categories.items():
            category_treatments = [t for t in treatments if t.get("category_id") == category_id]
            
            # Only include non-empty categories
            if category_treatments:
                result[category_id] = {
                    "category": category_data,
                    "treatments": category_treatments
                }
        
        return result
    
    @classmethod
    def search_treatments(cls, query: str) -> List[Dict[str, Any]]:
        """
        Search for treatments by name or description
        
        Args:
            query: Search query string
            
        Returns:
            List of matching treatment dictionaries
        """
        query = query.lower()
        treatments = cls.get_all_treatments()
        
        return [
            t for t in treatments
            if query in t.get("name", "").lower() or query in t.get("description", "").lower()
        ]
    
    @classmethod
    def get_recommended_treatments(cls, treatment_id: str) -> List[Dict[str, Any]]:
        """
        Get recommended treatments based on a selected treatment
        
        Args:
            treatment_id: ID of the treatment to base recommendations on
            
        Returns:
            List of recommended treatment dictionaries
        """
        treatment = cls.get_treatment_by_id(treatment_id)
        if not treatment:
            return []
        
        # First, recommend treatments from the same category
        category_id = treatment.get("category_id")
        same_category = cls.get_treatments_by_category(category_id)
        
        # Exclude the original treatment
        same_category = [t for t in same_category if t["id"] != treatment_id]
        
        # Get complementary treatments based on predefined relations
        # In a real system, this could be based on purchase history or business rules
        complementary_map = {
            "dental_implant_standard": ["dental_crowns", "bone_grafting"],
            "dental_implant_premium": ["dental_crowns", "bone_grafting"],
            "porcelain_veneers": ["teeth_whitening", "dental_examination"],
            "teeth_whitening": ["dental_examination", "professional_cleaning"],
            "root_canal": ["dental_crowns", "dental_examination"],
            "dental_crowns": ["dental_examination"],
            "full_mouth_reconstruction": ["dental_examination", "professional_cleaning"],
            "hollywood_smile": ["teeth_whitening", "dental_examination"],
            "all_on_4_implants": ["dental_examination", "bone_grafting"]
        }
        
        complementary_ids = complementary_map.get(treatment_id, [])
        complementary = [cls.get_treatment_by_id(t_id) for t_id in complementary_ids]
        complementary = [t for t in complementary if t is not None]
        
        # Combine recommendations, prioritizing complementary treatments
        recommended = complementary + [t for t in same_category if t["id"] not in complementary_ids]
        
        # Limit to 3 recommendations
        return recommended[:3]