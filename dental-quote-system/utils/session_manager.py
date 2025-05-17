"""
Session Manager Utility
Handles session data for the dental quote system
"""
from flask import session
import json
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def initialize_session():
    """Initialize a new session with default values"""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        
    if 'treatments' not in session:
        session['treatments'] = []
        
    if 'promo_code' not in session:
        session['promo_code'] = None
        
    if 'promo_details' not in session:
        session['promo_details'] = None
        
    if 'patient_info' not in session:
        session['patient_info'] = {}
        
    if 'quote_id' not in session:
        session['quote_id'] = None
        
    logger.info(f"Session initialized with ID: {session.get('session_id')}")

def get_session_id():
    """Get the current session ID"""
    return session.get('session_id')

def get_treatments():
    """Get the treatments in the current session"""
    return session.get('treatments', [])

def add_treatment(treatment):
    """Add a treatment to the session"""
    treatments = get_treatments()
    
    # Check if treatment already exists in session
    for existing in treatments:
        if existing.get('id') == treatment.get('id'):
            return False
    
    # Add timestamp for tracking
    treatment['added_at'] = datetime.now().isoformat()
    
    # Add to session
    treatments.append(treatment)
    session['treatments'] = treatments
    
    return True

def remove_treatment(treatment_id):
    """Remove a treatment from the session"""
    treatments = get_treatments()
    
    # Filter out the treatment with the specified ID
    updated_treatments = [t for t in treatments if t.get('id') != treatment_id]
    
    # Check if any treatment was removed
    if len(updated_treatments) < len(treatments):
        session['treatments'] = updated_treatments
        return True
    
    return False

def update_treatment_quantity(treatment_id, quantity):
    """Update the quantity of a treatment in the session"""
    treatments = get_treatments()
    
    for treatment in treatments:
        if treatment.get('id') == treatment_id:
            treatment['quantity'] = max(1, int(quantity))  # Ensure minimum quantity of 1
            session['treatments'] = treatments
            return True
    
    return False

def clear_treatments():
    """Clear all treatments in the session"""
    session['treatments'] = []

def get_promo_code():
    """Get the current promo code"""
    return session.get('promo_code')

def get_promo_details():
    """Get the details of the applied promo code"""
    return session.get('promo_details')

def set_promo_code(code, details):
    """Set a promo code in the session"""
    session['promo_code'] = code
    session['promo_details'] = details

def remove_promo_code():
    """Remove the promo code from the session"""
    session['promo_code'] = None
    session['promo_details'] = None

def set_patient_info(info):
    """Set patient information in the session"""
    session['patient_info'] = info

def get_patient_info():
    """Get patient information from the session"""
    return session.get('patient_info', {})

def set_quote_id(quote_id):
    """Set the quote ID in the session"""
    session['quote_id'] = quote_id

def get_quote_id():
    """Get the quote ID from the session"""
    return session.get('quote_id')

def calculate_totals():
    """Calculate the total cost from treatments and promotions in the session"""
    treatments = get_treatments()
    promo_code = get_promo_code()
    promo_details = get_promo_details()
    
    subtotal = 0
    
    # Calculate subtotal from selected treatments
    for treatment in treatments:
        price = float(treatment.get('price', 0))
        quantity = int(treatment.get('quantity', 1))
        subtotal += price * quantity
    
    # Initialize discount
    discount = 0
    
    # Apply promo code if available
    if promo_code and promo_details:
        discount_type = promo_details.get('discount_type', '')
        discount_value = float(promo_details.get('discount_value', 0))
        
        if discount_type == 'percentage':
            discount = subtotal * (discount_value / 100)
        elif discount_type == 'fixed_amount':
            discount = min(discount_value, subtotal)  # Don't allow negative totals
    
    # Calculate final total
    total = subtotal - discount
    
    return {
        'subtotal': subtotal,
        'discount': discount,
        'total': total,
        'promo_code': promo_code,
        'promo_details': promo_details
    }

def export_session_data():
    """Export all session data as a dictionary for debugging or integration"""
    return {
        'session_id': get_session_id(),
        'treatments': get_treatments(),
        'promo_code': get_promo_code(),
        'promo_details': get_promo_details(),
        'patient_info': get_patient_info(),
        'quote_id': get_quote_id(),
        'totals': calculate_totals()
    }

def clear_session():
    """Clear all session data and re-initialize"""
    session.clear()
    initialize_session()