"""
Integration Routes for Dental Quote System
Handles API endpoints for integration with other systems
"""

from flask import Blueprint, request, jsonify, session
import logging
import time
import json
from utils.session_manager import SessionManager
from services.promo_service import PromoService

logger = logging.getLogger(__name__)

# Create blueprint
integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/api/current-quote', methods=['GET'])
def get_current_quote():
    """API endpoint to get the current quote data"""
    try:
        # Get current data from session
        treatments = SessionManager.get_treatments()
        promo_details = SessionManager.get_promo_details()
        patient_info = SessionManager.get_patient_info()
        
        # Calculate totals
        subtotal = sum(treatment.get('price', 0) for treatment in treatments)
        discount_percent = promo_details.get('discount_percent', 0)
        discount_amount = (subtotal * discount_percent) / 100
        total = subtotal - discount_amount
        
        # Get special offer details if a promo code is applied
        promo_code = promo_details.get('promo_code')
        special_offer = PromoService.get_special_offer_details(promo_code) if promo_code else None
        
        # Prepare response
        response = {
            'success': True,
            'data': {
                'treatments': treatments,
                'subtotal': subtotal,
                'discount_percent': discount_percent,
                'discount_amount': discount_amount,
                'total': total,
                'promo_code': promo_code,
                'special_offer': special_offer,
                'patient_info': patient_info,
                'session_id': session.get('session_id', ''),
                'last_updated': session.get('last_activity', time.time())
            }
        }
        
        return jsonify(response)
    except Exception as e:
        logger.exception("Error getting current quote")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@integration_routes.route('/api/save-quote', methods=['POST'])
def save_quote():
    """API endpoint to save a quote to external storage or database"""
    try:
        # Get current data from session
        treatments = SessionManager.get_treatments()
        promo_details = SessionManager.get_promo_details()
        patient_info = SessionManager.get_patient_info()
        
        if not treatments:
            return jsonify({
                'success': False,
                'error': 'No treatments selected'
            }), 400
        
        if not patient_info.get('name') or not patient_info.get('email'):
            return jsonify({
                'success': False,
                'error': 'Patient information is incomplete'
            }), 400
        
        # Calculate totals
        subtotal = sum(treatment.get('price', 0) for treatment in treatments)
        discount_percent = promo_details.get('discount_percent', 0)
        discount_amount = (subtotal * discount_percent) / 100
        total = subtotal - discount_amount
        
        # Generate quote reference
        quote_reference = f"Q{int(time.time())}"
        
        # Create quote data
        quote_data = {
            'quote_reference': quote_reference,
            'treatments': treatments,
            'subtotal': subtotal,
            'discount_percent': discount_percent,
            'discount_amount': discount_amount,
            'total': total,
            'promo_code': promo_details.get('promo_code'),
            'patient_info': patient_info,
            'created_at': time.time()
        }
        
        # In a real implementation, this would save to a database
        # For this example, we'll just return the data
        
        # Reset session after successful save
        # SessionManager.reset_session()
        
        return jsonify({
            'success': True,
            'data': quote_data
        })
    except Exception as e:
        logger.exception("Error saving quote")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@integration_routes.route('/api/get-treatments', methods=['GET'])
def get_treatments():
    """API endpoint to get available treatments"""
    # Sample treatments list for demonstration
    treatments = [
        {
            'id': 'dental_implant_standard',
            'name': 'Dental Implant (Standard)',
            'price': 950.00,
            'category': 'implants',
            'description': 'Standard titanium dental implant including abutment'
        },
        {
            'id': 'dental_crowns',
            'name': 'Dental Crown (Porcelain)',
            'price': 650.00,
            'category': 'crowns',
            'description': 'High-quality porcelain crown for single tooth'
        },
        {
            'id': 'porcelain_veneers',
            'name': 'Porcelain Veneers (Per Tooth)',
            'price': 550.00,
            'category': 'cosmetic',
            'description': 'Custom-made porcelain veneer for a single tooth'
        },
        {
            'id': 'teeth_whitening',
            'name': 'Professional Teeth Whitening',
            'price': 280.00,
            'category': 'cosmetic',
            'description': 'In-office professional teeth whitening treatment'
        },
        {
            'id': 'root_canal',
            'name': 'Root Canal Treatment',
            'price': 550.00,
            'category': 'endodontics',
            'description': 'Complete root canal treatment including temporary filling'
        },
        {
            'id': 'full_mouth_reconstruction',
            'name': 'Full Mouth Reconstruction',
            'price': 8500.00,
            'category': 'major',
            'description': 'Comprehensive treatment to restore all teeth in both jaws'
        },
        {
            'id': 'hollywood_smile',
            'name': 'Hollywood Smile Package',
            'price': 3800.00,
            'category': 'packages',
            'description': 'Complete smile makeover with multiple veneers or crowns'
        },
        {
            'id': 'all_on_4_implants',
            'name': 'All-on-4 Dental Implants',
            'price': 7500.00,
            'category': 'implants',
            'description': 'Full arch restoration supported by four dental implants'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': treatments
    })