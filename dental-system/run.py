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

# Create static images directory if it doesn't exist
os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)
os.makedirs(os.path.join(app.static_folder, 'images/treatments'), exist_ok=True)
os.makedirs(os.path.join(app.static_folder, 'images/offers'), exist_ok=True)
os.makedirs(os.path.join(app.static_folder, 'images/testimonials'), exist_ok=True)
os.makedirs(os.path.join(app.static_folder, 'css'), exist_ok=True)

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
        if promo_code not in PROMO_CODES:
            return 0
            
        promo_info = PROMO_CODES[promo_code]
        discount_percent = promo_info.get('discount_percent', 0)
        return (total * discount_percent) / 100

# Mock data
TREATMENTS = [
    {"id": 1, "name": "Dental Implant", "price": 1200, "currency": "EUR", "description": "Titanium post surgically inserted into the jawbone"},
    {"id": 2, "name": "Porcelain Crown", "price": 800, "currency": "EUR", "description": "Custom-made cap that covers a damaged tooth"},
    {"id": 3, "name": "Root Canal", "price": 600, "currency": "EUR", "description": "Treatment for infected pulp of tooth"},
    {"id": 4, "name": "Teeth Whitening", "price": 400, "currency": "EUR", "description": "Professional bleaching to remove stains"},
    {"id": 5, "name": "Dental Veneers (per tooth)", "price": 700, "currency": "EUR", "description": "Custom shells to cover front of teeth"},
    {"id": 6, "name": "Dental Cleaning", "price": 150, "currency": "EUR", "description": "Professional plaque and tartar removal"},
]

PROMO_CODES = {
    "WELCOME10": {"discount_percent": 10, "description": "10% off your first treatment"},
    "IMPLANTCROWN30": {"discount_percent": 30, "description": "30% off Implant + Crown package", "package_only": True},
    "LUXHOTEL20": {"discount_percent": 20, "description": "20% off plus free hotel stay", "min_amount": 2000},
    "LUXTRAVEL": {"discount_percent": 40, "description": "40% off with luxury travel arrangements", "min_amount": 1500}
}

# Special offers data - shared between Flask and React
SPECIAL_OFFERS = [
    {
        "id": "ac36590b-b0dc-434e-ba74-d42ab2483f41",
        "title": "Premium Implant Package",
        "description": "Complete dental implant solution with premium materials",
        "discount": "30% off",
        "price": 1450,
        "oldPrice": 2100,
        "promoCode": "IMPLANTCROWN30",
        "limited": True,
        "clinicId": 1,
        "treatmentIds": [1, 2],
        "expiryDate": "2025-07-30",
        "image": "dental-implant.jpg"
    },
    {
        "id": "79a8f452-7398-4487-a5c9-35c4b998f2eb",
        "title": "Luxury Smile Makeover",
        "description": "Complete smile transformation with hotel accommodation included",
        "discount": "Save €3000",
        "price": 2999,
        "oldPrice": 5999,
        "promoCode": "LUXHOTEL20",
        "limited": True,
        "clinicId": 2,
        "treatmentIds": [5, 4, 2],
        "expiryDate": "2025-06-30",
        "image": "smile-makeover.jpg"
    },
    {
        "id": "5e68734d-6092-4822-a9ec-5099316c6d6f",
        "title": "Travel & Treatment Bundle",
        "description": "All-inclusive package with flights, luxury hotel, and premium treatments",
        "discount": "40% off",
        "price": 1999,
        "oldPrice": 3499,
        "promoCode": "LUXTRAVEL",
        "limited": False,
        "clinicId": 3,
        "treatmentIds": [1, 2, 6],
        "expiryDate": "2025-08-15",
        "image": "travel-bundle.jpg"
    }
]

# Main website routes
@app.route('/')
def index():
    # Example statistics
    stats = {
        "quotes_generated": "17k+",
        "avg_clinic_rating": "4.5",
        "max_savings": "70%",
        "data_security": "Fully encrypted"
    }
    
    return render_template('index.html', special_offers=SPECIAL_OFFERS, stats=stats)

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
        discount_amount = SessionManager.calculate_discount(promo_code, quote_data.get('total', 0))
        quote_data['promo_code'] = promo_code
        quote_data['discount_amount'] = discount_amount
        SessionManager.save_quote_data(quote_data)
    
    # Check for clinic ID in URL
    clinic_id = request.args.get('clinic_id')
    if clinic_id:
        quote_data['clinic_id'] = clinic_id
        SessionManager.save_quote_data(quote_data)
        
    # Check for treatments in URL (comma-separated list of IDs)
    treatments_param = request.args.get('treatments')
    if treatments_param:
        try:
            treatment_ids = [int(t) for t in treatments_param.split(',')]
            treatments_to_add = [t for t in TREATMENTS if t['id'] in treatment_ids]
            
            # Add treatments to quote
            if treatments_to_add:
                quote_data['treatments'].extend(treatments_to_add)
                quote_data['total'] = sum(t.get('price', 0) for t in quote_data['treatments'])
                
                # Recalculate discount if promo code is applied
                if quote_data['promo_code']:
                    quote_data['discount_amount'] = SessionManager.calculate_discount(
                        quote_data['promo_code'], quote_data['total']
                    )
                    
                SessionManager.save_quote_data(quote_data)
        except ValueError:
            # Ignore invalid treatment IDs
            pass
    
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

