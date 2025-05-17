import json
import os
import uuid
from datetime import datetime
from flask import current_app, url_for

class TreatmentService:
    """
    Service class to handle dental treatments
    """
    
    @classmethod
    def get_treatments_by_category(cls):
        """
        Get all treatments grouped by category
        
        Returns:
            dict: Treatments grouped by category
        """
        # Load treatments from sample data
        treatments = cls._load_treatments()
        categories = cls._load_categories()
        
        # Group treatments by category
        categorized = {}
        for category in categories:
            category_id = category['id']
            categorized[category_id] = {
                'category': category,
                'treatments': [t for t in treatments if t.get('category_id') == category_id]
            }
        
        return categorized
    
    @classmethod
    def get_popular_treatments(cls):
        """
        Get popular treatments for homepage
        
        Returns:
            list: List of popular treatments
        """
        treatments = cls._load_treatments()
        
        # Filter to only include treatments marked as popular
        popular = [t for t in treatments if t.get('is_popular', False)]
        
        # If no treatments are marked as popular, return the first few
        if not popular and treatments:
            popular = treatments[:6]
        
        return popular
    
    @classmethod
    def get_treatment(cls, treatment_id):
        """
        Get a specific treatment by ID
        
        Args:
            treatment_id (str): The treatment ID
            
        Returns:
            dict: The treatment or None if not found
        """
        treatments = cls._load_treatments()
        
        # Find treatment by ID
        for treatment in treatments:
            if treatment.get('id') == treatment_id:
                return treatment
        
        return None
    
    @classmethod
    def get_treatments_by_ids(cls, treatment_ids):
        """
        Get multiple treatments by their IDs
        
        Args:
            treatment_ids (list): List of treatment IDs
            
        Returns:
            list: List of treatments
        """
        if not treatment_ids:
            return []
        
        treatments = cls._load_treatments()
        
        # Filter treatments by IDs
        return [t for t in treatments if t.get('id') in treatment_ids]
    
    @classmethod
    def get_countries(cls):
        """
        Get available countries for patient info form
        
        Returns:
            list: List of countries with code and name
        """
        return [
            {'code': 'GB', 'name': 'United Kingdom'},
            {'code': 'US', 'name': 'United States'},
            {'code': 'CA', 'name': 'Canada'},
            {'code': 'AU', 'name': 'Australia'},
            {'code': 'DE', 'name': 'Germany'},
            {'code': 'FR', 'name': 'France'},
            {'code': 'IT', 'name': 'Italy'},
            {'code': 'ES', 'name': 'Spain'},
            {'code': 'NL', 'name': 'Netherlands'},
            {'code': 'IE', 'name': 'Ireland'},
            {'code': 'SE', 'name': 'Sweden'},
            {'code': 'NO', 'name': 'Norway'},
            {'code': 'DK', 'name': 'Denmark'},
            {'code': 'FI', 'name': 'Finland'},
            {'code': 'CH', 'name': 'Switzerland'},
            {'code': 'AT', 'name': 'Austria'},
            {'code': 'BE', 'name': 'Belgium'},
            {'code': 'PT', 'name': 'Portugal'},
            {'code': 'GR', 'name': 'Greece'},
            {'code': 'AE', 'name': 'United Arab Emirates'}
        ]
    
    @classmethod
    def save_quote(cls, patient_info, treatments, promo_code, promo_details, subtotal, discount_amount, total):
        """
        Save a quote to file storage
        
        Args:
            patient_info (dict): Patient information
            treatments (list): Selected treatments
            promo_code (str): Applied promo code if any
            promo_details (dict): Details about the applied promotion
            subtotal (float): Quote subtotal
            discount_amount (float): Discount amount
            total (float): Total after discount
            
        Returns:
            str: The generated quote ID
        """
        quote_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        quote_data = {
            'id': quote_id,
            'created_at': timestamp,
            'patient_info': patient_info,
            'treatments': treatments,
            'promo_code': promo_code,
            'promo_details': promo_details,
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total
        }
        
        # Save to file
        quotes_dir = os.path.join(current_app.root_path, 'data', 'quotes')
        os.makedirs(quotes_dir, exist_ok=True)
        
        quote_file = os.path.join(quotes_dir, f"{quote_id}.json")
        with open(quote_file, 'w') as f:
            json.dump(quote_data, f, indent=2)
        
        return quote_id
    
    @classmethod
    def get_quote(cls, quote_id):
        """
        Get a saved quote by ID
        
        Args:
            quote_id (str): The quote ID
            
        Returns:
            dict: The quote data or None if not found
        """
        quotes_dir = os.path.join(current_app.root_path, 'data', 'quotes')
        quote_file = os.path.join(quotes_dir, f"{quote_id}.json")
        
        if not os.path.exists(quote_file):
            return None
        
        with open(quote_file, 'r') as f:
            quote_data = json.load(f)
        
        return quote_data
    
    @classmethod
    def generate_pdf_quote(cls, quote_id):
        """
        Generate a PDF quote
        
        Args:
            quote_id (str): The quote ID
            
        Returns:
            str: URL to the generated PDF
        """
        # In a real application, this would generate a PDF file
        # For now, we'll just return a static URL
        return url_for('static', filename=f'pdf/quote_{quote_id}.pdf')
    
    @classmethod
    def _load_treatments(cls):
        """
        Load treatments from data file
        
        Returns:
            list: List of treatments
        """
        # Define a list of sample treatments for testing
        return [
            {
                'id': 'dental_implant_standard',
                'name': 'Standard Dental Implant',
                'description': 'Titanium implant with ceramic crown. The gold standard for replacing missing teeth.',
                'price': 750,
                'category_id': 'implants',
                'duration_minutes': 90,
                'is_popular': True,
                'image': 'treatments/dental_implant.jpg'
            },
            {
                'id': 'dental_implant_premium',
                'name': 'Premium Dental Implant',
                'description': 'Premium dental implant with higher-grade materials and extended warranty.',
                'price': 950,
                'category_id': 'implants',
                'duration_minutes': 90,
                'is_popular': False,
                'image': 'treatments/premium_implant.jpg'
            },
            {
                'id': 'all_on_4_implants',
                'name': 'All-on-4 Implants',
                'description': 'Full arch replacement with just 4 implants. Ideal for those missing multiple teeth.',
                'price': 4500,
                'category_id': 'implants',
                'duration_minutes': 180,
                'is_popular': True,
                'image': 'treatments/all_on_4.jpg'
            },
            {
                'id': 'porcelain_veneers',
                'name': 'Porcelain Veneers',
                'description': 'Thin porcelain shells that cover the front surface of teeth to improve appearance.',
                'price': 350,
                'category_id': 'cosmetic',
                'duration_minutes': 60,
                'is_popular': True,
                'image': 'treatments/veneers.jpg'
            },
            {
                'id': 'teeth_whitening',
                'name': 'Professional Teeth Whitening',
                'description': 'In-office teeth whitening procedure for a brighter smile.',
                'price': 250,
                'category_id': 'cosmetic',
                'duration_minutes': 60,
                'is_popular': True,
                'image': 'treatments/whitening.jpg'
            },
            {
                'id': 'hollywood_smile',
                'name': 'Hollywood Smile',
                'description': 'Complete smile makeover using veneers and other cosmetic procedures.',
                'price': 2800,
                'category_id': 'cosmetic',
                'duration_minutes': 180,
                'is_popular': True,
                'image': 'treatments/hollywood_smile.jpg'
            },
            {
                'id': 'dental_crowns',
                'name': 'Dental Crowns',
                'description': 'Ceramic crowns to restore damaged teeth with a natural look.',
                'price': 300,
                'category_id': 'restorative',
                'duration_minutes': 60,
                'is_popular': True,
                'image': 'treatments/crowns.jpg'
            },
            {
                'id': 'dental_bridges',
                'name': 'Dental Bridges',
                'description': 'Fixed bridges to replace missing teeth. Attached to natural teeth or implants.',
                'price': 550,
                'category_id': 'restorative',
                'duration_minutes': 90,
                'is_popular': False,
                'image': 'treatments/bridges.jpg'
            },
            {
                'id': 'root_canal',
                'name': 'Root Canal Treatment',
                'description': 'Procedure to treat infection in the tooth root and save the natural tooth.',
                'price': 350,
                'category_id': 'restorative',
                'duration_minutes': 90,
                'is_popular': False,
                'image': 'treatments/root_canal.jpg'
            },
            {
                'id': 'full_mouth_reconstruction',
                'name': 'Full Mouth Reconstruction',
                'description': 'Comprehensive treatment to rebuild or restore all teeth in the upper and lower jaws.',
                'price': 7500,
                'category_id': 'restorative',
                'duration_minutes': 360,
                'is_popular': False,
                'image': 'treatments/full_mouth.jpg'
            },
            {
                'id': 'invisalign',
                'name': 'Invisalign Treatment',
                'description': 'Clear aligners for teeth straightening with better aesthetics than traditional braces.',
                'price': 2000,
                'category_id': 'orthodontics',
                'duration_minutes': 30,
                'is_popular': True,
                'image': 'treatments/invisalign.jpg'
            },
            {
                'id': 'traditional_braces',
                'name': 'Traditional Braces',
                'description': 'Metal braces for effective teeth straightening and bite correction.',
                'price': 1500,
                'category_id': 'orthodontics',
                'duration_minutes': 60,
                'is_popular': False,
                'image': 'treatments/braces.jpg'
            }
        ]
    
    @classmethod
    def _load_categories(cls):
        """
        Load treatment categories
        
        Returns:
            list: List of treatment categories
        """
        return [
            {
                'id': 'implants',
                'name': 'Dental Implants',
                'description': 'Permanent tooth replacement solutions that look and function like natural teeth.',
                'icon': 'tooth'
            },
            {
                'id': 'cosmetic',
                'name': 'Cosmetic Dentistry',
                'description': 'Procedures focused on improving the appearance of your smile.',
                'icon': 'smile'
            },
            {
                'id': 'restorative',
                'name': 'Restorative Treatments',
                'description': 'Treatments to restore damaged or missing teeth to full function.',
                'icon': 'wrench'
            },
            {
                'id': 'orthodontics',
                'name': 'Orthodontic Treatments',
                'description': 'Procedures to straighten teeth and correct bite issues.',
                'icon': 'align-center'
            }
        ]