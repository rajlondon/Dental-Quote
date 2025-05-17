"""
SessionManager for dental quote system

This module provides functionality for managing session data related to the dental quote system.
"""


class SessionManager:
    """
    Handles session data operations for the dental quote system.
    Provides methods for calculating totals, applying promo codes, and managing session state.
    """
    
    @staticmethod
    def get_subtotal(selected_treatments):
        """
        Calculate the subtotal price of all selected treatments
        
        Args:
            selected_treatments: List of treatments in the quote
            
        Returns:
            float: The subtotal price
        """
        subtotal = 0
        for treatment in selected_treatments:
            # Default to 1 if quantity is not specified
            quantity = treatment.get('quantity', 1)
            # Use USD price by default
            price = treatment.get('price_usd', 0)
            subtotal += price * quantity
        
        return round(subtotal, 2)
    
    @staticmethod
    def get_discount_amount(subtotal, promo_details):
        """
        Calculate the discount amount based on promo code details
        
        Args:
            subtotal: The subtotal price before discount
            promo_details: Dictionary containing promo code details
            
        Returns:
            float: The discount amount
        """
        if not promo_details:
            return 0
        
        discount_type = promo_details.get('discount_type')
        discount_value = promo_details.get('discount_value', 0)
        
        if discount_type == 'percentage':
            discount = subtotal * (discount_value / 100)
        elif discount_type == 'fixed_amount':
            discount = min(discount_value, subtotal)  # Don't exceed subtotal
        else:
            discount = 0
        
        return round(discount, 2)
    
    @staticmethod
    def get_total(subtotal, discount):
        """
        Calculate the total price after discount
        
        Args:
            subtotal: The subtotal price before discount
            discount: The discount amount
            
        Returns:
            float: The total price
        """
        total = subtotal - discount
        return round(max(0, total), 2)  # Ensure total is not negative
    
    @staticmethod
    def clear_promo_code(session):
        """
        Remove promo code and details from the session
        
        Args:
            session: The Flask session object
        """
        if 'quote' in session:
            session['quote']['promo_code'] = None
            session['quote']['promo_details'] = None
            session.modified = True
    
    @staticmethod
    def set_selected_offer(session, offer):
        """
        Set the selected special offer in the session
        
        Args:
            session: The Flask session object
            offer: Dictionary containing offer details
        """
        if 'quote' in session:
            session['quote']['selected_offer'] = offer
            session.modified = True
    
    @staticmethod
    def set_quote_id(session, quote_id):
        """
        Set the quote ID in the session after saving to database
        
        Args:
            session: The Flask session object
            quote_id: The unique identifier for the saved quote
        """
        if 'quote' in session:
            session['quote']['quote_id'] = quote_id
            session.modified = True
    
    @staticmethod
    def get_session_data(session):
        """
        Get all quote-related data from the session
        
        Args:
            session: The Flask session object
            
        Returns:
            dict: All quote data
        """
        if 'quote' in session:
            return session['quote']
        return None