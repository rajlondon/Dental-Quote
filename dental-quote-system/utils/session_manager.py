"""
Session Manager for Dental Quote System
Handles session data storage and retrieval
"""

from flask import session
import uuid
import json
from datetime import datetime

def get_session_data():
    """
    Get the current session data
    
    Returns:
        dict: The current session data
    """
    if 'quote_data' not in session:
        init_session_data()
    
    return session['quote_data']

def set_session_data(data):
    """
    Update the session data
    
    Args:
        data (dict): The data to update in the session
    """
    if 'quote_data' not in session:
        init_session_data()
    
    session['quote_data'].update(data)
    session.modified = True

def init_session_data():
    """
    Initialize session data with default values if not already present
    """
    if 'quote_data' not in session:
        session['quote_data'] = {
            'session_id': str(uuid.uuid4()),
            'created_at': datetime.now().isoformat(),
            'selected_treatments': [],
            'promo_code': None,
            'promo_details': None,
            'special_offer_id': None,
            'patient_info': {},
            'quote_totals': {
                'subtotal': 0,
                'discount_amount': 0, 
                'total': 0
            }
        }
        session.modified = True

def add_treatment(treatment_data):
    """
    Add a treatment to the current quote
    
    Args:
        treatment_data (dict): The treatment data to add
        
    Returns:
        dict: Updated session data including selected treatments and quote totals
    """
    session_data = get_session_data()
    
    # Check if treatment is already in the quote
    treatment_id = treatment_data.get('id')
    existing_treatment = next(
        (t for t in session_data['selected_treatments'] if t.get('id') == treatment_id), 
        None
    )
    
    if existing_treatment:
        # Update the quantity if the treatment already exists
        existing_treatment['quantity'] = existing_treatment.get('quantity', 1) + 1
    else:
        # Add quantity field and add the treatment to the list
        treatment_data['quantity'] = 1
        session_data['selected_treatments'].append(treatment_data)
    
    # Recalculate totals
    update_quote_totals()
    
    return {
        'selected_treatments': session_data['selected_treatments'],
        'totals': session_data['quote_totals']
    }

def remove_treatment(treatment_id):
    """
    Remove a treatment from the current quote
    
    Args:
        treatment_id (str): The ID of the treatment to remove
        
    Returns:
        dict: Updated session data including selected treatments and quote totals
    """
    session_data = get_session_data()
    
    # Filter out the treatment with the specified ID
    session_data['selected_treatments'] = [
        t for t in session_data['selected_treatments'] if t.get('id') != treatment_id
    ]
    
    # Update session data
    set_session_data(session_data)
    
    # Recalculate totals
    update_quote_totals()
    
    return {
        'selected_treatments': session_data['selected_treatments'],
        'totals': session_data['quote_totals']
    }

def update_treatment_quantity(treatment_id, quantity):
    """
    Update the quantity of a treatment in the current quote
    
    Args:
        treatment_id (str): The ID of the treatment to update
        quantity (int): The new quantity
        
    Returns:
        dict: Updated session data including selected treatments and quote totals
    """
    session_data = get_session_data()
    
    # Find and update the treatment
    for treatment in session_data['selected_treatments']:
        if treatment.get('id') == treatment_id:
            treatment['quantity'] = quantity
            break
    
    # Update session data
    set_session_data(session_data)
    
    # Recalculate totals
    update_quote_totals()
    
    return {
        'selected_treatments': session_data['selected_treatments'],
        'totals': session_data['quote_totals']
    }

def apply_promo_code(promo_code, promo_details):
    """
    Apply a promotional code to the current quote
    
    Args:
        promo_code (str): The promotional code to apply
        promo_details (dict): The details of the promotion
        
    Returns:
        dict: Updated quote totals
    """
    session_data = get_session_data()
    
    # Store promo code and details
    session_data['promo_code'] = promo_code
    session_data['promo_details'] = promo_details
    
    # Update session data
    set_session_data(session_data)
    
    # Recalculate totals
    update_quote_totals()
    
    return session_data['quote_totals']

def remove_promo_code():
    """
    Remove the promotional code from the current quote
    
    Returns:
        dict: Updated quote totals
    """
    session_data = get_session_data()
    
    # Remove promo code and details
    session_data['promo_code'] = None
    session_data['promo_details'] = None
    
    # Update session data
    set_session_data(session_data)
    
    # Recalculate totals
    update_quote_totals()
    
    return session_data['quote_totals']

def apply_special_offer(offer_id, offer_details):
    """
    Apply a special offer to the current quote
    
    Args:
        offer_id (str): The ID of the offer to apply
        offer_details (dict): The details of the offer
        
    Returns:
        dict: Updated session data
    """
    session_data = get_session_data()
    
    # Store special offer ID and details
    session_data['special_offer_id'] = offer_id
    session_data['promo_code'] = offer_details.get('promo_code')
    session_data['promo_details'] = offer_details
    
    # Update session data
    set_session_data(session_data)
    
    # Recalculate totals
    update_quote_totals()
    
    return session_data

def save_patient_info(patient_data):
    """
    Save patient information to the current quote
    
    Args:
        patient_data (dict): The patient information to save
        
    Returns:
        dict: Updated session data
    """
    session_data = get_session_data()
    
    # Store patient information
    session_data['patient_info'] = patient_data
    
    # Update session data
    set_session_data(session_data)
    
    return session_data

def update_quote_totals():
    """
    Recalculate the quote totals based on selected treatments and promotions
    """
    session_data = get_session_data()
    
    # Calculate subtotal
    subtotal = sum(
        treatment.get('price', 0) * treatment.get('quantity', 1) 
        for treatment in session_data['selected_treatments']
    )
    
    # Calculate discount amount based on promo code
    discount_amount = 0
    if session_data['promo_details']:
        promo_details = session_data['promo_details']
        
        # Different calculation based on discount type
        if promo_details.get('discount_type') == 'percentage':
            discount_percentage = promo_details.get('discount_value', 0)
            discount_amount = subtotal * (discount_percentage / 100)
        elif promo_details.get('discount_type') == 'fixed_amount':
            discount_amount = promo_details.get('discount_value', 0)
            # Ensure discount doesn't exceed subtotal
            discount_amount = min(discount_amount, subtotal)
    
    # Calculate total
    total = subtotal - discount_amount
    
    # Update quote totals
    session_data['quote_totals'] = {
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    }
    
    # Update session data
    set_session_data(session_data)

def clear_session_data():
    """
    Clear all session data
    """
    if 'quote_data' in session:
        del session['quote_data']
    
    # Re-initialize with default values
    init_session_data()