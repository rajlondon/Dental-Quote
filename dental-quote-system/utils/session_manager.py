"""
Session Manager for Dental Quote System

This utility provides methods to manage session data with improved persistence
and prevents state loss issues common in browser environments.
"""

from flask import session
import time
import json
import uuid
from datetime import datetime

class SessionManager:
    """
    Static class to manage session data with robust state handling.
    
    Provides methods to initialize, get, update, and reset session data
    with additional safeguards against state loss.
    """
    
    @staticmethod
    def initialize_session():
        """Initialize session with default values if not already set"""
        # Create session metadata if it doesn't exist
        if 'session_meta' not in session:
            session['session_meta'] = {
                'id': str(uuid.uuid4()),
                'created': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat(),
                'visit_count': 1
            }
        else:
            # Update visit count and last updated timestamp
            session['session_meta']['visit_count'] = session['session_meta'].get('visit_count', 0) + 1
            session['session_meta']['last_updated'] = datetime.now().isoformat()
        
        # Initialize treatments list if not exists
        if 'dental_treatments' not in session:
            session['dental_treatments'] = []
        
        # Initialize promo details if not exists
        if 'promo_details' not in session:
            session['promo_details'] = None
        
        # Initialize patient info if not exists
        if 'patient_info' not in session:
            session['patient_info'] = {
                'name': '',
                'email': '',
                'phone': '',
                'notes': ''
            }
        
        # Initialize backup state if not exists
        if 'backup_state' not in session:
            session['backup_state'] = None
            
        # Add timestamp to force session update
        session['timestamp'] = time.time()
        
        # Touch session to ensure it's saved
        session.modified = True
    
    @staticmethod
    def get_treatments():
        """Get all treatments from session"""
        return session.get('dental_treatments', [])
    
    @staticmethod
    def add_treatment(treatment):
        """
        Add a treatment to the session
        
        Args:
            treatment (dict): Treatment data to add
            
        Returns:
            bool: True if added, False if already exists
        """
        # Initialize session if needed
        SessionManager.initialize_session()
        
        # Check if treatment already exists
        treatments = SessionManager.get_treatments()
        
        # Check for duplicate by ID
        if any(t.get('id') == treatment.get('id') for t in treatments):
            return False
        
        # Add treatment
        treatments.append(treatment)
        session['dental_treatments'] = treatments
        
        # Update timestamp and mark as modified
        session['timestamp'] = time.time()
        session.modified = True
        
        # Create backup
        SessionManager.create_backup()
        
        return True
    
    @staticmethod
    def remove_treatment(treatment_id):
        """
        Remove a treatment from the session
        
        Args:
            treatment_id (str): ID of treatment to remove
            
        Returns:
            bool: True if removed, False if not found
        """
        # Initialize session if needed
        SessionManager.initialize_session()
        
        # Get treatments
        treatments = SessionManager.get_treatments()
        
        # Find treatment
        initial_count = len(treatments)
        treatments = [t for t in treatments if t.get('id') != treatment_id]
        
        # Update session if treatment was removed
        if len(treatments) < initial_count:
            session['dental_treatments'] = treatments
            
            # Update timestamp and mark as modified
            session['timestamp'] = time.time()
            session.modified = True
            
            # Create backup
            SessionManager.create_backup()
            
            return True
        
        return False
    
    @staticmethod
    def get_promo_details():
        """Get promo details from session"""
        return session.get('promo_details')
    
    @staticmethod
    def apply_promo_code(promo_details):
        """
        Apply a promo code to the session
        
        Args:
            promo_details (dict): Promo code details
        """
        # Initialize session if needed
        SessionManager.initialize_session()
        
        # Store promo details
        session['promo_details'] = promo_details
        
        # Update timestamp and mark as modified
        session['timestamp'] = time.time()
        session.modified = True
        
        # Create backup
        SessionManager.create_backup()
    
    @staticmethod
    def remove_promo_code():
        """Remove promo code from session"""
        # Initialize session if needed
        SessionManager.initialize_session()
        
        # Remove promo details
        session['promo_details'] = None
        
        # Update timestamp and mark as modified
        session['timestamp'] = time.time()
        session.modified = True
        
        # Create backup
        SessionManager.create_backup()
    
    @staticmethod
    def get_patient_info():
        """Get patient info from session"""
        return session.get('patient_info', {})
    
    @staticmethod
    def update_patient_info(info):
        """
        Update patient info in session
        
        Args:
            info (dict): Patient information
        """
        # Initialize session if needed
        SessionManager.initialize_session()
        
        # Update patient info
        session['patient_info'] = info
        
        # Update timestamp and mark as modified
        session['timestamp'] = time.time()
        session.modified = True
        
        # Create backup
        SessionManager.create_backup()
    
    @staticmethod
    def reset_session():
        """Reset the entire session but keep the session ID"""
        # Save session ID
        session_id = None
        if 'session_meta' in session:
            session_id = session['session_meta'].get('id')
        
        # Clear session
        session.clear()
        
        # Re-initialize session
        SessionManager.initialize_session()
        
        # Restore session ID if it existed
        if session_id:
            session['session_meta']['id'] = session_id
        
        # Update timestamp and mark as modified
        session['timestamp'] = time.time()
        session.modified = True
    
    @staticmethod
    def get_session_metadata():
        """
        Get session metadata
        
        Returns:
            dict: Session metadata including treatments count, has promo, etc.
        """
        # Initialize session if needed
        SessionManager.initialize_session()
        
        # Get data
        treatments = SessionManager.get_treatments()
        promo_details = SessionManager.get_promo_details()
        patient_info = SessionManager.get_patient_info()
        
        # Calculate metadata
        has_treatments = len(treatments) > 0
        has_promo = promo_details is not None
        has_patient_info = any(patient_info.values())
        
        return {
            'session_id': session.get('session_meta', {}).get('id', ''),
            'created': session.get('session_meta', {}).get('created', ''),
            'last_updated': session.get('session_meta', {}).get('last_updated', ''),
            'visit_count': session.get('session_meta', {}).get('visit_count', 0),
            'has_treatments': has_treatments,
            'treatment_count': len(treatments),
            'has_promo': has_promo,
            'has_patient_info': has_patient_info,
            'timestamp': session.get('timestamp', 0)
        }
    
    @staticmethod
    def create_backup():
        """Create a backup of the current session state"""
        # Create backup of current state
        backup = {
            'dental_treatments': session.get('dental_treatments', []),
            'promo_details': session.get('promo_details'),
            'patient_info': session.get('patient_info', {})
        }
        
        # Store backup
        session['backup_state'] = backup
        session.modified = True
    
    @staticmethod
    def restore_from_backup():
        """
        Restore session from backup if available
        
        Returns:
            bool: True if restored, False if no backup available
        """
        # Check if backup exists
        if 'backup_state' not in session or not session['backup_state']:
            return False
        
        # Get backup
        backup = session['backup_state']
        
        # Restore data
        if 'dental_treatments' in backup:
            session['dental_treatments'] = backup['dental_treatments']
        
        if 'promo_details' in backup:
            session['promo_details'] = backup['promo_details']
        
        if 'patient_info' in backup:
            session['patient_info'] = backup['patient_info']
        
        # Update timestamp and mark as modified
        session['timestamp'] = time.time()
        session.modified = True
        
        return True