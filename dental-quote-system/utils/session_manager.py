import logging
from typing import Dict, List, Any, Optional
from flask import session
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Session Manager for handling quote data persistence
    All methods are static as they operate on the Flask session object
    """
    
    # Session keys
    QUOTE_KEY = 'quote_data'
    SELECTED_TREATMENTS_KEY = 'selected_treatments'
    PATIENT_INFO_KEY = 'patient_info'
    PROMO_CODE_KEY = 'promo_code'
    PROMO_DETAILS_KEY = 'promo_details'
    ORIGINAL_QUOTE_TOTAL_KEY = 'original_total'
    
    @staticmethod
    def initialize_session() -> None:
        """
        Initialize the session with default values if they don't exist
        """
        if SessionManager.QUOTE_KEY not in session:
            session[SessionManager.QUOTE_KEY] = {
                'id': str(uuid.uuid4()),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'subtotal': 0,
                'discount_amount': 0,
                'total': 0,
                'currency': 'USD'
            }
        
        if SessionManager.SELECTED_TREATMENTS_KEY not in session:
            session[SessionManager.SELECTED_TREATMENTS_KEY] = []
        
        if SessionManager.PATIENT_INFO_KEY not in session:
            session[SessionManager.PATIENT_INFO_KEY] = {}
        
        if SessionManager.PROMO_CODE_KEY not in session:
            session[SessionManager.PROMO_CODE_KEY] = None
        
        if SessionManager.PROMO_DETAILS_KEY not in session:
            session[SessionManager.PROMO_DETAILS_KEY] = None
        
        if SessionManager.ORIGINAL_QUOTE_TOTAL_KEY not in session:
            session[SessionManager.ORIGINAL_QUOTE_TOTAL_KEY] = 0
    
    @staticmethod
    def reset_session() -> None:
        """
        Reset the session data
        """
        if SessionManager.QUOTE_KEY in session:
            del session[SessionManager.QUOTE_KEY]
        
        if SessionManager.SELECTED_TREATMENTS_KEY in session:
            del session[SessionManager.SELECTED_TREATMENTS_KEY]
        
        if SessionManager.PATIENT_INFO_KEY in session:
            del session[SessionManager.PATIENT_INFO_KEY]
        
        if SessionManager.PROMO_CODE_KEY in session:
            del session[SessionManager.PROMO_CODE_KEY]
        
        if SessionManager.PROMO_DETAILS_KEY in session:
            del session[SessionManager.PROMO_DETAILS_KEY]
        
        if SessionManager.ORIGINAL_QUOTE_TOTAL_KEY in session:
            del session[SessionManager.ORIGINAL_QUOTE_TOTAL_KEY]
        
        SessionManager.initialize_session()
    
    @staticmethod
    def get_quote_data() -> Dict[str, Any]:
        """
        Get the current quote data
        """
        SessionManager.initialize_session()
        return session.get(SessionManager.QUOTE_KEY, {})
    
    @staticmethod
    def update_quote_data(data: Dict[str, Any]) -> None:
        """
        Update the quote data
        """
        SessionManager.initialize_session()
        
        # Update only the keys that are passed
        current_data = session.get(SessionManager.QUOTE_KEY, {})
        for key, value in data.items():
            current_data[key] = value
        
        # Update the timestamp
        current_data['updated_at'] = datetime.utcnow().isoformat()
        
        session[SessionManager.QUOTE_KEY] = current_data
    
    @staticmethod
    def get_selected_treatments() -> List[Dict[str, Any]]:
        """
        Get the list of selected treatments
        """
        SessionManager.initialize_session()
        return session.get(SessionManager.SELECTED_TREATMENTS_KEY, [])
    
    @staticmethod
    def add_treatment(treatment: Dict[str, Any]) -> None:
        """
        Add a treatment to the selected treatments list
        If the treatment already exists, increment the quantity
        """
        SessionManager.initialize_session()
        
        treatments = session.get(SessionManager.SELECTED_TREATMENTS_KEY, [])
        
        # Check if the treatment already exists
        existing_treatment = next((t for t in treatments if t.get('id') == treatment.get('id')), None)
        
        if existing_treatment:
            # Increment the quantity
            existing_treatment['quantity'] = existing_treatment.get('quantity', 1) + 1
        else:
            # Add quantity to the treatment if not specified
            if 'quantity' not in treatment:
                treatment['quantity'] = 1
            
            # Add the treatment
            treatments.append(treatment)
        
        session[SessionManager.SELECTED_TREATMENTS_KEY] = treatments
        
        # Update the quote totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def remove_treatment(treatment_id: str) -> None:
        """
        Remove a treatment from the selected treatments list
        """
        SessionManager.initialize_session()
        
        treatments = session.get(SessionManager.SELECTED_TREATMENTS_KEY, [])
        
        # Remove the treatment
        treatments = [t for t in treatments if t.get('id') != treatment_id]
        
        session[SessionManager.SELECTED_TREATMENTS_KEY] = treatments
        
        # Update the quote totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def update_treatment_quantity(treatment_id: str, quantity: int) -> None:
        """
        Update the quantity of a selected treatment
        """
        SessionManager.initialize_session()
        
        treatments = session.get(SessionManager.SELECTED_TREATMENTS_KEY, [])
        
        # Find the treatment
        treatment = next((t for t in treatments if t.get('id') == treatment_id), None)
        
        if treatment:
            # Update the quantity
            treatment['quantity'] = max(1, quantity)  # Ensure quantity is at least 1
        
        session[SessionManager.SELECTED_TREATMENTS_KEY] = treatments
        
        # Update the quote totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def get_patient_info() -> Dict[str, Any]:
        """
        Get the patient information
        """
        SessionManager.initialize_session()
        return session.get(SessionManager.PATIENT_INFO_KEY, {})
    
    @staticmethod
    def update_patient_info(info: Dict[str, Any]) -> None:
        """
        Update the patient information
        """
        SessionManager.initialize_session()
        
        # Update only the keys that are passed
        current_info = session.get(SessionManager.PATIENT_INFO_KEY, {})
        for key, value in info.items():
            current_info[key] = value
        
        session[SessionManager.PATIENT_INFO_KEY] = current_info
    
    @staticmethod
    def get_promo_code() -> Optional[str]:
        """
        Get the current promo code
        """
        SessionManager.initialize_session()
        return session.get(SessionManager.PROMO_CODE_KEY)
    
    @staticmethod
    def set_promo_code(code: str, details: Dict[str, Any]) -> None:
        """
        Set the promo code and its details
        """
        SessionManager.initialize_session()
        
        # Store original total if not set
        if not session.get(SessionManager.ORIGINAL_QUOTE_TOTAL_KEY):
            session[SessionManager.ORIGINAL_QUOTE_TOTAL_KEY] = session.get(SessionManager.QUOTE_KEY, {}).get('total', 0)
        
        session[SessionManager.PROMO_CODE_KEY] = code
        session[SessionManager.PROMO_DETAILS_KEY] = details
        
        # Update the quote totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def remove_promo_code() -> None:
        """
        Remove the promo code and its details
        """
        SessionManager.initialize_session()
        
        session[SessionManager.PROMO_CODE_KEY] = None
        session[SessionManager.PROMO_DETAILS_KEY] = None
        session[SessionManager.ORIGINAL_QUOTE_TOTAL_KEY] = 0
        
        # Update the quote totals
        SessionManager._recalculate_totals()
    
    @staticmethod
    def get_promo_details() -> Dict[str, Any]:
        """
        Get the details of the applied promo code
        """
        SessionManager.initialize_session()
        return session.get(SessionManager.PROMO_DETAILS_KEY, {})
    
    @staticmethod
    def _recalculate_totals() -> None:
        """
        Recalculate the quote totals based on selected treatments and promo code
        """
        treatments = session.get(SessionManager.SELECTED_TREATMENTS_KEY, [])
        
        # Calculate subtotal
        subtotal = sum(t.get('price', 0) * t.get('quantity', 1) for t in treatments)
        
        # Apply promo code if present
        promo_code = session.get(SessionManager.PROMO_CODE_KEY)
        promo_details = session.get(SessionManager.PROMO_DETAILS_KEY, {})
        discount_amount = 0
        
        if promo_code and promo_details:
            discount_type = promo_details.get('discount_type')
            discount_value = promo_details.get('discount_value', 0)
            
            if discount_type == 'percentage':
                discount_amount = (subtotal * discount_value) / 100
            elif discount_type == 'fixed_amount':
                discount_amount = min(discount_value, subtotal)  # Don't exceed subtotal
        
        # Calculate total
        total = max(0, subtotal - discount_amount)
        
        # Update quote data
        quote_data = session.get(SessionManager.QUOTE_KEY, {})
        quote_data.update({
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total,
            'updated_at': datetime.utcnow().isoformat()
        })
        
        session[SessionManager.QUOTE_KEY] = quote_data