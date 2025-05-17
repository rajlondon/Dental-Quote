"""
Session manager utility for the MyDentalFly application.
Provides functionality for managing session data.
"""

import logging
from flask import session, redirect, url_for
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

def init_session():
    """Initialize session with default values if not already set."""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        
    if 'selected_treatments' not in session:
        session['selected_treatments'] = []
        
    if 'patient_info' not in session:
        session['patient_info'] = {}
        
    if 'quote_id' not in session:
        session['quote_id'] = f"QUOTE-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        
    if 'date_generated' not in session:
        session['date_generated'] = datetime.now().strftime('%Y-%m-%d')
        
    logger.debug(f"Session initialized with ID: {session.get('session_id')}")

def save_session_data(key, value):
    """Save data to session."""
    session[key] = value
    logger.debug(f"Data saved to session with key: {key}")
    return True

def get_session_data(key, default=None):
    """Get data from session."""
    return session.get(key, default)

def clear_session_data(key=None):
    """Clear session data for a specific key or entire session."""
    if key is None:
        # Clear entire session except for session_id
        session_id = session.get('session_id')
        session.clear()
        session['session_id'] = session_id
        logger.debug("Session cleared")
    else:
        # Clear specific key
        if key in session:
            session.pop(key)
            logger.debug(f"Session data cleared for key: {key}")
    return True

def reset_quote():
    """Reset quote-related session data."""
    keys_to_keep = ['session_id']
    for key in list(session.keys()):
        if key not in keys_to_keep:
            session.pop(key)
    
    # Reinitialize session
    init_session()
    logger.debug("Quote reset")
    return True

def check_treatments_selected():
    """Check if treatments are selected and redirect if not."""
    if 'selected_treatments' not in session or not session['selected_treatments']:
        logger.debug("No treatments selected, redirecting to quote builder")
        return False
    return True

def check_patient_info():
    """Check if patient info is provided and redirect if not."""
    if 'patient_info' not in session or not session['patient_info']:
        logger.debug("No patient info provided, redirecting to patient info form")
        return False
    return True