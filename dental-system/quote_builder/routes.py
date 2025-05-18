from flask import Blueprint, render_template, request, jsonify, redirect, url_for, session
import json
from ..utils.session import SessionManager

quote_blueprint = Blueprint('quote', __name__, template_folder='templates')

# Mock treatment data (in a real app this would come from a database)
TREATMENTS = [
    {"id": 1, "name": "Dental Implant", "price": 1200, "currency": "EUR", "description": "Titanium post surgically inserted into the jawbone"},
    {"id": 2, "name": "Porcelain Crown", "price": 800, "currency": "EUR", "description": "Custom-made cap that covers a damaged tooth"},
    {"id": 3, "name": "Root Canal", "price": 600, "currency": "EUR", "description": "Treatment for infected pulp of tooth"},
    {"id": 4, "name": "Teeth Whitening", "price": 400, "currency": "EUR", "description": "Professional bleaching to remove stains"},
    {"id": 5, "name": "Dental Veneers (per tooth)", "price": 700, "currency": "EUR", "description": "Custom shells to cover front of teeth"},
    {"id": 6, "name": "Dental Cleaning", "price": 150, "currency": "EUR", "description": "Professional plaque and tartar removal"},
]

# Mock promo codes
PROMO_CODES = {
    "WELCOME10": {"discount_percent": 10, "description": "10% off your first treatment"},
    "IMPLANTCROWN30": {"discount_percent": 30, "description": "30% off Implant + Crown package", "package_only": True},
    "LUXHOTEL20": {"discount_percent": 20, "description": "20% off plus free hotel stay", "min_amount": 2000},
    "LUXTRAVEL": {"discount_percent": 40, "description": "40% off with luxury travel arrangements", "min_amount": 1500}
}

@quote_blueprint.route('/')
def index():
    """Main quote builder page"""
    # Initialize session if needed
    SessionManager.init_quote_session()
    
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Process any query parameters
    promo_code = request.args.get('promo')
    if promo_code and promo_code in PROMO_CODES:
        # Auto-apply promo code from URL
        discount_info = PROMO_CODES[promo_code]
        SessionManager.apply_promo_code(promo_code, discount_info)
    
    # Check for clinic ID in URL
    clinic_id = request.args.get('clinic_id')
    if clinic_id:
        quote_data['clinic_id'] = clinic_id
        SessionManager.save_quote_data(quote_data)
    
    return render_template('quote_builder/index.html', 
                           quote_data=quote_data,
                           treatments=TREATMENTS,
                           step='treatments')

@quote_blueprint.route('/step/<step_name>')
def step(step_name):
    """Handle different steps of the quote builder"""
    # Initialize session if needed
    SessionManager.init_quote_session()
    
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Update current step
    SessionManager.update_quote_step(step_name)
    
    # Prepare context based on step
    context = {'quote_data': quote_data}
    
    if step_name == 'treatments':
        context['treatments'] = TREATMENTS
    
    return render_template(f'quote_builder/step_{step_name}.html', **context)

@quote_blueprint.route('/api/treatments', methods=['GET'])
def get_treatments():
    """API endpoint to get all treatments"""
    return jsonify(TREATMENTS)

@quote_blueprint.route('/api/add-treatment', methods=['POST'])
def add_treatment():
    """API endpoint to add a treatment to the quote"""
    data = request.json
    treatment_id = data.get('treatment_id')
    
    # Find the treatment in our list
    treatment = next((t for t in TREATMENTS if t['id'] == treatment_id), None)
    
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'}), 404
    
    # Add treatment to the quote
    SessionManager.add_treatment(treatment)
    
    return jsonify({
        'success': True, 
        'quote_data': SessionManager.get_quote_data()
    })

@quote_blueprint.route('/api/remove-treatment', methods=['POST'])
def remove_treatment():
    """API endpoint to remove a treatment from the quote"""
    data = request.json
    treatment_id = data.get('treatment_id')
    
    # Remove treatment from the quote
    SessionManager.remove_treatment(treatment_id)
    
    return jsonify({
        'success': True, 
        'quote_data': SessionManager.get_quote_data()
    })

@quote_blueprint.route('/api/apply-promo-code', methods=['POST'])
def apply_promo_code():
    """API endpoint to apply a promo code to the quote"""
    data = request.json
    promo_code = data.get('promo_code')
    
    if not promo_code or promo_code not in PROMO_CODES:
        return jsonify({
            'success': False,
            'message': 'Invalid promo code'
        }), 400
    
    quote_data = SessionManager.get_quote_data()
    total = quote_data.get('total', 0)
    
    # Apply promo code logic
    promo_info = PROMO_CODES[promo_code]
    
    # Check minimum amount if required
    if 'min_amount' in promo_info and total < promo_info['min_amount']:
        return jsonify({
            'success': False,
            'message': f"Your total must be at least €{promo_info['min_amount']} to use this code"
        }), 400
    
    # Calculate discount
    discount_percent = promo_info.get('discount_percent', 0)
    discount_amount = (total * discount_percent) / 100
    
    # Apply the discount
    SessionManager.apply_promo_code(promo_code, discount_amount)
    
    return jsonify({
        'success': True,
        'quote_data': SessionManager.get_quote_data(),
        'message': f"Applied: {promo_info.get('description')}"
    })

@quote_blueprint.route('/api/save-patient-info', methods=['POST'])
def save_patient_info():
    """API endpoint to save patient information"""
    data = request.json
    required_fields = ['name', 'email']
    
    # Validate required fields
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Save patient info to the quote
    SessionManager.save_patient_info(data)
    
    return jsonify({
        'success': True,
        'quote_data': SessionManager.get_quote_data()
    })

@quote_blueprint.route('/api/submit-quote', methods=['POST'])
def submit_quote():
    """API endpoint to finalize and submit the quote"""
    quote_data = SessionManager.get_quote_data()
    
    # Validate the quote has treatments and patient info
    if not quote_data.get('treatments'):
        return jsonify({
            'success': False,
            'message': 'No treatments selected'
        }), 400
    
    if not quote_data.get('patient_info'):
        return jsonify({
            'success': False,
            'message': 'Patient information missing'
        }), 400
    
    # In a real app, this would save to a database and maybe send emails
    # For now, just return success
    
    # Generate a quote ID (in real app, this would be from the database)
    quote_data['status'] = 'submitted'
    quote_data['submitted_at'] = SessionManager.get_quote_data().get('created_at')
    
    # Get a copy of the data before clearing
    final_quote = quote_data.copy()
    
    # Clear the session
    SessionManager.clear_quote()
    
    return jsonify({
        'success': True,
        'quote': final_quote,
        'message': 'Quote submitted successfully!'
    })