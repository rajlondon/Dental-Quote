"""
Dental Quote System
Main application module for the dental quote system
"""
from flask import Flask, render_template, request, redirect, url_for, session, flash
import os
import secrets
from datetime import timedelta

# Import route blueprints
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Import utilities
from utils.session_manager import initialize_session

# Create Flask application
app = Flask(__name__)

# Configure application
# Set secret key for session management
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(16)

# Set session configuration for persistence
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(integration_routes)

# Register error handlers
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 Not Found errors."""
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server errors."""
    return render_template('errors/500.html'), 500

# Request handling middleware
@app.before_request
def before_request():
    """Initialize session before each request."""
    initialize_session()

# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)