"""
Treatment Service Module
Handles dental treatment data and operations
"""
import logging
import json
import os

logger = logging.getLogger(__name__)

def get_all_treatments():
    """Get all treatments
    
    Returns:
        list: All treatments
    """
    return _load_treatments()

def get_treatment_by_id(treatment_id):
    """Get a treatment by its ID
    
    Args:
        treatment_id (str): Treatment ID
        
    Returns:
        dict: Treatment data or None
    """
    treatments = _load_treatments()
    
    # Find treatment by ID
    for treatment in treatments:
        if treatment['id'] == treatment_id:
            return treatment
    
    return None

def get_popular_treatments(limit=6):
    """Get popular treatments
    
    Args:
        limit (int): Maximum number of treatments to return
        
    Returns:
        list: Popular treatments
    """
    treatments = _load_treatments()
    
    # Filter for popular treatments
    popular_treatments = [treatment for treatment in treatments if treatment.get('popular', False)]
    
    # Sort by popularity score (if available) or just return the first few
    popular_treatments.sort(key=lambda x: x.get('popularity_score', 0), reverse=True)
    
    return popular_treatments[:limit]

def get_treatments_by_category(category_id):
    """Get treatments by category
    
    Args:
        category_id (str): Category ID
        
    Returns:
        list: Treatments in the category
    """
    treatments = _load_treatments()
    
    # Filter for treatments in the category
    category_treatments = [
        treatment for treatment in treatments 
        if treatment.get('category_id') == category_id
    ]
    
    return category_treatments

def get_categorized_treatments():
    """Get treatments categorized by category
    
    Returns:
        dict: Categories with their treatments
    """
    treatments = _load_treatments()
    categories = _load_categories()
    
    # Create dictionary for each category
    categorized = {}
    
    for category in categories:
        category_id = category['id']
        categorized[category_id] = {
            'id': category_id,
            'name': category['name'],
            'treatments': []
        }
    
    # Add treatments to their categories
    for treatment in treatments:
        category_id = treatment.get('category_id')
        if category_id and category_id in categorized:
            categorized[category_id]['treatments'].append(treatment)
    
    return categorized

def _load_treatments():
    """Load treatments from data source
    
    Returns:
        list: Treatments
    """
    # Use mock treatments for development and testing
    treatments = [
        {
            "id": "dental_implant_standard",
            "name": "Standard Dental Implant",
            "description": "A titanium post surgically placed into the jawbone to serve as a replacement for a missing tooth root.",
            "category_id": "implants",
            "price": 750,
            "duration": "2-3 hours",
            "image": "/static/images/treatments/dental-implant.jpg",
            "popular": True,
            "popularity_score": 95
        },
        {
            "id": "dental_implant_premium",
            "name": "Premium Dental Implant",
            "description": "Advanced dental implant using premium materials with lifetime warranty.",
            "category_id": "implants",
            "price": 1100,
            "duration": "2-3 hours",
            "image": "/static/images/treatments/premium-implant.jpg",
            "popular": False,
            "popularity_score": 75
        },
        {
            "id": "all_on_4_implants",
            "name": "All-on-4 Implants",
            "description": "A full arch of prosthetic teeth supported by just four strategically placed implants.",
            "category_id": "implants",
            "price": 5500,
            "duration": "1-2 days",
            "image": "/static/images/treatments/all-on-4.jpg",
            "popular": True,
            "popularity_score": 90
        },
        {
            "id": "porcelain_veneers",
            "name": "Porcelain Veneers",
            "description": "Thin shells of porcelain bonded to the front of teeth to improve appearance.",
            "category_id": "cosmetic",
            "price": 350,
            "duration": "1-2 hours per tooth",
            "image": "/static/images/treatments/veneers.jpg",
            "popular": True,
            "popularity_score": 92
        },
        {
            "id": "composite_veneers",
            "name": "Composite Veneers",
            "description": "Tooth-colored resin applied to improve the appearance of teeth.",
            "category_id": "cosmetic",
            "price": 200,
            "duration": "1 hour per tooth",
            "image": "/static/images/treatments/composite-veneers.jpg",
            "popular": False,
            "popularity_score": 70
        },
        {
            "id": "teeth_whitening",
            "name": "Professional Teeth Whitening",
            "description": "In-office whitening procedure to brighten and whiten teeth.",
            "category_id": "cosmetic",
            "price": 250,
            "duration": "1-2 hours",
            "image": "/static/images/treatments/teeth-whitening.jpg",
            "popular": True,
            "popularity_score": 88
        },
        {
            "id": "dental_crowns",
            "name": "Dental Crowns",
            "description": "Custom-fitted caps placed over damaged or decayed teeth.",
            "category_id": "restorative",
            "price": 300,
            "duration": "1-2 hours",
            "image": "/static/images/treatments/crowns.jpg",
            "popular": True,
            "popularity_score": 85
        },
        {
            "id": "dental_bridges",
            "name": "Dental Bridges",
            "description": "Fixed prosthetic devices to replace one or more missing teeth.",
            "category_id": "restorative",
            "price": 650,
            "duration": "2-3 hours",
            "image": "/static/images/treatments/bridges.jpg",
            "popular": False,
            "popularity_score": 72
        },
        {
            "id": "root_canal",
            "name": "Root Canal Treatment",
            "description": "Procedure to treat infection at the center of a tooth.",
            "category_id": "restorative",
            "price": 350,
            "duration": "1-2 hours",
            "image": "/static/images/treatments/root-canal.jpg",
            "popular": False,
            "popularity_score": 60
        },
        {
            "id": "dental_filling",
            "name": "Dental Filling",
            "description": "Material used to fill cavities or repair minor tooth fractures.",
            "category_id": "restorative",
            "price": 80,
            "duration": "30-60 minutes",
            "image": "/static/images/treatments/filling.jpg",
            "popular": False,
            "popularity_score": 65
        },
        {
            "id": "full_mouth_reconstruction",
            "name": "Full Mouth Reconstruction",
            "description": "Comprehensive treatment to restore all teeth in both the upper and lower jaws.",
            "category_id": "advanced",
            "price": 8500,
            "duration": "Multiple visits",
            "image": "/static/images/treatments/full-mouth.jpg",
            "popular": False,
            "popularity_score": 50
        },
        {
            "id": "hollywood_smile",
            "name": "Hollywood Smile",
            "description": "Combination of treatments to achieve a perfect smile with bright, aligned teeth.",
            "category_id": "cosmetic",
            "price": 3500,
            "duration": "Multiple visits",
            "image": "/static/images/treatments/hollywood-smile.jpg",
            "popular": True,
            "popularity_score": 95
        }
    ]
    
    return treatments

def _load_categories():
    """Load treatment categories
    
    Returns:
        list: Categories
    """
    # Use mock categories for development and testing
    categories = [
        {
            "id": "implants",
            "name": "Dental Implants",
            "description": "Permanent solutions for missing teeth"
        },
        {
            "id": "cosmetic",
            "name": "Cosmetic Dentistry",
            "description": "Treatments to enhance your smile"
        },
        {
            "id": "restorative",
            "name": "Restorative Dentistry",
            "description": "Repair damaged or decayed teeth"
        },
        {
            "id": "advanced",
            "name": "Advanced Procedures",
            "description": "Complex dental treatments"
        }
    ]
    
    return categories