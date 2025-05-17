"""
Dental Quote Builder Application
A Flask-based application for building and managing dental treatment quotes
"""

import os
from flask import Flask, session
from datetime import timedelta
import secrets
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed, using environment variables as is")

from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.api_routes import api_routes
from routes.integration_routes import integration_routes

def create_app():
    """
    Create and configure Flask application instance
    
    Returns:
        Flask: Configured Flask application
    """
    # Create Flask app
    app = Flask(__name__, 
                static_folder='static',
                template_folder='templates')
    
    # Configure app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
    app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(__file__), 'sessions')
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_USE_SIGNER'] = True
    
    # Register blueprints
    app.register_blueprint(page_routes)
    app.register_blueprint(promo_routes)
    app.register_blueprint(api_routes)
    app.register_blueprint(integration_routes)
    
    # Ensure session directory exists
    os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)