# API endpoints for the quote builder UI
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
    
    # Recalculate discount if promo code is applied
    if quote_data['promo_code']:
        quote_data['discount_amount'] = SessionManager.calculate_discount(
            quote_data['promo_code'], quote_data['total']
        )
        
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
    
    # Recalculate discount if promo code is applied
    if quote_data['promo_code']:
        quote_data['discount_amount'] = SessionManager.calculate_discount(
            quote_data['promo_code'], quote_data['total']
        )
        
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
    quote_data['submitted_at'] = datetime.now().isoformat()
    
    # Get a copy of the data before clearing
    final_quote = quote_data.copy()
    
    # Clear the session
    session.pop('quote_data', None)
    
    return jsonify({
        'success': True,
        'quote': final_quote,
        'message': 'Quote submitted successfully!'
    })

# Integration API endpoints for React application
@app.route('/api/quote-data-sync', methods=['POST'])
def quote_data_sync():
    """API endpoint to synchronize quote data with React app"""
    try:
        data = request.json
        quote_data = data.get('quote', {})
        user_data = data.get('user', {})
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        # Log the synchronization request
        print(f"Quote sync request received: user_id={user_data.get('id', 'anonymous')}, timestamp={timestamp}")
        
        # Store the data in session
        current_data = SessionManager.get_quote_data()
        
        # Merge data from React app with current session data
        if 'treatments' in quote_data and quote_data['treatments']:
            current_data['treatments'] = quote_data['treatments']
            
        if 'promoCode' in quote_data and quote_data['promoCode']:
            current_data['promo_code'] = quote_data['promoCode']
            
        if 'clinicId' in quote_data and quote_data['clinicId']:
            current_data['clinic_id'] = quote_data['clinicId']
            
        if 'patientInfo' in quote_data and quote_data['patientInfo']:
            current_data['patient_info'] = quote_data['patientInfo']
            
        # Recalculate totals
        current_data['total'] = sum(t.get('price', 0) for t in current_data['treatments'])
        
        # Recalculate discount if promo code is applied
        if current_data['promo_code']:
            current_data['discount_amount'] = SessionManager.calculate_discount(
                current_data['promo_code'], current_data['total']
            )
            
        # Save updated data
        SessionManager.save_quote_data(current_data)
        
        return jsonify({
            'success': True,
            'quote_data': current_data,
            'message': 'Quote data synchronized successfully'
        })
    except Exception as e:
        print(f"Error in quote data sync: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error synchronizing quote data: {str(e)}'
        }), 500

@app.route('/api/validate-promo', methods=['POST'])
def validate_promo():
    """API endpoint to validate promo codes for React app"""
    try:
        data = request.json
        promo_code = data.get('promoCode')
        quote_total = data.get('quoteTotal', 0)
        
        # Validate the promo code
        if not promo_code or promo_code not in PROMO_CODES:
            return jsonify({
                'success': False,
                'valid': False,
                'message': 'Invalid promotional code'
            }), 400
            
        promo_info = PROMO_CODES[promo_code]
        
        # Check minimum amount if required
        if 'min_amount' in promo_info and quote_total < promo_info['min_amount']:
            return jsonify({
                'success': False,
                'valid': False,
                'message': f"Your total must be at least €{promo_info['min_amount']} to use this code"
            }), 400
            
        # Calculate discount
        discount_percent = promo_info.get('discount_percent', 0)
        discount_amount = (quote_total * discount_percent) / 100
        
        return jsonify({
            'success': True,
            'valid': True,
            'promoCode': promo_code,
            'discountPercent': discount_percent,
            'discountAmount': discount_amount,
            'description': promo_info.get('description', ''),
            'message': f"Promo code '{promo_code}' applied successfully."
        })
    except Exception as e:
        print(f"Error validating promo code: {str(e)}")
        return jsonify({
            'success': False,
            'valid': False,
            'message': f'Error validating promo code: {str(e)}'
        }), 500

@app.route('/api/special-offers', methods=['GET'])
def get_special_offers():
    """API endpoint to get special offers for React app"""
    try:
        return jsonify(SPECIAL_OFFERS)
    except Exception as e:
        print(f"Error fetching special offers: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching special offers: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Create static directory for images if it doesn't exist
    static_img_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'images')
    os.makedirs(static_img_dir, exist_ok=True)
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)