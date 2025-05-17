"""
Session Manager Module
Handles session initialization and management for the dental quote system
"""
from flask import session
import uuid
from datetime import datetime

def initialize_session():
    """Initialize session variables if they don't exist"""
    if 'initialized' not in session:
        # Create a new session with default values
        session['initialized'] = True
        session['quote_id'] = str(uuid.uuid4())
        session['treatments'] = []
        session['promo_code'] = None
        session['promo_details'] = None
        session['patient_info'] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
        session['created_at'] = datetime.now().isoformat()
        session['last_updated'] = datetime.now().isoformat()
        session.permanent = True

def get_quote_data():
    """Get the current quote data from the session"""
    if 'initialized' not in session:
        initialize_session()
    
    # Calculate totals
    treatments = session.get('treatments', [])
    subtotal = sum(treatment.get('price', 0) for treatment in treatments)
    
    # Apply promo code discount if available
    promo_details = session.get('promo_details')
    discount = 0
    
    if promo_details and subtotal > 0:
        if promo_details.get('discount_type') == 'percentage':
            discount = (subtotal * promo_details.get('discount_value', 0)) / 100
        elif promo_details.get('discount_type') == 'fixed_amount':
            discount = promo_details.get('discount_value', 0)
    
    total = subtotal - discount
    
    return {
        'quote_id': session.get('quote_id'),
        'treatments': treatments,
        'promo_code': session.get('promo_code'),
        'promo_details': promo_details,
        'patient_info': session.get('patient_info', {}),
        'subtotal': subtotal,
        'discount': discount,
        'total': total,
        'created_at': session.get('created_at'),
        'last_updated': session.get('last_updated')
    }

def update_session():
    """Update the last_updated timestamp in the session"""
    session['last_updated'] = datetime.now().isoformat()

def add_treatment(treatment):
    """Add a treatment to the quote"""
    if 'initialized' not in session:
        initialize_session()
    
    if 'treatments' not in session:
        session['treatments'] = []
    
    # Check if treatment already exists in the quote
    for existing in session['treatments']:
        if existing.get('id') == treatment.get('id'):
            # Treatment already in quote
            return False
    
    # Add treatment to the quote
    session['treatments'].append(treatment)
    update_session()
    return True

def remove_treatment(treatment_id):
    """Remove a treatment from the quote"""
    if 'treatments' not in session:
        return False
    
    original_length = len(session['treatments'])
    session['treatments'] = [t for t in session['treatments'] if t.get('id') != treatment_id]
    
    if len(session['treatments']) < original_length:
        update_session()
        return True
    
    return False

def apply_promo_code(promo_code, promo_details):
    """Apply a promo code to the quote"""
    if 'initialized' not in session:
        initialize_session()
    
    session['promo_code'] = promo_code
    session['promo_details'] = promo_details
    update_session()
    return True

def remove_promo_code():
    """Remove the applied promo code from the quote"""
    if 'promo_code' not in session or 'promo_details' not in session:
        return False
    
    session['promo_code'] = None
    session['promo_details'] = None
    update_session()
    return True

def update_patient_info(patient_info):
    """Update patient information in the quote"""
    if 'initialized' not in session:
        initialize_session()
    
    session['patient_info'] = patient_info
    update_session()
    return True

def reset_quote():
    """Reset the quote to its initial state"""
    session.clear()
    initialize_session()
    return True