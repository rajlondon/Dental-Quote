"""
MyDentalFly Quote System - Main Application
Flask application for dental treatment quotes with promo code integration
"""

from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import os
import json
from datetime import datetime

# Import utility modules and services
from utils.session_manager import SessionManager
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Import route modules
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Create Flask app
app = Flask(__name__)

# Configure application
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mydentalfly-secret-key') 
app.config['SESSION_TYPE'] = 'filesystem'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Initialize services
session_manager = SessionManager(app)
treatment_service = TreatmentService()
promo_service = PromoService()

# Make services available to all templates
@app.context_processor
def inject_services():
    return {
        'treatment_service': treatment_service,
        'promo_service': promo_service
    }

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes, url_prefix='/promo')
app.register_blueprint(integration_routes, url_prefix='/api')

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('error.html', error=str(e)), 500

# AJAX route handlers
@app.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the quote via AJAX"""
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return redirect(url_for('page_routes.quote_builder'))
    
    treatment_id = request.form.get('treatment_id')
    if not treatment_id:
        return jsonify({'success': False, 'message': 'Treatment ID is required'})
    
    # Get treatment details
    treatment = treatment_service.get_treatment_by_id(treatment_id)
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'})
    
    # Add to session
    session_manager.add_treatment_to_quote(treatment)
    
    # Get updated quote information
    selected_treatments = session_manager.get_selected_treatments()
    quote_totals = session_manager.calculate_quote_totals()
    
    return jsonify({
        'success': True, 
        'message': f'Added {treatment["name"]} to your quote',
        'selected_treatments': selected_treatments,
        'totals': quote_totals
    })

@app.route('/remove-treatment', methods=['POST'])
def remove_treatment():
    """Remove a treatment from the quote via AJAX"""
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return redirect(url_for('page_routes.quote_builder'))
    
    treatment_id = request.form.get('treatment_id')
    if not treatment_id:
        return jsonify({'success': False, 'message': 'Treatment ID is required'})
    
    # Remove from session
    removed = session_manager.remove_treatment_from_quote(treatment_id)
    if not removed:
        return jsonify({'success': False, 'message': 'Treatment not found in your quote'})
    
    # Get updated quote information
    selected_treatments = session_manager.get_selected_treatments()
    quote_totals = session_manager.calculate_quote_totals()
    
    return jsonify({
        'success': True, 
        'message': 'Treatment removed from your quote',
        'selected_treatments': selected_treatments,
        'totals': quote_totals
    })

@app.route('/update-quantity', methods=['POST'])
def update_quantity():
    """Update treatment quantity via AJAX"""
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return redirect(url_for('page_routes.quote_builder'))
    
    treatment_id = request.form.get('treatment_id')
    quantity = request.form.get('quantity')
    
    if not treatment_id or not quantity:
        return jsonify({'success': False, 'message': 'Treatment ID and quantity are required'})
    
    try:
        quantity = int(quantity)
        if quantity < 1:
            quantity = 1
    except ValueError:
        return jsonify({'success': False, 'message': 'Quantity must be a number'})
    
    # Update session
    updated = session_manager.update_treatment_quantity(treatment_id, quantity)
    if not updated:
        return jsonify({'success': False, 'message': 'Treatment not found in your quote'})
    
    # Get updated quote information
    selected_treatments = session_manager.get_selected_treatments()
    quote_totals = session_manager.calculate_quote_totals()
    
    return jsonify({
        'success': True,
        'selected_treatments': selected_treatments,
        'totals': quote_totals
    })

@app.route('/apply-promo', methods=['POST'])
def apply_promo():
    """Apply a promo code via AJAX"""
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return redirect(url_for('page_routes.quote_builder'))
    
    promo_code = request.form.get('promo_code')
    if not promo_code:
        return jsonify({'success': False, 'message': 'Promo code is required'})
    
    # Validate promo code
    promo_details = promo_service.validate_promo_code(promo_code)
    if not promo_details:
        return jsonify({'success': False, 'message': 'Invalid promo code'})
    
    # Check if treatments in quote are eligible for this promo
    if not promo_service.check_promo_eligibility(promo_details, session_manager.get_selected_treatments()):
        return jsonify({
            'success': False, 
            'message': 'This promo code is not applicable to your selected treatments'
        })
    
    # Apply to session
    session_manager.apply_promo_code(promo_code, promo_details)
    
    # Get updated quote information
    quote_totals = session_manager.calculate_quote_totals()
    
    return jsonify({
        'success': True, 
        'message': 'Promo code applied successfully!',
        'promo_details': promo_details,
        'totals': quote_totals
    })

@app.route('/remove-promo', methods=['POST'])
def remove_promo():
    """Remove promo code via AJAX"""
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return redirect(url_for('page_routes.quote_builder'))
    
    # Remove from session
    removed = session_manager.remove_promo_code()
    if not removed:
        return jsonify({'success': False, 'message': 'No promo code was applied'})
    
    # Get updated quote information
    quote_totals = session_manager.calculate_quote_totals()
    
    return jsonify({
        'success': True, 
        'message': 'Promo code removed',
        'totals': quote_totals
    })

# Run the application
if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(host='0.0.0.0', port=5000, debug=True)