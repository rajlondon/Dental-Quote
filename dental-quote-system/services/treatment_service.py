"""
Treatment Service for Dental Quote System
Handles treatment data and operations
"""
import json
import os
from pathlib import Path

class TreatmentService:
    """
    Service class for handling dental treatments
    Provides methods to get treatments, categories, and treatment details
    """
    
    def __init__(self):
        """Initialize the treatment service with sample data"""
        self.data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'treatments.json')
        self.treatments = self._load_treatments()
        self.categories = self._generate_categories()
    
    def _load_treatments(self):
        """Load treatments from JSON file or use sample data if file doesn't exist"""
        # Create data directory if it doesn't exist
        Path(os.path.join(os.path.dirname(__file__), '..', 'data')).mkdir(parents=True, exist_ok=True)
        
        # Check if data file exists
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading treatments file: {e}")
                return self._get_sample_treatments()
        else:
            # Create file with sample data
            sample_data = self._get_sample_treatments()
            self._save_treatments(sample_data)
            return sample_data
    
    def _save_treatments(self, treatments):
        """Save treatments to JSON file"""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(treatments, f, indent=4)
            return True
        except Exception as e:
            print(f"Error saving treatments: {e}")
            return False
    
    def _generate_categories(self):
        """Generate categories from treatments"""
        categories = {}
        
        for treatment in self.treatments:
            category = treatment.get('category', 'General')
            category_id = category.lower().replace(' ', '_')
            
            if category_id not in categories:
                categories[category_id] = {
                    'id': category_id,
                    'name': category,
                    'treatments': []
                }
            
            categories[category_id]['treatments'].append(treatment)
        
        return categories
    
    def _get_sample_treatments(self):
        """Get sample treatment data"""
        return [
            {
                "id": "dental_implant_standard",
                "name": "Dental Implant (Standard)",
                "description": "Titanium root replacement with ceramic crown for a single missing tooth. Includes consultation, surgery, abutment, and final crown.",
                "price": 799,
                "category": "Implants",
                "image": "images/treatment-implant-standard.jpg",
                "duration_days": 5,
                "healing_time_days": 90,
                "procedures": ["Consultation", "CT Scan", "Implant Surgery", "Abutment Placement", "Crown Fitting"],
                "details": "Our standard implant package includes premium titanium implants with a lifetime warranty. The procedure is minimally invasive with a high success rate of over 98%."
            },
            {
                "id": "dental_implant_premium",
                "name": "Dental Implant (Premium)",
                "description": "Premium implant with zirconia crown and expedited treatment protocol. Includes 3D planning, guided surgery, and premium materials.",
                "price": 1299,
                "category": "Implants",
                "image": "images/treatment-implant-premium.jpg",
                "duration_days": 5,
                "healing_time_days": 60,
                "procedures": ["3D Consultation", "Digital Planning", "Guided Implant Surgery", "CAD/CAM Zirconia Crown"],
                "details": "Our premium implant package uses the latest technology for precise placement and faster healing. Includes upgraded zirconia crown with superior aesthetics."
            },
            {
                "id": "all_on_4_implants",
                "name": "All-on-4 Implant Denture",
                "description": "Full arch restoration supported by 4 dental implants. Fixed, non-removable solution for complete tooth replacement.",
                "price": 5999,
                "category": "Implants",
                "image": "images/treatment-all-on-4.jpg",
                "duration_days": 7,
                "healing_time_days": 90,
                "procedures": ["Full Evaluation", "Multiple Extractions", "Four Implant Placements", "Temporary Prosthesis", "Final Prosthesis"],
                "details": "Revolutionary All-on-4 technique provides a permanent solution for full arch replacement with just four strategically placed implants, eliminating the need for bone grafts in most cases."
            },
            {
                "id": "porcelain_veneers",
                "name": "Porcelain Veneers",
                "description": "Thin, custom-made porcelain shells that cover the front surface of teeth to improve appearance. Price is per veneer.",
                "price": 299,
                "category": "Cosmetic",
                "image": "images/treatment-veneers.jpg",
                "duration_days": 5,
                "healing_time_days": 7,
                "procedures": ["Consultation", "Minimal Tooth Preparation", "Digital Impression", "Temporary Veneers", "Final Fitting"],
                "details": "Our porcelain veneers are custom-crafted in an advanced dental laboratory to match your natural teeth while providing the desired improvements in shape, color, and alignment."
            },
            {
                "id": "hollywood_smile",
                "name": "Hollywood Smile Package",
                "description": "Complete smile makeover with 8-10 porcelain veneers or crowns for a picture-perfect smile.",
                "price": 2499,
                "category": "Cosmetic",
                "image": "images/treatment-hollywood-smile.jpg",
                "duration_days": 7,
                "healing_time_days": 14,
                "procedures": ["Smile Design Consultation", "Digital Smile Preview", "Teeth Preparation", "Temporary Veneers", "Final Veneer Placement"],
                "details": "Our most comprehensive cosmetic package includes professional whitening, custom-designed veneers, and digital smile planning for transformative results."
            },
            {
                "id": "teeth_whitening_zoom",
                "name": "Professional Teeth Whitening",
                "description": "In-office professional whitening procedure that lightens teeth up to 8 shades in a single session.",
                "price": 199,
                "category": "Cosmetic",
                "image": "images/treatment-whitening.jpg",
                "duration_days": 1,
                "healing_time_days": 0,
                "procedures": ["Dental Cleaning", "Gum Protection", "Whitening Application", "LED Activation"],
                "details": "Our professional whitening uses the latest LED-activated technology for fast, effective results without sensitivity. Includes take-home touch-up kit."
            },
            {
                "id": "dental_crowns",
                "name": "Dental Crown",
                "description": "Full tooth coverage restoration to restore shape, size, and strength. Price is per crown.",
                "price": 249,
                "category": "Restorative",
                "image": "images/treatment-crown.jpg",
                "duration_days": 5,
                "healing_time_days": 7,
                "procedures": ["Examination", "Tooth Preparation", "Digital Impression", "Temporary Crown", "Permanent Crown Placement"],
                "details": "Our dental crowns are made from high-quality zirconia or porcelain materials for exceptional durability and natural appearance."
            },
            {
                "id": "root_canal_treatment",
                "name": "Root Canal Treatment",
                "description": "Procedure to treat infection in the tooth's root canal system and pulp chamber.",
                "price": 199,
                "category": "Restorative",
                "image": "images/treatment-root-canal.jpg",
                "duration_days": 2,
                "healing_time_days": 7,
                "procedures": ["Diagnosis", "Local Anesthesia", "Canal Cleaning", "Filling", "Crown Recommendation"],
                "details": "Our painless root canal procedure uses advanced rotary instruments and medicaments to thoroughly clean infected canals and preserve your natural tooth."
            },
            {
                "id": "dental_bridge_3_unit",
                "name": "Dental Bridge (3-Unit)",
                "description": "Fixed prosthetic device to replace a missing tooth by joining to surrounding teeth.",
                "price": 699,
                "category": "Restorative",
                "image": "images/treatment-bridge.jpg",
                "duration_days": 5,
                "healing_time_days": 7,
                "procedures": ["Examination", "Abutment Teeth Preparation", "Impression", "Temporary Bridge", "Permanent Bridge Placement"],
                "details": "Our 3-unit bridges provide a stable, aesthetic solution for replacing a missing tooth without the need for surgery, using adjacent teeth as support."
            },
            {
                "id": "full_mouth_reconstruction",
                "name": "Full Mouth Reconstruction",
                "description": "Comprehensive treatment to rebuild or restore all teeth in upper and lower jaws.",
                "price": 7999,
                "category": "Restorative",
                "image": "images/treatment-full-mouth.jpg",
                "duration_days": 14,
                "healing_time_days": 30,
                "procedures": ["Comprehensive Examination", "Treatment Planning", "Multiple Procedures", "Staged Restoration", "Final Adjustments"],
                "details": "Our full mouth reconstruction addresses multiple dental issues simultaneously, combining implants, crowns, bridges, and other treatments for complete oral rehabilitation."
            },
            {
                "id": "dental_cleaning",
                "name": "Professional Dental Cleaning",
                "description": "Thorough cleaning to remove plaque and tartar, includes polishing and fluoride treatment.",
                "price": 59,
                "category": "Preventive",
                "image": "images/treatment-cleaning.jpg",
                "duration_days": 1,
                "healing_time_days": 0,
                "procedures": ["Scaling", "Root Planning", "Polishing", "Fluoride Application"],
                "details": "Our professional cleaning removes stubborn plaque and calculus, reaching areas that regular brushing cannot, to prevent gum disease and maintain oral health."
            },
            {
                "id": "dental_examination",
                "name": "Comprehensive Dental Examination",
                "description": "Thorough evaluation of oral health, including X-rays and oral cancer screening.",
                "price": 49,
                "category": "Preventive",
                "image": "images/treatment-examination.jpg",
                "duration_days": 1,
                "healing_time_days": 0,
                "procedures": ["Visual Examination", "Digital X-Rays", "Cancer Screening", "Treatment Consultation"],
                "details": "Our comprehensive examination uses advanced digital diagnostics to identify potential issues early, creating a baseline for your ongoing dental health."
            }
        ]
    
    def get_all_treatments(self):
        """Get all treatments"""
        return self.treatments
    
    def get_treatment_by_id(self, treatment_id):
        """Get treatment by ID"""
        for treatment in self.treatments:
            if treatment['id'] == treatment_id:
                return treatment
        return None
    
    def get_treatments_by_category(self, category_id):
        """Get treatments by category ID"""
        if category_id in self.categories:
            return self.categories[category_id]['treatments']
        return []
    
    def get_all_categories(self):
        """Get all categories"""
        return self.categories
    
    def add_treatment(self, treatment_data):
        """Add a new treatment"""
        # Generate ID if not provided
        if 'id' not in treatment_data:
            treatment_data['id'] = treatment_data['name'].lower().replace(' ', '_')
        
        # Add to treatments list
        self.treatments.append(treatment_data)
        
        # Update categories
        self._generate_categories()
        
        # Save to file
        self._save_treatments(self.treatments)
        
        return treatment_data
    
    def update_treatment(self, treatment_id, treatment_data):
        """Update an existing treatment"""
        for i, treatment in enumerate(self.treatments):
            if treatment['id'] == treatment_id:
                # Update treatment data
                self.treatments[i] = {**treatment, **treatment_data}
                
                # Update categories
                self._generate_categories()
                
                # Save to file
                self._save_treatments(self.treatments)
                
                return self.treatments[i]
        
        return None  # Treatment not found
    
    def delete_treatment(self, treatment_id):
        """Delete a treatment"""
        for i, treatment in enumerate(self.treatments):
            if treatment['id'] == treatment_id:
                # Remove treatment
                deleted_treatment = self.treatments.pop(i)
                
                # Update categories
                self._generate_categories()
                
                # Save to file
                self._save_treatments(self.treatments)
                
                return deleted_treatment
        
        return None  # Treatment not found