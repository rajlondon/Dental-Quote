from flask import Flask, session
import os
from datetime import timedelta
import secrets

# Import routes
from routes.page_routes import page_routes
from routes.api_routes import api_routes
from routes.promo_routes import promo_routes

# Create Flask app
app = Flask(__name__)

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_TYPE'] = 'filesystem'

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(api_routes, url_prefix='/api')
app.register_blueprint(promo_routes, url_prefix='/promo')

# Ensure directories exist
os.makedirs(os.path.join(app.root_path, 'data', 'quotes'), exist_ok=True)
os.makedirs(os.path.join(app.static_folder, 'pdf'), exist_ok=True)

@app.before_request
def make_session_permanent():
    session.permanent = True

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)