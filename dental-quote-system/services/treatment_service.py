"""
Treatment Service Module
Handles dental treatment data and operations
"""
import json
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Treatment data file path
TREATMENT_DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'treatments.json')

def load_treatments():
    """Load treatment data from JSON file or generate sample data if file doesn't exist"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(TREATMENT_DATA_FILE), exist_ok=True)
    
    # If file doesn't exist, generate sample data
    if not os.path.exists(TREATMENT_DATA_FILE):
        logger.info("Treatment data file not found. Generating sample data.")
        treatments = generate_sample_treatments()
        save_treatments(treatments)
        return treatments
    
    # Load from file
    try:
        with open(TREATMENT_DATA_FILE, 'r') as file:
            treatments = json.load(file)
        logger.info(f"Loaded {len(treatments)} treatments from file")
        return treatments
    except Exception as e:
        logger.error(f"Error loading treatments from file: {e}")
        treatments = generate_sample_treatments()
        save_treatments(treatments)
        return treatments

def save_treatments(treatments):
    """Save treatments to JSON file"""
    try:
        with open(TREATMENT_DATA_FILE, 'w') as file:
            json.dump(treatments, file, indent=2)
        logger.info(f"Saved {len(treatments)} treatments to file")
        return True
    except Exception as e:
        logger.error(f"Error saving treatments to file: {e}")
        return False

def generate_sample_treatments():
    """Generate sample treatment data"""
    treatments = [
        {
            "id": "dental_implant_standard",
            "name": "Dental Implant (Standard)",
            "description": "Titanium implant with abutment and crown, replacing a single missing tooth.",
            "category": "implants",
            "price": 750,
            "currency": "USD",
            "duration_days": 5,
            "recovery_time": "3-5 days",
            "image": "/static/images/treatments/dental_implant.jpg",
            "popular": True
        },
        {
            "id": "dental_implant_premium",
            "name": "Dental Implant (Premium)",
            "description": "Premium titanium implant with custom abutment and zirconia crown.",
            "category": "implants",
            "price": 950,
            "currency": "USD",
            "duration_days": 5,
            "recovery_time": "3-5 days",
            "image": "/static/images/treatments/dental_implant_premium.jpg",
            "popular": False
        },
        {
            "id": "all_on_4_implants",
            "name": "All-on-4 Implants",
            "description": "Four implants supporting a full arch of fixed teeth, ideal for complete tooth loss.",
            "category": "implants",
            "price": 5500,
            "currency": "USD",
            "duration_days": 7,
            "recovery_time": "7-10 days",
            "image": "/static/images/treatments/all_on_4.jpg",
            "popular": True
        },
        {
            "id": "porcelain_veneers",
            "name": "Porcelain Veneers",
            "description": "Thin shells bonded to the front surface of teeth to improve appearance.",
            "category": "cosmetic",
            "price": 400,
            "currency": "USD",
            "duration_days": 3,
            "recovery_time": "1-2 days",
            "image": "/static/images/treatments/porcelain_veneers.jpg",
            "popular": True
        },
        {
            "id": "composite_veneers",
            "name": "Composite Veneers",
            "description": "Resin-based veneers applied and shaped directly on the teeth.",
            "category": "cosmetic",
            "price": 250,
            "currency": "USD",
            "duration_days": 2,
            "recovery_time": "1 day",
            "image": "/static/images/treatments/composite_veneers.jpg",
            "popular": False
        },
        {
            "id": "dental_crowns",
            "name": "Dental Crowns",
            "description": "Custom-fit covering that restores a damaged or missing tooth.",
            "category": "restorative",
            "price": 350,
            "currency": "USD",
            "duration_days": 3,
            "recovery_time": "1-2 days",
            "image": "/static/images/treatments/dental_crowns.jpg",
            "popular": True
        },
        {
            "id": "teeth_whitening",
            "name": "Professional Teeth Whitening",
            "description": "In-office whitening treatment for noticeably brighter teeth.",
            "category": "cosmetic",
            "price": 200,
            "currency": "USD",
            "duration_days": 1,
            "recovery_time": "None",
            "image": "/static/images/treatments/teeth_whitening.jpg",
            "popular": True
        },
        {
            "id": "root_canal",
            "name": "Root Canal Treatment",
            "description": "Procedure to treat infection at the center of a tooth.",
            "category": "endodontic",
            "price": 300,
            "currency": "USD",
            "duration_days": 2,
            "recovery_time": "1-2 days",
            "image": "/static/images/treatments/root_canal.jpg",
            "popular": False
        },
        {
            "id": "dental_bridge",
            "name": "Dental Bridge",
            "description": "Fixed replacement for missing teeth that bridges the gap.",
            "category": "restorative",
            "price": 700,
            "currency": "USD",
            "duration_days": 4,
            "recovery_time": "1-2 days",
            "image": "/static/images/treatments/dental_bridge.jpg",
            "popular": False
        },
        {
            "id": "hollywood_smile",
            "name": "Hollywood Smile",
            "description": "Complete smile makeover with veneers or crowns for all visible teeth.",
            "category": "cosmetic",
            "price": 3800,
            "currency": "USD",
            "duration_days": 7,
            "recovery_time": "3-5 days",
            "image": "/static/images/treatments/hollywood_smile.jpg",
            "popular": True
        },
        {
            "id": "dental_filling",
            "name": "Dental Filling",
            "description": "Material to fill cavities and repair damaged tooth structure.",
            "category": "restorative",
            "price": 120,
            "currency": "USD",
            "duration_days": 1,
            "recovery_time": "Same day",
            "image": "/static/images/treatments/dental_filling.jpg",
            "popular": False
        },
        {
            "id": "full_mouth_reconstruction",
            "name": "Full Mouth Reconstruction",
            "description": "Comprehensive treatment to rebuild all teeth in both jaws.",
            "category": "restorative",
            "price": 8500,
            "currency": "USD",
            "duration_days": 14,
            "recovery_time": "10-14 days",
            "image": "/static/images/treatments/full_mouth_reconstruction.jpg",
            "popular": False
        },
        {
            "id": "dental_bonding",
            "name": "Dental Bonding",
            "description": "Application of tooth-colored resin to repair chipped or cracked teeth.",
            "category": "cosmetic",
            "price": 180,
            "currency": "USD",
            "duration_days": 1,
            "recovery_time": "Same day",
            "image": "/static/images/treatments/dental_bonding.jpg",
            "popular": False
        }
    ]
    
    return treatments

def get_all_treatments():
    """Get all available treatments"""
    return load_treatments()

def get_popular_treatments():
    """Get popular treatments for homepage display"""
    treatments = load_treatments()
    return [t for t in treatments if t.get('popular', False)]

def get_treatment_by_id(treatment_id):
    """Get a treatment by its ID"""
    treatments = load_treatments()
    for treatment in treatments:
        if treatment.get('id') == treatment_id:
            return treatment
    return None

def get_treatments_by_category(category):
    """Get treatments by category"""
    treatments = load_treatments()
    return [t for t in treatments if t.get('category') == category]

def get_treatment_categories():
    """Get all unique treatment categories"""
    treatments = load_treatments()
    categories = set()
    
    for treatment in treatments:
        categories.add(treatment.get('category', 'other'))
    
    return sorted(list(categories))