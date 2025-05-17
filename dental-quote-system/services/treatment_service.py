"""
Treatment Service Module
Handles dental treatments for the quote system
"""

# Predefined dental treatments
TREATMENTS = [
    {
        'id': 'dental_implant_standard',
        'name': 'Dental Implant (Standard)',
        'description': 'Standard dental implant with abutment and crown',
        'category': 'Implants',
        'price': 1200,
        'image': '/static/images/implant.jpg'
    },
    {
        'id': 'dental_implant_premium',
        'name': 'Dental Implant (Premium)',
        'description': 'Premium dental implant with porcelain crown',
        'category': 'Implants',
        'price': 1500,
        'image': '/static/images/implant_premium.jpg'
    },
    {
        'id': 'all_on_4_implants',
        'name': 'All-on-4 Implants',
        'description': 'Full arch replacement with 4 implants',
        'category': 'Implants',
        'price': 7500,
        'image': '/static/images/all_on_4.jpg'
    },
    {
        'id': 'porcelain_veneers',
        'name': 'Porcelain Veneers',
        'description': 'High-quality porcelain veneers (per tooth)',
        'category': 'Cosmetic',
        'price': 500,
        'image': '/static/images/veneers.jpg'
    },
    {
        'id': 'composite_veneers',
        'name': 'Composite Veneers',
        'description': 'Composite resin veneers (per tooth)',
        'category': 'Cosmetic',
        'price': 250,
        'image': '/static/images/composite_veneers.jpg'
    },
    {
        'id': 'teeth_whitening',
        'name': 'Teeth Whitening',
        'description': 'Professional teeth whitening treatment',
        'category': 'Cosmetic',
        'price': 350,
        'image': '/static/images/whitening.jpg'
    },
    {
        'id': 'dental_crowns',
        'name': 'Dental Crowns',
        'description': 'Porcelain or zirconia crowns (per tooth)',
        'category': 'Restorative',
        'price': 400,
        'image': '/static/images/crowns.jpg'
    },
    {
        'id': 'root_canal',
        'name': 'Root Canal Treatment',
        'description': 'Root canal therapy (per tooth)',
        'category': 'Endodontic',
        'price': 450,
        'image': '/static/images/root_canal.jpg'
    },
    {
        'id': 'dental_bridge',
        'name': 'Dental Bridge',
        'description': '3-unit dental bridge',
        'category': 'Restorative',
        'price': 1200,
        'image': '/static/images/bridge.jpg'
    },
    {
        'id': 'full_mouth_reconstruction',
        'name': 'Full Mouth Reconstruction',
        'description': 'Complete restoration of all teeth',
        'category': 'Comprehensive',
        'price': 15000,
        'image': '/static/images/full_mouth.jpg'
    },
    {
        'id': 'hollywood_smile',
        'name': 'Hollywood Smile',
        'description': 'Complete smile makeover with veneers or crowns',
        'category': 'Cosmetic',
        'price': 6000,
        'image': '/static/images/hollywood_smile.jpg'
    },
    {
        'id': 'dental_consultation',
        'name': 'Dental Consultation',
        'description': 'Comprehensive dental consultation and treatment planning',
        'category': 'General',
        'price': 100,
        'image': '/static/images/consultation.jpg'
    }
]

def get_available_treatments():
    """
    Get all available dental treatments
    
    Returns:
        list: List of all available dental treatments
    """
    return TREATMENTS

def get_treatment_by_id(treatment_id):
    """
    Get a treatment by its ID
    
    Args:
        treatment_id (str): The ID of the treatment to retrieve
        
    Returns:
        dict or None: The treatment details if found, None otherwise
    """
    return next((t for t in TREATMENTS if t['id'] == treatment_id), None)

def get_treatments_by_category(category):
    """
    Get all treatments in a specific category
    
    Args:
        category (str): The category to filter by
        
    Returns:
        list: List of treatments in the specified category
    """
    return [t for t in TREATMENTS if t['category'] == category]