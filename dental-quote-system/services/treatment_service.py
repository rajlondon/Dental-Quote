"""
Treatment Service for Dental Quote System
Manages dental treatments data
"""

import json
import os
import uuid
from datetime import datetime

class TreatmentService:
    """
    Service for managing dental treatments
    """
    
    def __init__(self):
        """
        Initialize the treatment service
        
        Loads treatment data from JSON file or creates sample data if not available
        """
        self.treatments = []
        self.categories = {}
        
        # Load treatments from data file if available
        self._load_treatments()
        
        # If no treatments were loaded, create sample data
        if not self.treatments:
            self._create_sample_treatments()
    
    def _load_treatments(self):
        """
        Load treatments from JSON data file
        """
        try:
            # Attempt to load from data file
            data_file = os.path.join(os.path.dirname(__file__), '../data/treatments.json')
            
            if os.path.exists(data_file):
                with open(data_file, 'r') as file:
                    data = json.load(file)
                    self.treatments = data.get('treatments', [])
                    self.categories = data.get('categories', {})
                
                return True
        except Exception as e:
            print(f"Error loading treatments: {e}")
        
        return False
    
    def _create_sample_treatments(self):
        """
        Create sample treatment data
        """
        # Define categories
        self.categories = {
            "basic": {
                "id": "basic",
                "name": "Basic Treatments",
                "description": "Essential dental treatments for oral health",
                "order": 1
            },
            "cosmetic": {
                "id": "cosmetic",
                "name": "Cosmetic Dentistry",
                "description": "Treatments to enhance the appearance of your smile",
                "order": 2
            },
            "restorative": {
                "id": "restorative",
                "name": "Restorative Treatments",
                "description": "Repair and restore damaged teeth",
                "order": 3
            },
            "implants": {
                "id": "implants",
                "name": "Dental Implants",
                "description": "Permanent solutions for missing teeth",
                "order": 4
            },
            "orthodontics": {
                "id": "orthodontics",
                "name": "Orthodontics",
                "description": "Teeth alignment and bite correction",
                "order": 5
            }
        }
        
        # Define sample treatments
        self.treatments = [
            {
                "id": "dental_cleaning",
                "name": "Dental Cleaning",
                "description": "Professional cleaning to remove plaque and tartar",
                "details": "Our professional dental cleaning removes plaque and tartar buildup that regular brushing can't reach. The procedure includes scaling, polishing, and fluoride treatment.",
                "price": 80,
                "duration": 60,
                "category_id": "basic",
                "image": "dental_cleaning.jpg"
            },
            {
                "id": "dental_exam",
                "name": "Comprehensive Dental Exam",
                "description": "Thorough examination of your oral health",
                "details": "A comprehensive examination of your teeth, gums, and oral tissues. Includes digital X-rays, oral cancer screening, and personalized treatment recommendations.",
                "price": 120,
                "duration": 45,
                "category_id": "basic",
                "image": "dental_exam.jpg"
            },
            {
                "id": "teeth_whitening",
                "name": "Professional Teeth Whitening",
                "description": "In-clinic whitening for a brighter smile",
                "details": "Our professional teeth whitening treatment uses medical-grade bleaching agents to remove deep stains and discoloration. Results are immediate and can lighten teeth by up to 8 shades.",
                "price": 350,
                "duration": 90,
                "category_id": "cosmetic",
                "image": "teeth_whitening.jpg"
            },
            {
                "id": "porcelain_veneers",
                "name": "Porcelain Veneers",
                "description": "Custom shells to improve appearance of front teeth",
                "details": "Thin, custom-made shells that cover the front surface of teeth to improve their appearance. Made from high-quality porcelain that mimics the light-reflecting properties of natural teeth.",
                "price": 800,
                "duration": 120,
                "category_id": "cosmetic",
                "image": "porcelain_veneers.jpg"
            },
            {
                "id": "dental_bonding",
                "name": "Dental Bonding",
                "description": "Repair chipped or cracked teeth",
                "details": "A procedure where tooth-colored resin material is applied and hardened with a special light to repair damaged teeth. Ideal for chipped, cracked, or discolored teeth.",
                "price": 250,
                "duration": 60,
                "category_id": "cosmetic",
                "image": "dental_bonding.jpg"
            },
            {
                "id": "dental_fillings",
                "name": "Dental Fillings",
                "description": "Restore teeth damaged by decay",
                "details": "Tooth-colored composite resin fillings to restore teeth damaged by decay. Our fillings are mercury-free and match the natural color of your teeth.",
                "price": 150,
                "duration": 60,
                "category_id": "restorative",
                "image": "dental_fillings.jpg"
            },
            {
                "id": "dental_crowns",
                "name": "Dental Crowns",
                "description": "Covers and protects damaged teeth",
                "details": "Custom-made caps that cover the entire tooth surface to restore strength, shape, and appearance. Our crowns are made from high-quality ceramic or porcelain fused to metal.",
                "price": 850,
                "duration": 90,
                "category_id": "restorative",
                "image": "dental_crowns.jpg"
            },
            {
                "id": "root_canal",
                "name": "Root Canal Therapy",
                "description": "Treat infected tooth pulp",
                "details": "A procedure to remove infected pulp from inside the tooth, clean, disinfect, and seal it. Modern techniques make this procedure virtually painless.",
                "price": 700,
                "duration": 120,
                "category_id": "restorative",
                "image": "root_canal.jpg"
            },
            {
                "id": "dental_bridge",
                "name": "Dental Bridge",
                "description": "Replace missing teeth with fixed appliance",
                "details": "A fixed dental prosthesis used to replace one or more missing teeth by joining an artificial tooth to adjacent teeth or dental implants. Made from porcelain fused to metal or ceramics.",
                "price": 950,
                "duration": 120,
                "category_id": "restorative",
                "image": "dental_bridge.jpg"
            },
            {
                "id": "dental_implant_standard",
                "name": "Single Dental Implant",
                "description": "Titanium post and crown to replace missing tooth",
                "details": "A titanium post surgically placed into the jawbone to act as a tooth root, plus a custom-made crown. Provides a permanent, natural-looking replacement for a missing tooth.",
                "price": 1500,
                "duration": 120,
                "category_id": "implants",
                "image": "dental_implant.jpg"
            },
            {
                "id": "all_on_4_implants",
                "name": "All-on-4 Dental Implants",
                "description": "Full arch replacement with four implants",
                "details": "A revolutionary technique where a full arch of teeth is supported by only four implants. Provides a fixed, permanent solution for multiple missing teeth.",
                "price": 9500,
                "duration": 240,
                "category_id": "implants",
                "image": "all_on_4.jpg"
            },
            {
                "id": "implant_supported_dentures",
                "name": "Implant-Supported Dentures",
                "description": "Removable dentures anchored to implants",
                "details": "Removable dentures that are anchored to dental implants for improved stability and comfort. Prevents bone loss and provides better chewing efficiency than traditional dentures.",
                "price": 4500,
                "duration": 180,
                "category_id": "implants",
                "image": "implant_dentures.jpg"
            },
            {
                "id": "metal_braces",
                "name": "Traditional Metal Braces",
                "description": "Standard braces for teeth alignment",
                "details": "Traditional metal braces consisting of brackets, wires, and bands to gradually align teeth. Effective for treating various orthodontic issues.",
                "price": 3500,
                "duration": 120,
                "category_id": "orthodontics",
                "image": "metal_braces.jpg"
            },
            {
                "id": "ceramic_braces",
                "name": "Ceramic Braces",
                "description": "Less visible braces made of clear material",
                "details": "Similar to traditional braces but with clear or tooth-colored brackets that blend with your teeth. A more discreet option for teeth alignment.",
                "price": 4000,
                "duration": 120,
                "category_id": "orthodontics",
                "image": "ceramic_braces.jpg"
            },
            {
                "id": "clear_aligners",
                "name": "Clear Aligners",
                "description": "Transparent removable aligners",
                "details": "Custom-made, clear plastic aligners that gradually shift teeth into position. Removable for eating and cleaning, and virtually invisible when worn.",
                "price": 4500,
                "duration": 90,
                "category_id": "orthodontics",
                "image": "clear_aligners.jpg"
            },
            {
                "id": "full_mouth_reconstruction",
                "name": "Full Mouth Reconstruction",
                "description": "Comprehensive restoration of all teeth",
                "details": "A comprehensive treatment plan that addresses multiple dental issues to restore function, health, and aesthetics to your entire mouth. May include implants, crowns, bridges, and more.",
                "price": 15000,
                "duration": 360,
                "category_id": "restorative",
                "image": "full_mouth.jpg"
            },
            {
                "id": "hollywood_smile",
                "name": "Hollywood Smile Makeover",
                "description": "Complete smile transformation",
                "details": "A complete smile makeover using a combination of cosmetic procedures such as veneers, whitening, and contouring to create a perfect 'Hollywood' smile.",
                "price": 5500,
                "duration": 240,
                "category_id": "cosmetic",
                "image": "hollywood_smile.jpg"
            }
        ]
        
        # Save sample data to file
        self._save_treatments()
    
    def _save_treatments(self):
        """
        Save treatments data to JSON file
        """
        try:
            # Ensure data directory exists
            data_dir = os.path.join(os.path.dirname(__file__), '../data')
            os.makedirs(data_dir, exist_ok=True)
            
            # Save to data file
            data_file = os.path.join(data_dir, 'treatments.json')
            
            with open(data_file, 'w') as file:
                json.dump({
                    'treatments': self.treatments,
                    'categories': self.categories
                }, file, indent=4)
            
            return True
        except Exception as e:
            print(f"Error saving treatments: {e}")
        
        return False
    
    def get_all_treatments(self):
        """
        Get all available treatments
        
        Returns:
            list: List of all treatments
        """
        return self.treatments
    
    def get_treatment_by_id(self, treatment_id):
        """
        Get a treatment by its ID
        
        Args:
            treatment_id (str): The ID of the treatment
            
        Returns:
            dict: The treatment data or None if not found
        """
        for treatment in self.treatments:
            if treatment.get('id') == treatment_id:
                return treatment
        
        return None
    
    def get_treatments_by_category(self, category_id):
        """
        Get all treatments in a specific category
        
        Args:
            category_id (str): The ID of the category
            
        Returns:
            list: List of treatments in the category
        """
        return [t for t in self.treatments if t.get('category_id') == category_id]
    
    def get_all_categories(self):
        """
        Get all available treatment categories
        
        Returns:
            dict: Dictionary of all categories
        """
        return self.categories
    
    def get_category_by_id(self, category_id):
        """
        Get a category by its ID
        
        Args:
            category_id (str): The ID of the category
            
        Returns:
            dict: The category data or None if not found
        """
        return self.categories.get(category_id)
    
    def get_treatments_by_price_range(self, min_price, max_price):
        """
        Get treatments within a specific price range
        
        Args:
            min_price (float): Minimum price
            max_price (float): Maximum price
            
        Returns:
            list: List of treatments within the price range
        """
        return [
            t for t in self.treatments 
            if t.get('price', 0) >= min_price and t.get('price', 0) <= max_price
        ]
    
    def get_treatments_by_ids(self, treatment_ids):
        """
        Get multiple treatments by their IDs
        
        Args:
            treatment_ids (list): List of treatment IDs
            
        Returns:
            list: List of matching treatments
        """
        return [
            t for t in self.treatments
            if t.get('id') in treatment_ids
        ]
    
    def search_treatments(self, query):
        """
        Search for treatments by name or description
        
        Args:
            query (str): Search query
            
        Returns:
            list: List of matching treatments
        """
        query = query.lower()
        return [
            t for t in self.treatments
            if query in t.get('name', '').lower() or query in t.get('description', '').lower()
        ]
    
    def get_treatments_categorized(self):
        """
        Get treatments organized by category
        
        Returns:
            dict: Dictionary with category IDs as keys and category data + treatments as values
        """
        result = {}
        
        for category_id, category in self.categories.items():
            category_treatments = self.get_treatments_by_category(category_id)
            
            result[category_id] = {
                **category,
                'treatments': category_treatments
            }
        
        return result