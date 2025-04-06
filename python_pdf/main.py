from flask import Flask, render_template, make_response, url_for, request, jsonify
from xhtml2pdf import pisa
import io
from datetime import datetime
import os
import json

app = Flask(__name__)

@app.route('/generate-quote', methods=['POST'])
def generate_quote():
    try:
        data = request.json
        
        # Default quote data
        quote_data = {
            "quote_id": data.get("quote_id", f"IDS-{datetime.now().strftime('%Y%m%d')}-001"),
            "name": data.get("patientName", "Guest"),
            "date": datetime.now().strftime("%d %B %Y"),
            "email": "contact@istanbuldentalsmile.co.uk",
            "website": "www.istanbuldentalsmile.co.uk",
            "treatment": "",
            "duration": "3-4 Days",
            "materials": "High quality dental materials",
            "clinics": [],
            "hotel": "4-star luxury stay with breakfast, walking distance to clinic",
            "transport": "VIP airport pickup + all clinic transfers",
            "flights": "Varies by departure city",
            "bonuses": "Free Turkish Hamam experience & English-speaking coordinator",
            "savings": [],
            "reviews": [
                {"text": "The best medical experience I've had – professional, smooth and transparent.", "author": "Sarah W."},
                {"text": "Incredible results and I got to explore Istanbul too. 100% recommend!", "author": "James T."},
                {"text": "From airport to aftercare, every detail was taken care of. Thanks team!", "author": "Alicia M."}
            ],
            "consultation_link": "https://calendly.com/istanbuldentalsmile/consultation",
            "deposit_link": "https://your-payment-url.com"
        }
        
        # Process treatment items from request
        if 'items' in data and data['items']:
            treatments = []
            for item in data['items']:
                treatments.append(item['treatment'])
            
            quote_data['treatment'] = ", ".join(treatments)
        
        # Process clinic comparison
        if 'clinics' in data and data['clinics']:
            for clinic in data['clinics']:
                price_gbp = f"£{clinic['priceGBP']}"
                quote_data['clinics'].append({
                    "name": clinic['name'],
                    "price_gbp": price_gbp,
                    "price_usd": f"${int(clinic['priceGBP'] * 1.25)}", # Estimate USD conversion
                    "location": "Istanbul", 
                    "guarantee": "5 Years",
                    "turnaround": "3-4 Days",
                    "rating": "⭐️⭐️⭐️⭐️⭐️"
                })
        
        # Process savings comparison
        if 'items' in data and data['items'] and 'totalGBP' in data:
            for item in data['items']:
                uk_price = item['priceGBP'] * 2.5  # Estimate UK price
                savings = uk_price - item['priceGBP']
                quote_data['savings'].append({
                    "name": item['treatment'],
                    "uk": f"£{uk_price:.2f}",
                    "istanbul": f"£{item['priceGBP']:.2f}",
                    "savings": f"£{savings:.2f}"
                })
        
        # Add flight estimates based on travel month
        if 'travelMonth' in data and data['travelMonth']:
            month = data['travelMonth']
            if month in ['June', 'July', 'August', 'December']:
                quote_data['flights'] = "£200-£350 (Peak season)"
            else:
                quote_data['flights'] = "£150-£250 (Off-peak season)"
        
        # Customize based on departure city
        if 'departureCity' in data and data['departureCity']:
            city = data['departureCity']
            quote_data['flights'] = f"{city}-Istanbul return – {quote_data['flights']}"
            
        # Generate the PDF
        html = render_template("quote_pdf.html", **quote_data)
        pdf = io.BytesIO()
        pisa.CreatePDF(io.StringIO(html), dest=pdf)
        
        pdf.seek(0)
        response = make_response(pdf.read())
        response.headers['Content-Type'] = 'application/pdf'
        quote_filename = f"IstanbulDentalSmile_Quote_{datetime.now().strftime('%d-%m-%Y')}.pdf"
        response.headers['Content-Disposition'] = f'attachment; filename={quote_filename}'
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health')
def health_check():
    return jsonify({"status": "ok", "message": "Python PDF generator is running"})

if __name__ == '__main__':
    # Get port from environment or use 5001 as default
    port = int(os.environ.get('PYTHON_PDF_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)