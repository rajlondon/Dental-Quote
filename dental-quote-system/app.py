"""
Dental Quote System - Main Application
Flask application for dental quote creation with special offers and promo codes
"""

from flask import Flask, render_template, request, redirect, url_for, session
import uuid
import os
import logging
from datetime import timedelta
import random
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes
from utils.session_manager import SessionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask application
app = Flask(__name__)

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', str(uuid.uuid4()))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable caching for development

# Add Cache-Control headers for all responses
@app.after_request
def add_cache_control(response):
    """Add Cache-Control headers to prevent caching issues"""
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Register route blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(integration_routes)

# Custom Jinja2 filters
@app.template_filter('currency')
def currency_filter(value):
    """Format a value as currency"""
    if value is None:
        return "$0.00"
    return "${:,.2f}".format(value)

@app.template_filter('session_id_short')
def session_id_short_filter(value):
    """Truncate session ID for display"""
    if not value or len(value) < 8:
        return value
    return value[:8] + '...'

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    logger.error(f"Server error: {str(e)}")
    return render_template('errors/500.html'), 500

# API Route for session status
@app.route('/api/session-status')
def session_status():
    """Return session status for frontend monitoring"""
    SessionManager.update_activity()
    metadata = SessionManager.get_session_metadata()
    return {
        'success': True,
        'data': metadata
    }

# Setup route - only for initialization
@app.route('/setup')
def setup():
    """Initialize application data"""
    try:
        # Create directories if they don't exist
        os.makedirs('static/uploads', exist_ok=True)
        
        # Initialize random seed
        random.seed()
        
        return {
            'success': True,
            'message': 'Application initialized successfully'
        }
    except Exception as e:
        logger.error(f"Setup error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    # Run Flask application
    app.run(host='0.0.0.0', port=8080, debug=True)