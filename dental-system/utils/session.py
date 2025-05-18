from flask import session
import uuid
from datetime import datetime

class SessionManager:
    """Helper class for managing session data"""
    
    @staticmethod
    def init_quote_session():
        """Initialize the quote session if it doesn't exist"""
        if 'quote_data' not in session:
            session['quote_data'] = {
                'id': str(uuid.uuid4()),
                'created_at': datetime.now().isoformat(),
                'step': 'treatments',
                'treatments': [],
                'patient_info': {},
                'promo_code': None,
                'discount_amount': 0,
                'total': 0
            }
    
    @staticmethod
    def get_quote_data():
        """Get the current quote data from session"""
        SessionManager.init_quote_session()
        return session.get('quote_data', {})
    
    @staticmethod
    def save_quote_data(quote_data):
        """Save the quote data to session"""
        session['quote_data'] = quote_data
        
    @staticmethod
    def update_quote_step(step):
        """Update the current step in the quote process"""
        quote_data = SessionManager.get_quote_data()
        quote_data['step'] = step
        SessionManager.save_quote_data(quote_data)
        
    @staticmethod
    def add_treatment(treatment):
        """Add a treatment to the quote"""
        quote_data = SessionManager.get_quote_data()
        quote_data['treatments'].append(treatment)
        # Recalculate total
        quote_data['total'] = sum(t.get('price', 0) for t in quote_data['treatments'])
        SessionManager.save_quote_data(quote_data)
        
    @staticmethod
    def remove_treatment(treatment_id):
        """Remove a treatment from the quote"""
        quote_data = SessionManager.get_quote_data()
        quote_data['treatments'] = [t for t in quote_data['treatments'] if t.get('id') != treatment_id]
        # Recalculate total
        quote_data['total'] = sum(t.get('price', 0) for t in quote_data['treatments'])
        SessionManager.save_quote_data(quote_data)
        
    @staticmethod
    def apply_promo_code(promo_code, discount_amount):
        """Apply a promo code to the quote"""
        quote_data = SessionManager.get_quote_data()
        quote_data['promo_code'] = promo_code
        quote_data['discount_amount'] = discount_amount
        SessionManager.save_quote_data(quote_data)
        
    @staticmethod
    def save_patient_info(patient_info):
        """Save patient information to the quote"""
        quote_data = SessionManager.get_quote_data()
        quote_data['patient_info'] = patient_info
        SessionManager.save_quote_data(quote_data)
        
    @staticmethod
    def clear_quote():
        """Clear the quote data from session"""
        if 'quote_data' in session:
            del session['quote_data']