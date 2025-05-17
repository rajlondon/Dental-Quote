"""
TreatmentService for Dental Quote System
Manages treatment data and operations
"""

import json
import os

class TreatmentService:
    """
    Handles treatment-related operations
    Provides treatment data, categories, and filtering
    """
    
    def __init__(self):
        self.treatments = self._load_treatments()
        self.categories = self._generate_categories()
    
    def _load_treatments(self):
        """Load treatment data from the data file"""
        try:
            # Use mock data for now, will be replaced with real data later
            return [
                {
                    "id": "dental_implant_standard",
                    "name": "Dental Implant (Standard)",
                    "description": "Titanium root replacement for missing teeth, providing a strong foundation for fixed or removable replacement teeth.",
                    "price": 950,
                    "category": "implants",
                    "image": "/static/images/treatments/dental_implant.jpg"
                },
                {
                    "id": "dental_implant_premium",
                    "name": "Dental Implant (Premium)",
                    "description": "Premium implant with advanced technology and materials for enhanced aesthetics and integration.",
                    "price": 1250,
                    "category": "implants",
                    "image": "/static/images/treatments/dental_implant_premium.jpg"
                },
                {
                    "id": "dental_crowns",
                    "name": "Dental Crown",
                    "description": "Custom-made cap that covers a damaged tooth to restore its shape, size, strength, and appearance.",
                    "price": 450,
                    "category": "crowns_bridges",
                    "image": "/static/images/treatments/dental_crown.jpg"
                },
                {
                    "id": "porcelain_veneers",
                    "name": "Porcelain Veneers",
                    "description": "Thin shells of porcelain that are bonded to the front surface of teeth to improve their appearance.",
                    "price": 550,
                    "category": "cosmetic",
                    "image": "/static/images/treatments/porcelain_veneers.jpg"
                },
                {
                    "id": "zirconia_bridge",
                    "name": "Zirconia Bridge",
                    "description": "Strong, durable bridge made from zirconia, used to replace missing teeth by anchoring to adjacent natural teeth.",
                    "price": 750,
                    "category": "crowns_bridges",
                    "image": "/static/images/treatments/zirconia_bridge.jpg"
                },
                {
                    "id": "teeth_whitening",
                    "name": "Professional Teeth Whitening",
                    "description": "In-office whitening treatment that removes stains and discoloration for a brighter smile.",
                    "price": 350,
                    "category": "cosmetic",
                    "image": "/static/images/treatments/teeth_whitening.jpg"
                },
                {
                    "id": "root_canal",
                    "name": "Root Canal Treatment",
                    "description": "Procedure to treat infection in the root of a tooth, saving the natural tooth and preventing extraction.",
                    "price": 550,
                    "category": "endodontics",
                    "image": "/static/images/treatments/root_canal.jpg"
                },
                {
                    "id": "dental_cleaning",
                    "name": "Professional Dental Cleaning",
                    "description": "Thorough cleaning of teeth by a dental professional to remove plaque and tartar buildup.",
                    "price": 120,
                    "category": "preventive",
                    "image": "/static/images/treatments/dental_cleaning.jpg"
                },
                {
                    "id": "all_on_4_implants",
                    "name": "All-on-4 Dental Implants",
                    "description": "Revolutionary technique where an entire arch of teeth is supported by just four dental implants.",
                    "price": 6500,
                    "category": "implants",
                    "image": "/static/images/treatments/all_on_4.jpg"
                },
                {
                    "id": "ceramic_braces",
                    "name": "Ceramic Braces",
                    "description": "Less visible braces made of ceramic material that blends with the natural color of teeth.",
                    "price": 2900,
                    "category": "orthodontics",
                    "image": "/static/images/treatments/ceramic_braces.jpg"
                },
                {
                    "id": "clear_aligners",
                    "name": "Clear Aligners",
                    "description": "Transparent, removable alternatives to braces that gradually straighten teeth.",
                    "price": 3500,
                    "category": "orthodontics",
                    "image": "/static/images/treatments/clear_aligners.jpg"
                },
                {
                    "id": "hollywood_smile",
                    "name": "Hollywood Smile Makeover",
                    "description": "Comprehensive smile makeover with combination treatments for a perfect Hollywood smile.",
                    "price": 4500,
                    "category": "cosmetic",
                    "image": "/static/images/treatments/hollywood_smile.jpg"
                },
                {
                    "id": "dental_filling",
                    "name": "Dental Filling",
                    "description": "Restoration of a damaged tooth using material that resembles the natural tooth color.",
                    "price": 120,
                    "category": "restorative",
                    "image": "/static/images/treatments/dental_filling.jpg"
                },
                {
                    "id": "wisdom_tooth_extraction",
                    "name": "Wisdom Tooth Extraction",
                    "description": "Surgical removal of one or more wisdom teeth, the four permanent adult teeth at the back corners.",
                    "price": 280,
                    "category": "oral_surgery",
                    "image": "/static/images/treatments/wisdom_tooth_extraction.jpg"
                },
                {
                    "id": "gum_therapy",
                    "name": "Gum Therapy",
                    "description": "Non-surgical treatment for gum disease to restore gum health and prevent tooth loss.",
                    "price": 380,
                    "category": "periodontics",
                    "image": "/static/images/treatments/gum_therapy.jpg"
                },
                {
                    "id": "full_mouth_reconstruction",
                    "name": "Full Mouth Reconstruction",
                    "description": "Comprehensive treatment to rebuild or restore all teeth in both upper and lower jaws.",
                    "price": 12000,
                    "category": "restorative",
                    "image": "/static/images/treatments/full_mouth_reconstruction.jpg"
                }
            ]
        except Exception as e:
            print(f"Error loading treatments: {e}")
            return []
    
    def _generate_categories(self):
        """Generate category structure from treatments"""
        categories = {}
        
        for treatment in self.treatments:
            category_id = treatment.get('category', 'other')
            
            if category_id not in categories:
                categories[category_id] = {
                    'name': self._format_category_name(category_id),
                    'treatments': []
                }
            
            categories[category_id]['treatments'].append(treatment)
        
        return categories
    
    def _format_category_name(self, category_id):
        """Format category ID into a readable name"""
        return category_id.replace('_', ' ').title()
    
    def get_all_treatments(self):
        """Get all available treatments"""
        return self.treatments
    
    def get_treatment_by_id(self, treatment_id):
        """Get a treatment by its ID"""
        for treatment in self.treatments:
            if treatment['id'] == treatment_id:
                return treatment
        return None
    
    def get_treatments_by_category(self, category_id):
        """Get all treatments in a specific category"""
        if category_id in self.categories:
            return self.categories[category_id]['treatments']
        return []
    
    def get_categorized_treatments(self):
        """Get treatments organized by category"""
        return self.categories
    
    def get_popular_treatments(self, limit=6):
        """Get a subset of treatments marked as popular or frequently chosen"""
        # In a real implementation, this would be based on actual popularity data
        popular_treatments = [
            t for t in self.treatments if t['id'] in [
                'dental_implant_standard',
                'porcelain_veneers',
                'teeth_whitening',
                'dental_crowns',
                'clear_aligners',
                'hollywood_smile'
            ]
        ]
        
        return popular_treatments[:limit]
    
    def filter_treatments(self, search_term=None, min_price=None, max_price=None, category=None):
        """Filter treatments based on criteria"""
        filtered = self.treatments.copy()
        
        # Filter by search term
        if search_term:
            search_term = search_term.lower()
            filtered = [
                t for t in filtered if 
                search_term in t['name'].lower() or 
                search_term in t['description'].lower()
            ]
        
        # Filter by price range
        if min_price is not None:
            filtered = [t for t in filtered if t['price'] >= min_price]
        
        if max_price is not None:
            filtered = [t for t in filtered if t['price'] <= max_price]
        
        # Filter by category
        if category:
            filtered = [t for t in filtered if t['category'] == category]
        
        return filtered