"""
Integration Routes Module
Handles integration with external systems and API endpoints
"""
from flask import Blueprint, request, jsonify
from utils.session_manager import export_session_data, get_treatments
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/api/session-data', methods=['GET'])
def get_session_data():
    """API endpoint to get current session data"""
    session_data = export_session_data()
    return jsonify(session_data)

@integration_routes.route('/api/treatments', methods=['GET'])
def get_treatment_data():
    """API endpoint to get selected treatments"""
    treatments = get_treatments()
    return jsonify(treatments)

@integration_routes.route('/api/export-quote', methods=['POST'])
def export_quote():
    """API endpoint to export quote data to external system"""
    # Get session data
    quote_data = export_session_data()
    
    # In a production environment, you would integrate with:
    # 1. CRM system (e.g., Salesforce, HubSpot)
    # 2. Email notification service
    # 3. Patient management system
    # 4. PDF generation service
    
    # For now, we'll just log and return the data
    logger.info(f"Quote exported with ID: {quote_data.get('quote_id')}")
    
    return jsonify({
        'success': True,
        'message': 'Quote exported successfully',
        'quote_data': quote_data
    })