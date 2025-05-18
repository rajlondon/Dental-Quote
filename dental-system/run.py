"""
Enhanced Flask Application for Dental Quote Builder
This application serves as a specialized processing engine for dental quotes
and integrates with the main React application through a REST API
"""
from flask import Flask, render_template, redirect, url_for, request, session, jsonify
from flask_session import Session
import os
from datetime import timedelta, datetime
import json
import uuid
import random
from flask_cors import CORS

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Enable CORS for all routes to allow communication with the main React app
CORS(app, supports_credentials=True, resources={
    r"/*": {"origins": "*"},
    r"/api/*": {"origins": "*", "supports_credentials": True}
})

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

# Create static directories if they don't exist
for folder in ['images', 'images/treatments', 'images/offers', 'images/testimonials', 'css']:
    os.makedirs(os.path.join(app.static_folder, folder), exist_ok=True)

# Session management class
class SessionManager:
    """Helper class for managing session data"""
    
    @staticmethod
    def init_quote_session():
        """Initialize the quote session if it doesn't exist"""
        if 'quote_data' not in session:
            session['quote_data'] = {
                'id': str(uuid.uuid4()),
                'created_at': datetime.now().isoformat(),
                'step': 'treatments',
                'treatments': [],
                'patient_info': {},
                'promo_code': None,
                'discount_amount': 0,
                'total': 0,
                'clinic_id': None,
                'source': 'web'
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
        
    @staticmethod
    def update_quote_step(step):
        """Update the current step in the quote process"""
        quote_data = SessionManager.get_quote_data()
        quote_data['step'] = step
        SessionManager.save_quote_data(quote_data)
        
    @staticmethod
    def calculate_discount(promo_code, total):
        """Calculate discount amount for a given promo code and total"""
        # Simple promo code logic - could be replaced with database lookup
        promo_codes = {
            'WELCOME10': {'type': 'percentage', 'value': 10},
            'SAVE50': {'type': 'fixed', 'value': 50},
            'IMPLANTCROWN30': {'type': 'percentage', 'value': 30},
            'LUXHOTEL20': {'type': 'percentage', 'value': 20},
            'LUXTRAVEL': {'type': 'percentage', 'value': 40},
        }
        
        if not promo_code or promo_code not in promo_codes:
            return 0
            
        promo = promo_codes[promo_code]
        if promo['type'] == 'percentage':
            return round((promo['value'] / 100) * total, 2)
        else:
            return min(promo['value'], total)  # Don't discount more than the total

# Sample data for demonstration
TREATMENTS = [
    {
        'id': 1,
        'name': 'Dental Implant',
        'description': 'Complete implant including abutment and crown',
        'price': 750,
        'discount': None
    },
    {
        'id': 2,
        'name': 'Porcelain Crown',
        'description': 'High-quality porcelain crown',
        'price': 280,
        'discount': None
    },
    {
        'id': 3,
        'name': 'Porcelain Veneer',
        'description': 'Thin porcelain shell for front teeth',
        'price': 320,
        'discount': 10
    },
    {
        'id': 4,
        'name': 'Teeth Whitening',
        'description': 'Professional in-office whitening',
        'price': 180,
        'discount': None
    },
    {
        'id': 5,
        'name': 'Root Canal Treatment',
        'description': 'Complete root canal with filling',
        'price': 290,
        'discount': None
    },
    {
        'id': 6,
        'name': 'Dental Cleaning',
        'description': 'Professional teeth cleaning and polishing',
        'price': 85,
        'discount': 15
    }
]

PACKAGES = [
    {
        'id': 'pkg-001',
        'name': 'Complete Implant Package',
        'description': 'Implant, abutment, crown, and aftercare',
        'price': 950,
        'original_price': 1200,
        'savings': '250€',
        'badge': 'Most Popular'
    },
    {
        'id': 'pkg-002',
        'name': 'Hollywood Smile',
        'description': '8 porcelain veneers for a perfect smile',
        'price': 2400,
        'original_price': 2880,
        'savings': '480€',
        'badge': 'Premium'
    }
]

SPECIAL_OFFERS = [
    {
        'id': 'offer-001',
        'title': 'Premium Implant Package',
        'description': 'Complete dental implant solution with premium materials',
        'image_path': 'images/offers/implant-package.jpg',
        'discount': '30% off',
        'price': 1450,
        'old_price': 2100,
        'promo_code': 'IMPLANTCROWN30',
        'limited': True,
        'clinicId': 1,
        'treatmentIds': [1, 2], 
        'expiry_date': '2025-07-30'
    },
    {
        'id': 'offer-002',
        'title': 'Luxury Smile Makeover',
        'description': 'Complete smile transformation with hotel accommodation included',
        'image_path': 'images/offers/smile-makeover.jpg',
        'discount': 'Save €3000',
        'price': 2999,
        'old_price': 5999,
        'promo_code': 'LUXHOTEL20',
        'limited': True,
        'clinicId': 2,
        'treatmentIds': [5, 4, 2], 
        'expiry_date': '2025-06-30'
    },
    {
        'id': 'offer-003',
        'title': 'Travel & Treatment Bundle',
        'description': 'All-inclusive package with flights, luxury hotel, and premium treatments',
        'image_path': 'images/offers/travel-bundle.jpg',
        'discount': '40% off',
        'price': 1999,
        'old_price': 3499,
        'promo_code': 'LUXTRAVEL',
        'limited': False,
        'clinicId': 3,
        'treatmentIds': [1, 2, 6], 
        'expiry_date': '2025-08-15'
    }
]

# Flask routes for our hybrid application
@app.route('/')
def index():
    """Main homepage with special offers section"""
    # Some basic stats to display on the homepage
    stats = {
        'patients_treated': '10,000+',
        'clinics': '25+',
        'savings': 'Up to 70%',
        'satisfaction': '98%'
    }
    return render_template('index.html', special_offers=SPECIAL_OFFERS, stats=stats)

@app.route('/search')
def search():
    """Search results page"""
    query = request.args.get('location', '')
    date = request.args.get('date', '')
    return render_template('search-results.html', query=query, date=date)

@app.route('/quote-builder')
@app.route('/quote-builder/<step_name>')
def quote_builder(step_name='dental-chart'):
    """Main quote builder page"""
    # Initialize the quote session
    SessionManager.init_quote_session()
    quote_data = SessionManager.get_quote_data()
    
    # Get query parameters
    promo_code = request.args.get('promo', quote_data.get('promo_code'))
    offer_id = request.args.get('offer')
    clinic_id = request.args.get('clinic', quote_data.get('clinic_id'))
    
    # Update quote data with URL parameters
    if promo_code:
        quote_data['promo_code'] = promo_code
    
    if clinic_id:
        quote_data['clinic_id'] = clinic_id
        
    if offer_id:
        # Find the special offer by ID
        offer = next((o for o in SPECIAL_OFFERS if o['id'] == offer_id), None)
        if offer:
            quote_data['special_offer'] = offer
            if 'promo_code' in offer:
                quote_data['promo_code'] = offer['promo_code']
    
    # Save updated quote data
    SessionManager.save_quote_data(quote_data)
    SessionManager.update_quote_step(step_name)
    
    # Determine step number for progress indicator
    step_order = ['dental-chart', 'treatments', 'promo-code', 'patient-info', 'review', 'confirmation']
    step_num = step_order.index(step_name) + 1 if step_name in step_order else 1
    
    # Setup step-specific data
    context = {
        'step': step_name,
        'step_num': step_num,
        'promo_code': quote_data.get('promo_code'),
        'clinic_id': quote_data.get('clinic_id')
    }
    
    if step_name == 'treatments':
        context['treatments'] = TREATMENTS
        context['packages'] = PACKAGES
    
    elif step_name == 'promo-code':
        # Get treatments from session
        treatments = quote_data.get('treatments', [])
        # Calculate the total price of selected treatments
        total_price = sum(t.get('price', 0) for t in treatments)
        
        # Calculate discount if promo code is present
        discount_amount = 0
        if quote_data.get('promo_code'):
            discount_amount = SessionManager.calculate_discount(
                quote_data['promo_code'], total_price)
        
        context.update({
            'quote_items': treatments,
            'total_price': total_price - discount_amount,
            'discount_amount': discount_amount,
            'promo_code_status': 'valid' if discount_amount > 0 else None
        })
    
    elif step_name == 'patient-info':
        context['patient_info'] = quote_data.get('patient_info', {})
    
    elif step_name == 'review':
        treatments = quote_data.get('treatments', [])
        total_price = sum(t.get('price', 0) for t in treatments)
        discount_amount = 0
        
        if quote_data.get('promo_code'):
            discount_amount = SessionManager.calculate_discount(
                quote_data['promo_code'], total_price)
        
        context.update({
            'quote_items': treatments,
            'total_price': total_price - discount_amount,
            'discount_amount': discount_amount,
            'patient_info': quote_data.get('patient_info', {})
        })
    
    elif step_name == 'confirmation':
        context['quote_reference'] = f"QT-{uuid.uuid4().hex[:8].upper()}"
        context['patient_info'] = quote_data.get('patient_info', {})
    
    return render_template('quote-builder.html', **context)

# API endpoints for React integration
@app.route('/api/quote-data-sync', methods=['POST'])
def quote_data_sync():
    """API endpoint to synchronize quote data with React app"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        quote_data = SessionManager.get_quote_data()
        # Update quote data from React
        if 'quote' in data:
            for key, value in data['quote'].items():
                quote_data[key] = value
        
        # Save the updated quote data
        SessionManager.save_quote_data(quote_data)
        
        return jsonify({
            'success': True,
            'data': quote_data,
            'message': 'Data synchronized successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/validate-promo', methods=['POST'])
def validate_promo():
    """API endpoint to validate promo codes for React app"""
    try:
        data = request.json
        promo_code = data.get('promoCode')
        total = data.get('quoteTotal', 0)
        
        if not promo_code:
            return jsonify({
                'success': False,
                'message': 'No promo code provided'
            }), 400
        
        # Calculate discount
        discount = SessionManager.calculate_discount(promo_code, total)
        
        if discount > 0:
            # Save to session if valid
            quote_data = SessionManager.get_quote_data()
            quote_data['promo_code'] = promo_code
            quote_data['discount_amount'] = discount
            SessionManager.save_quote_data(quote_data)
            
            return jsonify({
                'success': True,
                'data': {
                    'valid': True,
                    'code': promo_code,
                    'discount': discount,
                    'discountedTotal': total - discount
                },
                'message': f'Promo code applied! You saved {discount}€'
            })
        else:
            return jsonify({
                'success': False,
                'data': {
                    'valid': False,
                    'code': promo_code
                },
                'message': 'Invalid promo code'
            }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/special-offers')
def get_special_offers():
    """API endpoint to get special offers for React app"""
    return jsonify(SPECIAL_OFFERS)

@app.route('/api/treatments')
def get_treatments():
    """API endpoint to get available treatments for React app"""
    return jsonify(TREATMENTS)

# Helper functions for bridging React and Flask
@app.route('/api/bridge/state')
def bridge_state():
    """Get the current state for React app"""
    quote_data = SessionManager.get_quote_data()
    return jsonify({
        'success': True,
        'data': quote_data
    })

@app.route('/api/bridge/treatments')
def bridge_treatments():
    """Get available treatments for React app"""
    return jsonify({
        'success': True,
        'data': {
            'treatments': TREATMENTS,
            'packages': PACKAGES
        }
    })

# Save patient information
@app.route('/api/save-patient-info', methods=['POST'])
def save_patient_info():
    """API endpoint to save patient information"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        # Get current quote data
        quote_data = SessionManager.get_quote_data()
        
        # Update patient info
        quote_data['patient_info'] = data
        
        # Save the updated quote data
        SessionManager.save_quote_data(quote_data)
        
        return jsonify({
            'success': True,
            'message': 'Patient information saved successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Submit final quote
@app.route('/api/submit-quote', methods=['POST'])
def submit_quote():
    """API endpoint to finalize and submit the quote"""
    try:
        # Get current quote data
        quote_data = SessionManager.get_quote_data()
        
        # Generate a reference number
        reference = f"QT-{uuid.uuid4().hex[:8].upper()}"
        quote_data['reference'] = reference
        quote_data['status'] = 'submitted'
        quote_data['submitted_at'] = datetime.now().isoformat()
        
        # Save the updated quote data
        SessionManager.save_quote_data(quote_data)
        
        # In a real application, you might also:
        # - Save the quote to a database
        # - Send confirmation emails
        # - Notify clinics, etc.
        
        return jsonify({
            'success': True,
            'data': {
                'reference': reference,
                'quote': quote_data
            },
            'message': 'Quote submitted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)