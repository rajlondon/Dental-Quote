"""
MyDentalFly - Dental Tourism Quote System
A Flask application for building customized dental treatment quotes with special offers.
"""

import os
import logging
from datetime import datetime
from flask import Flask, session, render_template
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.api_routes import api_routes
from routes.integration_routes import integration_routes

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(api_routes)
app.register_blueprint(integration_routes)

# Add utility functions to templates
@app.context_processor
def utility_processor():
    return {
        'now': datetime.now,
    }

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('errors/500.html'), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)