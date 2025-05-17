import os
import logging
from flask import Flask, render_template, session
from flask_session import Session

# Import blueprints
from routes.page_routes import page_routes_bp
from routes.promo_routes import promo_routes_bp
from routes.api_routes import api_routes_bp
from routes.integration_routes import integration_routes_bp

def create_app():
    """
    Create and configure the Flask application
    """
    app = Flask(__name__)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Configure app
    app.config.update(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key-for-mydental-fly'),
        SESSION_TYPE='filesystem',
        SESSION_FILE_DIR='./flask_session',
        SESSION_PERMANENT=True,
        PERMANENT_SESSION_LIFETIME=3600 * 24 * 7,  # 7 days
        STATIC_FOLDER='static',
        TEMPLATES_FOLDER='templates'
    )
    
    # Initialize Flask-Session
    Session(app)
    
    # Register blueprints
    app.register_blueprint(page_routes_bp)
    app.register_blueprint(promo_routes_bp)
    app.register_blueprint(api_routes_bp)
    app.register_blueprint(integration_routes_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)