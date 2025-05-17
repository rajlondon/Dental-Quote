"""
Treatment Service Module
Provides data and functions for dental treatments
"""
import logging

logger = logging.getLogger(__name__)

# Define treatment categories
TREATMENT_CATEGORIES = [
    "Dental Implants",
    "Cosmetic Dentistry",
    "Orthodontics",
    "Restorative Dentistry",
    "General Dentistry",
    "Oral Surgery"
]

# Define treatments data
TREATMENTS = {
    "dental_implant_standard": {
        "id": "dental_implant_standard",
        "name": "Standard Dental Implant",
        "description": "Titanium dental implant with crown for a single missing tooth.",
        "price": 750,
        "category": "Dental Implants",
        "image": "/static/images/treatments/dental_implant_standard.jpg",
        "popular": True,
        "procedure_time": "2-3 hours",
        "recovery_time": "3-6 months",
        "warranty": "5 years"
    },
    "dental_implant_premium": {
        "id": "dental_implant_premium",
        "name": "Premium Dental Implant",
        "description": "Premium titanium implant with porcelain crown and lifetime warranty.",
        "price": 950,
        "category": "Dental Implants",
        "image": "/static/images/treatments/dental_implant_premium.jpg",
        "popular": False,
        "procedure_time": "2-3 hours",
        "recovery_time": "3-6 months",
        "warranty": "Lifetime"
    },
    "all_on_4_implants": {
        "id": "all_on_4_implants",
        "name": "All-on-4 Dental Implants",
        "description": "Complete arch restoration with only 4 implants, fixed in one day.",
        "price": 4500,
        "category": "Dental Implants",
        "image": "/static/images/treatments/all_on_4_implants.jpg",
        "popular": True,
        "procedure_time": "4-6 hours",
        "recovery_time": "3-6 months",
        "warranty": "10 years"
    },
    "all_on_6_implants": {
        "id": "all_on_6_implants",
        "name": "All-on-6 Dental Implants",
        "description": "Complete arch restoration with 6 implants for maximum stability.",
        "price": 5500,
        "category": "Dental Implants",
        "image": "/static/images/treatments/all_on_6_implants.jpg",
        "popular": False,
        "procedure_time": "5-7 hours",
        "recovery_time": "3-6 months",
        "warranty": "10 years"
    },
    "porcelain_veneers": {
        "id": "porcelain_veneers",
        "name": "Porcelain Veneers",
        "description": "Custom-made thin shells bonded to the front of teeth for a perfect smile.",
        "price": 350,
        "category": "Cosmetic Dentistry",
        "image": "/static/images/treatments/porcelain_veneers.jpg",
        "popular": True,
        "procedure_time": "1-2 hours per tooth",
        "recovery_time": "1-2 weeks",
        "warranty": "5 years"
    },
    "composite_veneers": {
        "id": "composite_veneers",
        "name": "Composite Veneers",
        "description": "Tooth-colored resin material bonded to teeth for an improved appearance.",
        "price": 200,
        "category": "Cosmetic Dentistry",
        "image": "/static/images/treatments/composite_veneers.jpg",
        "popular": False,
        "procedure_time": "1 hour per tooth",
        "recovery_time": "Immediate",
        "warranty": "2 years"
    },
    "teeth_whitening": {
        "id": "teeth_whitening",
        "name": "Professional Teeth Whitening",
        "description": "In-office laser teeth whitening for a brighter, whiter smile.",
        "price": 250,
        "category": "Cosmetic Dentistry",
        "image": "/static/images/treatments/teeth_whitening.jpg",
        "popular": True,
        "procedure_time": "1-2 hours",
        "recovery_time": "Immediate",
        "warranty": "1 year"
    },
    "hollywood_smile": {
        "id": "hollywood_smile",
        "name": "Hollywood Smile",
        "description": "Complete smile makeover with premium veneers and whitening.",
        "price": 2800,
        "category": "Cosmetic Dentistry",
        "image": "/static/images/treatments/hollywood_smile.jpg",
        "popular": True,
        "procedure_time": "2-3 days",
        "recovery_time": "1-2 weeks",
        "warranty": "10 years"
    },
    "invisible_aligners": {
        "id": "invisible_aligners",
        "name": "Invisible Aligners",
        "description": "Clear, removable aligners custom-made to gradually straighten teeth.",
        "price": 1800,
        "category": "Orthodontics",
        "image": "/static/images/treatments/invisible_aligners.jpg",
        "popular": True,
        "procedure_time": "Multiple appointments",
        "recovery_time": "12-18 months total",
        "warranty": "Varies"
    },
    "ceramic_braces": {
        "id": "ceramic_braces",
        "name": "Ceramic Braces",
        "description": "Tooth-colored brackets that blend with teeth for a more discreet look.",
        "price": 1500,
        "category": "Orthodontics",
        "image": "/static/images/treatments/ceramic_braces.jpg",
        "popular": False,
        "procedure_time": "1-2 hours initial",
        "recovery_time": "18-24 months total",
        "warranty": "Varies"
    },
    "metal_braces": {
        "id": "metal_braces",
        "name": "Metal Braces",
        "description": "Traditional metal brackets and wires to straighten teeth effectively.",
        "price": 1200,
        "category": "Orthodontics",
        "image": "/static/images/treatments/metal_braces.jpg",
        "popular": False,
        "procedure_time": "1-2 hours initial",
        "recovery_time": "18-24 months total",
        "warranty": "Varies"
    },
    "lingual_braces": {
        "id": "lingual_braces",
        "name": "Lingual Braces",
        "description": "Braces placed behind the teeth, completely hidden from view.",
        "price": 2200,
        "category": "Orthodontics",
        "image": "/static/images/treatments/lingual_braces.jpg",
        "popular": False,
        "procedure_time": "1-2 hours initial",
        "recovery_time": "18-24 months total",
        "warranty": "Varies"
    },
    "dental_crowns": {
        "id": "dental_crowns",
        "name": "Dental Crowns",
        "description": "Tooth-shaped cap placed over a damaged tooth to restore function and appearance.",
        "price": 300,
        "category": "Restorative Dentistry",
        "image": "/static/images/treatments/dental_crowns.jpg",
        "popular": True,
        "procedure_time": "1-2 hours",
        "recovery_time": "1-2 weeks",
        "warranty": "5 years"
    },
    "dental_bridges": {
        "id": "dental_bridges",
        "name": "Dental Bridges",
        "description": "Fixed replacement for one or more missing teeth, anchored to adjacent teeth.",
        "price": 550,
        "category": "Restorative Dentistry",
        "image": "/static/images/treatments/dental_bridges.jpg",
        "popular": False,
        "procedure_time": "2-3 hours",
        "recovery_time": "2-4 weeks",
        "warranty": "5 years"
    },
    "root_canal_treatment": {
        "id": "root_canal_treatment",
        "name": "Root Canal Treatment",
        "description": "Procedure to remove infected pulp and save a severely infected tooth.",
        "price": 250,
        "category": "Restorative Dentistry",
        "image": "/static/images/treatments/root_canal_treatment.jpg",
        "popular": True,
        "procedure_time": "1-2 hours",
        "recovery_time": "1 week",
        "warranty": "2 years"
    },
    "dental_fillings": {
        "id": "dental_fillings",
        "name": "Dental Fillings",
        "description": "Material to fill cavities and restore damaged tooth structure.",
        "price": 80,
        "category": "Restorative Dentistry",
        "image": "/static/images/treatments/dental_fillings.jpg",
        "popular": True,
        "procedure_time": "30-60 minutes",
        "recovery_time": "Immediate",
        "warranty": "2 years"
    },
    "dental_cleaning": {
        "id": "dental_cleaning",
        "name": "Professional Dental Cleaning",
        "description": "Deep cleaning to remove plaque, tartar, and stains from teeth.",
        "price": 70,
        "category": "General Dentistry",
        "image": "/static/images/treatments/dental_cleaning.jpg",
        "popular": True,
        "procedure_time": "30-60 minutes",
        "recovery_time": "Immediate",
        "warranty": "N/A"
    },
    "dental_checkup": {
        "id": "dental_checkup",
        "name": "Comprehensive Dental Checkup",
        "description": "Complete examination including X-rays and oral cancer screening.",
        "price": 50,
        "category": "General Dentistry",
        "image": "/static/images/treatments/dental_checkup.jpg",
        "popular": True,
        "procedure_time": "30-45 minutes",
        "recovery_time": "Immediate",
        "warranty": "N/A"
    },
    "wisdom_tooth_extraction": {
        "id": "wisdom_tooth_extraction",
        "name": "Wisdom Tooth Extraction",
        "description": "Surgical removal of problematic wisdom teeth.",
        "price": 180,
        "category": "Oral Surgery",
        "image": "/static/images/treatments/wisdom_tooth_extraction.jpg",
        "popular": True,
        "procedure_time": "30-60 minutes per tooth",
        "recovery_time": "1-2 weeks",
        "warranty": "N/A"
    },
    "bone_grafting": {
        "id": "bone_grafting",
        "name": "Bone Grafting",
        "description": "Procedure to replace or augment missing bone in the jaw.",
        "price": 550,
        "category": "Oral Surgery",
        "image": "/static/images/treatments/bone_grafting.jpg",
        "popular": False,
        "procedure_time": "1-2 hours",
        "recovery_time": "3-6 months",
        "warranty": "Varies"
    },
    "full_mouth_reconstruction": {
        "id": "full_mouth_reconstruction",
        "name": "Full Mouth Reconstruction",
        "description": "Comprehensive treatment to rebuild or restore all teeth in upper and lower jaws.",
        "price": 6500,
        "category": "Restorative Dentistry",
        "image": "/static/images/treatments/full_mouth_reconstruction.jpg",
        "popular": False,
        "procedure_time": "Multiple appointments",
        "recovery_time": "3-6 months total",
        "warranty": "10 years"
    }
}

def get_treatment_categories():
    """Get all treatment categories"""
    return TREATMENT_CATEGORIES

def get_treatment_by_id(treatment_id):
    """Get a treatment by its ID"""
    return TREATMENTS.get(treatment_id)

def get_all_treatments():
    """Get all treatments as a list"""
    return list(TREATMENTS.values())

def get_treatments_by_category(category):
    """Get all treatments in a specific category"""
    return [treatment for treatment in TREATMENTS.values() if treatment['category'] == category]

def get_popular_treatments():
    """Get all popular treatments"""
    return [treatment for treatment in TREATMENTS.values() if treatment.get('popular', False)]

def get_categorized_treatments():
    """Get treatments organized by category"""
    categorized = {}
    for category in TREATMENT_CATEGORIES:
        categorized[category] = get_treatments_by_category(category)
    return categorized