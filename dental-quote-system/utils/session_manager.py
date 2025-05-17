"""
Session Manager Module
Handles session management and data persistence for the dental quote application
"""
from flask import session
import uuid
from datetime import datetime, timedelta

def initialize_session():
    """Initialize or reset the session data"""
    if 'quote_id' not in session:
        session['quote_id'] = str(uuid.uuid4())
    
    if 'treatments' not in session:
        session['treatments'] = []
    
    if 'promo_code' not in session:
        session['promo_code'] = None
    
    if 'promo_details' not in session:
        session['promo_details'] = None
    
    if 'patient_info' not in session:
        session['patient_info'] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
    
    if 'created_at' not in session:
        session['created_at'] = datetime.now().isoformat()
    
    # Set session to permanent and lifetime to 30 minutes
    session.permanent = True
    session.modified = True

def get_treatments():
    """Get the list of selected treatments from session"""
    initialize_session()
    return session.get('treatments', [])

def add_treatment(treatment):
    """Add a treatment to the session"""
    initialize_session()
    treatments = session.get('treatments', [])
    
    # Check if treatment already exists (avoid duplicates)
    for existing in treatments:
        if existing['id'] == treatment['id']:
            return False
    
    treatments.append(treatment)
    session['treatments'] = treatments
    session.modified = True
    return True

def remove_treatment(treatment_id):
    """Remove a treatment from the session"""
    initialize_session()
    treatments = session.get('treatments', [])
    
    # Find and remove the treatment
    updated_treatments = [t for t in treatments if t['id'] != treatment_id]
    
    # Update session
    session['treatments'] = updated_treatments
    session.modified = True
    return len(treatments) != len(updated_treatments)

def set_promo_code(promo_code, promo_details=None):
    """Set a promo code and its details in the session"""
    initialize_session()
    session['promo_code'] = promo_code
    session['promo_details'] = promo_details
    session.modified = True

def get_promo_code():
    """Get the current promo code from session"""
    initialize_session()
    return session.get('promo_code')

def get_promo_details():
    """Get the current promo details from session"""
    initialize_session()
    return session.get('promo_details')

def remove_promo_code():
    """Remove promo code from session"""
    initialize_session()
    session['promo_code'] = None
    session['promo_details'] = None
    session.modified = True

def set_patient_info(patient_info):
    """Set patient information in the session"""
    initialize_session()
    session['patient_info'] = patient_info
    session.modified = True

def get_patient_info():
    """Get patient information from session"""
    initialize_session()
    return session.get('patient_info', {})

def calculate_totals():
    """Calculate subtotal, discount and total prices"""
    initialize_session()
    treatments = session.get('treatments', [])
    promo_code = session.get('promo_code')
    promo_details = session.get('promo_details', {})
    
    # Calculate subtotal
    subtotal = sum(float(treatment.get('price', 0)) for treatment in treatments)
    
    # Calculate discount
    discount = 0
    if promo_code and promo_details:
        discount_type = promo_details.get('discount_type', '')
        discount_value = float(promo_details.get('discount_value', 0))
        
        if discount_type == 'percentage':
            discount = subtotal * (discount_value / 100)
        elif discount_type == 'fixed_amount':
            discount = min(discount_value, subtotal)  # Don't allow negative totals
    
    # Calculate total
    total = subtotal - discount
    
    return {
        'subtotal': round(subtotal, 2),
        'discount': round(discount, 2),
        'total': round(total, 2)
    }

def get_quote_data():
    """Get all quote data from session"""
    initialize_session()
    totals = calculate_totals()
    
    return {
        'quote_id': session.get('quote_id'),
        'treatments': session.get('treatments', []),
        'promo_code': session.get('promo_code'),
        'promo_details': session.get('promo_details'),
        'patient_info': session.get('patient_info', {}),
        'subtotal': totals['subtotal'],
        'discount': totals['discount'],
        'total': totals['total'],
        'created_at': session.get('created_at')
    }

def clear_session():
    """Clear all session data"""
    session.clear()
    initialize_session()