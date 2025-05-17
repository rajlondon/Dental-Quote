"""
Session Manager Utility
Handles session management and persistence for the quote system
"""
import logging
import datetime
from flask import session
from decimal import Decimal

logger = logging.getLogger(__name__)

def initialize_session():
    """Initialize the session if it's not already set up"""
    if 'initialized' not in session:
        session['initialized'] = True
        session['date_created'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        session['treatments'] = []
        session['promo_code'] = None
        session['promo_details'] = None
        session['patient_info'] = {}
        logger.info("New session initialized")

def get_session_treatments():
    """Get treatments from session"""
    initialize_session()
    return session.get('treatments', [])

def add_treatment(treatment_data):
    """Add a treatment to the session
    
    Args:
        treatment_data (dict): Treatment data including id, name, price, etc.
        
    Returns:
        tuple: (success, message, added)
    """
    initialize_session()
    
    treatments = session.get('treatments', [])
    
    # Check if treatment already exists
    for treatment in treatments:
        if treatment['id'] == treatment_data['id']:
            # Increment quantity
            treatment['quantity'] += 1
            session.modified = True
            return True, f"Quantity of {treatment['name']} increased.", False
    
    # Add new treatment with quantity=1
    treatment_data['quantity'] = 1
    treatments.append(treatment_data)
    session['treatments'] = treatments
    session.modified = True
    
    return True, f"{treatment_data['name']} added to your quote.", True

def remove_treatment(treatment_id):
    """Remove a treatment from the session
    
    Args:
        treatment_id (str): ID of the treatment to remove
        
    Returns:
        tuple: (success, message)
    """
    initialize_session()
    
    treatments = session.get('treatments', [])
    
    # Find and remove the treatment
    removed = False
    treatment_name = ""
    for i, treatment in enumerate(treatments):
        if treatment['id'] == treatment_id:
            treatment_name = treatment['name']
            treatments.pop(i)
            removed = True
            break
    
    if removed:
        session['treatments'] = treatments
        session.modified = True
        return True, f"{treatment_name} removed from your quote."
    
    return False, "Treatment not found in your quote."

def update_treatment_quantity(treatment_id, quantity):
    """Update the quantity of a treatment
    
    Args:
        treatment_id (str): ID of the treatment to update
        quantity (int): New quantity value
        
    Returns:
        tuple: (success, message)
    """
    initialize_session()
    
    treatments = session.get('treatments', [])
    
    # Find and update the treatment
    for treatment in treatments:
        if treatment['id'] == treatment_id:
            treatment['quantity'] = max(1, int(quantity))  # Ensure at least 1
            session.modified = True
            return True, f"Quantity updated."
    
    return False, "Treatment not found in your quote."

def get_quote_totals():
    """Calculate quote totals
    
    Returns:
        dict: Totals including subtotal, discount, and total
    """
    initialize_session()
    
    treatments = session.get('treatments', [])
    
    # Calculate subtotal
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in treatments)
    
    # Calculate discount if promo code is applied
    discount = 0
    promo_details = session.get('promo_details')
    
    if promo_details:
        if promo_details['discount_type'] == 'percentage':
            discount = (subtotal * promo_details['discount_value']) / 100
        else:  # fixed_amount
            discount = min(subtotal, promo_details['discount_value'])  # Cap at subtotal
    
    # Calculate total
    total = max(0, subtotal - discount)
    
    return {
        'subtotal': format_price(subtotal),
        'discount': format_price(discount),
        'total': format_price(total)
    }

def format_price(price):
    """Format price to 2 decimal places"""
    return round(float(price), 2)

def apply_promo_code(promo_code):
    """Apply a promo code to the session
    
    Args:
        promo_code (str): Promo code to apply
        
    Returns:
        tuple: (success, message)
    """
    from services.promo_service import validate_promo_code
    
    initialize_session()
    
    # Get quote subtotal
    treatments = session.get('treatments', [])
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in treatments)
    
    # Validate promo code
    result = validate_promo_code(promo_code, subtotal)
    
    if result['valid']:
        session['promo_code'] = promo_code
        session['promo_details'] = result['promo_details']
        session.modified = True
        return True, f"Promo code '{promo_code}' applied successfully."
    
    return False, result['message']

def remove_promo_code():
    """Remove the applied promo code
    
    Returns:
        tuple: (success, message)
    """
    initialize_session()
    
    if session.get('promo_code'):
        promo_code = session.get('promo_code')
        session['promo_code'] = None
        session['promo_details'] = None
        session.modified = True
        return True, f"Promo code '{promo_code}' removed."
    
    return False, "No promo code applied."

def get_applied_promo_code():
    """Get the currently applied promo code
    
    Returns:
        str: Promo code or None
    """
    initialize_session()
    return session.get('promo_code')

def get_promo_details():
    """Get the details of the applied promo code
    
    Returns:
        dict: Promo details or None
    """
    initialize_session()
    return session.get('promo_details')

def save_patient_info(patient_data):
    """Save patient information to the session
    
    Args:
        patient_data (dict): Patient information
        
    Returns:
        bool: Success
    """
    initialize_session()
    
    session['patient_info'] = patient_data
    session.modified = True
    
    return True

def get_patient_info():
    """Get patient information from the session
    
    Returns:
        dict: Patient information
    """
    initialize_session()
    return session.get('patient_info', {})

def generate_quote_id():
    """Generate a unique quote ID
    
    Returns:
        str: Quote ID
    """
    import uuid
    
    return str(uuid.uuid4())

def clear_session():
    """Clear the entire session"""
    session.clear()
    initialize_session()