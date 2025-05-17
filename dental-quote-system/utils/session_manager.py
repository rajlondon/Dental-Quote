import json
import time
from flask import session, request

class SessionManager:
    """Enhanced session management with backup and recovery"""
    
    @staticmethod
    def get_quote_data():
        """Get quote data with fallback to backup if main is corrupted"""
        try:
            if 'quote_data' in session:
                # Try to access and validate quote data
                treatments = session['quote_data'].get('treatments', [])
                if not isinstance(treatments, list):
                    raise ValueError("Invalid treatment data structure")
                
                return session['quote_data']
            elif 'quote_data_backup' in session:
                # Restore from backup
                print("Restoring quote data from backup")
                session['quote_data'] = session['quote_data_backup']
                return session['quote_data']
        except Exception as e:
            print(f"Session error: {str(e)}")
            if 'quote_data_backup' in session:
                # Restore from backup on error
                try:
                    session['quote_data'] = session['quote_data_backup']
                    return session['quote_data']
                except:
                    pass
        
        # Initialize new if no valid data exists
        return SessionManager.initialize_quote_data()
    
    @staticmethod
    def save_quote_data(quote_data):
        """Save quote data with backup"""
        # First create a backup of current state
        if 'quote_data' in session:
            session['quote_data_backup'] = session['quote_data']
        
        # Then update with new data
        session['quote_data'] = quote_data
        
        # Also store a timestamped backup for recovery
        backup_key = f'quote_backup_{int(time.time())}'
        session[backup_key] = quote_data
        
        # Keep only the 5 most recent backups
        backup_keys = [k for k in session.keys() if k.startswith('quote_backup_')]
        backup_keys.sort(reverse=True)
        
        for key in backup_keys[5:]:
            session.pop(key, None)
    
    @staticmethod
    def initialize_quote_data():
        """Create a new empty quote structure"""
        quote_data = {
            'treatments': [],
            'promo_code': None,
            'discount': 0,
            'step': 'treatments',
            'patient_info': {
                'name': '',
                'email': '',
                'phone': '',
                'preferred_date': '',
                'notes': ''
            },
            'created_at': time.time()
        }
        
        session['quote_data'] = quote_data
        session['quote_data_backup'] = quote_data.copy()
        return quote_data
    
    @staticmethod
    def clear_quote_data():
        """Clear all quote data"""
        # Save final backup before clearing
        if 'quote_data' in session:
            final_backup_key = f'quote_final_{int(time.time())}'
            session[final_backup_key] = session['quote_data']
            
        # Remove current data
        session.pop('quote_data', None)
        session.pop('quote_data_backup', None)