"""
Session Manager Module
Provides utility functions for managing session data
"""
import logging
from flask import session
from services.treatment_service import get_treatment_by_id, calculate_treatments_total
from services.promo_service import get_promotion_by_code, calculate_discount

logger = logging.getLogger(__name__)

def get_session_treatments():
    """Get treatments from session"""
    return session.get('treatments', [])

def add_treatment_to_session(treatment_id, quantity=1):
    """
    Add a treatment to the session
    Returns (success, message)
    """
    # Get the treatment details
    treatment = get_treatment_by_id(treatment_id)
    
    if not treatment:
        logger.warning(f"Treatment not found: {treatment_id}")
        return False, f"Treatment not found: {treatment_id}"
    
    # Check if the treatment is already in the session
    treatments = get_session_treatments()
    
    for existing_treatment in treatments:
        if existing_treatment.get('id') == treatment_id:
            # Update quantity if already in cart
            existing_treatment['quantity'] = existing_treatment.get('quantity', 1) + quantity
            session['treatments'] = treatments
            session.modified = True
            
            # Update totals
            update_quote_totals()
            
            logger.info(f"Updated quantity for treatment: {treatment_id}")
            return True, f"Updated quantity for {treatment.get('name')}"
    
    # Add new treatment to session
    treatment_copy = treatment.copy()
    treatment_copy['quantity'] = quantity
    
    treatments.append(treatment_copy)
    session['treatments'] = treatments
    session.modified = True
    
    # Update totals
    update_quote_totals()
    
    logger.info(f"Added treatment to session: {treatment_id}")
    return True, f"Added {treatment.get('name')} to your quote"

def remove_treatment_from_session(treatment_id):
    """
    Remove a treatment from the session
    Returns (success, message)
    """
    treatments = get_session_treatments()
    
    # Find the treatment in the session
    for i, treatment in enumerate(treatments):
        if treatment.get('id') == treatment_id:
            # Remove the treatment
            removed_treatment = treatments.pop(i)
            session['treatments'] = treatments
            session.modified = True
            
            # Update totals
            update_quote_totals()
            
            logger.info(f"Removed treatment from session: {treatment_id}")
            return True, f"Removed {removed_treatment.get('name')} from your quote"
    
    logger.warning(f"Treatment not found in session: {treatment_id}")
    return False, f"Treatment not found in your quote"

def update_treatment_quantity(treatment_id, quantity):
    """
    Update treatment quantity in the session
    Returns (success, message)
    """
    # Convert quantity to int
    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        logger.warning(f"Invalid quantity: {quantity}")
        return False, "Invalid quantity"
    
    # Check for valid quantity
    if quantity <= 0:
        return remove_treatment_from_session(treatment_id)
    
    treatments = get_session_treatments()
    
    # Find the treatment in the session
    for treatment in treatments:
        if treatment.get('id') == treatment_id:
            # Update quantity
            treatment['quantity'] = quantity
            session['treatments'] = treatments
            session.modified = True
            
            # Update totals
            update_quote_totals()
            
            logger.info(f"Updated quantity for treatment: {treatment_id}")
            return True, f"Updated quantity for {treatment.get('name')}"
    
    logger.warning(f"Treatment not found in session: {treatment_id}")
    return False, f"Treatment not found in your quote"

def apply_promo_code(promo_code):
    """
    Apply a promo code to the session
    Returns (success, message)
    """
    if not promo_code:
        logger.warning("No promo code provided")
        return False, "Please enter a promo code"
    
    # Get total amount
    totals = get_quote_totals()
    subtotal = totals.get('subtotal', 0)
    
    # Validate the promo code
    validation_result = validate_promo_code(promo_code, subtotal)
    
    if not validation_result['valid']:
        logger.warning(f"Invalid promo code: {promo_code}")
        return False, validation_result['message']
    
    # Store promo code in session
    session['promo_code'] = promo_code
    session.modified = True
    
    # Update totals
    update_quote_totals()
    
    logger.info(f"Applied promo code: {promo_code}")
    return True, f"Promo code '{promo_code}' applied successfully"

def remove_promo_code():
    """
    Remove the promo code from the session
    Returns (success, message)
    """
    if 'promo_code' not in session or not session['promo_code']:
        logger.warning("No promo code in session")
        return False, "No promo code to remove"
    
    promo_code = session['promo_code']
    session['promo_code'] = None
    session.modified = True
    
    # Update totals
    update_quote_totals()
    
    logger.info(f"Removed promo code: {promo_code}")
    return True, f"Promo code '{promo_code}' removed successfully"

def get_applied_promo_code():
    """Get the applied promo code from session"""
    return session.get('promo_code')

def get_promo_details():
    """Get the details of the applied promo code"""
    promo_code = get_applied_promo_code()
    
    if not promo_code:
        return None
    
    return get_promotion_by_code(promo_code)

def update_quote_totals():
    """Update quote totals in the session"""
    treatments = get_session_treatments()
    
    # Calculate subtotal
    treatment_totals = calculate_treatments_total(treatments)
    subtotal = treatment_totals.get('subtotal', 0)
    item_count = treatment_totals.get('item_count', 0)
    
    # Calculate discount if promo code is applied
    promo_code = get_applied_promo_code()
    discount = 0
    
    if promo_code:
        discount_result = calculate_discount(promo_code, treatments, subtotal)
        discount = discount_result.get('discount_amount', 0)
    
    # Calculate total
    total = subtotal - discount
    if total < 0:
        total = 0
    
    # Update session
    session['quote_totals'] = {
        'subtotal': subtotal,
        'discount': discount,
        'total': total,
        'item_count': item_count
    }
    session.modified = True
    
    logger.info(f"Updated quote totals: subtotal=${subtotal}, discount=${discount}, total=${total}")
    return session['quote_totals']

def get_quote_totals():
    """Get quote totals from session"""
    return session.get('quote_totals', {
        'subtotal': 0,
        'discount': 0,
        'total': 0,
        'item_count': 0
    })

def clear_session():
    """Clear all session data"""
    session.clear()
    session.modified = True
    logger.info("Cleared session data")
    return True, "Session data cleared"

def validate_promo_code(promo_code, subtotal):
    """Validate a promo code"""
    from services.promo_service import validate_promo_code as validate_promo
    return validate_promo(promo_code, subtotal)

def get_patient_info():
    """Get patient info from session"""
    return session.get('patient_info', {})

def update_patient_info(patient_data):
    """Update patient info in session"""
    session['patient_info'] = patient_data
    session.modified = True
    logger.info("Updated patient info")
    return True, "Patient information updated"