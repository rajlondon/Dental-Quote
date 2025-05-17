"""
Dental Quote System
Main application file
"""
from flask import Flask, session
from flask_session import Session
import os
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from utils.session_manager import initialize_session
from datetime import timedelta

# Create Flask app
app = Flask(__name__)

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dental-quote-system-secret-key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_FILE_DIR'] = os.path.join(os.getcwd(), 'flask_session')
app.config['SESSION_FILE_THRESHOLD'] = 500  # Number of sessions stored before cleanup

# Initialize session
Session(app)

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)

# Register before_request handler
@app.before_request
def before_request():
    """Initialize session before each request"""
    initialize_session()

# Create session directory if it doesn't exist
os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)

if __name__ == '__main__':
    # Run the app in debug mode
    app.run(host='0.0.0.0', port=5005, debug=True)