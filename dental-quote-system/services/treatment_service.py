"""
TreatmentService for dental quote system

This module provides functionality for managing dental treatments
and quotes in the dental quote system.
"""

import os
import json
import uuid
from datetime import datetime


class TreatmentService:
    """
    Service for handling dental treatments and quotes.
    Provides methods for treatment retrieval, categorization,
    and quote management.
    """
    
    def __init__(self):
        """Initialize the TreatmentService with test data"""
        self.treatments = self._load_treatments()
        self.quotes = {}  # In-memory storage for quotes
        
    def _load_treatments(self):
        """
        Load dental treatments from data store
        
        Returns:
            list: List of treatment objects
        """
        # In a real app, this would load from database
        return [
            {
                'id': 'dental_implant_standard',
                'name': 'Dental Implant (Standard)',
                'category': 'implants',
                'description': 'Standard dental implant including implant, abutment, and crown',
                'price_usd': 995,
                'price_gbp': 780,
                'procedure_time': '2-3 hours',
                'recovery_time': '3-6 months',
                'image': '/static/img/treatments/implant.jpg',
                'popular': True
            },
            {
                'id': 'dental_implant_premium',
                'name': 'Dental Implant (Premium)',
                'category': 'implants',
                'description': 'Premium dental implant with lifetime warranty and advanced materials',
                'price_usd': 1495,
                'price_gbp': 1180,
                'procedure_time': '2-3 hours',
                'recovery_time': '3-6 months',
                'image': '/static/img/treatments/implant_premium.jpg',
                'popular': False
            },
            {
                'id': 'dental_crowns',
                'name': 'Dental Crown',
                'category': 'cosmetic',
                'description': 'Porcelain or ceramic crown for damaged or decayed teeth',
                'price_usd': 395,
                'price_gbp': 310,
                'procedure_time': '1-2 hours',
                'recovery_time': '1-2 days',
                'image': '/static/img/treatments/crown.jpg',
                'popular': True
            },
            {
                'id': 'porcelain_veneers',
                'name': 'Porcelain Veneer',
                'category': 'cosmetic',
                'description': 'Custom-made porcelain shells that cover the front of teeth',
                'price_usd': 450,
                'price_gbp': 350,
                'procedure_time': '1-2 hours',
                'recovery_time': '1-3 days',
                'image': '/static/img/treatments/veneer.jpg',
                'popular': True
            },
            {
                'id': 'composite_veneers',
                'name': 'Composite Veneer',
                'category': 'cosmetic',
                'description': 'More affordable veneer option made from composite resin',
                'price_usd': 250,
                'price_gbp': 195,
                'procedure_time': '1 hour',
                'recovery_time': '1 day',
                'image': '/static/img/treatments/veneer_composite.jpg',
                'popular': False
            },
            {
                'id': 'teeth_whitening',
                'name': 'Professional Teeth Whitening',
                'category': 'cosmetic',
                'description': 'Professional-grade whitening for a brighter smile',
                'price_usd': 250,
                'price_gbp': 195,
                'procedure_time': '1 hour',
                'recovery_time': 'None',
                'image': '/static/img/treatments/whitening.jpg',
                'popular': True
            },
            {
                'id': 'dental_bonding',
                'name': 'Dental Bonding',
                'category': 'cosmetic',
                'description': 'Repair of chipped, fractured or discolored teeth with resin',
                'price_usd': 175,
                'price_gbp': 140,
                'procedure_time': '30-60 minutes per tooth',
                'recovery_time': 'None',
                'image': '/static/img/treatments/bonding.jpg',
                'popular': False
            },
            {
                'id': 'root_canal',
                'name': 'Root Canal Therapy',
                'category': 'restorative',
                'description': 'Treatment for infected or decayed tooth pulp',
                'price_usd': 495,
                'price_gbp': 390,
                'procedure_time': '1-2 hours',
                'recovery_time': '1-2 days',
                'image': '/static/img/treatments/root_canal.jpg',
                'popular': False
            },
            {
                'id': 'dental_bridge',
                'name': 'Dental Bridge',
                'category': 'restorative',
                'description': 'Bridge to replace one or more missing teeth',
                'price_usd': 750,
                'price_gbp': 590,
                'procedure_time': '2 sessions, 1-2 hours each',
                'recovery_time': '1-2 weeks',
                'image': '/static/img/treatments/bridge.jpg',
                'popular': False
            },
            {
                'id': 'full_mouth_reconstruction',
                'name': 'Full Mouth Reconstruction',
                'category': 'restorative',
                'description': 'Comprehensive treatment to rebuild or replace all teeth',
                'price_usd': 12000,
                'price_gbp': 9400,
                'procedure_time': 'Multiple sessions',
                'recovery_time': '1-3 months',
                'image': '/static/img/treatments/reconstruction.jpg',
                'popular': False
            },
            {
                'id': 'hollywood_smile',
                'name': 'Hollywood Smile',
                'category': 'cosmetic',
                'description': 'Complete smile makeover including veneers for multiple teeth',
                'price_usd': 3800,
                'price_gbp': 2980,
                'procedure_time': 'Multiple sessions',
                'recovery_time': '1-2 weeks',
                'image': '/static/img/treatments/hollywood.jpg',
                'popular': True
            },
            {
                'id': 'all_on_4_implants',
                'name': 'All-on-4 Implants',
                'category': 'implants',
                'description': 'Full arch of fixed teeth supported by only 4 implants',
                'price_usd': 6500,
                'price_gbp': 5100,
                'procedure_time': '1 day procedure',
                'recovery_time': '3-6 months',
                'image': '/static/img/treatments/all_on_4.jpg',
                'popular': True
            }
        ]
    
    def get_treatment(self, treatment_id):
        """
        Get a treatment by its ID
        
        Args:
            treatment_id: The unique identifier for the treatment
            
        Returns:
            dict: The treatment object or None if not found
        """
        for treatment in self.treatments:
            if treatment.get('id') == treatment_id:
                return treatment
        return None
    
    def get_treatments_by_category(self, category_id=None):
        """
        Get treatments grouped by category or filtered by a specific category
        
        Args:
            category_id: Optional category ID to filter by
            
        Returns:
            dict: Dictionary of treatments grouped by category
        """
        if category_id:
            # Return treatments for a specific category
            return {
                category_id: [t for t in self.treatments if t.get('category') == category_id]
            }
        
        # Group all treatments by category
        categorized = {}
        for treatment in self.treatments:
            category = treatment.get('category', 'other')
            if category not in categorized:
                categorized[category] = []
            categorized[category].append(treatment)
        
        return categorized
    
    def get_popular_treatments(self, limit=6):
        """
        Get popular treatments for display on homepage
        
        Args:
            limit: Maximum number of treatments to return
            
        Returns:
            list: List of popular treatment objects
        """
        popular = [t for t in self.treatments if t.get('popular', False)]
        return popular[:limit]
    
    def get_countries(self):
        """
        Get list of countries for patient information form
        
        Returns:
            list: List of country objects
        """
        # In a real app, this would come from a database
        return [
            {'code': 'GB', 'name': 'United Kingdom'},
            {'code': 'US', 'name': 'United States'},
            {'code': 'DE', 'name': 'Germany'},
            {'code': 'FR', 'name': 'France'},
            {'code': 'NL', 'name': 'Netherlands'},
            {'code': 'BE', 'name': 'Belgium'},
            {'code': 'IE', 'name': 'Ireland'},
            {'code': 'ES', 'name': 'Spain'},
            {'code': 'IT', 'name': 'Italy'},
            {'code': 'PT', 'name': 'Portugal'},
            {'code': 'CH', 'name': 'Switzerland'},
            {'code': 'AT', 'name': 'Austria'},
            {'code': 'SE', 'name': 'Sweden'},
            {'code': 'NO', 'name': 'Norway'},
            {'code': 'DK', 'name': 'Denmark'},
            {'code': 'FI', 'name': 'Finland'},
            {'code': 'AU', 'name': 'Australia'},
            {'code': 'NZ', 'name': 'New Zealand'},
            {'code': 'CA', 'name': 'Canada'},
            {'code': 'JP', 'name': 'Japan'},
            {'code': 'SG', 'name': 'Singapore'},
            {'code': 'AE', 'name': 'United Arab Emirates'},
            {'code': 'SA', 'name': 'Saudi Arabia'},
            {'code': 'QA', 'name': 'Qatar'},
            {'code': 'KW', 'name': 'Kuwait'},
            {'code': 'BH', 'name': 'Bahrain'},
            {'code': 'OM', 'name': 'Oman'}
        ]
    
    def save_quote(self, quote_data):
        """
        Save a quote to the data store
        
        Args:
            quote_data: Dictionary containing quote data
            
        Returns:
            str: The unique identifier for the saved quote
        """
        # Generate a unique ID for the quote
        quote_id = str(uuid.uuid4())
        
        # Add timestamp and quote ID
        quote_data['id'] = quote_id
        quote_data['created_at'] = datetime.now().isoformat()
        
        # In a real app, this would save to a database
        # For now, we just store it in memory
        self.quotes[quote_id] = quote_data
        
        return quote_id
    
    def get_quote(self, quote_id):
        """
        Get a quote by its ID
        
        Args:
            quote_id: The unique identifier for the quote
            
        Returns:
            dict: The quote object or None if not found
        """
        return self.quotes.get(quote_id)
    
    def generate_pdf_quote(self, quote_id):
        """
        Generate a PDF document for a quote
        
        Args:
            quote_id: The unique identifier for the quote
            
        Returns:
            bytes: PDF document as bytes
        """
        # In a real app, this would generate a PDF
        # For now, we just return a simple message
        quote = self.get_quote(quote_id)
        if not quote:
            return None
        
        # This is a placeholder for PDF generation
        # In a real app, you would use a library like pdfkit or reportlab
        return f"PDF quote generated for {quote_id}".encode('utf-8')