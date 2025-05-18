from flask import Flask, render_template, redirect, url_for, request
from flask_session import Session
import os
from datetime import timedelta

app = Flask(__name__)

# Configure session
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "your-secret-key")
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=24)
app.config["SESSION_USE_SIGNER"] = True

# Initialize session
Session(app)

# Import and register the quote builder blueprint
from quote_builder.routes import quote_blueprint
app.register_blueprint(quote_blueprint, url_prefix='/quote-builder')

# Main website routes
@app.route('/')
def index():
    # Example special offers data
    special_offers = [
        {"id": 1, "title": "Premium Implant Package", "discount": "50% off", "price": 750, "old_price": 1500, 
         "image_path": "images/dental-implant.jpg", "promo_code": "IMPLANTCROWN30", "limited": True, 
         "description": "Get a premium dental implant with crown at half the normal price", "expiry_date": "June 30, 2025"},
        {"id": 2, "title": "Luxury Smile Makeover", "discount": "Save €3000", "price": 2999, "old_price": 5999, 
         "image_path": "images/smile-makeover.jpg", "promo_code": "LUXHOTEL20", "limited": True, 
         "description": "Complete smile transformation with luxury hotel stay included", "expiry_date": "July 15, 2025"},
        {"id": 3, "title": "Travel & Treatment Bundle", "discount": "40% off", "price": 1999, "old_price": 3499, 
         "image_path": "images/travel-bundle.jpg", "promo_code": "LUXTRAVEL", "limited": False, 
         "description": "All-inclusive package with flights, hotel and treatment", "expiry_date": "August 31, 2025"}
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))