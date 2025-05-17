"""
Integration Routes Module
Handles integration with external systems and API endpoints
"""
from flask import Blueprint, request, jsonify
from utils.session_manager import get_quote_data
from datetime import datetime

# Create Blueprint
integration_routes = Blueprint('integration_routes', __name__)

# API endpoint to get quote data as JSON
@integration_routes.route('/api/quote-data', methods=['GET'])
def get_quote_data_api():
    """Return the current quote data as JSON"""
    quote_data = get_quote_data()
    
    # Add additional metadata
    quote_data['generated_at'] = datetime.now().isoformat()
    quote_data['quote_ref'] = quote_data['quote_id'][:8].upper() if quote_data['quote_id'] else None
    
    return jsonify(quote_data)

# API endpoint for webhook integration
@integration_routes.route('/api/webhook/quote-complete', methods=['POST'])
def quote_webhook():
    """Webhook to be called when a quote is completed"""
    # Implement webhook logic here (e.g., send data to CRM, email system, etc.)
    # This is a placeholder for future integration
    
    return jsonify({
        'success': True,
        'message': 'Quote webhook received'
    })