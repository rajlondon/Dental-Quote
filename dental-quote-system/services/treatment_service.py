"""
Treatment Service Module
Handles treatments and related functionality
"""
import json
import os
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Treatments data file path
TREATMENTS_DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'treatments.json')

def load_treatments():
    """Load treatments from JSON file or generate sample data if file doesn't exist"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(TREATMENTS_DATA_FILE), exist_ok=True)
    
    # If file doesn't exist, generate sample data
    if not os.path.exists(TREATMENTS_DATA_FILE):
        logger.info("Treatments data file not found. Generating sample data.")
        treatments = generate_sample_treatments()
        save_treatments(treatments)
        return treatments
    
    # Load from file
    try:
        with open(TREATMENTS_DATA_FILE, 'r') as file:
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
        with open(TREATMENTS_DATA_FILE, 'w') as file:
            json.dump(treatments, file, indent=2)
        logger.info(f"Saved {len(treatments)} treatments to file")
        return True
    except Exception as e:
        logger.error(f"Error saving treatments to file: {e}")
        return False

def generate_sample_treatments():
    """Generate sample treatments data"""
    treatments = [
        # Implants
        {
            "id": "dental_implant_standard",
            "name": "Standard Dental Implant",
            "category": "implants",
            "description": "Titanium dental implant with abutment and crown. Includes surgery and follow-up care.",
            "price": 750,
            "currency": "USD",
            "image": "/static/images/treatments/dental_implant.jpg",
            "features": ["Titanium implant", "Abutment", "Porcelain crown", "Surgery", "Local anesthesia"],
            "timeline": "3-6 months (requires multiple visits)",
            "longevity": "15+ years with proper care"
        },
        {
            "id": "dental_implant_premium",
            "name": "Premium Dental Implant",
            "category": "implants",
            "description": "Premium implant system with enhanced aesthetics and longer warranty. Includes all necessary procedures.",
            "price": 950,
            "currency": "USD",
            "image": "/static/images/treatments/premium_implant.jpg",
            "features": ["Premium implant brand", "Custom abutment", "Zirconia crown", "Surgery", "Extended warranty"],
            "timeline": "3-6 months (requires multiple visits)",
            "longevity": "Lifetime warranty on implant"
        },
        {
            "id": "all_on_4_implants",
            "name": "All-on-4 Implants",
            "category": "implants",
            "description": "Full arch replacement using just 4 implants. Immediate loading possible with temporary prosthesis.",
            "price": 4500,
            "currency": "USD",
            "image": "/static/images/treatments/all_on_4.jpg",
            "features": ["4 dental implants", "Full arch prosthesis", "Same-day temporary teeth", "Permanent restoration"],
            "timeline": "2-3 days for temporary, 4-6 months for permanent",
            "longevity": "15+ years for implants, 10+ years for prosthesis"
        },
        
        # Crowns & Bridges
        {
            "id": "dental_crowns",
            "name": "Dental Crown",
            "category": "crowns",
            "description": "Porcelain or zirconia crown to restore damaged or decayed teeth. Natural appearance and high durability.",
            "price": 350,
            "currency": "USD",
            "image": "/static/images/treatments/dental_crown.jpg",
            "features": ["Porcelain/Zirconia material", "Custom shade matching", "Digital impressions"],
            "timeline": "1-2 days with CAD/CAM technology",
            "longevity": "10-15 years with proper care"
        },
        {
            "id": "dental_bridge_3_unit",
            "name": "3-Unit Dental Bridge",
            "category": "crowns",
            "description": "Fixed bridge to replace a missing tooth, supported by adjacent teeth. Natural-looking replacement.",
            "price": 950,
            "currency": "USD",
            "image": "/static/images/treatments/dental_bridge.jpg",
            "features": ["3-unit bridge", "Porcelain/Zirconia material", "Custom shade matching"],
            "timeline": "2-3 days",
            "longevity": "10-15 years with proper care"
        },
        
        # Veneers
        {
            "id": "porcelain_veneers",
            "name": "Porcelain Veneers",
            "category": "veneers",
            "description": "Thin porcelain shells bonded to front teeth to improve appearance. Stain-resistant and natural-looking.",
            "price": 400,
            "currency": "USD",
            "image": "/static/images/treatments/porcelain_veneers.jpg",
            "features": ["E-max porcelain", "Minimal tooth reduction", "Custom design"],
            "timeline": "2-3 days",
            "longevity": "10-15 years"
        },
        {
            "id": "composite_veneers",
            "name": "Composite Veneers",
            "category": "veneers",
            "description": "Direct application of composite resin to improve tooth appearance. More affordable alternative to porcelain.",
            "price": 200,
            "currency": "USD",
            "image": "/static/images/treatments/composite_veneers.jpg",
            "features": ["Composite resin material", "Single visit procedure", "Repairable"],
            "timeline": "Same day",
            "longevity": "5-7 years"
        },
        {
            "id": "hollywood_smile",
            "name": "Hollywood Smile",
            "category": "veneers",
            "description": "Complete smile makeover with 8-10 porcelain veneers. Creates a bright, uniform and attractive smile.",
            "price": 3200,
            "currency": "USD",
            "image": "/static/images/treatments/hollywood_smile.jpg",
            "features": ["8-10 porcelain veneers", "Smile design", "Temporary mock-up"],
            "timeline": "3-5 days",
            "longevity": "10-15 years"
        },
        
        # Root Canal & Extractions
        {
            "id": "root_canal_treatment",
            "name": "Root Canal Treatment",
            "category": "endodontics",
            "description": "Procedure to treat infected tooth pulp and save the natural tooth. Includes cleaning, filling and sealing.",
            "price": 300,
            "currency": "USD",
            "image": "/static/images/treatments/root_canal.jpg",
            "features": ["Removes infected pulp", "Prevents extraction", "Modern techniques"],
            "timeline": "1-2 visits",
            "longevity": "Lifetime with proper restoration"
        },
        {
            "id": "tooth_extraction_simple",
            "name": "Simple Tooth Extraction",
            "category": "endodontics",
            "description": "Removal of visible tooth that can be extracted with forceps. Includes local anesthesia.",
            "price": 100,
            "currency": "USD",
            "image": "/static/images/treatments/extraction.jpg",
            "features": ["Local anesthesia", "Simple procedure", "Post-extraction care"],
            "timeline": "Single visit (30-60 minutes)",
            "longevity": "N/A (extraction)"
        },
        {
            "id": "tooth_extraction_surgical",
            "name": "Surgical Tooth Extraction",
            "category": "endodontics",
            "description": "Removal of tooth that cannot be easily accessed, such as impacted wisdom teeth. Includes sedation options.",
            "price": 200,
            "currency": "USD",
            "image": "/static/images/treatments/surgical_extraction.jpg",
            "features": ["Surgical approach", "Sedation options", "Impacted tooth removal"],
            "timeline": "Single visit (60-90 minutes)",
            "longevity": "N/A (extraction)"
        },
        
        # Whitening & Cleaning
        {
            "id": "teeth_whitening_in_office",
            "name": "In-Office Teeth Whitening",
            "category": "whitening",
            "description": "Professional whitening treatment using high-concentration bleaching gel and special light. Immediate results.",
            "price": 250,
            "currency": "USD",
            "image": "/static/images/treatments/teeth_whitening.jpg",
            "features": ["Immediate results", "Professional strength gel", "LED activation"],
            "timeline": "Single visit (60-90 minutes)",
            "longevity": "1-2 years depending on habits"
        },
        {
            "id": "teeth_whitening_take_home",
            "name": "Take-Home Whitening Kit",
            "category": "whitening",
            "description": "Custom-fitted whitening trays with professional-grade whitening gel for use at home. Gradual results.",
            "price": 150,
            "currency": "USD",
            "image": "/static/images/treatments/home_whitening.jpg",
            "features": ["Custom trays", "Professional gel", "Convenient home use"],
            "timeline": "2-3 weeks of daily use",
            "longevity": "1-2 years with occasional touch-ups"
        },
        {
            "id": "dental_cleaning",
            "name": "Professional Dental Cleaning",
            "category": "whitening",
            "description": "Thorough cleaning by dental hygienist to remove plaque and tartar. Includes polishing and fluoride treatment.",
            "price": 100,
            "currency": "USD",
            "image": "/static/images/treatments/dental_cleaning.jpg",
            "features": ["Tartar removal", "Polishing", "Fluoride treatment"],
            "timeline": "Single visit (45-60 minutes)",
            "longevity": "Recommended every 6 months"
        },
        
        # Complete Reconstructions
        {
            "id": "full_mouth_reconstruction",
            "name": "Full Mouth Reconstruction",
            "category": "reconstruction",
            "description": "Comprehensive treatment to restore function and aesthetics to severely damaged dentition. Combines multiple procedures.",
            "price": 8500,
            "currency": "USD",
            "image": "/static/images/treatments/full_mouth.jpg",
            "features": ["Comprehensive treatment plan", "Multiple procedures", "Complete rehabilitation"],
            "timeline": "Multiple visits over 1-3 weeks",
            "longevity": "10-15 years for restorations"
        },
        {
            "id": "smile_makeover",
            "name": "Smile Makeover",
            "category": "reconstruction",
            "description": "Combination of cosmetic procedures to enhance your smile. Customized treatment plan based on your goals.",
            "price": 3800,
            "currency": "USD",
            "image": "/static/images/treatments/smile_makeover.jpg",
            "features": ["Customized treatment plan", "Combination of procedures", "Focus on aesthetics"],
            "timeline": "Multiple visits over 1-2 weeks",
            "longevity": "Varies by procedures"
        }
    ]
    
    return treatments

def get_treatment_by_id(treatment_id):
    """Get a treatment by its ID"""
    if not treatment_id:
        return None
    
    treatments = load_treatments()
    
    for treatment in treatments:
        if treatment.get('id') == treatment_id:
            return treatment
    
    return None

def get_categorized_treatments():
    """Get treatments organized by category"""
    treatments = load_treatments()
    
    categorized = {}
    for treatment in treatments:
        category = treatment.get('category', 'other')
        if category not in categorized:
            categorized[category] = []
        categorized[category].append(treatment)
    
    return categorized

def get_treatment_categories():
    """Get a list of all treatment categories"""
    categorized = get_categorized_treatments()
    return list(categorized.keys())

def calculate_totals(selected_treatments, promo_details=None):
    """Calculate quote totals including any discounts from promo codes"""
    subtotal = 0
    discount = 0
    
    # Calculate the subtotal
    for treatment in selected_treatments:
        price = float(treatment.get('price', 0))
        quantity = int(treatment.get('quantity', 1))
        subtotal += price * quantity
    
    # Apply discount if promo code is provided
    if promo_details:
        discount_type = promo_details.get('discount_type')
        discount_value = float(promo_details.get('discount_value', 0))
        
        if discount_type == 'percentage':
            discount = subtotal * (discount_value / 100)
        elif discount_type == 'fixed_amount':
            discount = min(discount_value, subtotal)  # Don't allow negative totals
    
    # Calculate the total
    total = subtotal - discount
    
    return {
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    }

def generate_quote_id():
    """Generate a unique quote ID"""
    return f"DQ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"