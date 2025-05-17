from flask import Blueprint, request, jsonify
from services.promo_service import PromoService

promo_routes = Blueprint('promo_routes', __name__)

@promo_routes.route('/api/promo-codes/apply', methods=['POST'])
def apply_promo_code():
    """Apply a promo code to the current quote"""
    data = request.get_json()
    
    if not data or 'promo_code' not in data:
        return jsonify({
            "success": False,
            "error": "Promo code is required"
        }), 400
    
    result = PromoService.apply_promo_code(data['promo_code'])
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 400

@promo_routes.route('/api/promo-codes/remove', methods=['POST'])
def remove_promo_code():
    """Remove the currently applied promo code"""
    result = PromoService.remove_promo_code()
    return jsonify(result)

@promo_routes.route('/api/promo-codes/current', methods=['GET'])
def get_current_promo():
    """Get information about the currently applied promo code"""
    promo = PromoService.get_applied_promo()
    
    if promo:
        return jsonify({
            "success": True,
            "promo_code": promo["code"],
            "discount": promo["discount"]
        })
    else:
        return jsonify({
            "success": True,
            "promo_code": None,
            "discount": 0
        })

@promo_routes.route('/api/promo-codes/restore-previous', methods=['POST'])
def restore_previous_promo():
    """Restore the previously applied promo code"""
    result = PromoService.restore_previous_promo()
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 400