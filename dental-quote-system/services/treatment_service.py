"""
Treatment Service Module
Handles available dental treatments and treatment selection process
"""
import json
import os
from pathlib import Path

# Get the treatments data path
TREATMENTS_DATA_PATH = Path(__file__).parent.parent / "data" / "treatments.json"

def load_treatments():
    """Load treatments from JSON file"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(TREATMENTS_DATA_PATH), exist_ok=True)
        
        # Check if the file exists, if not create a sample one
        if not os.path.exists(TREATMENTS_DATA_PATH):
            sample_treatments = generate_sample_treatments()
            with open(TREATMENTS_DATA_PATH, 'w') as f:
                json.dump(sample_treatments, f, indent=2)
            return sample_treatments
        
        # Load the file if it exists
        with open(TREATMENTS_DATA_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading treatments: {e}")
        return generate_sample_treatments()

def generate_sample_treatments():
    """Generate sample treatments data"""
    return [
        {
            "id": "dental_implant_standard",
            "name": "Dental Implant",
            "description": "Standard dental implant with abutment and crown",
            "price": 750,
            "category": "implants",
            "image": "/static/images/treatments/dental_implant.jpg",
            "popular": True
        },
        {
            "id": "porcelain_veneers",
            "name": "Porcelain Veneers",
            "description": "Custom-made thin shells that cover the front of teeth",
            "price": 350,
            "category": "cosmetic",
            "image": "/static/images/treatments/porcelain_veneers.jpg",
            "popular": True
        },
        {
            "id": "teeth_whitening",
            "name": "Professional Teeth Whitening",
            "description": "In-office professional teeth whitening session",
            "price": 200,
            "category": "cosmetic",
            "image": "/static/images/treatments/teeth_whitening.jpg",
            "popular": True
        },
        {
            "id": "root_canal",
            "name": "Root Canal Treatment",
            "description": "Complete root canal therapy including temporary filling",
            "price": 300,
            "category": "restorative",
            "image": "/static/images/treatments/root_canal.jpg",
            "popular": False
        },
        {
            "id": "dental_crowns",
            "name": "Dental Crown",
            "description": "Full porcelain or zirconia dental crown",
            "price": 280,
            "category": "restorative",
            "image": "/static/images/treatments/dental_crown.jpg",
            "popular": True
        },
        {
            "id": "full_mouth_reconstruction",
            "name": "Full Mouth Reconstruction",
            "description": "Comprehensive treatment to restore all teeth in both jaws",
            "price": 5500,
            "category": "implants",
            "image": "/static/images/treatments/full_mouth.jpg",
            "popular": False
        },
        {
            "id": "dental_bridge",
            "name": "Dental Bridge (3 units)",
            "description": "Fixed bridge to replace missing teeth (3 units)",
            "price": 850,
            "category": "restorative",
            "image": "/static/images/treatments/dental_bridge.jpg",
            "popular": False
        },
        {
            "id": "invisalign_treatment",
            "name": "Invisalign Treatment",
            "description": "Complete Invisalign clear aligner therapy",
            "price": 2800,
            "category": "orthodontic",
            "image": "/static/images/treatments/invisalign.jpg",
            "popular": True
        },
        {
            "id": "dental_filling",
            "name": "Dental Filling",
            "description": "Composite resin dental filling",
            "price": 100,
            "category": "restorative",
            "image": "/static/images/treatments/dental_filling.jpg",
            "popular": False
        },
        {
            "id": "all_on_4_implants",
            "name": "All-on-4 Implants",
            "description": "Full arch restoration with 4 dental implants",
            "price": 6500,
            "category": "implants",
            "image": "/static/images/treatments/all_on_4.jpg",
            "popular": True
        },
        {
            "id": "hollywood_smile",
            "name": "Hollywood Smile",
            "description": "Complete smile makeover with 10-12 veneers",
            "price": 3200,
            "category": "cosmetic",
            "image": "/static/images/treatments/hollywood_smile.jpg",
            "popular": True
        },
        {
            "id": "tooth_extraction",
            "name": "Tooth Extraction",
            "description": "Simple tooth extraction",
            "price": 80,
            "category": "surgical",
            "image": "/static/images/treatments/extraction.jpg",
            "popular": False
        }
    ]

def get_treatment_categories():
    """Get all treatment categories"""
    treatments = load_treatments()
    categories = set()
    
    for treatment in treatments:
        categories.add(treatment.get('category', 'other'))
    
    return sorted(list(categories))

def get_treatment_by_id(treatment_id):
    """Get a treatment by its ID"""
    treatments = load_treatments()
    
    for treatment in treatments:
        if treatment['id'] == treatment_id:
            return treatment
    
    return None

def get_popular_treatments(limit=6):
    """Get popular treatments"""
    treatments = load_treatments()
    popular = [t for t in treatments if t.get('popular', False)]
    
    # If not enough popular treatments, add others
    if len(popular) < limit:
        non_popular = [t for t in treatments if not t.get('popular', False)]
        popular.extend(non_popular[:limit - len(popular)])
    
    return popular[:limit]