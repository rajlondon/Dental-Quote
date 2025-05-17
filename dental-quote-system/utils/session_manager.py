"""
Session Management Utility for Dental Quote System
Provides enhanced session persistence capabilities to prevent state loss
"""

from flask import session
import json
import time
import uuid
import logging

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Enhanced session manager to address persistence issues
    by providing backup and recovery methods
    """
    
    @staticmethod
    def initialize_session():
        """Initialize a new session with default values"""
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
            session['created_at'] = time.time()
            session['last_activity'] = time.time()
            session['treatments'] = []
            session['promo_code'] = None
            session['discount_percent'] = 0
            session['patient_info'] = {}
            session.modified = True
            logger.info(f"New session initialized: {session['session_id']}")
    
    @staticmethod
    def update_activity():
        """Update the last activity timestamp"""
        session['last_activity'] = time.time()
        session.modified = True
    
    @staticmethod
    def store_treatments(treatments):
        """Store treatments in session"""
        session['treatments'] = treatments
        SessionManager.update_activity()
        logger.info(f"Treatments updated: {len(treatments)} items")
    
    @staticmethod
    def get_treatments():
        """Get treatments from session"""
        return session.get('treatments', [])
    
    @staticmethod
    def store_promo_code(promo_code, discount_percent):
        """Store promo code in session"""
        session['promo_code'] = promo_code
        session['discount_percent'] = discount_percent
        SessionManager.update_activity()
        logger.info(f"Promo code applied: {promo_code} with {discount_percent}% discount")
    
    @staticmethod
    def clear_promo_code():
        """Clear promo code from session"""
        previous_code = session.get('promo_code')
        session['promo_code'] = None
        session['discount_percent'] = 0
        SessionManager.update_activity()
        logger.info(f"Promo code removed: {previous_code}")
    
    @staticmethod
    def get_promo_details():
        """Get promo code and discount from session"""
        return {
            'promo_code': session.get('promo_code'),
            'discount_percent': session.get('discount_percent', 0)
        }
    
    @staticmethod
    def store_patient_info(patient_info):
        """Store patient info in session"""
        session['patient_info'] = patient_info
        SessionManager.update_activity()
        logger.info("Patient info saved")
    
    @staticmethod
    def get_patient_info():
        """Get patient info from session"""
        return session.get('patient_info', {})
    
    @staticmethod
    def create_backup():
        """Create a backup of current session state"""
        backup = {
            'session_id': session.get('session_id'),
            'treatments': session.get('treatments', []),
            'promo_code': session.get('promo_code'),
            'discount_percent': session.get('discount_percent', 0),
            'patient_info': session.get('patient_info', {}),
            'timestamp': time.time()
        }
        session['session_backup'] = backup
        session.modified = True
        logger.info("Session backup created")
        return backup
    
    @staticmethod
    def restore_from_backup():
        """Restore session from backup"""
        backup = session.get('session_backup')
        if not backup:
            logger.warning("No backup found to restore")
            return False
        
        session['treatments'] = backup.get('treatments', [])
        session['promo_code'] = backup.get('promo_code')
        session['discount_percent'] = backup.get('discount_percent', 0)
        session['patient_info'] = backup.get('patient_info', {})
        session['last_activity'] = time.time()
        session.modified = True
        logger.info(f"Session restored from backup: {backup.get('timestamp')}")
        return True
    
    @staticmethod
    def reset_session():
        """Reset the session but keep the session ID"""
        session_id = session.get('session_id', str(uuid.uuid4()))
        session.clear()
        session['session_id'] = session_id
        session['created_at'] = time.time()
        session['last_activity'] = time.time()
        session['treatments'] = []
        session['promo_code'] = None
        session['discount_percent'] = 0
        session['patient_info'] = {}
        session.modified = True
        logger.info(f"Session reset: {session_id}")
    
    @staticmethod
    def get_session_age():
        """Get the age of the session in seconds"""
        created_at = session.get('created_at', time.time())
        return time.time() - created_at
    
    @staticmethod
    def get_inactivity_time():
        """Get the time since last activity in seconds"""
        last_activity = session.get('last_activity', time.time())
        return time.time() - last_activity