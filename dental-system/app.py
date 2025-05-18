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
        {"id": 1, "title": "Premium Implant Package", "discount": "50% off", "price": "€750", "oldPrice": "€1500", 
         "image": "dental-implant.jpg", "promoCode": "IMPLANTCROWN30", "limited": True},
        {"id": 2, "title": "Luxury Smile Makeover", "discount": "Save €3000", "price": "€2999", "oldPrice": "€5999", 
         "image": "smile-makeover.jpg", "promoCode": "LUXHOTEL20", "limited": True},
        {"id": 3, "title": "Travel & Treatment Bundle", "discount": "40% off", "price": "€1999", "oldPrice": "€3499", 
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))