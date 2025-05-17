"""
Session Manager for Dental Quote System
Handles session management for quote data
"""
from flask import session

class SessionManager:
    """
    Manages session data for the dental quote system.
    Provides methods to store and retrieve user selected treatments,
    promo codes, and other quote-related information.
    """
    
    def __init__(self):
        """Initialize the session manager"""
        self.session_key_treatments = 'selected_treatments'
        self.session_key_promo = 'promo_code'
        self.session_key_promo_details = 'promo_details'
        self.session_key_patient_info = 'patient_info'
    
    def initialize_session(self):
        """Initialize session with empty data if not exists"""
        if self.session_key_treatments not in session:
            session[self.session_key_treatments] = []
        
        if self.session_key_promo not in session:
            session[self.session_key_promo] = None
            
        if self.session_key_promo_details not in session:
            session[self.session_key_promo_details] = None
            
        if self.session_key_patient_info not in session:
            session[self.session_key_patient_info] = {}
            
        session.modified = True
    
    def add_treatment(self, treatment_data):
        """
        Add a treatment to the session
        
        Args:
            treatment_data (dict): Treatment data with at least id, name, price
            
        Returns:
            bool: Success status
        """
        self.initialize_session()
        
        # Convert to list if it's None
        if session[self.session_key_treatments] is None:
            session[self.session_key_treatments] = []
        
        # Check if treatment already exists
        for treatment in session[self.session_key_treatments]:
            if treatment['id'] == treatment_data['id']:
                # Update quantity if it exists
                if 'quantity' in treatment:
                    treatment['quantity'] += 1
                else:
                    treatment['quantity'] = 2
                session.modified = True
                return True
        
        # Add new treatment with quantity 1
        treatment_data['quantity'] = 1
        session[self.session_key_treatments].append(treatment_data)
        session.modified = True
        return True
    
    def remove_treatment(self, treatment_id):
        """
        Remove a treatment from the session
        
        Args:
            treatment_id (str): ID of the treatment to remove
            
        Returns:
            bool: Success status
        """
        self.initialize_session()
        
        # Filter out the treatment to remove
        session[self.session_key_treatments] = [
            t for t in session[self.session_key_treatments] 
            if t['id'] != treatment_id
        ]
        
        session.modified = True
        return True
    
    def update_treatment_quantity(self, treatment_id, quantity):
        """
        Update the quantity of a treatment
        
        Args:
            treatment_id (str): ID of the treatment
            quantity (int): New quantity
            
        Returns:
            bool: Success status
        """
        self.initialize_session()
        
        # Find the treatment and update its quantity
        for treatment in session[self.session_key_treatments]:
            if treatment['id'] == treatment_id:
                treatment['quantity'] = max(1, quantity)  # Ensure minimum quantity is 1
                session.modified = True
                return True
                
        return False  # Treatment not found
    
    def apply_promo_code(self, promo_code, promo_details=None):
        """
        Apply a promo code to the session
        
        Args:
            promo_code (str): Promo code to apply
            promo_details (dict, optional): Additional promo details
            
        Returns:
            bool: Success status
        """
        self.initialize_session()
        
        session[self.session_key_promo] = promo_code
        
        if promo_details:
            session[self.session_key_promo_details] = promo_details
            
        session.modified = True
        return True
    
    def remove_promo_code(self):
        """
        Remove the applied promo code
        
        Returns:
            bool: Success status
        """
        self.initialize_session()
        
        session[self.session_key_promo] = None
        session[self.session_key_promo_details] = None
        
        session.modified = True
        return True
    
    def save_patient_info(self, patient_data):
        """
        Save patient information
        
        Args:
            patient_data (dict): Patient information
            
        Returns:
            bool: Success status
        """
        self.initialize_session()
        
        session[self.session_key_patient_info] = patient_data
        session.modified = True
        return True
    
    def get_patient_info(self):
        """
        Get patient information
        
        Returns:
            dict: Patient information
        """
        self.initialize_session()
        return session.get(self.session_key_patient_info, {})
    
    def get_selected_treatments(self):
        """
        Get selected treatments
        
        Returns:
            list: List of selected treatments
        """
        self.initialize_session()
        return session.get(self.session_key_treatments, [])
    
    def get_promo_code(self):
        """
        Get applied promo code
        
        Returns:
            str: Applied promo code or None
        """
        self.initialize_session()
        return session.get(self.session_key_promo)
    
    def get_promo_details(self):
        """
        Get promo code details
        
        Returns:
            dict: Promo details or None
        """
        self.initialize_session()
        return session.get(self.session_key_promo_details)
    
    def calculate_totals(self):
        """
        Calculate quote totals
        
        Returns:
            dict: Dictionary with subtotal, discount_amount, and total
        """
        self.initialize_session()
        
        # Calculate subtotal
        subtotal = 0
        for treatment in self.get_selected_treatments():
            price = float(treatment.get('price', 0))
            quantity = int(treatment.get('quantity', 1))
            subtotal += price * quantity
        
        # Calculate discount
        discount_amount = 0
        promo_details = self.get_promo_details()
        promo_code = self.get_promo_code()
        
        if promo_code and promo_details:
            discount_type = promo_details.get('discount_type')
            discount_value = float(promo_details.get('discount_value', 0))
            
            if discount_type == 'percentage':
                discount_amount = subtotal * (discount_value / 100)
            elif discount_type == 'fixed_amount':
                discount_amount = min(discount_value, subtotal)  # Don't discount more than subtotal
        
        # Calculate total
        total = max(0, subtotal - discount_amount)
        
        # Format to 2 decimal places
        subtotal = round(subtotal, 2)
        discount_amount = round(discount_amount, 2)
        total = round(total, 2)
        
        return {
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total
        }
    
    def get_quote_summary(self):
        """
        Get complete quote summary
        
        Returns:
            dict: Complete quote data
        """
        return {
            'treatments': self.get_selected_treatments(),
            'promo_code': self.get_promo_code(),
            'promo_details': self.get_promo_details(),
            'patient_info': self.get_patient_info(),
            'totals': self.calculate_totals()
        }
    
    def clear_session(self):
        """
        Clear all session data
        
        Returns:
            bool: Success status
        """
        session.clear()
        return True