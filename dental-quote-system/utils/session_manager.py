"""
Session Manager for Dental Quote System

This module provides robust session management to solve state persistence issues.
It includes functionality for:
- Storing and retrieving treatment selections
- Managing promo code applications
- Persisting patient information
- Tracking session metadata for health monitoring
"""

from datetime import datetime
from flask import session

class SessionManager:
    """
    Manages session state and provides persistence guarantees
    
    This class prevents state loss by:
    1. Using a hierarchical session structure
    2. Implementing atomic operations for state changes
    3. Tracking session metadata for debugging
    4. Providing backup/restore functionality
    """
    
    # Session keys
    TREATMENTS_KEY = 'dental_treatments'
    PROMO_KEY = 'promo_details'
    PATIENT_INFO_KEY = 'patient_info'
    SESSION_META_KEY = 'session_meta'
    BACKUP_KEY = 'state_backup'
    
    @classmethod
    def initialize_session(cls):
        """Initialize session with default values if not already present"""
        # Initialize treatment selections
        if cls.TREATMENTS_KEY not in session:
            session[cls.TREATMENTS_KEY] = []
            
        # Initialize promo code details
        if cls.PROMO_KEY not in session:
            session[cls.PROMO_KEY] = None
            
        # Initialize patient information
        if cls.PATIENT_INFO_KEY not in session:
            session[cls.PATIENT_INFO_KEY] = {
                'name': '',
                'email': '',
                'phone': '',
                'notes': ''
            }
            
        # Initialize session metadata
        if cls.SESSION_META_KEY not in session:
            session[cls.SESSION_META_KEY] = {
                'created': datetime.now().isoformat(),
                'last_modified': datetime.now().isoformat(),
                'last_activity': datetime.now().isoformat(),
                'access_count': 0
            }
        
        # Update access count
        cls._update_session_activity()
    
    @classmethod
    def add_treatment(cls, treatment):
        """
        Add a treatment to the session
        
        Args:
            treatment (dict): Treatment to add
        """
        # Create backup
        cls._backup_state()
        
        # Get current treatments
        treatments = session.get(cls.TREATMENTS_KEY, [])
        
        # Check if treatment already exists by ID
        for existing in treatments:
            if existing.get('id') == treatment.get('id'):
                # Already exists, don't add duplicate
                return False
        
        # Add the treatment
        treatments.append(treatment)
        session[cls.TREATMENTS_KEY] = treatments
        
        # Update session metadata
        cls._update_session_modification()
        
        return True
    
    @classmethod
    def remove_treatment(cls, treatment_id):
        """
        Remove a treatment from the session
        
        Args:
            treatment_id (str): ID of treatment to remove
        
        Returns:
            bool: True if removed, False if not found
        """
        # Create backup
        cls._backup_state()
        
        # Get current treatments
        treatments = session.get(cls.TREATMENTS_KEY, [])
        
        # Find and remove the treatment
        for i, treatment in enumerate(treatments):
            if treatment.get('id') == treatment_id:
                treatments.pop(i)
                session[cls.TREATMENTS_KEY] = treatments
                
                # Update session metadata
                cls._update_session_modification()
                
                return True
        
        return False
    
    @classmethod
    def get_treatments(cls):
        """
        Get all selected treatments
        
        Returns:
            list: List of treatment dictionaries
        """
        # Update activity timestamp
        cls._update_session_activity()
        
        return session.get(cls.TREATMENTS_KEY, [])
    
    @classmethod
    def clear_treatments(cls):
        """Clear all selected treatments"""
        # Create backup
        cls._backup_state()
        
        # Clear treatments
        session[cls.TREATMENTS_KEY] = []
        
        # Update session metadata
        cls._update_session_modification()
    
    @classmethod
    def apply_promo_code(cls, promo_details):
        """
        Apply a promo code to the session
        
        Args:
            promo_details (dict): Promo code details
        """
        # Create backup
        cls._backup_state()
        
        # Set promo details
        session[cls.PROMO_KEY] = promo_details
        
        # Update session metadata
        cls._update_session_modification()
    
    @classmethod
    def remove_promo_code(cls):
        """Remove any applied promo code"""
        # Create backup
        cls._backup_state()
        
        # Clear promo details
        session[cls.PROMO_KEY] = None
        
        # Update session metadata
        cls._update_session_modification()
    
    @classmethod
    def get_promo_details(cls):
        """
        Get current promo code details
        
        Returns:
            dict|None: Promo code details or None if not applied
        """
        # Update activity timestamp
        cls._update_session_activity()
        
        return session.get(cls.PROMO_KEY)
    
    @classmethod
    def update_patient_info(cls, patient_info):
        """
        Update patient information
        
        Args:
            patient_info (dict): Patient information
        """
        # Create backup
        cls._backup_state()
        
        # Update patient info
        current_info = session.get(cls.PATIENT_INFO_KEY, {})
        current_info.update(patient_info)
        session[cls.PATIENT_INFO_KEY] = current_info
        
        # Update session metadata
        cls._update_session_modification()
    
    @classmethod
    def get_patient_info(cls):
        """
        Get current patient information
        
        Returns:
            dict: Patient information
        """
        # Update activity timestamp
        cls._update_session_activity()
        
        return session.get(cls.PATIENT_INFO_KEY, {})
    
    @classmethod
    def clear_patient_info(cls):
        """Clear patient information"""
        # Create backup
        cls._backup_state()
        
        # Reset patient info
        session[cls.PATIENT_INFO_KEY] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
        
        # Update session metadata
        cls._update_session_modification()
    
    @classmethod
    def reset_session(cls):
        """Reset the entire session"""
        # Create backup
        cls._backup_state()
        
        # Clear treatments
        session[cls.TREATMENTS_KEY] = []
        
        # Clear promo details
        session[cls.PROMO_KEY] = None
        
        # Reset patient info
        session[cls.PATIENT_INFO_KEY] = {
            'name': '',
            'email': '',
            'phone': '',
            'notes': ''
        }
        
        # Update session metadata
        cls._update_session_modification()
    
    @classmethod
    def get_session_metadata(cls):
        """
        Get session metadata for analytics and debugging
        
        Returns:
            dict: Session metadata
        """
        # Update activity timestamp
        cls._update_session_activity()
        
        metadata = session.get(cls.SESSION_META_KEY, {})
        
        # Calculate session age and idle time
        try:
            created = datetime.fromisoformat(metadata.get('created', datetime.now().isoformat()))
            last_activity = datetime.fromisoformat(metadata.get('last_activity', datetime.now().isoformat()))
            now = datetime.now()
            
            # Convert to minutes
            age_minutes = (now - created).total_seconds() / 60
            idle_minutes = (now - last_activity).total_seconds() / 60
            
            return {
                **metadata,
                'age_minutes': age_minutes,
                'idle_minutes': idle_minutes,
                'exists': True
            }
            
        except Exception as e:
            # In case of any error, return minimal metadata
            return {
                'exists': True,
                'error': str(e),
                'age_minutes': 0,
                'idle_minutes': 0
            }
    
    @classmethod
    def restore_from_backup(cls):
        """
        Restore session state from backup
        
        Returns:
            bool: True if restored successfully, False otherwise
        """
        if cls.BACKUP_KEY not in session:
            return False
        
        backup = session.get(cls.BACKUP_KEY)
        
        # Restore treatments
        if cls.TREATMENTS_KEY in backup:
            session[cls.TREATMENTS_KEY] = backup[cls.TREATMENTS_KEY]
            
        # Restore promo details
        if cls.PROMO_KEY in backup:
            session[cls.PROMO_KEY] = backup[cls.PROMO_KEY]
            
        # Restore patient info
        if cls.PATIENT_INFO_KEY in backup:
            session[cls.PATIENT_INFO_KEY] = backup[cls.PATIENT_INFO_KEY]
        
        # Update session metadata
        cls._update_session_modification()
        
        return True
    
    @classmethod
    def _backup_state(cls):
        """Create a backup of the current session state"""
        backup = {
            cls.TREATMENTS_KEY: session.get(cls.TREATMENTS_KEY, []),
            cls.PROMO_KEY: session.get(cls.PROMO_KEY),
            cls.PATIENT_INFO_KEY: session.get(cls.PATIENT_INFO_KEY, {})
        }
        
        session[cls.BACKUP_KEY] = backup
    
    @classmethod
    def _update_session_modification(cls):
        """Update session modification timestamp"""
        metadata = session.get(cls.SESSION_META_KEY, {})
        metadata['last_modified'] = datetime.now().isoformat()
        metadata['last_activity'] = datetime.now().isoformat()
        metadata['access_count'] = metadata.get('access_count', 0) + 1
        session[cls.SESSION_META_KEY] = metadata
    
    @classmethod
    def _update_session_activity(cls):
        """Update session activity timestamp"""
        metadata = session.get(cls.SESSION_META_KEY, {})
        metadata['last_activity'] = datetime.now().isoformat()
        metadata['access_count'] = metadata.get('access_count', 0) + 1
        session[cls.SESSION_META_KEY] = metadata