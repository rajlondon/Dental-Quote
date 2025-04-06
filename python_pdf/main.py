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
        
        # Build structured quote data from user input
        quote_data = {
            "quote_id": data.get("quoteNumber", f"IDS-{datetime.now().strftime('%Y%m%d')}-{str(datetime.now().microsecond)[:3]}"),
            "name": data.get("patientName", "Guest"),
            "date": datetime.now().strftime("%d %B %Y"),
            "email": "contact@istanbuldentalsmile.co.uk",
            "website": "www.istanbuldentalsmile.co.uk",
            "treatment": "",
            "duration": "3-4 Days",
            "materials": "E-max Veneers – highly aesthetic & durable ceramic",
            "clinics": [
                {"name": "DentGroup Istanbul", "price_gbp": "£1,800", "price_usd": "$2,200", "location": "Nişantaşı", "guarantee": "5 Years", "turnaround": "3 Days", "rating": "⭐️⭐️⭐️⭐️⭐️"},
                {"name": "Vera Smile", "price_gbp": "£1,700", "price_usd": "$2,100", "location": "Şişli", "guarantee": "5 Years", "turnaround": "4 Days", "rating": "⭐️⭐️⭐️⭐️½"},
                {"name": "LuxClinic Turkey", "price_gbp": "£1,850", "price_usd": "$2,250", "location": "Levent", "guarantee": "10 Years", "turnaround": "3 Days", "rating": "⭐️⭐️⭐️⭐️⭐️"}
            ],
            "hotel": "4-star luxury stay with breakfast, walking distance to clinic – £240 (3 nights)",
            "transport": "VIP airport pickup + all clinic transfers – £75",
            "flights": "London-Istanbul return – £150–£250",
            "bonuses": "Free Turkish Hamam experience & English-speaking coordinator",
            "savings": [
                {"name": "Full Smile Makeover", "uk": "£10,500", "istanbul": "£3,800", "savings": "£6,700"},
                {"name": "8 E-max Veneers", "uk": "£4,000", "istanbul": "£1,800", "savings": "£2,200"},
            ],
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
                treatment_name = item.get('treatment', '')
                quantity = item.get('quantity', 1)
                
                # Format treatment with quantity
                if quantity > 1:
                    treatments.append(f"{quantity}x {treatment_name}")
                else:
                    treatments.append(treatment_name)
            
            # Join all treatments with commas
            quote_data['treatment'] = ", ".join(treatments)
            
            # If we have real data, update the savings section
            if treatments:
                # Clear default savings
                quote_data['savings'] = []
                
                # Add actual treatment savings
                for item in data['items']:
                    treatment_name = item.get('treatment', '')
                    price_gbp = item.get('priceGBP', 0)
                    # Estimate UK price as 2.5x Istanbul price (conservative estimate)
                    uk_price = price_gbp * 2.5
                    savings = uk_price - price_gbp
                    
                    quote_data['savings'].append({
                        "name": treatment_name,
                        "uk": f"£{uk_price:.2f}",
                        "istanbul": f"£{price_gbp:.2f}",
                        "savings": f"£{savings:.2f}"
                    })
        
        # Process clinic comparison with actual quote data
        if 'items' in data and data['items'] and data.get('totalGBP'):
            # Clear default clinics if we have real data
            quote_data['clinics'] = []
            
            # Add actual clinics from our database
            base_price = data.get('totalGBP', 1800)
            
            # Create varied pricing for different clinics
            quote_data['clinics'] = [
                {
                    "name": "DentGroup Istanbul", 
                    "price_gbp": f"£{base_price}", 
                    "price_usd": f"${int(base_price * 1.25)}", 
                    "location": "Nişantaşı", 
                    "guarantee": "5 Years", 
                    "turnaround": "3 Days", 
                    "rating": "⭐️⭐️⭐️⭐️⭐️"
                },
                {
                    "name": "Vera Smile", 
                    "price_gbp": f"£{int(base_price * 0.95)}", 
                    "price_usd": f"${int(base_price * 0.95 * 1.25)}", 
                    "location": "Şişli", 
                    "guarantee": "5 Years", 
                    "turnaround": "4 Days", 
                    "rating": "⭐️⭐️⭐️⭐️½"
                },
                {
                    "name": "LuxClinic Turkey", 
                    "price_gbp": f"£{int(base_price * 1.03)}", 
                    "price_usd": f"${int(base_price * 1.03 * 1.25)}", 
                    "location": "Levent", 
                    "guarantee": "10 Years", 
                    "turnaround": "3 Days", 
                    "rating": "⭐️⭐️⭐️⭐️⭐️"
                }
            ]
        
        # Customize flight info based on travel month
        if 'travelMonth' in data and data['travelMonth']:
            month = data['travelMonth']
            if month in ['June', 'July', 'August', 'December']:
                season = "£200-£350 (Peak season)"
            else:
                season = "£150-£250 (Off-peak season)"
                
            # Set flight info including departure city if available
            if 'departureCity' in data and data['departureCity']:
                city = data['departureCity']
                quote_data['flights'] = f"{city}-Istanbul return – {season}"
            else:
                quote_data['flights'] = f"London-Istanbul return – {season}"
            
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