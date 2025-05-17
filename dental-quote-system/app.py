"""
Main Flask application for MyDentalFly Dental Quote System
"""
import os
import logging
from flask import Flask, session
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask application
app = Flask(__name__)

# Configure application
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mydentalfly-secure-key-2025')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes, url_prefix='/promo')
app.register_blueprint(integration_routes, url_prefix='/api')

@app.before_request
def initialize_session():
    """Initialize session data if not already present"""
    if 'treatments' not in session:
        session['treatments'] = []
    if 'promo_code' not in session:
        session['promo_code'] = None
    if 'patient_info' not in session:
        session['patient_info'] = {}
    if 'quote_totals' not in session:
        session['quote_totals'] = {
            'subtotal': 0,
            'discount': 0,
            'total': 0,
            'item_count': 0
        }

@app.context_processor
def inject_globals():
    """Inject global variables into templates"""
    return {
        'quote_totals': session.get('quote_totals', {
            'subtotal': 0,
            'discount': 0,
            'total': 0,
            'item_count': 0
        }),
        'promo_code': session.get('promo_code'),
        'treatment_count': len(session.get('treatments', []))
    }

# Uncomment for direct execution if not using run.py
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5005, debug=True)