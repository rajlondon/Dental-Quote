import logging
import uuid
from typing import Dict, List, Any, Optional
from flask import session
from services.promo_service import PromoService

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Utility class for managing session data in the dental quote system
    All methods are static to allow easy access from any part of the application
    """
    
    @staticmethod
    def initialize_session() -> None:
        """
        Initialize session with default values if not already initialized
        """
        if 'quote_initialized' not in session:
            session['quote_id'] = str(uuid.uuid4())
            session['selected_treatments'] = []
            session['promo_code'] = None
            session['promo_details'] = None
            session['special_offer_id'] = None
            session['patient_info'] = {}
            session['subtotal'] = 0
            session['discount_amount'] = 0
            session['total'] = 0
            session['quote_initialized'] = True
    
    @staticmethod
    def reset_session() -> None:
        """
        Reset the session to start a new quote
        """
        session['quote_id'] = str(uuid.uuid4())
        session['selected_treatments'] = []
        session['promo_code'] = None
        session['promo_details'] = None
        session['special_offer_id'] = None
        session['patient_info'] = {}
        session['subtotal'] = 0
        session['discount_amount'] = 0
        session['total'] = 0
        session['quote_initialized'] = True
    
    @staticmethod
    def get_quote_id() -> str:
        """
        Get the current quote ID from session
        """
        SessionManager.initialize_session()
        return session.get('quote_id', '')
    
    @staticmethod
    def get_selected_treatments() -> List[Dict[str, Any]]:
        """
        Get the selected treatments from session
        """
        SessionManager.initialize_session()
        return session.get('selected_treatments', [])
    
    @staticmethod
    def add_treatment(treatment: Dict[str, Any]) -> None:
        """
        Add a treatment to the session
        If the treatment already exists, increment its quantity
        """
        SessionManager.initialize_session()
        
        # Get current treatments
        selected_treatments = session.get('selected_treatments', [])
        
        # Check if the treatment already exists
        existing_treatment = next((t for t in selected_treatments if t.get('id') == treatment.get('id')), None)
        
        if existing_treatment:
            # Increment quantity if already exists
            existing_treatment['quantity'] = existing_treatment.get('quantity', 1) + 1
        else:
            # Add treatment with quantity 1
            treatment_with_quantity = treatment.copy()
            treatment_with_quantity['quantity'] = 1
            selected_treatments.append(treatment_with_quantity)
        
        # Update session
        session['selected_treatments'] = selected_treatments
        
        # Recalculate totals
        SessionManager.calculate_totals()
    
    @staticmethod
    def remove_treatment(treatment_id: str) -> None:
        """
        Remove a treatment from the session
        """
        SessionManager.initialize_session()
        
        # Get current treatments
        selected_treatments = session.get('selected_treatments', [])
        
        # Remove the treatment
        session['selected_treatments'] = [t for t in selected_treatments if t.get('id') != treatment_id]
        
        # Recalculate totals
        SessionManager.calculate_totals()
    
    @staticmethod
    def update_treatment_quantity(treatment_id: str, quantity: int) -> None:
        """
        Update the quantity of a treatment
        If quantity is 0 or less, remove the treatment
        """
        SessionManager.initialize_session()
        
        if quantity <= 0:
            SessionManager.remove_treatment(treatment_id)
            return
        
        # Get current treatments
        selected_treatments = session.get('selected_treatments', [])
        
        # Update quantity
        for treatment in selected_treatments:
            if treatment.get('id') == treatment_id:
                treatment['quantity'] = quantity
                break
        
        # Update session
        session['selected_treatments'] = selected_treatments
        
        # Recalculate totals
        SessionManager.calculate_totals()
    
    @staticmethod
    def calculate_totals() -> None:
        """
        Calculate subtotal, discount and total
        """
        SessionManager.initialize_session()
        
        # Get selected treatments
        selected_treatments = session.get('selected_treatments', [])
        
        # Calculate subtotal
        subtotal = sum(
            t.get('price', 0) * t.get('quantity', 1) 
            for t in selected_treatments
        )
        
        # Store subtotal in session
        session['subtotal'] = subtotal
        
        # Calculate discount if promo code is applied
        discount_amount = 0
        if session.get('promo_code') and session.get('promo_details'):
            promo_details = session.get('promo_details', {})
            
            # Calculate discount based on discount type
            if promo_details.get('discount_type') == 'percentage':
                discount_amount = (subtotal * promo_details.get('discount_value', 0)) / 100
            elif promo_details.get('discount_type') == 'fixed_amount':
                discount_amount = promo_details.get('discount_value', 0)
            
            # Apply maximum discount limit if specified
            if promo_details.get('max_discount_amount') and discount_amount > promo_details.get('max_discount_amount'):
                discount_amount = promo_details.get('max_discount_amount')
            
            # Ensure discount doesn't exceed the subtotal
            if discount_amount > subtotal:
                discount_amount = subtotal
        
        # Store discount amount in session
        session['discount_amount'] = discount_amount
        
        # Calculate total
        total = subtotal - discount_amount
        
        # Store total in session
        session['total'] = total
    
    @staticmethod
    def get_quote_data() -> Dict[str, Any]:
        """
        Get all quote data from session
        """
        SessionManager.initialize_session()
        
        # Ensure totals are up to date
        SessionManager.calculate_totals()
        
        return {
            'id': session.get('quote_id', ''),
            'subtotal': session.get('subtotal', 0),
            'discount_amount': session.get('discount_amount', 0),
            'total': session.get('total', 0),
            'promo_code': session.get('promo_code'),
            'special_offer_id': session.get('special_offer_id')
        }
    
    @staticmethod
    def get_promo_code() -> Optional[str]:
        """
        Get the applied promo code from session
        """
        SessionManager.initialize_session()
        return session.get('promo_code')
    
    @staticmethod
    def get_promo_details() -> Optional[Dict[str, Any]]:
        """
        Get the details of the applied promo code from session
        """
        SessionManager.initialize_session()
        return session.get('promo_details')
    
    @staticmethod
    def set_promo_code(code: str, details: Dict[str, Any]) -> None:
        """
        Set promo code and its details in session
        """
        SessionManager.initialize_session()
        
        session['promo_code'] = code
        session['promo_details'] = details
        
        # Recalculate totals
        SessionManager.calculate_totals()
    
    @staticmethod
    def remove_promo_code() -> None:
        """
        Remove promo code from session
        """
        SessionManager.initialize_session()
        
        session['promo_code'] = None
        session['promo_details'] = None
        
        # Recalculate totals
        SessionManager.calculate_totals()
    
    @staticmethod
    def set_special_offer_id(offer_id: str) -> None:
        """
        Set the special offer ID in session
        """
        SessionManager.initialize_session()
        session['special_offer_id'] = offer_id
    
    @staticmethod
    def get_special_offer_id() -> Optional[str]:
        """
        Get the special offer ID from session
        """
        SessionManager.initialize_session()
        return session.get('special_offer_id')
    
    @staticmethod
    def get_patient_info() -> Dict[str, Any]:
        """
        Get patient information from session
        """
        SessionManager.initialize_session()
        return session.get('patient_info', {})
    
    @staticmethod
    def update_patient_info(patient_info: Dict[str, Any]) -> None:
        """
        Update patient information in session
        """
        SessionManager.initialize_session()
        session['patient_info'] = patient_info