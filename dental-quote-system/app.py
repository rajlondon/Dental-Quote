"""
MyDentalFly - Dental Quote System
Main Flask Application
"""
import os
from flask import Flask, render_template, session, request, flash
from dotenv import load_dotenv
from services.treatment_service import TreatmentService
from services.promo_service import PromoService
from routes import page_routes, promo_routes, integration_routes
import secrets

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(16)
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # 30 minutes
    
    # Create service instances
    treatment_service = TreatmentService()
    promo_service = PromoService()
    
    # Add services to app config for access in routes
    app.config['treatment_service'] = treatment_service
    app.config['promo_service'] = promo_service
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register context processors
    register_context_processors(app)
    
    # Register blueprints
    app.register_blueprint(page_routes.bp)
    app.register_blueprint(promo_routes.bp)
    app.register_blueprint(integration_routes.bp)
    
    return app

def register_error_handlers(app):
    """Register error handlers for the application"""
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return render_template('errors/500.html'), 500

def register_context_processors(app):
    """Register context processors for template rendering"""
    @app.context_processor
    def inject_services():
        """Make services available to all templates"""
        return {
            'treatment_service': app.config['treatment_service'],
            'promo_service': app.config['promo_service']
        }
    
    @app.context_processor
    def inject_quote_data():
        """Make quote data available to all templates"""
        from utils.session_manager import SessionManager
        session_manager = SessionManager()
        
        selected_treatments = session_manager.get_selected_treatments()
        totals = session_manager.calculate_totals()
        
        return {
            'quote_item_count': len(selected_treatments),
            'quote_total': totals['total'],
            'quote_subtotal': totals['subtotal'],
            'quote_discount': totals['discount_amount']
        }

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)