"""
Session Manager for Dental Quote System
Handles session persistence, tracking, and management
"""

from flask import session
import logging
import uuid
import time
import json

# Configure logging
logger = logging.getLogger(__name__)

class SessionManager:
    """
    Handles session management with enhanced persistence
    Uses a multi-layered approach to prevent session loss
    """
    
    @staticmethod
    def initialize_session():
        """Initialize a new session with required metadata"""
        # Initialize session if needed
        if 'initialized' not in session:
            session['initialized'] = True
            session['session_id'] = str(uuid.uuid4())
            session['created_at'] = time.time()
            session['last_activity'] = time.time()
            session['treatments'] = []
            session['promo_code'] = None
            session['promo_value'] = 0
            session['patient_info'] = {}
            session['backup'] = {}
            session['quote_data'] = {}
            logger.info(f"New session initialized: {session['session_id']}")
        else:
            # Update last activity time
            SessionManager.update_activity()
    
    @staticmethod
    def update_activity():
        """Update the last activity timestamp"""
        if 'initialized' in session:
            session['last_activity'] = time.time()
    
    @staticmethod
    def backup_session_data():
        """Create a backup of current session data"""
        if 'initialized' in session:
            # Create a deep copy of session data
            backup = {
                'treatments': session.get('treatments', []),
                'promo_code': session.get('promo_code'),
                'promo_value': session.get('promo_value', 0),
                'patient_info': session.get('patient_info', {}),
                'timestamp': time.time()
            }
            
            # Store backup in session
            session['backup'] = backup
            logger.info(f"Session backup created: {session.get('session_id')}")
    
    @staticmethod
    def restore_from_backup():
        """Restore session data from backup"""
        if 'initialized' in session and 'backup' in session:
            backup = session.get('backup', {})
            
            if backup:
                session['treatments'] = backup.get('treatments', [])
                session['promo_code'] = backup.get('promo_code')
                session['promo_value'] = backup.get('promo_value', 0)
                session['patient_info'] = backup.get('patient_info', {})
                logger.info(f"Session restored from backup: {session.get('session_id')}")
                return True
            
        return False
    
    @staticmethod
    def store_treatments(treatments):
        """Store treatment selections in session"""
        if 'initialized' in session:
            session['treatments'] = treatments
            # Update last activity time
            SessionManager.update_activity()
            # Create backup
            SessionManager.backup_session_data()
            logger.info(f"Treatments updated in session: {len(treatments)} items")
    
    @staticmethod
    def store_promo_code(promo_code, promo_value=0):
        """Store promo code and discount in session"""
        if 'initialized' in session:
            session['promo_code'] = promo_code
            session['promo_value'] = promo_value
            # Update last activity time
            SessionManager.update_activity()
            # Create backup
            SessionManager.backup_session_data()
            logger.info(f"Promo code '{promo_code}' stored in session")
    
    @staticmethod
    def remove_promo_code():
        """Remove promo code from session"""
        if 'initialized' in session:
            session['promo_code'] = None
            session['promo_value'] = 0
            # Update last activity time
            SessionManager.update_activity()
            # Create backup
            SessionManager.backup_session_data()
            logger.info("Promo code removed from session")
    
    @staticmethod
    def store_patient_info(patient_info):
        """Store patient information in session"""
        if 'initialized' in session:
            session['patient_info'] = patient_info
            # Update last activity time
            SessionManager.update_activity()
            # Create backup
            SessionManager.backup_session_data()
            logger.info("Patient information stored in session")
    
    @staticmethod
    def store_quote_data(quote_data):
        """Store final quote data in session"""
        if 'initialized' in session:
            session['quote_data'] = quote_data
            # Update last activity time
            SessionManager.update_activity()
            logger.info("Quote data stored in session")
    
    @staticmethod
    def get_session_data():
        """Get all session data"""
        if 'initialized' in session:
            # Construct session data dictionary
            session_data = {
                'session_id': session.get('session_id'),
                'created_at': session.get('created_at'),
                'last_activity': session.get('last_activity'),
                'treatments': session.get('treatments', []),
                'promo_code': session.get('promo_code'),
                'promo_value': session.get('promo_value', 0),
                'patient_info': session.get('patient_info', {}),
                'quote_data': session.get('quote_data', {})
            }
            return session_data
        
        return None
    
    @staticmethod
    def get_session_metadata():
        """Get session metadata for monitoring"""
        if 'initialized' in session:
            # Calculate session age
            created_at = session.get('created_at', time.time())
            last_activity = session.get('last_activity', time.time())
            current_time = time.time()
            
            age_seconds = current_time - created_at
            idle_seconds = current_time - last_activity
            
            # Convert to minutes for better readability
            age_minutes = age_seconds / 60
            idle_minutes = idle_seconds / 60
            
            metadata = {
                'session_id': session.get('session_id'),
                'created_at': created_at,
                'last_activity': last_activity,
                'age_minutes': round(age_minutes, 2),
                'idle_minutes': round(idle_minutes, 2),
                'has_treatments': len(session.get('treatments', [])) > 0,
                'has_promo': session.get('promo_code') is not None,
                'has_patient_info': len(session.get('patient_info', {})) > 0,
                'has_backup': len(session.get('backup', {})) > 0,
                'has_quote_data': len(session.get('quote_data', {})) > 0
            }
            
            return metadata
        
        return {}
    
    @staticmethod
    def clear_session():
        """Clear all session data"""
        # Keep only the session ID for tracking purposes
        session_id = session.get('session_id')
        
        # Clear session
        session.clear()
        
        # Reinitialize with the same ID for continuity
        session['initialized'] = True
        session['session_id'] = session_id if session_id else str(uuid.uuid4())
        session['created_at'] = time.time()
        session['last_activity'] = time.time()
        
        logger.info(f"Session cleared: {session['session_id']}")