from flask import Flask, request, render_template, make_response, jsonify
from xhtml2pdf import pisa
import io
from datetime import datetime
import os
import base64
import json

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/health')
def health_check():
    return jsonify({"status": "ok"})

@app.route('/generate-quote', methods=['POST'])
def generate_quote():
    try:
        # Get data from request
        data = request.get_json()
        
        # Generate quote ID in format IDS-YYYYMMDD-XXX
        quote_date = datetime.now()
        date_str = quote_date.strftime("%Y%m%d")
        rand_num = str(hash(str(data) + str(datetime.now().timestamp())))[-3:]
        quote_id = f"IDS-{date_str}-{rand_num}"
        
        # Format the date for display
        formatted_date = quote_date.strftime("%d %B %Y")
        
        # Prepare clinic data (using provided clinics or defaults if not provided)
        clinics = data.get('clinics', [])
        if not clinics or len(clinics) == 0:
            # Default clinics if none provided
            clinics = [
                {"name": "DentGroup Istanbul", "price_gbp": data.get('totalGBP', 0) * 0.95, "location": "Nişantaşı", "guarantee": "5 Years", "turnaround": "3 Days", "rating": "⭐⭐⭐⭐⭐"},
                {"name": "Vera Smile", "price_gbp": data.get('totalGBP', 0) * 0.92, "location": "Şişli", "guarantee": "5 Years", "turnaround": "4 Days", "rating": "⭐⭐⭐⭐½"},
                {"name": "LuxClinic Turkey", "price_gbp": data.get('totalGBP', 0), "location": "Levent", "guarantee": "10 Years", "turnaround": "3 Days", "rating": "⭐⭐⭐⭐⭐"}
            ]
        
        # Format the clinics data for template
        formatted_clinics = []
        for clinic in clinics:
            formatted_clinics.append({
                "name": clinic.get('name', ''),
                "price_gbp": f"£{float(clinic.get('priceGBP', 0)):.2f}",
                "price_usd": f"${float(clinic.get('priceGBP', 0) * 1.25):.2f}",
                "location": clinic.get('location', 'Istanbul'),
                "guarantee": clinic.get('guarantee', '5 Years'),
                "turnaround": clinic.get('turnaround', '3-5 Days'),
                "rating": clinic.get('rating', '⭐⭐⭐⭐⭐')
            })
        
        # Calculate treatment summary
        treatments = []
        if data.get('items'):
            treatments = [f"{item.get('quantity', 1)}x {item.get('treatment', '')}" for item in data.get('items', [])]
        treatment_summary = " + ".join(treatments) if treatments else "Dental Treatment Package"
        
        # Generate UK vs Istanbul price comparison
        savings = []
        if data.get('items'):
            for item in data.get('items', []):
                # UK price is typically 2-3x higher
                uk_price = item.get('priceGBP', 0) * 2.5
                istanbul_price = item.get('priceGBP', 0)
                savings.append({
                    "name": item.get('treatment', ''),
                    "uk": f"£{uk_price:.2f}",
                    "istanbul": f"£{istanbul_price:.2f}",
                    "savings": f"£{(uk_price - istanbul_price):.2f}"
                })
        
        # Sample reviews
        reviews = [
            {"text": "The best dental experience I've had – professional, smooth and transparent.", "author": "Sarah W."},
            {"text": "Incredible results and I got to explore Istanbul too. 100% recommend!", "author": "James T."},
            {"text": "From airport to aftercare, every detail was taken care of. Thanks team!", "author": "Alicia M."}
        ]
        
        # Prepare data for the template
        quote_data = {
            "quote_id": quote_id,
            "name": data.get('patientName', 'Valued Customer'),
            "date": formatted_date,
            "treatment": treatment_summary,
            "clinics": formatted_clinics,
            "duration": "3-5 Days",
            "materials": "Premium dental materials with long-term guarantee",
            "hotel": "4-star luxury stay with breakfast, walking distance to clinic – £240 (3 nights)",
            "transport": "VIP airport pickup + all clinic transfers – £75",
            "flights": f"London-Istanbul return – £150–£300 ({data.get('travelMonth', 'flexible')})",
            "bonuses": "Free Turkish Hamam experience & English-speaking coordinator",
            "savings": savings,
            "reviews": reviews,
            "consultation_link": "https://calendly.com/istanbuldentalsmile/consultation",
            "deposit_link": "https://payment.istanbuldentalsmile.com/deposit",
            "email": "info@istanbuldentalsmile.com",
            "website": "www.istanbuldentalsmile.com"
        }
        
        # Generate HTML from template
        html = render_template("quote_pdf.html", **quote_data)
        
        # Convert HTML to PDF
        pdf_buffer = io.BytesIO()
        pisa.CreatePDF(io.StringIO(html), dest=pdf_buffer)
        
        # Prepare response
        pdf_buffer.seek(0)
        response = make_response(pdf_buffer.read())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=IstanbulDentalSmile_Quote_{quote_id}.pdf'
        
        return response
        
    except Exception as e:
        print(f"Error generating quote: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with the main application
    app.run(host='0.0.0.0', port=5001, debug=True)