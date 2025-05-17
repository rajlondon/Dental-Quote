"""
Session Manager for Dental Quote System
Handles session initialization, persistence, and recovery
"""

from flask import session
import logging
import time
import json
import uuid
import os

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Manages session data with improved persistence and recovery mechanisms
    - Implements automatic session backup and recovery
    - Provides caching headers to prevent browser caching issues
    - Tracks session activity and timeouts
    """
    
    SESSION_TIMEOUT = 3600  # 1 hour session timeout
    
    @classmethod
    def initialize_session(cls):
        """Initialize a new session if one doesn't exist"""
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
            session['created_at'] = time.time()
            session['last_activity'] = time.time()
            session['treatments'] = []
            session['promo_details'] = {}
            session['patient_info'] = {}
            session['session_backup'] = {}
            logger.info(f"New session initialized: {session['session_id']}")
    
    @classmethod
    def update_activity(cls):
        """Update the last activity timestamp"""
        session['last_activity'] = time.time()
    
    @classmethod
    def is_session_valid(cls):
        """Check if the session is still valid (not timed out)"""
        if 'last_activity' not in session:
            return False
        
        current_time = time.time()
        last_activity = session.get('last_activity', 0)
        
        return (current_time - last_activity) < cls.SESSION_TIMEOUT
    
    @classmethod
    def create_backup(cls):
        """Create a backup of the current session data"""
        try:
            backup = {
                'treatments': session.get('treatments', []),
                'promo_details': session.get('promo_details', {}),
                'patient_info': session.get('patient_info', {}),
                'timestamp': time.time()
            }
            
            session['session_backup'] = backup
            logger.debug(f"Session backup created for {session.get('session_id')}")
            return True
        except Exception as e:
            logger.error(f"Error creating session backup: {str(e)}")
            return False
    
    @classmethod
    def restore_from_backup(cls):
        """Restore session data from backup"""
        try:
            backup = session.get('session_backup', {})
            
            if not backup:
                logger.warning("No session backup found")
                return False
            
            # Restore data from backup
            session['treatments'] = backup.get('treatments', [])
            session['promo_details'] = backup.get('promo_details', {})
            session['patient_info'] = backup.get('patient_info', {})
            
            logger.info(f"Session restored from backup for {session.get('session_id')}")
            return True
        except Exception as e:
            logger.error(f"Error restoring session from backup: {str(e)}")
            return False
    
    @classmethod
    def reset_session(cls):
        """Reset the session but keep the session ID"""
        session_id = session.get('session_id')
        created_at = session.get('created_at')
        
        # Clear the session
        session.clear()
        
        # Restore session ID and creation time
        if session_id:
            session['session_id'] = session_id
        else:
            session['session_id'] = str(uuid.uuid4())
        
        if created_at:
            session['created_at'] = created_at
        else:
            session['created_at'] = time.time()
        
        # Initialize new session data
        session['last_activity'] = time.time()
        session['treatments'] = []
        session['promo_details'] = {}
        session['patient_info'] = {}
        session['session_backup'] = {}
        
        logger.info(f"Session reset: {session['session_id']}")
    
    @classmethod
    def get_treatments(cls):
        """Get treatments from session"""
        return session.get('treatments', [])
    
    @classmethod
    def store_treatments(cls, treatments):
        """Store treatments in session"""
        session['treatments'] = treatments
        cls.update_activity()
    
    @classmethod
    def get_promo_details(cls):
        """Get promo details from session"""
        return session.get('promo_details', {})
    
    @classmethod
    def store_promo_details(cls, promo_details):
        """Store promo details in session"""
        session['promo_details'] = promo_details
        cls.update_activity()
    
    @classmethod
    def remove_promo_details(cls):
        """Remove promo details from session"""
        session['promo_details'] = {}
        cls.update_activity()
    
    @classmethod
    def get_patient_info(cls):
        """Get patient info from session"""
        return session.get('patient_info', {})
    
    @classmethod
    def store_patient_info(cls, patient_info):
        """Store patient info in session"""
        session['patient_info'] = patient_info
        cls.update_activity()
    
    @classmethod
    def get_session_metadata(cls):
        """Get session metadata for diagnostics"""
        return {
            'session_id': session.get('session_id', 'None'),
            'created_at': session.get('created_at', 0),
            'last_activity': session.get('last_activity', 0),
            'has_backup': bool(session.get('session_backup')),
            'is_valid': cls.is_session_valid()
        }