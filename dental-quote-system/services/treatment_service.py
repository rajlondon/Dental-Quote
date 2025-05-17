"""
Treatment Service Module
Provides functions and data for dental treatments
"""
import logging

logger = logging.getLogger(__name__)

# Define available treatments
TREATMENTS = {
    "dental_implant_standard": {
        "id": "dental_implant_standard",
        "name": "Standard Dental Implant",
        "description": "Titanium implant with abutment and crown, placed in a single surgical procedure.",
        "price": 750,
        "image": "/static/images/treatments/dental_implant.jpg",
        "duration": "2-3 days",
        "recovery": "3-5 days",
        "category": "implants",
        "popular": True,
        "clinic_reference_code": "IMP-STD"
    },
    "dental_implant_premium": {
        "id": "dental_implant_premium",
        "name": "Premium Dental Implant",
        "description": "Premium brand titanium implant with custom abutment and high-quality porcelain crown.",
        "price": 950,
        "image": "/static/images/treatments/premium_implant.jpg",
        "duration": "2-3 days",
        "recovery": "3-5 days",
        "category": "implants",
        "popular": False,
        "clinic_reference_code": "IMP-PRE"
    },
    "all_on_4_implants": {
        "id": "all_on_4_implants",
        "name": "All-on-4 Dental Implants",
        "description": "Full arch restoration using only 4 implants to support a fixed prosthesis.",
        "price": 4500,
        "image": "/static/images/treatments/all_on_4.jpg",
        "duration": "5-7 days",
        "recovery": "7-10 days",
        "category": "implants",
        "popular": True,
        "clinic_reference_code": "AO4"
    },
    "all_on_6_implants": {
        "id": "all_on_6_implants",
        "name": "All-on-6 Dental Implants",
        "description": "Full arch restoration using 6 implants for added stability and support.",
        "price": 5500,
        "image": "/static/images/treatments/all_on_6.jpg",
        "duration": "5-7 days",
        "recovery": "7-10 days",
        "category": "implants",
        "popular": False,
        "clinic_reference_code": "AO6"
    },
    "dental_crowns": {
        "id": "dental_crowns",
        "name": "Dental Crowns",
        "description": "Porcelain or zirconia crowns to restore damaged or decayed teeth.",
        "price": 350,
        "image": "/static/images/treatments/dental_crown.jpg",
        "duration": "3-5 days",
        "recovery": "1-2 days",
        "category": "cosmetic",
        "popular": True,
        "clinic_reference_code": "CRW"
    },
    "porcelain_veneers": {
        "id": "porcelain_veneers",
        "name": "Porcelain Veneers",
        "description": "Thin porcelain shells bonded to the front of teeth for a beautiful, natural-looking smile.",
        "price": 400,
        "image": "/static/images/treatments/veneers.jpg",
        "duration": "5-7 days",
        "recovery": "1-2 days",
        "category": "cosmetic",
        "popular": True,
        "clinic_reference_code": "VEN"
    },
    "composite_veneers": {
        "id": "composite_veneers",
        "name": "Composite Veneers",
        "description": "Tooth-colored resin applied directly to teeth for a cost-effective smile enhancement.",
        "price": 200,
        "image": "/static/images/treatments/composite_veneers.jpg",
        "duration": "1-2 days",
        "recovery": "None",
        "category": "cosmetic",
        "popular": False,
        "clinic_reference_code": "VEN-C"
    },
    "teeth_whitening": {
        "id": "teeth_whitening",
        "name": "Professional Teeth Whitening",
        "description": "In-office laser whitening treatment to brighten teeth by several shades.",
        "price": 150,
        "image": "/static/images/treatments/teeth_whitening.jpg",
        "duration": "1 day",
        "recovery": "None",
        "category": "cosmetic",
        "popular": True,
        "clinic_reference_code": "WHT"
    },
    "dental_bridge": {
        "id": "dental_bridge",
        "name": "Dental Bridge",
        "description": "Fixed prosthetic device to replace one or more missing teeth.",
        "price": 600,
        "image": "/static/images/treatments/dental_bridge.jpg",
        "duration": "3-5 days",
        "recovery": "1-2 days",
        "category": "restorative",
        "popular": False,
        "clinic_reference_code": "BRG"
    },
    "root_canal": {
        "id": "root_canal",
        "name": "Root Canal Treatment",
        "description": "Procedure to treat infection at the center of a tooth (root canal system).",
        "price": 300,
        "image": "/static/images/treatments/root_canal.jpg",
        "duration": "1-2 days",
        "recovery": "1-2 days",
        "category": "restorative",
        "popular": False,
        "clinic_reference_code": "RCT"
    },
    "dental_cleaning": {
        "id": "dental_cleaning",
        "name": "Professional Dental Cleaning",
        "description": "Deep cleaning to remove plaque and tartar build-up.",
        "price": 75,
        "image": "/static/images/treatments/dental_cleaning.jpg",
        "duration": "1 day",
        "recovery": "None",
        "category": "preventive",
        "popular": False,
        "clinic_reference_code": "CLN"
    },
    "dental_bonding": {
        "id": "dental_bonding",
        "name": "Dental Bonding",
        "description": "Application of tooth-colored resin to repair chipped, cracked, or discolored teeth.",
        "price": 150,
        "image": "/static/images/treatments/dental_bonding.jpg",
        "duration": "1 day",
        "recovery": "None",
        "category": "cosmetic",
        "popular": False,
        "clinic_reference_code": "BND"
    },
    "dental_consultation": {
        "id": "dental_consultation",
        "name": "Dental Consultation",
        "description": "Comprehensive evaluation by a specialist dentist to assess your dental needs.",
        "price": 75,
        "image": "/static/images/treatments/consultation.jpg",
        "duration": "1 day",
        "recovery": "None",
        "category": "preventive",
        "popular": False,
        "clinic_reference_code": "CON"
    },
    "full_mouth_reconstruction": {
        "id": "full_mouth_reconstruction",
        "name": "Full Mouth Reconstruction",
        "description": "Complete restoration of all teeth in both upper and lower jaws.",
        "price": 7500,
        "image": "/static/images/treatments/full_mouth.jpg",
        "duration": "7-14 days",
        "recovery": "10-14 days",
        "category": "restorative",
        "popular": False,
        "clinic_reference_code": "FMR"
    },
    "dental_filling": {
        "id": "dental_filling",
        "name": "Dental Filling",
        "description": "Tooth-colored composite filling to repair cavities or tooth decay.",
        "price": 120,
        "image": "/static/images/treatments/dental_filling.jpg",
        "duration": "1 day",
        "recovery": "None",
        "category": "restorative",
        "popular": False,
        "clinic_reference_code": "FIL"
    },
    "hollywood_smile": {
        "id": "hollywood_smile",
        "name": "Hollywood Smile",
        "description": "Comprehensive smile makeover with multiple veneers and/or crowns for a perfect smile.",
        "price": 3500,
        "image": "/static/images/treatments/hollywood_smile.jpg",
        "duration": "7-10 days",
        "recovery": "3-5 days",
        "category": "cosmetic",
        "popular": True,
        "clinic_reference_code": "HWS"
    }
}

def get_all_treatments():
    """Get all available treatments"""
    return list(TREATMENTS.values())

def get_treatments_by_category(category):
    """Get treatments by category"""
    return [treatment for treatment in TREATMENTS.values() if treatment.get('category') == category]

def get_popular_treatments():
    """Get popular treatments"""
    return [treatment for treatment in TREATMENTS.values() if treatment.get('popular')]

def get_treatment_by_id(treatment_id):
    """Get a treatment by its ID"""
    return TREATMENTS.get(treatment_id)

def calculate_treatments_total(treatments):
    """Calculate the total price for a list of treatments"""
    total = 0
    item_count = 0
    
    for treatment in treatments:
        quantity = treatment.get('quantity', 1)
        price = treatment.get('price', 0)
        total += price * quantity
        item_count += quantity
    
    return {
        'subtotal': total,
        'item_count': item_count
    }