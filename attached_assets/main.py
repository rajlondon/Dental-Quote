
from flask import Flask, render_template, make_response
from xhtml2pdf import pisa
import io
from datetime import datetime

app = Flask(__name__)

@app.route('/generate-quote')
def generate_quote():
    quote_data = {
        "name": "Raj Singh",
        "email": "raj@example.com",
        "date": datetime.now().strftime("%d %B %Y"),
        "treatment": "8 Zirconium Crowns + Whitening",
        "clinics": [
            {"name": "DentGroup Istanbul", "price_gbp": "£1,800", "price_usd": "$2,200"},
            {"name": "Vera Smile", "price_gbp": "£1,700", "price_usd": "$2,100"},
            {"name": "LuxClinic Turkey", "price_gbp": "£1,850", "price_usd": "$2,250"},
        ],
        "hotel": "4★ partner hotel near clinic (3 nights with breakfast) – £240",
        "transport": "VIP transfer service – £75",
        "flights": "London-Istanbul return – £150–£250",
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
