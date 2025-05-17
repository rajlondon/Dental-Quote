"""
Session Manager for Dental Quote System

This module provides session management functionality for maintaining
quote data throughout the user journey, from treatment selection to
quote submission.
"""

from flask import session
from datetime import datetime
import uuid
import json
from typing import Dict, List, Any, Optional, Union


class SessionManager:
    """
    Session manager class to handle storing and retrieving quote data
    in the user's session throughout the quote-building process.
    """

    # Session keys
    SESSION_KEY = 'dental_quote'
    TREATMENTS_KEY = 'selected_treatments'
    PROMO_CODE_KEY = 'promo_code'
    PROMO_DETAILS_KEY = 'promo_details'
    PATIENT_INFO_KEY = 'patient_info'
    QUOTE_REFERENCE_KEY = 'quote_reference'
    SUBTOTAL_KEY = 'subtotal'
    DISCOUNT_KEY = 'discount'
    TOTAL_KEY = 'total'
    
    @classmethod
    def initialize_session(cls, reset: bool = False) -> None:
        """
        Initialize or reset the quote session data
        
        Args:
            reset: If True, reset the session data even if it already exists
        """
        if cls.SESSION_KEY not in session or reset:
            session[cls.SESSION_KEY] = {
                cls.TREATMENTS_KEY: [],
                cls.PROMO_CODE_KEY: None,
                cls.PROMO_DETAILS_KEY: None,
                cls.PATIENT_INFO_KEY: None,
                cls.QUOTE_REFERENCE_KEY: None,
                cls.SUBTOTAL_KEY: 0,
                cls.DISCOUNT_KEY: 0,
                cls.TOTAL_KEY: 0
            }
    
    @classmethod
    def get_quote_data(cls) -> Dict[str, Any]:
        """
        Get all quote data from the session
        
        Returns:
            Dictionary containing all quote data
        """
        cls.initialize_session()
        return session[cls.SESSION_KEY]
    
    @classmethod
    def get_selected_treatments(cls) -> List[Dict[str, Any]]:
        """
        Get selected treatments from the session
        
        Returns:
            List of selected treatments with their details
        """
        return cls.get_quote_data().get(cls.TREATMENTS_KEY, [])
    
    @classmethod
    def add_treatment(cls, treatment_data: Dict[str, Any]) -> None:
        """
        Add a treatment to the selected treatments list
        
        Args:
            treatment_data: Dictionary containing treatment details
        """
        treatments = cls.get_selected_treatments()
        
        # Check if treatment already exists in the list
        existing_treatment = next(
            (t for t in treatments if t['id'] == treatment_data['id']), 
            None
        )
        
        if existing_treatment:
            # Increment quantity if already in list
            existing_treatment['quantity'] = existing_treatment.get('quantity', 1) + 1
        else:
            # Add new treatment with quantity 1
            treatment_data['quantity'] = 1
            treatments.append(treatment_data)
        
        # Update treatments in session
        quote_data = cls.get_quote_data()
        quote_data[cls.TREATMENTS_KEY] = treatments
        session[cls.SESSION_KEY] = quote_data
        
        # Recalculate pricing
        cls.update_pricing()
    
    @classmethod
    def remove_treatment(cls, treatment_id: str) -> None:
        """
        Remove a treatment from the selected treatments list
        
        Args:
            treatment_id: ID of the treatment to remove
        """
        treatments = cls.get_selected_treatments()
        updated_treatments = [t for t in treatments if t['id'] != treatment_id]
        
        # Update treatments in session
        quote_data = cls.get_quote_data()
        quote_data[cls.TREATMENTS_KEY] = updated_treatments
        session[cls.SESSION_KEY] = quote_data
        
        # Recalculate pricing
        cls.update_pricing()
    
    @classmethod
    def update_treatment_quantity(cls, treatment_id: str, quantity: int) -> None:
        """
        Update the quantity of a selected treatment
        
        Args:
            treatment_id: ID of the treatment to update
            quantity: New quantity (must be at least 1)
        """
        if quantity < 1:
            quantity = 1
            
        treatments = cls.get_selected_treatments()
        
        for treatment in treatments:
            if treatment['id'] == treatment_id:
                treatment['quantity'] = quantity
                break
        
        # Update treatments in session
        quote_data = cls.get_quote_data()
        quote_data[cls.TREATMENTS_KEY] = treatments
        session[cls.SESSION_KEY] = quote_data
        
        # Recalculate pricing
        cls.update_pricing()
    
    @classmethod
    def set_promo_code(cls, promo_code: str, promo_details: Optional[Dict[str, Any]] = None) -> None:
        """
        Set the promotional code and its details
        
        Args:
            promo_code: The promotional code string
            promo_details: Optional dictionary with promo details (discount amount, type, etc.)
        """
        quote_data = cls.get_quote_data()
        quote_data[cls.PROMO_CODE_KEY] = promo_code
        quote_data[cls.PROMO_DETAILS_KEY] = promo_details
        session[cls.SESSION_KEY] = quote_data
        
        # Recalculate pricing with new promo code
        cls.update_pricing()
    
    @classmethod
    def remove_promo_code(cls) -> None:
        """Remove the promotional code from the session"""
        quote_data = cls.get_quote_data()
        quote_data[cls.PROMO_CODE_KEY] = None
        quote_data[cls.PROMO_DETAILS_KEY] = None
        session[cls.SESSION_KEY] = quote_data
        
        # Recalculate pricing without promo code
        cls.update_pricing()
    
    @classmethod
    def get_promo_code(cls) -> Optional[str]:
        """
        Get the current promotional code
        
        Returns:
            The promotional code or None if not set
        """
        return cls.get_quote_data().get(cls.PROMO_CODE_KEY)
    
    @classmethod
    def get_promo_details(cls) -> Optional[Dict[str, Any]]:
        """
        Get the promotional code details
        
        Returns:
            Dictionary with promo details or None if not set
        """
        return cls.get_quote_data().get(cls.PROMO_DETAILS_KEY)
    
    @classmethod
    def set_patient_info(cls, patient_data: Dict[str, Any]) -> None:
        """
        Set the patient information
        
        Args:
            patient_data: Dictionary containing patient details
        """
        quote_data = cls.get_quote_data()
        quote_data[cls.PATIENT_INFO_KEY] = patient_data
        session[cls.SESSION_KEY] = quote_data
    
    @classmethod
    def get_patient_info(cls) -> Optional[Dict[str, Any]]:
        """
        Get the patient information
        
        Returns:
            Dictionary with patient details or None if not set
        """
        return cls.get_quote_data().get(cls.PATIENT_INFO_KEY)
    
    @classmethod
    def generate_quote_reference(cls) -> str:
        """
        Generate a unique quote reference number
        
        Returns:
            A unique reference string
        """
        # Generate a unique reference in the format MDF-20250517-XXXX
        date_str = datetime.now().strftime("%Y%m%d")
        unique_id = str(uuid.uuid4())[:6].upper()
        reference = f"MDF-{date_str}-{unique_id}"
        
        # Store the reference in the session
        quote_data = cls.get_quote_data()
        quote_data[cls.QUOTE_REFERENCE_KEY] = reference
        session[cls.SESSION_KEY] = quote_data
        
        return reference
    
    @classmethod
    def get_quote_reference(cls) -> Optional[str]:
        """
        Get the quote reference number
        
        Returns:
            The quote reference string or None if not generated yet
        """
        return cls.get_quote_data().get(cls.QUOTE_REFERENCE_KEY)
    
    @classmethod
    def update_pricing(cls) -> Dict[str, float]:
        """
        Calculate and update pricing information (subtotal, discount, total)
        
        Returns:
            Dictionary with pricing information
        """
        # Get current quote data
        quote_data = cls.get_quote_data()
        treatments = quote_data.get(cls.TREATMENTS_KEY, [])
        promo_details = quote_data.get(cls.PROMO_DETAILS_KEY)
        
        # Calculate subtotal
        subtotal = sum(
            treatment.get('price', 0) * treatment.get('quantity', 1)
            for treatment in treatments
        )
        
        # Calculate discount
        discount = 0
        if promo_details:
            discount_type = promo_details.get('discount_type')
            discount_value = promo_details.get('discount_value', 0)
            applicable_treatments = promo_details.get('applicable_treatments', [])
            
            if discount_type == 'percentage':
                if applicable_treatments:
                    # Calculate subtotal for applicable treatments only
                    applicable_subtotal = sum(
                        treatment.get('price', 0) * treatment.get('quantity', 1)
                        for treatment in treatments
                        if treatment.get('id') in applicable_treatments
                    )
                    discount = applicable_subtotal * (discount_value / 100)
                else:
                    # Apply to all treatments
                    discount = subtotal * (discount_value / 100)
                    
            elif discount_type == 'fixed_amount':
                discount = min(discount_value, subtotal)  # Can't discount more than the subtotal
        
        # Calculate total
        total = subtotal - discount
        
        # Update pricing in session
        quote_data[cls.SUBTOTAL_KEY] = round(subtotal, 2)
        quote_data[cls.DISCOUNT_KEY] = round(discount, 2)
        quote_data[cls.TOTAL_KEY] = round(total, 2)
        session[cls.SESSION_KEY] = quote_data
        
        return {
            'subtotal': round(subtotal, 2),
            'discount': round(discount, 2),
            'total': round(total, 2)
        }
    
    @classmethod
    def get_pricing(cls) -> Dict[str, float]:
        """
        Get current pricing information
        
        Returns:
            Dictionary with subtotal, discount, and total
        """
        quote_data = cls.get_quote_data()
        return {
            'subtotal': quote_data.get(cls.SUBTOTAL_KEY, 0),
            'discount': quote_data.get(cls.DISCOUNT_KEY, 0),
            'total': quote_data.get(cls.TOTAL_KEY, 0)
        }
    
    @classmethod
    def get_complete_quote_data(cls) -> Dict[str, Any]:
        """
        Get complete quote data for submission or display
        
        Returns:
            Dictionary with all quote information
        """
        # Refresh pricing to ensure it's accurate
        cls.update_pricing()
        
        # Return comprehensive quote data
        return {
            'treatments': cls.get_selected_treatments(),
            'promo_code': cls.get_promo_code(),
            'promo_details': cls.get_promo_details(),
            'patient_info': cls.get_patient_info(),
            'reference': cls.get_quote_reference() or cls.generate_quote_reference(),
            'created_at': datetime.now().isoformat(),
            **cls.get_pricing()
        }