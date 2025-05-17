from utils.session_manager import SessionManager

class PromoService:
    """Service for managing promo codes"""
    
    # Valid promo codes and their discount percentages
    VALID_PROMO_CODES = {
        "SUMMER15": 15,
        "DENTAL25": 25,
        "NEWPATIENT": 20,
        "TEST10": 10,
        "FREECONSULT": 100,
        "LUXHOTEL20": 20,
        "IMPLANTCROWN30": 30,
        "FREEWHITE": 100
    }
    
    @staticmethod
    def apply_promo_code(code):
        """Apply a promo code to the current quote"""
        # Standardize code format
        code = code.strip().upper()
        
        # Get current quote data
        quote_data = SessionManager.get_quote_data()
        
        # Check if code is valid
        if code not in PromoService.VALID_PROMO_CODES:
            return {
                "success": False,
                "error": "Invalid promo code"
            }
        
        # Get discount percentage
        discount = PromoService.VALID_PROMO_CODES[code]
        
        # Create a backup before modifying
        previous_promo = {
            "code": quote_data.get("promo_code"),
            "discount": quote_data.get("discount", 0)
        }
        quote_data["previous_promo"] = previous_promo
        
        # Apply promo code
        quote_data["promo_code"] = code
        quote_data["discount"] = discount
        
        # Save updated quote data
        SessionManager.save_quote_data(quote_data)
        
        return {
            "success": True,
            "promo_code": code,
            "discount": discount
        }
    
    @staticmethod
    def remove_promo_code():
        """Remove the currently applied promo code"""
        # Get current quote data
        quote_data = SessionManager.get_quote_data()
        
        # Create a backup before modifying
        previous_promo = {
            "code": quote_data.get("promo_code"),
            "discount": quote_data.get("discount", 0)
        }
        quote_data["previous_promo"] = previous_promo
        
        # Remove promo code
        quote_data["promo_code"] = None
        quote_data["discount"] = 0
        
        # Save updated quote data
        SessionManager.save_quote_data(quote_data)
        
        return {
            "success": True
        }
    
    @staticmethod
    def get_applied_promo():
        """Get information about the currently applied promo code"""
        quote_data = SessionManager.get_quote_data()
        
        promo_code = quote_data.get("promo_code")
        discount = quote_data.get("discount", 0)
        
        if not promo_code:
            return None
        
        return {
            "code": promo_code,
            "discount": discount
        }
    
    @staticmethod
    def restore_previous_promo():
        """Restore the previously applied promo code (if any)"""
        quote_data = SessionManager.get_quote_data()
        
        if "previous_promo" not in quote_data:
            return {
                "success": False,
                "error": "No previous promo code found"
            }
        
        previous_promo = quote_data["previous_promo"]
        
        if previous_promo["code"]:
            quote_data["promo_code"] = previous_promo["code"]
            quote_data["discount"] = previous_promo["discount"]
        else:
            quote_data["promo_code"] = None
            quote_data["discount"] = 0
        
        # Remove previous promo data
        quote_data.pop("previous_promo", None)
        
        # Save updated quote data
        SessionManager.save_quote_data(quote_data)
        
        return {
            "success": True,
            "promo_code": quote_data["promo_code"],
            "discount": quote_data["discount"]
        }