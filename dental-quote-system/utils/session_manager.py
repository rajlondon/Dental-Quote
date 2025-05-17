from flask import session
import json
import uuid
from datetime import datetime

class SessionManager:
    """
    Utility class to manage session data for the quote builder
    """
    
    @staticmethod
    def initialize_session(reset=False):
        """
        Initialize the session with default values if needed
        
        Args:
            reset (bool): If True, reset all session data to defaults
        """
        if reset or 'quote_data' not in session:
            session['quote_data'] = {
                'selected_treatments': [],
                'promo_code': None,
                'promo_details': None,
                'patient_info': None,
                'quote_id': None,
                'created_at': datetime.now().isoformat()
            }
    
    @staticmethod
    def get_selected_treatments():
        """
        Get the list of selected treatments
        
        Returns:
            list: The selected treatments
        """
        return session.get('quote_data', {}).get('selected_treatments', [])
    
    @staticmethod
    def add_treatment(treatment):
        """
        Add a treatment to the quote
        
        Args:
            treatment (dict): The treatment to add
        """
        if 'quote_data' not in session:
            SessionManager.initialize_session()
        
        selected_treatments = SessionManager.get_selected_treatments()
        
        # Check if treatment is already in the list
        existing_treatment = next(
            (t for t in selected_treatments if t['id'] == treatment['id']), 
            None
        )
        
        if existing_treatment:
            # Increment quantity if already in the list
            existing_treatment['quantity'] += 1
        else:
            # Add new treatment with quantity 1
            treatment_data = {
                'id': treatment['id'],
                'name': treatment['name'],
                'description': treatment['description'],
                'price': treatment['price'],
                'category_id': treatment.get('category_id'),
                'quantity': 1
            }
            selected_treatments.append(treatment_data)
        
        session['quote_data']['selected_treatments'] = selected_treatments
        
        # Recalculate totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def remove_treatment(treatment_id):
        """
        Remove a treatment from the quote
        
        Args:
            treatment_id (str): The ID of the treatment to remove
        """
        if 'quote_data' not in session:
            return
        
        selected_treatments = SessionManager.get_selected_treatments()
        
        # Filter out the treatment to remove
        updated_treatments = [t for t in selected_treatments if t['id'] != treatment_id]
        
        session['quote_data']['selected_treatments'] = updated_treatments
        
        # Recalculate totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def update_treatment_quantity(treatment_id, quantity):
        """
        Update the quantity of a treatment
        
        Args:
            treatment_id (str): The ID of the treatment to update
            quantity (int): The new quantity
        """
        if 'quote_data' not in session:
            return
        
        selected_treatments = SessionManager.get_selected_treatments()
        
        # Find the treatment
        treatment = next(
            (t for t in selected_treatments if t['id'] == treatment_id),
            None
        )
        
        if treatment:
            # Update quantity
            treatment['quantity'] = max(1, int(quantity))
            
            # Update in session
            session['quote_data']['selected_treatments'] = selected_treatments
            
            # Recalculate totals
            SessionManager._recalculate_totals()
    
    @staticmethod
    def set_promo_code(code, details=None):
        """
        Set a promotional code and its details
        
        Args:
            code (str): The promotional code
            details (dict, optional): Details about the promotion
        """
        if 'quote_data' not in session:
            SessionManager.initialize_session()
        
        session['quote_data']['promo_code'] = code
        session['quote_data']['promo_details'] = details or {}
        
        # Recalculate totals with the new promo code
        SessionManager._recalculate_totals()
    
    @staticmethod
    def clear_promo_code():
        """Clear the applied promotional code"""
        if 'quote_data' not in session:
            return
        
        session['quote_data']['promo_code'] = None
        session['quote_data']['promo_details'] = None
        
        # Recalculate totals without promo code
        SessionManager._recalculate_totals()
    
    @staticmethod
    def get_promo_code():
        """
        Get the applied promotional code
        
        Returns:
            str: The promotional code or None
        """
        return session.get('quote_data', {}).get('promo_code')
    
    @staticmethod
    def get_promo_details():
        """
        Get details about the applied promotion
        
        Returns:
            dict: The promotion details or None
        """
        return session.get('quote_data', {}).get('promo_details')
    
    @staticmethod
    def set_patient_info(patient_data):
        """
        Set patient information
        
        Args:
            patient_data (dict): Patient information
        """
        if 'quote_data' not in session:
            SessionManager.initialize_session()
        
        session['quote_data']['patient_info'] = patient_data
    
    @staticmethod
    def get_patient_info():
        """
        Get the patient information
        
        Returns:
            dict: The patient information or None
        """
        return session.get('quote_data', {}).get('patient_info')
    
    @staticmethod
    def set_quote_id(quote_id):
        """
        Set the saved quote ID
        
        Args:
            quote_id (str): The quote ID
        """
        if 'quote_data' not in session:
            SessionManager.initialize_session()
        
        session['quote_data']['quote_id'] = quote_id
    
    @staticmethod
    def get_quote_id():
        """
        Get the saved quote ID
        
        Returns:
            str: The quote ID or None
        """
        return session.get('quote_data', {}).get('quote_id')
    
    @staticmethod
    def set_selected_offer(offer_id):
        """
        Set the selected special offer
        
        Args:
            offer_id (str): The offer ID
        """
        if 'quote_data' not in session:
            SessionManager.initialize_session()
        
        session['quote_data']['selected_offer'] = offer_id
    
    @staticmethod
    def get_selected_offer():
        """
        Get the selected special offer
        
        Returns:
            str: The offer ID or None
        """
        return session.get('quote_data', {}).get('selected_offer')
    
    @staticmethod
    def get_subtotal():
        """
        Calculate the subtotal for all selected treatments
        
        Returns:
            float: The subtotal
        """
        selected_treatments = SessionManager.get_selected_treatments()
        
        if not selected_treatments:
            return 0
        
        return sum(t['price'] * t['quantity'] for t in selected_treatments)
    
    @staticmethod
    def get_discount_amount():
        """
        Calculate the discount amount based on the applied promo code
        
        Returns:
            float: The discount amount
        """
        promo_details = SessionManager.get_promo_details()
        subtotal = SessionManager.get_subtotal()
        
        if not promo_details or subtotal == 0:
            return 0
        
        discount_type = promo_details.get('discount_type')
        discount_value = promo_details.get('discount_value', 0)
        
        if discount_type == 'percentage':
            # Percentage discount
            return (subtotal * discount_value / 100.0)
        elif discount_type == 'fixed_amount':
            # Fixed amount discount
            return min(discount_value, subtotal)  # Don't discount more than the subtotal
        
        return 0
    
    @staticmethod
    def get_total():
        """
        Calculate the total after discounts
        
        Returns:
            float: The total amount
        """
        subtotal = SessionManager.get_subtotal()
        discount = SessionManager.get_discount_amount()
        
        return subtotal - discount
    
    @staticmethod
    def _recalculate_totals():
        """
        Internal method to recalculate totals
        This is called automatically when treatments or promo codes change
        """
        # The totals are calculated on-demand, so no need to store them
        # This method exists for future use if we need to cache calculated values
        pass