"""
Session Manager for Dental Quote System
Handles session data for quotes, treatments, and promo codes
"""

from flask import session
import copy
import json

class SessionManager:
    """
    Manages session data for the quote builder
    All quote data is stored in Flask session for simplicity
    In production, this would use a database for persistence
    """
    
    def __init__(self, promo_service=None):
        """Initialize the session manager"""
        self.promo_service = promo_service
        self._initialize_session()
    
    def _initialize_session(self):
        """Initialize session if necessary"""
        if 'quote' not in session:
            session['quote'] = {
                'treatments': [],
                'patient_info': {},
                'promo_code': None,
                'quote_id': None
            }
    
    def clear_quote(self):
        """Clear the current quote data"""
        session['quote'] = {
            'treatments': [],
            'patient_info': {},
            'promo_code': None,
            'quote_id': None
        }
    
    # Treatment Management
    
    def get_selected_treatments(self):
        """Get list of treatments in the quote"""
        return session['quote'].get('treatments', [])
    
    def add_treatment_to_quote(self, treatment_data):
        """Add a treatment to the quote"""
        # Copy the treatment data to avoid modifying the original
        treatment = copy.deepcopy(treatment_data)
        
        # Check if treatment already exists in quote
        existing_treatments = session['quote'].get('treatments', [])
        
        for existing in existing_treatments:
            if existing['id'] == treatment['id']:
                # Update quantity instead of adding a new entry
                existing['quantity'] = existing.get('quantity', 1) + 1
                session.modified = True
                return existing
        
        # If not found, add as a new treatment with quantity 1
        treatment['quantity'] = 1
        
        if 'treatments' not in session['quote']:
            session['quote']['treatments'] = []
        
        session['quote']['treatments'].append(treatment)
        session.modified = True
        
        return treatment
    
    def remove_treatment_from_quote(self, treatment_id):
        """Remove a treatment from the quote"""
        if 'treatments' not in session['quote']:
            return False
        
        initial_length = len(session['quote']['treatments'])
        session['quote']['treatments'] = [
            t for t in session['quote']['treatments'] 
            if t['id'] != treatment_id
        ]
        
        session.modified = True
        return len(session['quote']['treatments']) < initial_length
    
    def update_treatment_quantity(self, treatment_id, quantity):
        """Update the quantity of a treatment in the quote"""
        if 'treatments' not in session['quote']:
            return False
        
        if quantity < 1:
            # If quantity is less than 1, remove the treatment
            return self.remove_treatment_from_quote(treatment_id)
        
        for treatment in session['quote']['treatments']:
            if treatment['id'] == treatment_id:
                treatment['quantity'] = quantity
                session.modified = True
                return True
        
        return False
    
    # Promo Code Management
    
    def get_promo_code(self):
        """Get the currently applied promo code"""
        return session['quote'].get('promo_code')
    
    def apply_promo_code(self, code):
        """Apply a promo code to the quote"""
        if not self.promo_service:
            return None, "Promo service not available"
        
        # Validate the promo code
        promo = self.promo_service.validate_promo_code(code)
        if not promo:
            return None, "Invalid promo code"
        
        # Check eligibility based on treatments in quote
        treatments = self.get_selected_treatments()
        if not self.promo_service.check_promo_eligibility(promo, treatments):
            return None, "This promo code is not applicable to your selected treatments"
        
        # Store the promo code
        session['quote']['promo_code'] = code
        session.modified = True
        
        return promo, None
    
    def remove_promo_code(self):
        """Remove the applied promo code"""
        if 'promo_code' in session['quote']:
            session['quote']['promo_code'] = None
            session.modified = True
            return True
        return False
    
    def get_promo_details(self):
        """Get details of the applied promo code"""
        code = self.get_promo_code()
        if not code or not self.promo_service:
            return None
        
        return self.promo_service.validate_promo_code(code)
    
    # Patient Information Management
    
    def save_patient_info(self, patient_data):
        """Save patient information to the quote"""
        session['quote']['patient_info'] = patient_data
        session.modified = True
    
    def get_patient_info(self):
        """Get the patient information from the quote"""
        return session['quote'].get('patient_info', {})
    
    # Quote Management
    
    def set_quote_id(self, quote_id):
        """Set the quote ID after submission"""
        session['quote']['quote_id'] = quote_id
        session.modified = True
    
    def get_quote_id(self):
        """Get the quote ID"""
        return session['quote'].get('quote_id')
    
    def calculate_quote_totals(self):
        """Calculate quote totals with any applied discounts"""
        treatments = self.get_selected_treatments()
        subtotal = sum(t.get('price', 0) * t.get('quantity', 1) for t in treatments)
        
        # Initialize totals
        totals = {
            'subtotal': subtotal,
            'discount_amount': 0,
            'total': subtotal
        }
        
        # Apply discount if promo code exists
        promo_details = self.get_promo_details()
        if promo_details:
            if promo_details['discount_type'] == 'percentage':
                # Percentage discount
                discount_rate = promo_details['discount_value'] / 100.0
                totals['discount_amount'] = round(subtotal * discount_rate, 2)
            else:
                # Fixed amount discount
                totals['discount_amount'] = min(promo_details['discount_value'], subtotal)
            
            # Calculate final total
            totals['total'] = subtotal - totals['discount_amount']
        
        return totals
    
    def get_full_quote(self):
        """Get the complete quote data for submission"""
        quote_data = copy.deepcopy(session['quote'])
        quote_data['totals'] = self.calculate_quote_totals()
        
        # Add promo details if a promo code is applied
        if quote_data['promo_code']:
            quote_data['promo_details'] = self.get_promo_details()
        
        return quote_data