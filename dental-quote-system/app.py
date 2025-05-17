"""
Main Flask application file for the MyDentalFly Dental Quote System
"""
from flask import Flask, session
from flask.helpers import send_from_directory
import os
from datetime import timedelta
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes
from utils.session_manager import initialize_session
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create the Flask application
app = Flask(__name__)

# Configure application
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mydentalfly-secret-key')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(__file__), 'flask_session')
app.config['SESSION_USE_SIGNER'] = True

# Ensure the session directory exists
os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(integration_routes)

# Serve static files directly
@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

# Create data directories if they don't exist
def create_data_directories():
    """Create necessary data directories"""
    os.makedirs(os.path.join(app.root_path, 'data'), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', 'images'), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', 'images', 'treatments'), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', 'images', 'promos'), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'static', 'images', 'testimonials'), exist_ok=True)

# Create the directories when the app starts
create_data_directories()

# Initialize session on first request
@app.before_request
def init_session():
    """Initialize session before each request if not already initialized"""
    if 'initialized' not in session:
        initialize_session()
        session['initialized'] = True

# Run the application
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=True)