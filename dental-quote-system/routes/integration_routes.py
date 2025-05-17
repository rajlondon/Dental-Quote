from flask import Blueprint, jsonify, redirect, url_for, session
from utils.session_manager import SessionManager
import json
import requests

integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/api/export-to-legacy-system', methods=['POST'])
def export_to_legacy_system():
    """Export the current quote to the legacy system"""
    quote_data = SessionManager.get_quote_data()
    
    # Transform data to match legacy system format
    legacy_format = {
        "treatments": [
            {
                "id": treatment.get("id"),
                "name": treatment.get("name"),
                "price": treatment.get("price"),
                "quantity": 1  # Default quantity
            }
            for treatment in quote_data.get("treatments", [])
        ],
        "patient": quote_data.get("patient_info", {}),
        "promoCode": quote_data.get("promo_code"),
        "discount": quote_data.get("discount", 0)
    }
    
    # In a real implementation, you would send this to your legacy system
    # For example:
    # response = requests.post("https://your-legacy-api.com/quotes", json=legacy_format)
    # quote_id = response.json().get("quote_id")
    
    # For demonstration, just return the formatted data
    return jsonify({
        "success": True,
        "legacy_format": legacy_format,
        "message": "Quote formatted for legacy system"
    })

@integration_routes.route('/export-and-redirect', methods=['GET'])
def export_and_redirect():
    """Export quote and redirect to legacy system"""
    quote_data = SessionManager.get_quote_data()
    
    # Transform data (same as above)
    legacy_format = {
        "treatments": [
            {
                "id": treatment.get("id"),
                "name": treatment.get("name"),
                "price": treatment.get("price"),
                "quantity": 1
            }
            for treatment in quote_data.get("treatments", [])
        ],
        "patient": quote_data.get("patient_info", {}),
        "promoCode": quote_data.get("promo_code"),
        "discount": quote_data.get("discount", 0)
    }
    
    # Store in session for the legacy system to access
    session["legacy_quote_data"] = legacy_format
    
    # Redirect to legacy system - replace with your actual legacy system URL
    # In production deployment, you'd use the actual URL
    return redirect("/legacy-system/import-quote?source=flask-app")