"""
Session Manager for Dental Quote System
Handles session creation, treatment management, and promo code application
"""
from flask import session
import uuid
from datetime import datetime

class SessionManager:
    """
    Manages user session data for the quote builder system
    - Tracks selected treatments
    - Manages promotional codes
    - Stores patient information
    """
    
    @staticmethod
    def initialize_session(reset=False):
        """Initialize a new quote session or reset an existing one"""
        if 'quote_session' not in session or reset:
            session['quote_session'] = {
                'session_id': str(uuid.uuid4()),
                'created_at': datetime.now().isoformat(),
                'selected_treatments': [],
                'promo_code': None,
                'promo_details': None,
                'patient_info': None,
                'quote_id': None
            }
        return session['quote_session']
    
    @staticmethod
    def get_session():
        """Get the current quote session"""
        if 'quote_session' not in session:
            return SessionManager.initialize_session()
        return session['quote_session']
    
    @staticmethod
    def add_treatment(treatment):
        """Add a treatment to the session"""
        quote_session = SessionManager.get_session()
        selected_treatments = quote_session['selected_treatments']
        
        # Check if treatment already exists
        for existing in selected_treatments:
            if existing['id'] == treatment['id']:
                existing['quantity'] += 1
                session.modified = True
                return quote_session
        
        # Add new treatment with quantity 1
        treatment['quantity'] = 1
        selected_treatments.append(treatment)
        session.modified = True
        return quote_session
    
    @staticmethod
    def remove_treatment(treatment_id):
        """Remove a treatment from the session"""
        quote_session = SessionManager.get_session()
        quote_session['selected_treatments'] = [
            t for t in quote_session['selected_treatments'] 
            if t['id'] != treatment_id
        ]
        session.modified = True
        return quote_session
    
    @staticmethod
    def update_treatment_quantity(treatment_id, quantity):
        """Update the quantity of a treatment"""
        if quantity < 1:
            return SessionManager.remove_treatment(treatment_id)
        
        quote_session = SessionManager.get_session()
        for treatment in quote_session['selected_treatments']:
            if treatment['id'] == treatment_id:
                treatment['quantity'] = quantity
                session.modified = True
                break
        
        return quote_session
    
    @staticmethod
    def get_selected_treatments():
        """Get selected treatments from the session"""
        quote_session = SessionManager.get_session()
        return quote_session['selected_treatments']
    
    @staticmethod
    def set_promo_code(promo_code, promo_details):
        """Set promo code and details in the session"""
        quote_session = SessionManager.get_session()
        quote_session['promo_code'] = promo_code
        quote_session['promo_details'] = promo_details
        session.modified = True
        return quote_session
    
    @staticmethod
    def remove_promo_code():
        """Remove promo code from the session"""
        quote_session = SessionManager.get_session()
        quote_session['promo_code'] = None
        quote_session['promo_details'] = None
        session.modified = True
        return quote_session
    
    @staticmethod
    def get_promo_code():
        """Get promo code from the session"""
        quote_session = SessionManager.get_session()
        return quote_session.get('promo_code')
    
    @staticmethod
    def get_promo_details():
        """Get promo details from the session"""
        quote_session = SessionManager.get_session()
        return quote_session.get('promo_details')
    
    @staticmethod
    def set_patient_info(patient_info):
        """Set patient information in the session"""
        quote_session = SessionManager.get_session()
        quote_session['patient_info'] = patient_info
        session.modified = True
        return quote_session
    
    @staticmethod
    def get_patient_info():
        """Get patient information from the session"""
        quote_session = SessionManager.get_session()
        return quote_session.get('patient_info')
    
    @staticmethod
    def set_quote_id(quote_id):
        """Set quote ID in the session"""
        quote_session = SessionManager.get_session()
        quote_session['quote_id'] = quote_id
        session.modified = True
        return quote_session
    
    @staticmethod
    def get_quote_id():
        """Get quote ID from the session"""
        quote_session = SessionManager.get_session()
        return quote_session.get('quote_id')
    
    @staticmethod
    def get_quote_data():
        """Get complete quote data from the session"""
        quote_session = SessionManager.get_session()
        return {
            'session_id': quote_session.get('session_id'),
            'created_at': quote_session.get('created_at'),
            'selected_treatments': quote_session.get('selected_treatments', []),
            'promo_code': quote_session.get('promo_code'),
            'promo_details': quote_session.get('promo_details'),
            'patient_info': quote_session.get('patient_info'),
            'quote_id': quote_session.get('quote_id')
        }