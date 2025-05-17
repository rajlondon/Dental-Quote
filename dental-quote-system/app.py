from flask import Flask, render_template, session
import os
import uuid
import datetime
from routes.page_routes import page_routes
from routes.promo_routes import promo_routes
from routes.integration_routes import integration_routes

# Create Flask application
app = Flask(__name__)

# Configure application
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', str(uuid.uuid4()))
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Custom Jinja2 template filters
@app.template_filter('timestamp_to_date')
def timestamp_to_date(timestamp):
    """Convert a Unix timestamp to a formatted date string"""
    if not timestamp:
        return "N/A"
    
    try:
        dt = datetime.datetime.fromtimestamp(timestamp)
        return dt.strftime('%B %d, %Y')
    except (ValueError, TypeError):
        return "Invalid date"

@app.template_filter('format_currency')
def format_currency(value):
    """Format a number as currency with $ symbol"""
    if not value:
        return "$0.00"
    
    try:
        return "${:,.2f}".format(float(value))
    except (ValueError, TypeError):
        return "$0.00"

# Register blueprints
app.register_blueprint(page_routes)
app.register_blueprint(promo_routes)
app.register_blueprint(integration_routes)

# Home route
@app.route('/')
def index():
    """Home page - redirects to quote builder"""
    return render_template('index.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('errors/500.html'), 500

# Special routes for health checks and testing
@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy'}

@app.route('/session-check')
def session_check():
    """Check if session is working"""
    if 'visit_count' not in session:
        session['visit_count'] = 1
    else:
        session['visit_count'] += 1
    
    return {
        'session_working': True,
        'visit_count': session['visit_count']
    }

@app.context_processor
def utility_processor():
    """Add utility functions to template context"""
    def calculate_subtotal(treatments):
        """Calculate the subtotal of all treatments"""
        return sum(treatment.get('price', 0) for treatment in treatments)
    
    def calculate_discount(subtotal, discount_percent):
        """Calculate the discount amount"""
        if not discount_percent:
            return 0
        return (subtotal * discount_percent) / 100
    
    def calculate_total(subtotal, discount):
        """Calculate the total after discount"""
        return subtotal - discount
    
    return dict(
        calculate_subtotal=calculate_subtotal,
        calculate_discount=calculate_discount,
        calculate_total=calculate_total
    )

if __name__ == '__main__':
    # Create required directories
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates/quote', exist_ok=True)
    os.makedirs('templates/errors', exist_ok=True)
    
    # Run the application
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)), debug=True)