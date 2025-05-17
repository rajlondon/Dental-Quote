"""
Session Manager Module
Handles session management functionality for dental quote system
"""
from flask import session
import uuid
import time
from datetime import datetime
import json

def initialize_session():
    """Initialize session with required data structures if not present."""
    if 'initialized' not in session:
        # Generate a unique quote reference
        session['quote_ref'] = generate_quote_ref()
        
        # Initialize treatments list
        session['treatments'] = []
        
        # Initialize patient info
        session['patient_info'] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
        
        # Initialize promo code
        session['promo_code'] = None
        session['promo_details'] = None
        
        # Set creation timestamp
        session['created_at'] = datetime.now().isoformat()
        
        # Mark session as initialized
        session['initialized'] = True
        
        # Set session cookie options
        session.permanent = True
        
        # Force session save
        session.modified = True


def generate_quote_ref():
    """Generate a unique quote reference."""
    # Format: QT-{timestamp}-{random_uuid}
    timestamp = int(time.time())
    unique_id = str(uuid.uuid4())[:8]
    return f"QT-{timestamp}-{unique_id}"


def get_treatments():
    """Get treatments from session."""
    initialize_session()
    return session.get('treatments', [])


def add_treatment(treatment):
    """Add treatment to session."""
    initialize_session()
    
    # Get current treatments
    treatments = session.get('treatments', [])
    
    # Add new treatment with unique ID if not present
    treatment_id = treatment.get('id')
    
    # Check if treatment already exists
    existing = next((t for t in treatments if t.get('id') == treatment_id), None)
    
    if not existing:
        # Add treatment
        treatments.append(treatment)
        session['treatments'] = treatments
        session.modified = True
        return True
    
    return False


def remove_treatment(treatment_id):
    """Remove treatment from session."""
    initialize_session()
    
    # Get current treatments
    treatments = session.get('treatments', [])
    
    # Find the treatment index
    treatment_index = next((i for i, t in enumerate(treatments) 
                           if t.get('id') == treatment_id), -1)
    
    if treatment_index >= 0:
        # Remove treatment
        del treatments[treatment_index]
        session['treatments'] = treatments
        session.modified = True
        return True
    
    return False


def get_patient_info():
    """Get patient info from session."""
    initialize_session()
    return session.get('patient_info', {})


def update_patient_info(info):
    """Update patient info in session."""
    initialize_session()
    
    # Get current patient info
    patient_info = session.get('patient_info', {})
    
    # Update with new values
    for key, value in info.items():
        patient_info[key] = value
    
    session['patient_info'] = patient_info
    session.modified = True


def apply_promo_code(code, details):
    """Apply promo code to session."""
    initialize_session()
    
    session['promo_code'] = code
    session['promo_details'] = details
    session.modified = True


def remove_promo_code():
    """Remove promo code from session."""
    initialize_session()
    
    session['promo_code'] = None
    session['promo_details'] = None
    session.modified = True


def reset_quote():
    """Reset quote data in session."""
    # Clear all quote related data
    if 'treatments' in session:
        session['treatments'] = []
    
    if 'patient_info' in session:
        session['patient_info'] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
    
    if 'promo_code' in session:
        session['promo_code'] = None
        session['promo_details'] = None
    
    # Generate a new quote reference
    session['quote_ref'] = generate_quote_ref()
    
    # Set creation timestamp
    session['created_at'] = datetime.now().isoformat()
    
    # Force session save
    session.modified = True


def calculate_totals():
    """Calculate quote totals based on treatments and promo code."""
    initialize_session()
    
    # Get treatments
    treatments = session.get('treatments', [])
    
    # Calculate subtotal
    subtotal = sum(treatment.get('price', 0) for treatment in treatments)
    
    # Calculate discount based on promo code
    discount = 0
    promo_details = session.get('promo_details')
    
    if promo_details:
        promo_type = promo_details.get('type')
        promo_value = promo_details.get('value', 0)
        
        if promo_type == 'percentage':
            discount = subtotal * (promo_value / 100)
        elif promo_type == 'fixed':
            discount = min(promo_value, subtotal)  # Don't exceed subtotal
    
    # Calculate total
    total = subtotal - discount
    
    return subtotal, discount, total