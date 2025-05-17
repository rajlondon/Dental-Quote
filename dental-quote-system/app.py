"""
Main application file for the MyDentalFly Dental Quote System.
This file initializes the Flask application and registers all routes.
"""

import os
import logging
from flask import Flask, render_template, session
from datetime import timedelta
import uuid
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not required in production

# Import route blueprints
from routes.page_routes import page_routes
from routes.api_routes import api_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Import utilities
from utils.session_manager import init_session

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Configure the application
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', str(uuid.uuid4()))
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_FILE_DIR'] = os.path.join(os.getcwd(), 'flask_session')
    app.config['SESSION_PERMANENT'] = True
    
    # Ensure the session directory exists
    os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(page_routes)
    app.register_blueprint(api_routes)
    app.register_blueprint(promo_routes)
    app.register_blueprint(integration_routes)
    
    # Register before request handler
    @app.before_request
    def before_request():
        """Initialize the session before each request."""
        init_session()
    
    # Register error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        """Handle 404 errors."""
        return render_template('error/404.html'), 404
    
    @app.errorhandler(500)
    def server_error(e):
        """Handle 500 errors."""
        logger.error(f"Server error: {str(e)}")
        return render_template('error/500.html'), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)