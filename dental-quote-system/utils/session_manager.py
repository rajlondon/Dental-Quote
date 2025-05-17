"""
Session Manager Module
Handles session initialization and management for the dental quote system
"""
from flask import session
import uuid
from datetime import datetime

def init_session():
    """
    Initialize session with necessary data structures if they don't exist.
    This prevents issues with accessing session variables that haven't been set.
    """
    # Create session ID if it doesn't exist
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        session['created_at'] = datetime.now().isoformat()
    
    # Initialize treatments list
    if 'treatments' not in session:
        session['treatments'] = []
    
    # Initialize promo code data
    if 'promo_code' not in session:
        session['promo_code'] = None
    
    if 'promo_details' not in session:
        session['promo_details'] = None
    
    # Initialize patient info
    if 'patient_info' not in session:
        session['patient_info'] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
    
    # Initialize quote reference
    if 'quote_ref' not in session:
        session['quote_ref'] = f"DQ-{str(uuid.uuid4())[:8].upper()}"
    
    # Set cache buster to prevent browser caching issues
    session['cache_buster'] = str(uuid.uuid4())

def add_treatment(treatment):
    """
    Add a treatment to the session.
    
    Args:
        treatment (dict): Treatment object to add
    """
    if 'treatments' not in session:
        session['treatments'] = []
    
    # Check if treatment already exists
    for t in session['treatments']:
        if t['id'] == treatment['id']:
            return False
    
    session['treatments'].append(treatment)
    # Update cache buster
    session['cache_buster'] = str(uuid.uuid4())
    return True

def remove_treatment(treatment_id):
    """
    Remove a treatment from the session.
    
    Args:
        treatment_id (str): ID of treatment to remove
    """
    if 'treatments' not in session:
        return False
    
    initial_count = len(session['treatments'])
    session['treatments'] = [t for t in session['treatments'] if t['id'] != treatment_id]
    
    # Update cache buster
    session['cache_buster'] = str(uuid.uuid4())
    
    # Return True if a treatment was removed
    return len(session['treatments']) < initial_count

def get_treatments():
    """
    Get treatments from the session.
    
    Returns:
        list: List of treatments
    """
    return session.get('treatments', [])

def apply_promo_code(code, promo_details):
    """
    Apply a promo code to the session.
    
    Args:
        code (str): Promo code
        promo_details (dict): Details about the promo code
    """
    session['promo_code'] = code
    session['promo_details'] = promo_details
    # Update cache buster
    session['cache_buster'] = str(uuid.uuid4())

def remove_promo_code():
    """
    Remove promo code from the session.
    """
    session['promo_code'] = None
    session['promo_details'] = None
    # Update cache buster
    session['cache_buster'] = str(uuid.uuid4())

def update_patient_info(info):
    """
    Update patient information.
    
    Args:
        info (dict): Patient information
    """
    session['patient_info'] = info
    # Update cache buster
    session['cache_buster'] = str(uuid.uuid4())

def get_patient_info():
    """
    Get patient info from the session.
    
    Returns:
        dict: Patient information
    """
    return session.get('patient_info', {
        'name': '',
        'email': '',
        'phone': '',
        'notes': ''
    })

def reset_quote():
    """
    Reset the quote data in the session.
    """
    session['treatments'] = []
    session['promo_code'] = None
    session['promo_details'] = None
    session['patient_info'] = {
        'name': '',
        'email': '',
        'phone': '',
        'notes': ''
    }
    session['quote_ref'] = f"DQ-{str(uuid.uuid4())[:8].upper()}"
    # Update cache buster
    session['cache_buster'] = str(uuid.uuid4())

def calculate_totals():
    """
    Calculate the subtotal, discount, and total for the quote.
    
    Returns:
        tuple: (subtotal, discount, total)
    """
    subtotal = sum(t.get('price', 0) for t in session.get('treatments', []))
    discount = 0
    
    if session.get('promo_details'):
        promo_details = session['promo_details']
        if promo_details['type'] == 'percentage':
            discount = (subtotal * promo_details['value']) / 100
        elif promo_details['type'] == 'fixed':
            discount = min(promo_details['value'], subtotal)
    
    total = subtotal - discount
    return (subtotal, discount, total)