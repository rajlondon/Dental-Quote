from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_session import Session
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
app.config["SECRET_KEY"] = "dental-quote-secret-key"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)

# Sample treatment data
TREATMENTS = [
    {"id": 1, "name": "Teeth Whitening", "price": 250},
    {"id": 2, "name": "Root Canal", "price": 800},
    {"id": 3, "name": "Dental Crown", "price": 1200},
    {"id": 4, "name": "Dental Implant", "price": 3000},
    {"id": 5, "name": "Teeth Cleaning", "price": 120},
    {"id": 6, "name": "Cavity Filling", "price": 150},
    {"id": 7, "name": "Extraction", "price": 180},
    {"id": 8, "name": "Dental Veneer", "price": 900}
]

# Valid promo codes
PROMO_CODES = {
    "SUMMER15": 15,
    "DENTAL25": 25,
    "NEWPATIENT": 20,
    "TEST10": 10,
    "FREECONSULT": 100,
    "LUXHOTEL20": 20,
    "IMPLANTCROWN30": 30,
    "FREEWHITE": 100
}

def init_session():
    """Initialize session data if it doesn't exist"""
    if "quote_data" not in session:
        session["quote_data"] = {
            "treatments": [],
            "promo_code": None,
            "discount": 0,
            "step": "treatments",
            "patient_info": {
                "name": "",
                "email": "",
                "phone": "",
                "preferred_date": "",
                "notes": ""
            }
        }
        
def calculate_totals():
    """Calculate quote totals"""
    init_session()
    quote_data = session["quote_data"]
    
    subtotal = sum(treatment["price"] for treatment in quote_data["treatments"])
    discount_amount = (subtotal * quote_data["discount"]) / 100
    total = subtotal - discount_amount
    
    result = {
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "total": total
    }
    
    # Add promo code and discount percentage info if a promo is applied
    if quote_data["promo_code"]:
        result["promo_code"] = quote_data["promo_code"]
        result["discount_percentage"] = quote_data["discount"]
        
    return result

@app.route("/")
def index():
    """Main page - redirect to quote builder"""
    return redirect(url_for("quote_builder"))

@app.route("/quote-builder")
def quote_builder():
    """Render the quote builder page"""
    init_session()
    return render_template("quote_builder.html", 
                          treatments=TREATMENTS, 
                          quote_data=session["quote_data"],
                          totals=calculate_totals())

@app.route("/api/treatments", methods=["GET"])
def get_treatments():
    """Get all available treatments"""
    return jsonify(TREATMENTS)

@app.route("/api/quote/treatments", methods=["GET"])
def get_quote_treatments():
    """Get treatments in the current quote"""
    init_session()
    return jsonify(session["quote_data"]["treatments"])

@app.route("/api/quote/add-treatment", methods=["POST"])
def add_treatment():
    """Add a treatment to the quote"""
    init_session()
    
    data = request.get_json()
    treatment_id = data.get("treatment_id")
    
    # Find the treatment
    treatment = next((t for t in TREATMENTS if t["id"] == treatment_id), None)
    
    if treatment:
        # Create a copy with a unique instance ID (to allow duplicates)
        treatment_copy = treatment.copy()
        treatment_copy["instance_id"] = str(uuid.uuid4())
        
        # Add to session
        session["quote_data"]["treatments"].append(treatment_copy)
        session.modified = True
        
        return jsonify({
            "success": True, 
            "treatments": session["quote_data"]["treatments"],
            "totals": calculate_totals()
        })
    
    return jsonify({"success": False, "error": "Treatment not found"}), 404

@app.route("/api/quote/remove-treatment", methods=["POST"])
def remove_treatment():
    """Remove a treatment from the quote"""
    init_session()
    
    data = request.get_json()
    instance_id = data.get("instance_id")
    
    # Filter out the treatment with the given instance_id
    session["quote_data"]["treatments"] = [
        t for t in session["quote_data"]["treatments"] 
        if t.get("instance_id") != instance_id
    ]
    session.modified = True
    
    return jsonify({
        "success": True, 
        "treatments": session["quote_data"]["treatments"],
        "totals": calculate_totals()
    })

@app.route("/api/quote/apply-promo", methods=["POST"])
def apply_promo():
    """Apply a promo code to the quote"""
    init_session()
    
    data = request.get_json()
    promo_code = data.get("promo_code", "") 
    if not promo_code and 'promo_code' in data:
        promo_code = data["promo_code"]
    
    # Convert to uppercase for consistent matching
    promo_code = promo_code.upper() if promo_code else ""
    
    if not promo_code:
        return jsonify({"success": False, "error": "No promo code provided"}), 400
    
    # Check if promo code is valid
    if promo_code in PROMO_CODES:
        discount = PROMO_CODES[promo_code]
        
        # Apply to session
        session["quote_data"]["promo_code"] = promo_code
        session["quote_data"]["discount"] = discount
        
        # Force session update - ensure it's saved
        session.modified = True
        
        # Make sure the session persists
        from flask import Response
        session.permanent = True
        
        app.logger.info(f"Promo code applied: {promo_code}. New session state: {session['quote_data']}")
        
        return jsonify({
            "success": True,
            "promo_code": promo_code,
            "discount": discount,
            "totals": calculate_totals()
        })
    
    return jsonify({"success": False, "error": "Invalid promo code"}), 400

@app.route("/api/quote/remove-promo", methods=["POST"])
def remove_promo():
    """Remove the applied promo code"""
    init_session()
    
    # Completely reset the promo code state
    session["quote_data"]["promo_code"] = ""
    session["quote_data"]["discount"] = 0
    
    # Force session update - this is critical for persistence
    session.modified = True
    
    # Make sure the session persists
    from flask import Response
    session.permanent = True
    
    # Calculate new totals with zeroed discount
    new_totals = calculate_totals()
    
    # Log the removal for debugging
    app.logger.info(f"Promo code removed. New state: {session['quote_data']}")
    
    return jsonify({
        "success": True,
        "promo_removed": True,
        "totals": new_totals
    })

@app.route("/api/quote/set-step", methods=["POST"])
def set_step():
    """Set the current step in the quote flow"""
    init_session()
    
    data = request.get_json()
    step = data.get("step")
    
    if step in ["treatments", "promo", "patient-info", "review"]:
        session["quote_data"]["step"] = step
        session.modified = True
        return jsonify({"success": True, "step": step})
    
    return jsonify({"success": False, "error": "Invalid step"}), 400

@app.route("/api/quote/update-patient-info", methods=["POST"])
def update_patient_info():
    """Update patient information"""
    init_session()
    
    data = request.get_json()
    patient_info = data.get("patient_info", {})
    
    # Update only provided fields
    for key, value in patient_info.items():
        if key in session["quote_data"]["patient_info"]:
            session["quote_data"]["patient_info"][key] = value
    
    session.modified = True
    
    return jsonify({
        "success": True,
        "patient_info": session["quote_data"]["patient_info"]
    })

@app.route("/api/quote/reset", methods=["POST"])
def reset_quote():
    """Reset the quote to empty state"""
    if "quote_data" in session:
        del session["quote_data"]
    init_session()
    
    return jsonify({
        "success": True,
        "quote_data": session["quote_data"],
        "totals": calculate_totals()
    })

@app.route("/api/quote/submit", methods=["POST"])
def submit_quote():
    """Submit the quote (would normally save to a database)"""
    init_session()
    
    # Generate a quote ID
    quote_id = f"Q-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    # In a real app, we would save to a database here
    # For demo purposes, we'll just return success
    
    return jsonify({
        "success": True,
        "quote_id": quote_id,
        "message": "Quote submitted successfully!"
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)