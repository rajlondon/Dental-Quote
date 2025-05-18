"""
Simple runner script for the Flask application
"""
from flask import Flask, render_template, redirect, url_for, request, session
from flask_session import Session
import os
from datetime import timedelta
import json

app = Flask(__name__)

# Configure session
app.config["SECRET_KEY"] = "dental-fly-secret-key"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_FILE_DIR"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flask_session')
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=24)
app.config["SESSION_USE_SIGNER"] = True

# Initialize session
os.makedirs(app.config["SESSION_FILE_DIR"], exist_ok=True)
Session(app)

# Session management class
class SessionManager:
    """Helper class for managing session data"""
    
    @staticmethod
    def init_quote_session():
        """Initialize the quote session if it doesn't exist"""
        if 'quote_data' not in session:
            session['quote_data'] = {
                'id': "12345",
                'created_at': "2025-05-18T00:00:00",
                'step': 'treatments',
                'treatments': [],
                'patient_info': {},
                'promo_code': None,
                'discount_amount': 0,
                'total': 0
            }
    
    @staticmethod
    def get_quote_data():
        """Get the current quote data from session"""
        SessionManager.init_quote_session()
        return session.get('quote_data', {})
    
    @staticmethod
    def save_quote_data(quote_data):
        """Save the quote data to session"""
        session['quote_data'] = quote_data

# Mock data
TREATMENTS = [
    {"id": 1, "name": "Dental Implant", "price": 1200, "currency": "EUR", "description": "Titanium post surgically inserted into the jawbone"},
    {"id": 2, "name": "Porcelain Crown", "price": 800, "currency": "EUR", "description": "Custom-made cap that covers a damaged tooth"},
    {"id": 3, "name": "Root Canal", "price": 600, "currency": "EUR", "description": "Treatment for infected pulp of tooth"},
    {"id": 4, "name": "Teeth Whitening", "price": 400, "currency": "EUR", "description": "Professional bleaching to remove stains"},
    {"id": 5, "name": "Dental Veneers (per tooth)", "price": 700, "currency": "EUR", "description": "Custom shells to cover front of teeth"},
]

PROMO_CODES = {
    "WELCOME10": {"discount_percent": 10, "description": "10% off your first treatment"},
    "IMPLANTCROWN30": {"discount_percent": 30, "description": "30% off Implant + Crown package", "package_only": True},
    "LUXHOTEL20": {"discount_percent": 20, "description": "20% off plus free hotel stay", "min_amount": 2000},
    "LUXTRAVEL": {"discount_percent": 40, "description": "40% off with luxury travel arrangements", "min_amount": 1500}
}

# Main website routes
@app.route('/')
def index():
    # Example special offers data
    special_offers = [
        {"id": 1, "title": "Premium Implant Package", "discount": "30% off", "price": "€1,450", "oldPrice": "€2,100", 
         "image": "dental-implant.jpg", "promoCode": "IMPLANTCROWN30", "limited": True},
        {"id": 2, "title": "Luxury Smile Makeover", "discount": "Save €3000", "price": "€2,999", "oldPrice": "€5,999", 
         "image": "smile-makeover.jpg", "promoCode": "LUXHOTEL20", "limited": True},
        {"id": 3, "title": "Travel & Treatment Bundle", "discount": "40% off", "price": "€1,999", "oldPrice": "€3,499", 
         "image": "travel-bundle.jpg", "promoCode": "LUXTRAVEL", "limited": False}
    ]
    
    # Example statistics
    stats = {
        "quotes_generated": "17k+",
        "avg_clinic_rating": "4.5",
        "max_savings": "70%",
        "data_security": "Fully encrypted"
    }
    
    return render_template('index.html', special_offers=special_offers, stats=stats)

@app.route('/search')
def search():
    # Search functionality
    location = request.args.get('location', '')
    date = request.args.get('date', '')
    # Perform search...
    return render_template('search.html', location=location, date=date, results=[])

