"""
SessionManager for Dental Quote System
Handles session-based storage and retrieval of quote information
"""

from flask import session

class SessionManager:
    """
    Manages the user session for the quote building process
    Handles adding/removing treatments, applying promo codes, etc.
    """
    
    def __init__(self, app):
        self.app = app
        # Initialize session with default values if needed
        self._initialize_session()
    
    def _initialize_session(self):
        """Initialize necessary session variables if they don't exist"""
        if 'quote' not in session:
            session['quote'] = {
                'treatments': [],
                'promo_code': None,
                'promo_details': None,
                'patient_info': {},
                'quote_id': None
            }
            session.modified = True
    
    def get_selected_treatments(self):
        """Get all selected treatments from the session"""
        self._initialize_session()
        return session['quote']['treatments']
    
    def add_treatment_to_quote(self, treatment):
        """Add a treatment to the quote or increment quantity if already exists"""
        self._initialize_session()
        
        # Check if treatment already exists in quote
        treatment_exists = False
        for idx, t in enumerate(session['quote']['treatments']):
            if t['id'] == treatment['id']:
                # Increment quantity
                if 'quantity' in t:
                    session['quote']['treatments'][idx]['quantity'] += 1
                else:
                    session['quote']['treatments'][idx]['quantity'] = 2
                treatment_exists = True
                break
        
        # If treatment doesn't exist, add it
        if not treatment_exists:
            treatment_with_quantity = dict(treatment)
            treatment_with_quantity['quantity'] = 1
            session['quote']['treatments'].append(treatment_with_quantity)
        
        session.modified = True
        return True
    
    def remove_treatment_from_quote(self, treatment_id):
        """Remove a treatment from the quote"""
        self._initialize_session()
        
        # Find the treatment
        original_length = len(session['quote']['treatments'])
        session['quote']['treatments'] = [
            t for t in session['quote']['treatments'] if t['id'] != treatment_id
        ]
        
        # Check if a treatment was removed
        if len(session['quote']['treatments']) < original_length:
            session.modified = True
            return True
        
        return False
    
    def update_treatment_quantity(self, treatment_id, quantity):
        """Update the quantity of a treatment in the quote"""
        self._initialize_session()
        
        # Find the treatment and update quantity
        for idx, t in enumerate(session['quote']['treatments']):
            if t['id'] == treatment_id:
                session['quote']['treatments'][idx]['quantity'] = quantity
                session.modified = True
                return True
        
        return False
    
    def get_promo_code(self):
        """Get the currently applied promo code"""
        self._initialize_session()
        return session['quote'].get('promo_code')
    
    def get_promo_details(self):
        """Get details of the currently applied promo code"""
        self._initialize_session()
        return session['quote'].get('promo_details')
    
    def apply_promo_code(self, promo_code, promo_details):
        """Apply a promo code to the session"""
        self._initialize_session()
        
        session['quote']['promo_code'] = promo_code
        session['quote']['promo_details'] = promo_details
        session.modified = True
        
        return True
    
    def remove_promo_code(self):
        """Remove the applied promo code"""
        self._initialize_session()
        
        if session['quote'].get('promo_code'):
            session['quote']['promo_code'] = None
            session['quote']['promo_details'] = None
            session.modified = True
            return True
        
        return False
    
    def calculate_quote_totals(self):
        """Calculate the subtotal, discount, and total for the quote"""
        self._initialize_session()
        
        # Calculate subtotal
        subtotal = 0
        for treatment in session['quote']['treatments']:
            quantity = treatment.get('quantity', 1)
            subtotal += treatment['price'] * quantity
        
        # Apply discount if promo code is present
        discount = 0
        promo_details = session['quote'].get('promo_details')
        
        if promo_details:
            if promo_details['discount_type'] == 'percentage':
                discount = subtotal * (promo_details['discount_value'] / 100)
            else:  # fixed amount
                discount = min(subtotal, promo_details['discount_value'])
        
        # Calculate total
        total = subtotal - discount
        
        return {
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        }
    
    def save_patient_info(self, patient_info):
        """Save patient information to the session"""
        self._initialize_session()
        
        session['quote']['patient_info'] = patient_info
        session.modified = True
        
        return True
    
    def get_patient_info(self):
        """Get patient information from the session"""
        self._initialize_session()
        return session['quote'].get('patient_info', {})
    
    def get_full_quote(self):
        """Get the complete quote information"""
        self._initialize_session()
        
        quote_data = dict(session['quote'])
        quote_data['totals'] = self.calculate_quote_totals()
        
        return quote_data
    
    def clear_quote(self):
        """Clear the quote data from the session"""
        if 'quote' in session:
            session.pop('quote')
            session.modified = True
        
        self._initialize_session()
        return True
    
    def set_quote_id(self, quote_id):
        """Set the quote ID after saving to database"""
        self._initialize_session()
        
        session['quote']['quote_id'] = quote_id
        session.modified = True
        
        return True
    
    def get_quote_id(self):
        """Get the quote ID"""
        self._initialize_session()
        return session['quote'].get('quote_id')