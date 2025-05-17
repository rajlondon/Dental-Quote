"""
Session Manager Module
Handles session data management for the quote system
"""
import logging
from flask import session

logger = logging.getLogger(__name__)

def initialize_session():
    """Initialize session data structure if not already present"""
    if 'quote_data' not in session:
        session['quote_data'] = {
            'treatments': [],
            'promo_code': None,
            'discount': 0,
            'promo_details': None,
            'patient_info': {}
        }
        logger.info("Initialized new session for quote data")

def get_session_treatments():
    """Get selected treatments from session
    
    Returns:
        list: Selected treatments
    """
    initialize_session()
    return session['quote_data']['treatments']

def add_treatment(treatment_data):
    """Add a treatment to the session
    
    Args:
        treatment_data (dict): Treatment data
        
    Returns:
        tuple: (success, message, added)
            - success (bool): Success status
            - message (str): Status message
            - added (bool): Whether the treatment was added or just incremented
    """
    initialize_session()
    
    # Check if treatment already exists
    treatment_id = treatment_data['id']
    
    for treatment in session['quote_data']['treatments']:
        if treatment['id'] == treatment_id:
            # Increment quantity
            quantity = treatment.get('quantity', 1) + 1
            treatment['quantity'] = quantity
            
            session.modified = True
            return True, f"Quantity increased to {quantity}", False
    
    # Add treatment with quantity 1
    treatment_to_add = treatment_data.copy()
    treatment_to_add['quantity'] = 1
    
    session['quote_data']['treatments'].append(treatment_to_add)
    session.modified = True
    
    return True, "Treatment added to quote", True

def remove_treatment(treatment_id):
    """Remove a treatment from the session
    
    Args:
        treatment_id (str): Treatment ID
        
    Returns:
        tuple: (success, message)
            - success (bool): Success status
            - message (str): Status message
    """
    initialize_session()
    
    # Find treatment in session
    treatments = session['quote_data']['treatments']
    
    for index, treatment in enumerate(treatments):
        if treatment['id'] == treatment_id:
            # Remove treatment
            del treatments[index]
            session.modified = True
            
            # Recalculate discount if promo code applied
            if session['quote_data']['promo_code']:
                from services.promo_service import calculate_discount
                promo_code = session['quote_data']['promo_code']
                subtotal = sum(t['price'] * t.get('quantity', 1) for t in treatments)
                
                discount_result = calculate_discount(promo_code, treatments, subtotal)
                
                if discount_result['success']:
                    session['quote_data']['discount'] = discount_result['discount']
                    session['quote_data']['promo_details'] = discount_result['promo_details']
            
            return True, "Treatment removed from quote"
    
    return False, "Treatment not found in quote"

def update_treatment_quantity(treatment_id, quantity):
    """Update the quantity of a treatment
    
    Args:
        treatment_id (str): Treatment ID
        quantity (int): New quantity
        
    Returns:
        tuple: (success, message)
            - success (bool): Success status
            - message (str): Status message
    """
    initialize_session()
    
    # Validate quantity
    if quantity < 1:
        return False, "Quantity must be at least 1"
    
    # Find treatment in session
    treatments = session['quote_data']['treatments']
    
    for treatment in treatments:
        if treatment['id'] == treatment_id:
            # Update quantity
            treatment['quantity'] = quantity
            session.modified = True
            
            # Recalculate discount if promo code applied
            if session['quote_data']['promo_code']:
                from services.promo_service import calculate_discount
                promo_code = session['quote_data']['promo_code']
                subtotal = sum(t['price'] * t.get('quantity', 1) for t in treatments)
                
                discount_result = calculate_discount(promo_code, treatments, subtotal)
                
                if discount_result['success']:
                    session['quote_data']['discount'] = discount_result['discount']
                    session['quote_data']['promo_details'] = discount_result['promo_details']
            
            return True, f"Quantity updated to {quantity}"
    
    return False, "Treatment not found in quote"

def apply_promo_code(promo_code, discount, promo_details):
    """Apply a promo code to the session
    
    Args:
        promo_code (str): Promo code
        discount (float): Discount amount
        promo_details (dict): Promo details
        
    Returns:
        bool: Success
    """
    initialize_session()
    
    session['quote_data']['promo_code'] = promo_code
    session['quote_data']['discount'] = discount
    session['quote_data']['promo_details'] = promo_details
    session.modified = True
    
    return True

def remove_promo_code():
    """Remove promo code from the session
    
    Returns:
        bool: Success
    """
    initialize_session()
    
    session['quote_data']['promo_code'] = None
    session['quote_data']['discount'] = 0
    session['quote_data']['promo_details'] = None
    session.modified = True
    
    return True

def get_applied_promo_code():
    """Get the applied promo code from session
    
    Returns:
        str: Promo code or None
    """
    initialize_session()
    return session['quote_data']['promo_code']

def get_promo_details():
    """Get the promo details from session
    
    Returns:
        dict: Promo details or None
    """
    initialize_session()
    return session['quote_data']['promo_details']

def get_quote_totals():
    """Calculate quote totals
    
    Returns:
        dict: Quote totals with keys:
            - subtotal: float
            - discount: float
            - total: float
    """
    initialize_session()
    
    # Calculate subtotal
    treatments = session['quote_data']['treatments']
    subtotal = sum(treatment['price'] * treatment.get('quantity', 1) for treatment in treatments)
    
    # Get discount
    discount = session['quote_data']['discount']
    
    # Calculate total
    total = subtotal - discount
    if total < 0:
        total = 0
    
    return {
        'subtotal': subtotal,
        'discount': discount,
        'total': total
    }

def save_patient_info(patient_data):
    """Save patient information to session
    
    Args:
        patient_data (dict): Patient information
        
    Returns:
        bool: Success
    """
    initialize_session()
    
    session['quote_data']['patient_info'] = patient_data
    session.modified = True
    
    return True

def get_patient_info():
    """Get patient information from session
    
    Returns:
        dict: Patient information
    """
    initialize_session()
    return session['quote_data']['patient_info']

def clear_session():
    """Clear the session data
    
    Returns:
        bool: Success
    """
    if 'quote_data' in session:
        session.pop('quote_data')
    
    return True