# Quote Builder routes
@app.route('/quote-builder/')
def quote_index():
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
        discount_amount = (quote_data.get('total', 0) * discount_info.get('discount_percent', 0)) / 100
        quote_data['promo_code'] = promo_code
        quote_data['discount_amount'] = discount_amount
        SessionManager.save_quote_data(quote_data)
    
    # Check for clinic ID in URL
    clinic_id = request.args.get('clinic_id')
    if clinic_id:
        quote_data['clinic_id'] = clinic_id
        SessionManager.save_quote_data(quote_data)
    
    return render_template('quote_builder/index.html', 
                           quote_data=quote_data,
                           treatments=TREATMENTS,
                           step='treatments')

@app.route('/quote-builder/step/<step_name>')
def quote_step(step_name):
    """Handle different steps of the quote builder"""
    # Initialize session if needed
    SessionManager.init_quote_session()
    
    # Get current quote data
    quote_data = SessionManager.get_quote_data()
    
    # Update current step
    quote_data['step'] = step_name
    SessionManager.save_quote_data(quote_data)
    
    # Prepare context based on step
    context = {'quote_data': quote_data, 'treatments': TREATMENTS}
    
    return render_template(f'quote_builder/step_{step_name}.html', **context)

# API endpoints
@app.route('/quote-builder/api/add-treatment', methods=['POST'])
def add_treatment():
    """API endpoint to add a treatment to the quote"""
    data = request.json
    treatment_id = data.get('treatment_id')
    
    # Find the treatment in our list
    treatment = next((t for t in TREATMENTS if t['id'] == treatment_id), None)
    
    if not treatment:
        return jsonify({'success': False, 'message': 'Treatment not found'}), 404
    
    # Add treatment to the quote
    quote_data = SessionManager.get_quote_data()
    quote_data['treatments'].append(treatment)
    quote_data['total'] = sum(t.get('price', 0) for t in quote_data['treatments'])
    SessionManager.save_quote_data(quote_data)
    
    return jsonify({
        'success': True, 
        'quote_data': quote_data
    })

@app.route('/quote-builder/api/remove-treatment', methods=['POST'])
def remove_treatment():
    """API endpoint to remove a treatment from the quote"""
    data = request.json
    treatment_id = data.get('treatment_id')
    
    # Remove treatment from the quote
    quote_data = SessionManager.get_quote_data()
    quote_data['treatments'] = [t for t in quote_data['treatments'] if t.get('id') != treatment_id]
    quote_data['total'] = sum(t.get('price', 0) for t in quote_data['treatments'])
    SessionManager.save_quote_data(quote_data)
    
    return jsonify({
        'success': True, 
        'quote_data': quote_data
    })

@app.route('/quote-builder/api/apply-promo-code', methods=['POST'])
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
    quote_data['promo_code'] = promo_code
    quote_data['discount_amount'] = discount_amount
    SessionManager.save_quote_data(quote_data)
    
    return jsonify({
        'success': True,
        'quote_data': quote_data,
        'message': f"Applied: {promo_info.get('description')}"
    })

@app.route('/quote-builder/api/save-patient-info', methods=['POST'])
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
    quote_data = SessionManager.get_quote_data()
    quote_data['patient_info'] = data
    SessionManager.save_quote_data(quote_data)
    
    return jsonify({
        'success': True,
        'quote_data': quote_data
    })

@app.route('/quote-builder/api/submit-quote', methods=['POST'])
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
    quote_data['submitted_at'] = quote_data.get('created_at')
    
    # Get a copy of the data before clearing
    final_quote = quote_data.copy()
    
    # Clear the session
    session.pop('quote_data', None)
    
    return jsonify({
        'success': True,
        'quote': final_quote,
        'message': 'Quote submitted successfully!'
    })

if __name__ == '__main__':
    # Create static directory for images if it doesn't exist
    static_img_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'images')
    os.makedirs(static_img_dir, exist_ok=True)
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)