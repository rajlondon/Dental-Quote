import uuid
import json
import logging
from datetime import datetime
from flask import session, g
from typing import Dict, List, Any, Optional, Union

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Manages user session data for the dental quote application.
    Handles storage and retrieval of treatments, promo codes, and patient information.
    """
    
    @staticmethod
    def initialize_session() -> None:
        """Initialize a new session with default values if it doesn't exist."""
        if 'quote_id' not in session:
            session['quote_id'] = str(uuid.uuid4())
            session['selected_treatments'] = []
            session['promo_code'] = None
            session['discount_amount'] = 0
            session['patient_info'] = {}
            session['special_offer_id'] = None
            session['quote_created_at'] = datetime.utcnow().isoformat()
            logger.info(f"New session initialized with quote_id: {session['quote_id']}")
    
    @staticmethod
    def get_selected_treatments() -> List[Dict[str, Any]]:
        """Get the list of treatments selected by the user."""
        SessionManager.initialize_session()
        return session.get('selected_treatments', [])
    
    @staticmethod
    def add_treatment(treatment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Add a treatment to the user's selection.
        If the treatment already exists, update its quantity.
        """
        SessionManager.initialize_session()
        treatments = SessionManager.get_selected_treatments()
        
        # Check if treatment already exists in selection
        for existing_treatment in treatments:
            if existing_treatment['id'] == treatment['id']:
                existing_treatment['quantity'] += 1
                session.modified = True
                return treatments
        
        # If not, add it with quantity 1
        treatment['quantity'] = 1
        treatments.append(treatment)
        session['selected_treatments'] = treatments
        
        # Log the action
        logger.info(f"Treatment added: {treatment['name']} (ID: {treatment['id']})")
        
        return treatments
    
    @staticmethod
    def remove_treatment(treatment_id: str) -> List[Dict[str, Any]]:
        """Remove a treatment from the user's selection."""
        SessionManager.initialize_session()
        treatments = SessionManager.get_selected_treatments()
        
        # Filter out the treatment to remove
        updated_treatments = [t for t in treatments if t['id'] != treatment_id]
        session['selected_treatments'] = updated_treatments
        
        # Log the action
        logger.info(f"Treatment removed: ID {treatment_id}")
        
        return updated_treatments
    
    @staticmethod
    def update_treatment_quantity(treatment_id: str, quantity: int) -> List[Dict[str, Any]]:
        """Update the quantity of a treatment in the user's selection."""
        SessionManager.initialize_session()
        treatments = SessionManager.get_selected_treatments()
        
        # Ensure quantity is at least 1
        quantity = max(1, quantity)
        
        # Find and update the treatment
        for treatment in treatments:
            if treatment['id'] == treatment_id:
                treatment['quantity'] = quantity
                session.modified = True
                break
        
        # Log the action
        logger.info(f"Treatment quantity updated: ID {treatment_id}, Quantity: {quantity}")
        
        return treatments
    
    @staticmethod
    def get_promo_code() -> Optional[str]:
        """Get the currently applied promo code."""
        SessionManager.initialize_session()
        return session.get('promo_code')
    
    @staticmethod
    def apply_promo_code(promo_code: str, discount_amount: float) -> None:
        """Apply a promo code and its associated discount."""
        SessionManager.initialize_session()
        session['promo_code'] = promo_code
        session['discount_amount'] = discount_amount
        
        # Log the action
        logger.info(f"Promo code applied: {promo_code}, Discount: ${discount_amount}")
    
    @staticmethod
    def remove_promo_code() -> None:
        """Remove the currently applied promo code."""
        SessionManager.initialize_session()
        session['promo_code'] = None
        session['discount_amount'] = 0
        
        # Log the action
        logger.info("Promo code removed")
    
    @staticmethod
    def get_discount_amount() -> float:
        """Get the current discount amount from the applied promo code."""
        SessionManager.initialize_session()
        return session.get('discount_amount', 0)
    
    @staticmethod
    def get_patient_info() -> Dict[str, Any]:
        """Get the patient information entered by the user."""
        SessionManager.initialize_session()
        return session.get('patient_info', {})
    
    @staticmethod
    def save_patient_info(patient_info: Dict[str, Any]) -> Dict[str, Any]:
        """Save the patient information entered by the user."""
        SessionManager.initialize_session()
        session['patient_info'] = patient_info
        
        # Log the action (excluding personal details for privacy)
        logger.info(f"Patient info saved for quote: {session.get('quote_id')}")
        
        return patient_info
    
    @staticmethod
    def get_special_offer_id() -> Optional[str]:
        """Get the special offer ID if the user started from a special offer."""
        SessionManager.initialize_session()
        return session.get('special_offer_id')
    
    @staticmethod
    def set_special_offer_id(offer_id: str) -> None:
        """Set the special offer ID when the user starts from a special offer."""
        SessionManager.initialize_session()
        session['special_offer_id'] = offer_id
        
        # Log the action
        logger.info(f"Special offer ID set: {offer_id}")
    
    @staticmethod
    def get_quote_id() -> str:
        """Get the unique ID for the current quote."""
        SessionManager.initialize_session()
        return session.get('quote_id')
    
    @staticmethod
    def calculate_totals() -> Dict[str, float]:
        """
        Calculate the subtotal, discount, and total for the current selection.
        Returns a dictionary with the calculated values.
        """
        SessionManager.initialize_session()
        treatments = SessionManager.get_selected_treatments()
        discount_amount = SessionManager.get_discount_amount()
        
        # Calculate subtotal
        subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in treatments)
        
        # Calculate total after discount
        total = max(0, subtotal - discount_amount)
        
        return {
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total
        }
    
    @staticmethod
    def reset_session() -> None:
        """Reset the session, clearing all stored data."""
        # Store the quote ID for logging purposes
        quote_id = session.get('quote_id', 'unknown')
        
        # Clear session
        session.clear()
        
        # Re-initialize with new values
        SessionManager.initialize_session()
        
        # Log the action
        logger.info(f"Session reset. Old quote ID: {quote_id}, New quote ID: {session['quote_id']}")
    
    @staticmethod
    def get_quote_data() -> Dict[str, Any]:
        """
        Get a complete snapshot of the current quote data.
        This includes selected treatments, promo code, patient info, and totals.
        """
        SessionManager.initialize_session()
        
        totals = SessionManager.calculate_totals()
        
        return {
            'quote_id': SessionManager.get_quote_id(),
            'selected_treatments': SessionManager.get_selected_treatments(),
            'promo_code': SessionManager.get_promo_code(),
            'patient_info': SessionManager.get_patient_info(),
            'special_offer_id': SessionManager.get_special_offer_id(),
            'created_at': session.get('quote_created_at'),
            'subtotal': totals['subtotal'],
            'discount_amount': totals['discount_amount'],
            'total': totals['total']
        }
    
    @staticmethod
    def to_json() -> str:
        """Convert the current session data to a JSON string."""
        quote_data = SessionManager.get_quote_data()
        return json.dumps(quote_data, indent=2, default=str)