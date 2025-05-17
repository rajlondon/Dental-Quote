"""
Integration Routes Module
Handles integration with external systems for the dental quote system
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
import json
import os
import uuid
from datetime import datetime

# Import utilities
from utils.session_manager import get_treatments, get_patient_info, calculate_totals

# Create blueprint
integration_routes = Blueprint('integration_routes', __name__)

@integration_routes.route('/api/quote-data')
def get_quote_data():
    """API endpoint to get current quote data as JSON."""
    # Get data from session
    treatments = get_treatments()
    patient_info = get_patient_info()
    subtotal, discount, total = calculate_totals()
    
    # Build response data
    data = {
        'quote_ref': session.get('quote_ref'),
        'treatments': treatments,
        'patient_info': patient_info,
        'promo_code': session.get('promo_code'),
        'promo_details': session.get('promo_details'),
        'pricing': {
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        },
        'created_at': session.get('created_at')
    }
    
    return jsonify(data)

@integration_routes.route('/api/save-quote', methods=['POST'])
def save_quote():
    """API endpoint to save quote to external system."""
    # In a real implementation, this would connect to an external API
    # or database to save the quote data
    
    # Get data from session
    treatments = get_treatments()
    patient_info = get_patient_info()
    subtotal, discount, total = calculate_totals()
    
    # Check if we have required data
    if not treatments:
        return jsonify({
            'success': False,
            'message': 'Cannot save an empty quote. Please add at least one treatment.'
        }), 400
    
    if not patient_info.get('name') or not patient_info.get('email'):
        return jsonify({
            'success': False,
            'message': 'Patient information is incomplete. Please provide name and email.'
        }), 400
    
    # Build quote data for saving
    quote_data = {
        'quote_ref': session.get('quote_ref'),
        'treatments': treatments,
        'patient_info': patient_info,
        'promo_code': session.get('promo_code'),
        'promo_details': session.get('promo_details'),
        'pricing': {
            'subtotal': subtotal,
            'discount': discount,
            'total': total
        },
        'created_at': session.get('created_at'),
        'saved_at': datetime.now().isoformat()
    }
    
    # In a real implementation, we would save this data to an external system
    # For now, simulate a successful save
    
    # Return success response
    return jsonify({
        'success': True,
        'message': 'Quote saved successfully!',
        'quote_ref': session.get('quote_ref')
    })

@integration_routes.route('/api/send-quote-email', methods=['POST'])
def send_quote_email():
    """API endpoint to send quote via email."""
    # In a real implementation, this would send an email with the quote details
    
    # Get data from session
    patient_info = get_patient_info()
    
    # Check if we have required data
    if not patient_info.get('email'):
        return jsonify({
            'success': False,
            'message': 'Patient email is required to send the quote.'
        }), 400
    
    # In a real implementation, we would send an email here
    # For now, simulate a successful email send
    
    # Return success response
    return jsonify({
        'success': True,
        'message': f'Quote sent to {patient_info.get("email")} successfully!',
        'quote_ref': session.get('quote_ref')
    })

@integration_routes.route('/api/export-pdf')
def export_pdf():
    """API endpoint to export quote as PDF."""
    # In a real implementation, this would generate a PDF and return it
    
    # Check if we have required data
    treatments = get_treatments()
    if not treatments:
        flash('Cannot export an empty quote. Please add at least one treatment.', 'error')
        return redirect(url_for('page_routes.quote_builder'))
    
    # For now, just redirect to the review page with a success message
    flash('PDF export feature will be available soon!', 'info')
    return redirect(url_for('page_routes.review_quote'))