"""
Dental Quote System - Main Application

A Flask application for dental treatment quotes with promo code support,
special offers, and session persistence.
"""

import os
from flask import Flask, session, render_template
from datetime import timedelta

# Import blueprints
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_FILE_DIR'] = os.path.join(os.getcwd(), 'flask_session')
    app.config['SESSION_USE_SIGNER'] = True
    
    # Register blueprints
    app.register_blueprint(page_routes)
    app.register_blueprint(promo_routes)
    app.register_blueprint(integration_routes)
    
    # Make session permanent but with a lifetime
    @app.before_request
    def make_session_permanent():
        session.permanent = True
    
    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('errors/500.html'), 500
    
    # Create session directory if it doesn't exist
    os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)