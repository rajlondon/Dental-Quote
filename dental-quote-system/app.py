"""
MyDentalFly Quote System Application
Main application file for dental tourism quote system
"""
import os
import logging
from flask import Flask, session
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
    app = Flask(__name__, 
                static_folder='static',
                template_folder='templates')
    
    # Configure the application
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key_h37sk29fmxpal22'),
        SESSION_TYPE='filesystem',
        SESSION_PERMANENT=True,
        PERMANENT_SESSION_LIFETIME=86400 * 30,  # 30 days in seconds
    )
    
    # Register blueprints
    app.register_blueprint(page_routes)
    app.register_blueprint(promo_routes)
    app.register_blueprint(integration_routes, url_prefix='/api')
    
    # Register error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return render_template('500.html'), 500
    
    # Create directories if they don't exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    logger.info("Application initialized")
    return app

# Create the Flask application instance
app = create_app()

# Import needed for error handlers
from flask import render_template

if __name__ == '__main__':
    # Run the application in development mode
    app.run(host='0.0.0.0', port=5005, debug=True)