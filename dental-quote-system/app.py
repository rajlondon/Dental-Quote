"""
Dental Quote System - Main Application File
Flask web application for dental treatment quote generation
"""
from flask import Flask, session
import logging
import os
from datetime import timedelta

# Import route blueprints
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application"""
    # Create app instance
    app = Flask(__name__)
    
    # Configure app
    app.config.update(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-secret-key'),
        SESSION_TYPE='filesystem',
        SESSION_PERMANENT=True,
        PERMANENT_SESSION_LIFETIME=timedelta(days=1),
        TEMPLATES_AUTO_RELOAD=True
    )
    
    # Register blueprints
    app.register_blueprint(page_routes)
    app.register_blueprint(promo_routes, url_prefix='/promo')
    app.register_blueprint(integration_routes, url_prefix='/api')
    
    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('error/404.html'), 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('error/500.html'), 500
    
    # Log app startup
    logger.info("Dental Quote System application started")
    
    return app

# Create the app instance
app = create_app()

# Import missing dependencies
from flask import render_template

if __name__ == '__main__':
    # Run the app
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=True)