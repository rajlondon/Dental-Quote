"""
Session Manager Utility
Handles session data manipulation for the quote system
"""
from flask import session
import json
import logging
from services.treatment_service import get_treatment_by_id, calculate_totals, generate_quote_id
from services.promo_service import get_promotion_by_code

logger = logging.getLogger(__name__)

def initialize_session():
    """Initialize session with default values if not already set"""
    if 'initialized' not in session:
        session['selected_treatments'] = []
        session['promo_code'] = None
        session['quote_id'] = generate_quote_id()
        session['patient_info'] = {}
        session['initialized'] = True
        logger.info(f"Initialized new session with quote ID: {session['quote_id']}")

def add_treatment(treatment_id):
    """Add a treatment to the selected treatments list"""
    if not treatment_id:
        return False, "No treatment specified"
    
    # Get the treatment details
    treatment = get_treatment_by_id(treatment_id)
    if not treatment:
        return False, f"Treatment with ID '{treatment_id}' not found"
    
    # Check if the treatment is already in the list
    selected_treatments = session.get('selected_treatments', [])
    for selected in selected_treatments:
        if selected.get('id') == treatment_id:
            return False, f"{treatment['name']} is already in your quote"
    
    # Add treatment to session with quantity 1
    treatment_with_quantity = treatment.copy()
    treatment_with_quantity['quantity'] = 1
    selected_treatments.append(treatment_with_quantity)
    session['selected_treatments'] = selected_treatments
    
    # Calculate new totals
    promo_details = None
    if session.get('promo_code'):
        promo_details = get_promotion_by_code(session['promo_code'])
    totals = calculate_totals(selected_treatments, promo_details)
    
    logger.info(f"Added treatment: {treatment['name']} to quote {session.get('quote_id')}")
    return True, f"{treatment['name']} added to your quote"

def remove_treatment(treatment_id):
    """Remove a treatment from the selected treatments list"""
    if not treatment_id:
        return False, "No treatment specified"
    
    # Get current selected treatments
    selected_treatments = session.get('selected_treatments', [])
    
    # Find the treatment to remove
    treatment_to_remove = None
    for treatment in selected_treatments:
        if treatment.get('id') == treatment_id:
            treatment_to_remove = treatment
            break
    
    if not treatment_to_remove:
        return False, f"Treatment with ID '{treatment_id}' not found in your quote"
    
    # Remove the treatment
    selected_treatments.remove(treatment_to_remove)
    session['selected_treatments'] = selected_treatments
    
    # Calculate new totals
    promo_details = None
    if session.get('promo_code'):
        promo_details = get_promotion_by_code(session['promo_code'])
    totals = calculate_totals(selected_treatments, promo_details)
    
    logger.info(f"Removed treatment: {treatment_to_remove.get('name')} from quote {session.get('quote_id')}")
    return True, f"{treatment_to_remove.get('name')} removed from your quote"

def update_treatment_quantity(treatment_id, quantity):
    """Update the quantity of a selected treatment"""
    if not treatment_id:
        return False, "No treatment specified"
    
    try:
        quantity = int(quantity)
        if quantity < 1:
            return False, "Quantity must be at least 1"
    except (ValueError, TypeError):
        return False, "Invalid quantity value"
    
    # Get current selected treatments
    selected_treatments = session.get('selected_treatments', [])
    
    # Find the treatment to update
    treatment_updated = False
    for treatment in selected_treatments:
        if treatment.get('id') == treatment_id:
            treatment['quantity'] = quantity
            treatment_updated = True
            treatment_name = treatment.get('name')
            break
    
    if not treatment_updated:
        return False, f"Treatment with ID '{treatment_id}' not found in your quote"
    
    # Update session
    session['selected_treatments'] = selected_treatments
    
    # Calculate new totals
    promo_details = None
    if session.get('promo_code'):
        promo_details = get_promotion_by_code(session['promo_code'])
    totals = calculate_totals(selected_treatments, promo_details)
    
    logger.info(f"Updated quantity of {treatment_name} to {quantity} in quote {session.get('quote_id')}")
    return True, f"Updated quantity of {treatment_name} to {quantity}"

def apply_promo_code(promo_code):
    """Apply a promo code to the current quote"""
    if not promo_code:
        return False, "No promo code provided"
    
    # Get current selected treatments
    selected_treatments = session.get('selected_treatments', [])
    
    # Validate the promo code
    from services.promo_service import validate_promo_code, apply_promo_code as apply_promo
    
    # Calculate the current subtotal
    subtotal = 0
    for treatment in selected_treatments:
        price = float(treatment.get('price', 0))
        quantity = int(treatment.get('quantity', 1))
        subtotal += price * quantity
    
    # Validate the promo code
    is_valid, message = validate_promo_code(promo_code, subtotal)
    
    if not is_valid:
        return False, message
    
    # Apply the promo code
    result = apply_promo(promo_code, subtotal)
    
    if result['success']:
        # Store the promo code in session
        session['promo_code'] = promo_code
        
        logger.info(f"Applied promo code: {promo_code} to quote {session.get('quote_id')}")
        return True, f"Promo code '{promo_code}' applied successfully", result
    
    return False, result['message']

def remove_promo_code():
    """Remove the currently applied promo code"""
    if not session.get('promo_code'):
        return False, "No promo code currently applied"
    
    promo_code = session.get('promo_code')
    session['promo_code'] = None
    
    logger.info(f"Removed promo code: {promo_code} from quote {session.get('quote_id')}")
    return True, f"Promo code '{promo_code}' removed"

def save_patient_info(patient_data):
    """Save patient information to the session"""
    if not patient_data:
        return False, "No patient data provided"
    
    session['patient_info'] = patient_data
    logger.info(f"Saved patient info for quote {session.get('quote_id')}")
    return True, "Patient information saved"

def get_quote_totals():
    """Calculate and return the current quote totals"""
    selected_treatments = session.get('selected_treatments', [])
    promo_details = None
    
    if session.get('promo_code'):
        promo_details = get_promotion_by_code(session['promo_code'])
    
    return calculate_totals(selected_treatments, promo_details)

def get_treatments():
    """Get the currently selected treatments"""
    return session.get('selected_treatments', [])

def get_promo_code():
    """Get the currently applied promo code"""
    return session.get('promo_code')

def get_patient_info():
    """Get the stored patient information"""
    return session.get('patient_info', {})

def get_quote_id():
    """Get the current quote ID"""
    return session.get('quote_id')

def export_session_data():
    """Export all session data for integration with external systems"""
    return {
        'quote_id': session.get('quote_id'),
        'selected_treatments': session.get('selected_treatments', []),
        'promo_code': session.get('promo_code'),
        'patient_info': session.get('patient_info', {}),
        'totals': get_quote_totals()
    }

def clear_session():
    """Clear the session data and start fresh"""
    session.clear()
    initialize_session()
    logger.info(f"Cleared session and initialized a new one with quote ID: {session.get('quote_id')}")
    return True, "Quote has been restarted"