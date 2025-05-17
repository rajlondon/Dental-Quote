"""
Dental Quote System Application
Main application entry point
"""

from flask import Flask, g, request, render_template
import os
import secrets

# Import services
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Import utilities
from utils.session_manager import SessionManager

# Import routes
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    
    # Initialize services
    treatment_service = TreatmentService()
    promo_service = PromoService()
    
    # Initialize session manager with services
    session_manager = SessionManager(promo_service=promo_service)
    
    # Store services in app config for access in routes
    app.config['treatment_service'] = treatment_service
    app.config['promo_service'] = promo_service
    app.config['session_manager'] = session_manager
    
    # Register blueprints
    app.register_blueprint(page_routes)
    app.register_blueprint(promo_routes)
    app.register_blueprint(integration_routes, url_prefix='/api')
    
    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return render_template('errors/500.html'), 500
    
    # Auto-apply promo code from URL query parameter
    @app.before_request
    def check_promo_param():
        # Only apply on GET requests with promo parameter
        if request.method == 'GET' and request.args.get('promo'):
            promo_code = request.args.get('promo')
            
            # Only apply if there's no existing promo and this is not an API route
            if not session_manager.get_promo_code() and not request.path.startswith('/api'):
                promo_result, error = session_manager.apply_promo_code(promo_code)
                # Save the outcome for later (no need to flash immediately)
                g.applied_promo = {
                    'code': promo_code,
                    'success': promo_result is not None,
                    'error': error
                }
    
    return app

# Initialize app
app = create_app()

if __name__ == '__main__':
    # Run application on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)