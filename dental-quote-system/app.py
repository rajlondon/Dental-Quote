import logging
import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from routes.page_routes import page_routes_bp
from routes.promo_routes import promo_routes_bp
from routes.api_routes import api_routes_bp
from utils.session_manager import SessionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_app():
    """
    Create and configure the Flask application
    """
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dental-quote-secret-key')
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
    
    # Register blueprints
    app.register_blueprint(page_routes_bp)
    app.register_blueprint(promo_routes_bp)
    app.register_blueprint(api_routes_bp)
    
    # Register error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('errors/500.html'), 500
    
    # Register before_request handler to initialize session
    @app.before_request
    def before_request():
        SessionManager.initialize_session()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)