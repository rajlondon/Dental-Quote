from flask import Blueprint, render_template, redirect, url_for, request
from utils.session_manager import SessionManager
from services.promo_service import PromoService

page_routes = Blueprint('page_routes', __name__)

@page_routes.route('/quote-builder')
def quote_builder():
    """Main quote builder page"""
    # Get current quote data with fallback to initialized data
    quote_data = SessionManager.get_quote_data()
    
    # Render the quote builder template with the current data
    return render_template('quote/quote_builder.html', quote_data=quote_data)

@page_routes.route('/set-step/<step>', methods=['POST'])
def set_step(step):
    """Set the current step in the quote flow"""
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Update step
    quote_data['step'] = step
    
    # Save updated quote data
    SessionManager.save_quote_data(quote_data)
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/add-treatment', methods=['POST'])
def add_treatment():
    """Add a treatment to the quote"""
    # Get form data
    treatment_id = request.form.get('treatment_id')
    treatment_name = request.form.get('treatment_name')
    treatment_price = float(request.form.get('treatment_price', 0))
    
    if not treatment_id or not treatment_name:
        # Error: missing required data
        return redirect(url_for('page_routes.quote_builder'))
    
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Check if treatment is already in the list
    treatment_exists = False
    for treatment in quote_data['treatments']:
        if treatment.get('id') == treatment_id:
            treatment_exists = True
            break
    
    if not treatment_exists:
        # Add treatment to list
        quote_data['treatments'].append({
            'id': treatment_id,
            'name': treatment_name,
            'price': treatment_price
        })
        
        # Save updated quote data
        SessionManager.save_quote_data(quote_data)
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/remove-treatment/<treatment_id>', methods=['POST'])
def remove_treatment(treatment_id):
    """Remove a treatment from the quote"""
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Remove treatment from list
    quote_data['treatments'] = [t for t in quote_data['treatments'] if t.get('id') != treatment_id]
    
    # Save updated quote data
    SessionManager.save_quote_data(quote_data)
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/save-patient-info', methods=['POST'])
def save_patient_info():
    """Save patient information"""
    # Get form data
    patient_name = request.form.get('patient-name', '')
    patient_email = request.form.get('patient-email', '')
    patient_phone = request.form.get('patient-phone', '')
    preferred_date = request.form.get('preferred-date', '')
    patient_notes = request.form.get('patient-notes', '')
    
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Update patient info
    quote_data['patient_info'] = {
        'name': patient_name,
        'email': patient_email,
        'phone': patient_phone,
        'preferred_date': preferred_date,
        'notes': patient_notes
    }
    
    # Move to next step
    quote_data['step'] = 'review'
    
    # Save updated quote data
    SessionManager.save_quote_data(quote_data)
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))

@page_routes.route('/reset-quote', methods=['POST'])
def reset_quote():
    """Reset the quote to empty state"""
    # Clear all quote data
    SessionManager.clear_quote_data()
    
    # Redirect back to quote builder
    return redirect(url_for('page_routes.quote_builder'))