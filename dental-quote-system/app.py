"""
Dental Quote System
Enhanced version with improved session management and promo code handling
"""

from flask import Flask, render_template, request, session
import logging
import os
from datetime import timedelta
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
import secrets

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REFRESH_EACH_REQUEST'] = True

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)

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

# Health check route
@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'version': '1.0.0'}

# Session monitoring endpoint
@app.route('/api/session-status')
def session_status():
    """Session status monitoring endpoint"""
    # Default data if no session exists
    status_data = {
        'exists': False,
        'age_minutes': 0,
        'idle_minutes': 0,
        'has_data': False
    }
    
    # Check if session exists
    if session.get('initialized'):
        from utils.session_manager import SessionManager
        metadata = SessionManager.get_session_metadata()
        
        status_data = {
            'exists': True,
            'session_id': metadata.get('session_id', ''),
            'age_minutes': metadata.get('age_minutes', 0),
            'idle_minutes': metadata.get('idle_minutes', 0),
            'has_treatments': metadata.get('has_treatments', False),
            'has_promo': metadata.get('has_promo', False),
            'has_patient_info': metadata.get('has_patient_info', False),
            'has_backup': metadata.get('has_backup', False),
            'timestamp': request.args.get('t', '')  # Include cache-busting value
        }
    
    return status_data

# Run the app
if __name__ == '__main__':
    # Set session to use cookies
    app.config['SESSION_TYPE'] = 'filesystem'
    
    # Create directories if they don't exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('templates/quote', exist_ok=True)
    os.makedirs('templates/promo', exist_ok=True)
    os.makedirs('templates/errors', exist_ok=True)
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)