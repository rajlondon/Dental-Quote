"""
Treatment Service for Dental Quote System
Provides treatment data and pricing calculations
"""

class TreatmentService:
    """
    Service for managing dental treatments
    - Provides treatment data
    - Calculates pricing
    - Organizes treatments by category
    """
    
    @staticmethod
    def get_all_treatments():
        """Get all available dental treatments"""
        all_treatments = {
            'popular': TreatmentService.get_popular_treatments(),
            'implants': TreatmentService.get_implant_treatments(),
            'cosmetic': TreatmentService.get_cosmetic_treatments(),
            'restorative': TreatmentService.get_restorative_treatments(),
            'preventive': TreatmentService.get_preventive_treatments()
        }
        return all_treatments
    
    @staticmethod
    def get_treatment_by_id(treatment_id):
        """Get a specific treatment by ID"""
        all_categories = TreatmentService.get_all_treatments()
        for category, treatments in all_categories.items():
            for treatment in treatments:
                if treatment['id'] == treatment_id:
                    return treatment
        return None
    
    @staticmethod
    def get_popular_treatments():
        """Get popular dental treatments"""
        return [
            {
                'id': 'dental_implant_standard',
                'name': 'Dental Implant (Standard)',
                'description': 'Titanium implant with abutment and crown. Replaces a single missing tooth with a permanent solution.',
                'price': 750.00,
                'category': 'popular'
            },
            {
                'id': 'porcelain_veneers',
                'name': 'Porcelain Veneers',
                'description': 'Custom-made shells that cover the front surface of teeth to improve appearance.',
                'price': 350.00,
                'category': 'popular'
            },
            {
                'id': 'teeth_whitening',
                'name': 'Professional Teeth Whitening',
                'description': 'In-office whitening procedure to remove stains and discoloration.',
                'price': 180.00,
                'category': 'popular'
            },
            {
                'id': 'dental_crowns',
                'name': 'Dental Crowns',
                'description': 'Custom-fitted caps that restore damaged teeth to their normal shape, size, and function.',
                'price': 290.00,
                'category': 'popular'
            }
        ]
    
    @staticmethod
    def get_implant_treatments():
        """Get implant-related dental treatments"""
        return [
            {
                'id': 'dental_implant_standard',
                'name': 'Dental Implant (Standard)',
                'description': 'Titanium implant with abutment and crown. Replaces a single missing tooth with a permanent solution.',
                'price': 750.00,
                'category': 'implants'
            },
            {
                'id': 'dental_implant_premium',
                'name': 'Dental Implant (Premium)',
                'description': 'Premium implant system with lifetime warranty. Includes all components and procedures.',
                'price': 950.00,
                'category': 'implants'
            },
            {
                'id': 'all_on_4_implants',
                'name': 'All-on-4 Dental Implants',
                'description': 'Full arch restoration using just 4 implants to support a fixed prosthesis.',
                'price': 4500.00,
                'category': 'implants'
            },
            {
                'id': 'all_on_6_implants',
                'name': 'All-on-6 Dental Implants',
                'description': 'Full arch restoration using 6 implants for enhanced stability and longevity.',
                'price': 5800.00,
                'category': 'implants'
            },
            {
                'id': 'bone_graft',
                'name': 'Bone Grafting',
                'description': 'Procedure to build up bone to provide a solid foundation for dental implants.',
                'price': 450.00,
                'category': 'implants'
            },
            {
                'id': 'sinus_lift',
                'name': 'Sinus Lift',
                'description': 'Adds bone to your upper jaw in the area of your molars and premolars to enable implant placement.',
                'price': 650.00,
                'category': 'implants'
            }
        ]
    
    @staticmethod
    def get_cosmetic_treatments():
        """Get cosmetic dental treatments"""
        return [
            {
                'id': 'porcelain_veneers',
                'name': 'Porcelain Veneers',
                'description': 'Custom-made shells that cover the front surface of teeth to improve appearance.',
                'price': 350.00,
                'category': 'cosmetic'
            },
            {
                'id': 'composite_veneers',
                'name': 'Composite Veneers',
                'description': 'Direct application of tooth-colored composite resin to reshape and enhance teeth.',
                'price': 200.00,
                'category': 'cosmetic'
            },
            {
                'id': 'teeth_whitening',
                'name': 'Professional Teeth Whitening',
                'description': 'In-office whitening procedure to remove stains and discoloration.',
                'price': 180.00,
                'category': 'cosmetic'
            },
            {
                'id': 'hollywood_smile',
                'name': 'Hollywood Smile Makeover',
                'description': 'Comprehensive treatment including veneers, whitening, and other procedures for a perfect smile.',
                'price': 2500.00,
                'category': 'cosmetic'
            },
            {
                'id': 'gum_contouring',
                'name': 'Gum Contouring',
                'description': 'Reshaping the gum line to improve the aesthetics of your smile.',
                'price': 300.00,
                'category': 'cosmetic'
            }
        ]
    
    @staticmethod
    def get_restorative_treatments():
        """Get restorative dental treatments"""
        return [
            {
                'id': 'dental_crowns',
                'name': 'Dental Crowns',
                'description': 'Custom-fitted caps that restore damaged teeth to their normal shape, size, and function.',
                'price': 290.00,
                'category': 'restorative'
            },
            {
                'id': 'dental_bridges',
                'name': 'Dental Bridges',
                'description': 'Fixed appliances that replace one or more missing teeth by joining artificial teeth to adjacent teeth.',
                'price': 650.00,
                'category': 'restorative'
            },
            {
                'id': 'dental_fillings',
                'name': 'Dental Fillings',
                'description': 'Restoration of decayed teeth using composite materials that match your natural tooth color.',
                'price': 80.00,
                'category': 'restorative'
            },
            {
                'id': 'root_canal',
                'name': 'Root Canal Treatment',
                'description': 'Removal of infected pulp from inside a tooth, cleaning, and sealing it.',
                'price': 320.00,
                'category': 'restorative'
            },
            {
                'id': 'inlays_onlays',
                'name': 'Inlays & Onlays',
                'description': 'Custom-made fillings for larger cavities, providing better strength and longevity than standard fillings.',
                'price': 250.00,
                'category': 'restorative'
            },
            {
                'id': 'full_mouth_reconstruction',
                'name': 'Full Mouth Reconstruction',
                'description': 'Comprehensive treatment to rebuild or restore all teeth in both the upper and lower jaws.',
                'price': 6500.00,
                'category': 'restorative'
            }
        ]
    
    @staticmethod
    def get_preventive_treatments():
        """Get preventive dental treatments"""
        return [
            {
                'id': 'dental_cleaning',
                'name': 'Professional Dental Cleaning',
                'description': 'Thorough cleaning by a dental hygienist to remove plaque and tartar.',
                'price': 60.00,
                'category': 'preventive'
            },
            {
                'id': 'dental_exam',
                'name': 'Comprehensive Dental Exam',
                'description': 'Complete evaluation of oral health, including X-rays and oral cancer screening.',
                'price': 85.00,
                'category': 'preventive'
            },
            {
                'id': 'dental_sealants',
                'name': 'Dental Sealants',
                'description': 'Protective coating applied to the chewing surfaces of back teeth to prevent decay.',
                'price': 35.00,
                'category': 'preventive'
            },
            {
                'id': 'fluoride_treatment',
                'name': 'Fluoride Treatment',
                'description': 'Application of fluoride to teeth to prevent tooth decay and strengthen enamel.',
                'price': 25.00,
                'category': 'preventive'
            }
        ]
    
    @staticmethod
    def calculate_subtotal(selected_treatments):
        """Calculate the subtotal for selected treatments"""
        subtotal = 0.0
        for treatment in selected_treatments:
            subtotal += treatment['price'] * treatment['quantity']
        return subtotal