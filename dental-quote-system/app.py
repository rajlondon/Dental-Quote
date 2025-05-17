"""
MyDentalFly - Dental Quote System
Main Application File
"""

import os
from datetime import datetime
from flask import Flask, render_template, request, session, g
from dotenv import load_dotenv

# Import routes
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.api_routes import api_routes
from routes.integration_routes import integration_routes

# Import services
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Import utilities
from utils.session_manager import init_session_data, get_session_data

# Load environment variables
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'my_secret_key_for_development')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(api_routes)
app.register_blueprint(integration_routes)

# Application context
@app.context_processor
def inject_globals():
    """
    Inject global variables into all templates
    """
    # Get current session data
    session_data = get_session_data()
    
    # Extract quote details
    selected_treatments = session_data.get('selected_treatments', [])
    promo_code = session_data.get('promo_code', None)
    quote_totals = session_data.get('quote_totals', {
        'subtotal': 0,
        'discount_amount': 0,
        'total': 0
    })
    
    # Calculate quote item count
    quote_item_count = sum(treatment.get('quantity', 1) for treatment in selected_treatments)
    
    return {
        'now': datetime.now(),
        'treatment_service': treatment_service,
        'promo_service': promo_service,
        'selected_treatments': selected_treatments,
        'promo_code': promo_code,
        'quote_totals': quote_totals,
        'quote_item_count': quote_item_count,
        'quote_total': quote_totals.get('total', 0)
    }

@app.before_request
def before_request():
    """
    Initialize session data if needed before each request
    """
    init_session_data()

if __name__ == '__main__':
    # Run the application
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)