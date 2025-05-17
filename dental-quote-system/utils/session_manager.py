"""
Session Manager Utility for Dental Quote System
Handles session data management for quotes
"""

from flask import session
from datetime import datetime

def get_session_data():
    """
    Get all current session data
    
    Returns:
        dict: Session data dictionary
    """
    return session

def calculate_totals(selected_treatments, promotion=None):
    """
    Calculate quote totals based on selected treatments and promotion
    
    Args:
        selected_treatments (list): List of selected treatments
        promotion (dict, optional): Promotion details if a promo code is applied
        
    Returns:
        dict: Quote totals including subtotal, discount_amount, and total
    """
    # Calculate subtotal
    subtotal = sum(
        treatment.get('price', 0) * treatment.get('quantity', 1) 
        for treatment in selected_treatments
    )
    
    # Initialize discount amount to 0
    discount_amount = 0
    
    # Apply promotion if available
    if promotion:
        discount_type = promotion.get('discount_type')
        discount_value = promotion.get('discount_value', 0)
        
        if discount_type == 'percentage':
            discount_amount = subtotal * (discount_value / 100)
        elif discount_type == 'fixed_amount':
            discount_amount = discount_value
            # Ensure discount doesn't exceed subtotal
            discount_amount = min(discount_amount, subtotal)
    
    # Calculate total
    total = subtotal - discount_amount
    
    return {
        'subtotal': subtotal,
        'discount_amount': discount_amount,
        'total': total
    }

def add_treatment(treatment):
    """
    Add a treatment to the quote in the session
    
    Args:
        treatment (dict): Treatment data to add
        
    Returns:
        dict: Updated session data
    """
    # Initialize selected_treatments if not exist
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Check if treatment already exists
    existing_treatment = next(
        (t for t in session['selected_treatments'] if t.get('id') == treatment.get('id')), 
        None
    )
    
    if existing_treatment:
        # Increment quantity if treatment already exists
        existing_treatment['quantity'] = existing_treatment.get('quantity', 1) + 1
    else:
        # Add new treatment with quantity 1
        treatment_data = {**treatment, 'quantity': 1}
        session['selected_treatments'].append(treatment_data)
    
    # Recalculate totals
    promo_details = session.get('promo_details')
    session['quote_totals'] = calculate_totals(session['selected_treatments'], promo_details)
    
    # Return updated session data
    return {
        'selected_treatments': session['selected_treatments'],
        'totals': session['quote_totals']
    }

def remove_treatment(treatment_id):
    """
    Remove a treatment from the quote in the session
    
    Args:
        treatment_id (str): ID of treatment to remove
        
    Returns:
        dict: Updated session data
    """
    # Initialize selected_treatments if not exist
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Remove treatment if exists
    session['selected_treatments'] = [
        t for t in session['selected_treatments'] 
        if t.get('id') != treatment_id
    ]
    
    # Recalculate totals
    promo_details = session.get('promo_details')
    session['quote_totals'] = calculate_totals(session['selected_treatments'], promo_details)
    
    # Return updated session data
    return {
        'selected_treatments': session['selected_treatments'],
        'totals': session['quote_totals']
    }

def update_treatment_quantity(treatment_id, quantity):
    """
    Update the quantity of a treatment in the quote
    
    Args:
        treatment_id (str): ID of treatment to update
        quantity (int): New quantity
        
    Returns:
        dict: Updated session data
    """
    # Initialize selected_treatments if not exist
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
    
    # Update quantity if treatment exists
    for treatment in session['selected_treatments']:
        if treatment.get('id') == treatment_id:
            treatment['quantity'] = max(1, quantity)
            break
    
    # Recalculate totals
    promo_details = session.get('promo_details')
    session['quote_totals'] = calculate_totals(session['selected_treatments'], promo_details)
    
    # Return updated session data
    return {
        'selected_treatments': session['selected_treatments'],
        'totals': session['quote_totals']
    }

def apply_promo_code(promo_code, promotion):
    """
    Apply a promo code to the quote
    
    Args:
        promo_code (str): Promo code to apply
        promotion (dict): Promotion details
        
    Returns:
        dict: Updated quote totals
    """
    # Store promo code in session
    session['promo_code'] = promo_code
    session['promo_details'] = promotion
    
    # Recalculate totals
    session['quote_totals'] = calculate_totals(session.get('selected_treatments', []), promotion)
    
    return session['quote_totals']

def remove_promo_code():
    """
    Remove the promo code from the quote
    
    Returns:
        dict: Updated quote totals
    """
    # Remove promo code from session
    session.pop('promo_code', None)
    session.pop('promo_details', None)
    
    # Recalculate totals
    session['quote_totals'] = calculate_totals(session.get('selected_treatments', []))
    
    return session['quote_totals']

def apply_special_offer(offer_id, offer):
    """
    Apply a special offer to the quote
    
    Args:
        offer_id (str): ID of offer to apply
        offer (dict): Offer details
        
    Returns:
        dict: Updated session data
    """
    # Store offer details in session
    session['applied_offer'] = offer_id
    
    # Apply promo code if available
    promo_code = offer.get('promo_code')
    if promo_code:
        apply_promo_code(promo_code, offer)
    
    return {
        'selected_treatments': session.get('selected_treatments', []),
        'totals': session.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        })
    }

def save_patient_info(patient_data):
    """
    Save patient information to the session
    
    Args:
        patient_data (dict): Patient information
        
    Returns:
        dict: Updated session data
    """
    # Add timestamp if not provided
    if not patient_data.get('date_submitted'):
        patient_data['date_submitted'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Save patient data to session
    session['patient_info'] = patient_data
    
    return session

def create_quote():
    """
    Create a new quote object from session data
    
    Returns:
        dict: Quote data
    """
    # Generate a quote ID
    import uuid
    quote_id = str(uuid.uuid4())[:8].upper()
    session['quote_id'] = quote_id
    
    # Create quote data
    quote_data = {
        'quote_id': quote_id,
        'selected_treatments': session.get('selected_treatments', []),
        'promo_code': session.get('promo_code'),
        'promo_details': session.get('promo_details'),
        'quote_totals': session.get('quote_totals', {
            'subtotal': 0,
            'discount_amount': 0,
            'total': 0
        }),
        'patient_info': session.get('patient_info', {}),
        'date_created': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Store complete quote in session
    session['quote_data'] = quote_data
    
    return quote_data

def clear_session():
    """
    Clear all session data
    
    Returns:
        bool: Success status
    """
    session.clear()
    return True