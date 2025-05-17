"""
Integration routes for the MyDentalFly application.
Handles integration with external services like email, PDF generation, etc.
"""

import logging
import os
from flask import Blueprint, request, jsonify, session, render_template
from services.treatment_service import TreatmentService
from services.promo_service import PromoService

# Create Blueprint
integration_routes = Blueprint('integration_routes', __name__, url_prefix='/api/integration')

# Initialize services
treatment_service = TreatmentService()
promo_service = PromoService()

# Logger
logger = logging.getLogger(__name__)

@integration_routes.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate a PDF of the quote."""
    # Get session data
    selected_treatments = session.get('selected_treatments', [])
    promo_code = session.get('promo_code')
    patient_info = session.get('patient_info', {})
    quote_id = session.get('quote_id', 'QUOTE-TEMP')
    
    if not selected_treatments:
        return jsonify({'error': 'No treatments selected'}), 400
    
    if not patient_info:
        return jsonify({'error': 'Patient information missing'}), 400
    
    try:
        # Calculate totals
        subtotal = sum(treatment['price'] * treatment['quantity'] for treatment in selected_treatments)
        discount_amount = 0
        if promo_code:
            discount_amount = promo_service.calculate_discount(promo_code, selected_treatments, subtotal)
        total = subtotal - discount_amount
        
        # Get promo details if applicable
        promo_details = None
        if promo_code:
            promo_details = promo_service.get_promo_details(promo_code)
        
        # In a real implementation, we would generate a PDF here
        # For demonstration purposes, we'll simulate success
        
        # Render template that would be used for PDF generation
        html_content = render_template(
            'pdf/quote_pdf.html',
            quote_id=quote_id,
            patient=patient_info,
            treatments=selected_treatments,
            promo_code=promo_code,
            promo_details=promo_details,
            subtotal=subtotal,
            discount_amount=discount_amount,
            total=total,
            date=session.get('date_generated', 'Today')
        )
        
        # In a real implementation, we would convert HTML to PDF
        # Using a library like WeasyPrint, pdfkit, or html-pdf-node
        
        # For now, just log that we would generate a PDF
        logger.info(f"PDF generation requested for quote {quote_id}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'PDF generated successfully',
            'quote_id': quote_id,
            'html_preview': html_content
        })
        
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

@integration_routes.route('/send-email', methods=['POST'])
def send_email():
    """Send the quote to the patient via email."""
    # Get session data
    patient_info = session.get('patient_info', {})
    quote_id = session.get('quote_id', 'QUOTE-TEMP')
    
    if not patient_info:
        return jsonify({'error': 'Patient information missing'}), 400
    
    email = patient_info.get('email')
    if not email:
        return jsonify({'error': 'Patient email missing'}), 400
    
    try:
        # In a real implementation, we would send an email here
        # Using a service like SendGrid, Mailjet, or SMTP
        
        # For demonstration purposes, we'll simulate success
        logger.info(f"Email would be sent to {email} for quote {quote_id}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': f'Quote sent to {email}',
            'quote_id': quote_id
        })
        
    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}")
        return jsonify({'error': f'Email sending failed: {str(e)}'}), 500

@integration_routes.route('/submit-to-crm', methods=['POST'])
def submit_to_crm():
    """Submit the quote to a CRM system."""
    # Get session data
    patient_info = session.get('patient_info', {})
    selected_treatments = session.get('selected_treatments', [])
    quote_id = session.get('quote_id', 'QUOTE-TEMP')
    
    if not patient_info:
        return jsonify({'error': 'Patient information missing'}), 400
    
    if not selected_treatments:
        return jsonify({'error': 'No treatments selected'}), 400
    
    try:
        # In a real implementation, we would submit to a CRM here
        # Using an API for systems like HubSpot, Salesforce, etc.
        
        # For demonstration purposes, we'll simulate success
        logger.info(f"CRM submission for quote {quote_id}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Quote submitted to CRM system',
            'quote_id': quote_id
        })
        
    except Exception as e:
        logger.error(f"CRM submission failed: {str(e)}")
        return jsonify({'error': f'CRM submission failed: {str(e)}'}), 500

@integration_routes.route('/currency-conversion', methods=['GET'])
def currency_conversion():
    """Convert amounts between currencies (USD, GBP, EUR, etc.)."""
    amount = request.args.get('amount', type=float)
    from_currency = request.args.get('from', default='USD')
    to_currency = request.args.get('to', default='GBP')
    
    if not amount:
        return jsonify({'error': 'Amount is required'}), 400
    
    try:
        # Simplified conversion rates (in real implementation, use an API)
        conversion_rates = {
            'USD_GBP': 0.78,
            'USD_EUR': 0.92,
            'GBP_USD': 1.28,
            'GBP_EUR': 1.17,
            'EUR_USD': 1.09,
            'EUR_GBP': 0.85
        }
        
        conversion_key = f"{from_currency}_{to_currency}"
        
        if from_currency == to_currency:
            converted_amount = amount
        elif conversion_key in conversion_rates:
            converted_amount = amount * conversion_rates[conversion_key]
        else:
            return jsonify({'error': 'Conversion not supported'}), 400
        
        return jsonify({
            'success': True,
            'original': {
                'amount': amount,
                'currency': from_currency
            },
            'converted': {
                'amount': round(converted_amount, 2),
                'currency': to_currency
            }
        })
        
    except Exception as e:
        logger.error(f"Currency conversion failed: {str(e)}")
        return jsonify({'error': f'Currency conversion failed: {str(e)}'}), 500