"""
Session Manager Utility
Handles session management for the dental quote application
"""
from flask import session
from services.treatment_service import get_treatment_by_id
from services.promo_service import validate_promo_code, calculate_discount
import uuid
import logging

logger = logging.getLogger(__name__)

def initialize_session():
    """Initialize or reset the session"""
    if 'initialized' not in session:
        session['initialized'] = True
        session['treatments'] = {}
        session['promo_code'] = None
        session['discount_amount'] = 0
        session['quote_id'] = None
        session['patient_info'] = {}
        logger.info("Session initialized")

def add_treatment(treatment_id):
    """Add a treatment to the session"""
    # Make sure the session is initialized
    initialize_session()
    
    # Get the treatment details
    treatment = get_treatment_by_id(treatment_id)
    
    if not treatment:
        return False, f"Treatment with ID {treatment_id} not found"
    
    # Add or update the treatment in the session
    treatments = session.get('treatments', {})
    
    if treatment_id in treatments:
        # Increment quantity if already in cart
        treatments[treatment_id]['quantity'] += 1
        message = f"{treatment['name']} quantity increased"
    else:
        # Add new treatment with quantity 1
        treatments[treatment_id] = {
            'id': treatment_id,
            'name': treatment['name'],
            'price': treatment['price'],
            'category': treatment['category'],
            'quantity': 1,
            'description': treatment['description'],
            'image': treatment.get('image', '')
        }
        message = f"{treatment['name']} added to quote"
    
    # Update the session
    session['treatments'] = treatments
    
    # Recalculate any discount if there's a promo code applied
    if session.get('promo_code'):
        apply_promo_code(session['promo_code'])
    
    logger.info(f"Treatment added: {treatment_id}")
    return True, message

def remove_treatment(treatment_id):
    """Remove a treatment from the session"""
    # Make sure the session is initialized
    initialize_session()
    
    # Get the treatments from the session
    treatments = session.get('treatments', {})
    
    if treatment_id not in treatments:
        return False, f"Treatment with ID {treatment_id} not in quote"
    
    # Get the treatment name before removing
    treatment_name = treatments[treatment_id]['name']
    
    # Remove the treatment
    del treatments[treatment_id]
    
    # Update the session
    session['treatments'] = treatments
    
    # Recalculate any discount if there's a promo code applied
    if session.get('promo_code'):
        apply_promo_code(session['promo_code'])
    
    logger.info(f"Treatment removed: {treatment_id}")
    return True, f"{treatment_name} removed from quote"

def update_treatment_quantity(treatment_id, quantity):
    """Update the quantity of a treatment in the session"""
    # Make sure the session is initialized
    initialize_session()
    
    # Get the treatments from the session
    treatments = session.get('treatments', {})
    
    if treatment_id not in treatments:
        return False, f"Treatment with ID {treatment_id} not in quote"
    
    try:
        quantity = int(quantity)
        if quantity <= 0:
            return remove_treatment(treatment_id)
        
        treatments[treatment_id]['quantity'] = quantity
        
        # Update the session
        session['treatments'] = treatments
        
        # Recalculate any discount if there's a promo code applied
        if session.get('promo_code'):
            apply_promo_code(session['promo_code'])
        
        logger.info(f"Treatment quantity updated: {treatment_id} -> {quantity}")
        return True, f"Quantity updated for {treatments[treatment_id]['name']}"
    
    except ValueError:
        return False, "Invalid quantity value"

def get_treatments():
    """Get all treatments from the session"""
    # Make sure the session is initialized
    initialize_session()
    
    # Get the treatments from the session
    treatments = session.get('treatments', {})
    
    # Convert the dictionary to a list
    treatment_list = list(treatments.values())
    
    return treatment_list

def get_quote_totals():
    """Calculate the quote totals"""
    # Make sure the session is initialized
    initialize_session()
    
    # Get the treatments from the session
    treatments = session.get('treatments', {})
    
    # Calculate the subtotal
    subtotal = 0
    for treatment_id, treatment in treatments.items():
        subtotal += treatment['price'] * treatment['quantity']
    
    # Get the discount amount
    discount_amount = session.get('discount_amount', 0)
    
    # Calculate the total
    total = subtotal - discount_amount
    if total < 0:
        total = 0
    
    return {
        'subtotal': subtotal,
        'discount': discount_amount,
        'total': total,
        'item_count': len(treatments),
        'total_items': sum(t['quantity'] for t in treatments.values())
    }

def apply_promo_code(promo_code):
    """Apply a promo code to the quote"""
    # Make sure the session is initialized
    initialize_session()
    
    # Standardize the promo code
    promo_code = promo_code.strip().upper()
    
    # Get the treatments from the session
    treatments = get_treatments()
    
    # Calculate the subtotal
    subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in treatments)
    
    # No treatments, no discount
    if not treatments:
        session['promo_code'] = None
        session['discount_amount'] = 0
        return False, "No treatments in quote. Add treatments before applying a promo code."
    
    # Validate the promo code
    validation_result = validate_promo_code(promo_code, subtotal)
    
    if not validation_result['valid']:
        session['promo_code'] = None
        session['discount_amount'] = 0
        return False, validation_result['message']
    
    # Calculate the discount
    discount_result = calculate_discount(promo_code, treatments, subtotal)
    
    # Apply the discount
    session['promo_code'] = promo_code
    session['discount_amount'] = discount_result['discount_amount']
    
    logger.info(f"Promo code applied: {promo_code}, Discount: {discount_result['discount_amount']}")
    return True, f"Promo code '{promo_code}' applied successfully!", discount_result

def get_promo_code():
    """Get the currently applied promo code"""
    # Make sure the session is initialized
    initialize_session()
    
    return session.get('promo_code')

def remove_promo_code():
    """Remove the currently applied promo code"""
    # Make sure the session is initialized
    initialize_session()
    
    if not session.get('promo_code'):
        return False, "No promo code currently applied"
    
    promo_code = session.get('promo_code')
    session['promo_code'] = None
    session['discount_amount'] = 0
    
    logger.info(f"Promo code removed: {promo_code}")
    return True, "Promo code removed successfully"

def save_patient_info(patient_data):
    """Save patient information to the session"""
    # Make sure the session is initialized
    initialize_session()
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone']
    for field in required_fields:
        if field not in patient_data or not patient_data[field]:
            return False, f"Missing required field: {field}"
    
    # Save the patient info
    session['patient_info'] = patient_data
    
    # Generate a quote ID if not already present
    if not session.get('quote_id'):
        session['quote_id'] = generate_quote_id()
    
    logger.info(f"Patient info saved: {patient_data['name']}")
    return True, "Patient information saved successfully"

def generate_quote_id():
    """Generate a unique quote ID"""
    return str(uuid.uuid4())

def clear_session():
    """Clear the session data"""
    session.clear()
    initialize_session()
    
    logger.info("Session cleared")
    return True, "Quote restarted"