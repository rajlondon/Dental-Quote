
from flask import Flask, render_template, make_response
from xhtml2pdf import pisa
import io
from datetime import datetime

app = Flask(__name__)

@app.route('/generate-quote')
def generate_quote():
    quote_data = {
        "quote_id": "Q-20250406-001",
        "name": "Raj Singh",
        "date": datetime.now().strftime("%d %B %Y"),
        "treatment": "8 E-max Veneers + Laser Whitening",
        "duration": "3-4 Days",
        "materials": "E-max Veneers – highly aesthetic & durable ceramic",
        "clinics": [
            {"name": "DentGroup Istanbul", "price_gbp": "£1,800", "location": "Nişantaşı", "guarantee": "5 Years", "turnaround": "3 Days", "rating": "⭐⭐⭐⭐⭐"},
            {"name": "Vera Smile", "price_gbp": "£1,700", "location": "Şişli", "guarantee": "5 Years", "turnaround": "4 Days", "rating": "⭐⭐⭐⭐½"},
            {"name": "LuxClinic Turkey", "price_gbp": "£1,850", "location": "Levent", "guarantee": "10 Years", "turnaround": "3 Days", "rating": "⭐⭐⭐⭐⭐"}
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

    html = render_template("quote_pdf.html", **quote_data)
    pdf = io.BytesIO()
    pisa.CreatePDF(io.StringIO(html), dest=pdf)

    pdf.seek(0)
    response = make_response(pdf.read())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=IstanbulDentalSmile_Quote.pdf'
    return response

if __name__ == '__main__':
    app.run(debug=True)
