from flask import Flask, render_template, request, redirect, url_for, session, flash
import os
import uuid
import json
from datetime import datetime
import random

# Import route modules (will create these next)
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Import utilities
from utils.session_manager import init_session

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dental-quote-system-dev-key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(integration_routes)

@app.before_request
def before_request():
    """Initialize session before each request."""
    init_session()

@app.context_processor
def utility_processor():
    """Add utility functions to all templates."""
    def now():
        return datetime.now()
    
    return dict(now=now)

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors."""
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors."""
    return render_template('errors/500.html'), 500

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    
    # Run app
    app.run(host='0.0.0.0', port=5005, debug=True)