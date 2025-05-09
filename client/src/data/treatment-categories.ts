import { TreatmentCategory } from '@/components/TreatmentPlanBuilder';

/**
 * Centralized treatment categories data
 * This data is used throughout the application for treatment selections
 */
export const treatmentCategoriesData: TreatmentCategory[] = [
  {
    id: 'implants',
    name: 'Implants',
    treatments: [
      { 
        id: 'dental_implant_standard', 
        name: 'Dental Implant (Standard)', 
        priceGBP: 875, 
        priceUSD: 1120,
        guarantee: '5-year',
        notes: 'Actual prices vary based on materials used and clinic quality. Final quotes will be confirmed after your dental records are reviewed.'
      },
      { 
        id: 'dental_implant_premium', 
        name: 'Dental Implant (Premium)', 
        priceGBP: 3000, 
        priceUSD: 3850,
        guarantee: '10-year',
        notes: 'for premium brands like Straumann or Nobel Biocare. Clinic prices vary based on materials used.'
      },
      { 
        id: 'all_on_4_implants', 
        name: 'All-on-4 Implants (Full Arch)', 
        priceGBP: 12000, 
        priceUSD: 15400,
        guarantee: '10-year',
        notes: ' Includes 4 implants and a full arch restoration. Clinic prices vary based on materials used.'
      },
      { 
        id: 'all_on_6_implants', 
        name: 'All-on-6 Implants (Full Arch)', 
        priceGBP: 14000, 
        priceUSD: 18000,
        guarantee: '10-year',
        notes: ' Includes 6 implants and a full arch restoration, providing additional support and stability, particularly in the upper jaw.'
      },
      { 
        id: 'bone_graft', 
        name: 'Bone Graft (Per Site)', 
        priceGBP: 650, 
        priceUSD: 835,
        guarantee: 'N/A',
        notes: ' May be required if your jaw bone lacks sufficient volume to support implants.'
      },
      { 
        id: 'sinus_lift', 
        name: 'Sinus Lift', 
        priceGBP: 900, 
        priceUSD: 1160,
        guarantee: 'N/A',
        notes: ' May be needed for upper jaw implants when there is insufficient bone height.'
      },
    ],
  },
  {
    id: 'crowns_veneers',
    name: 'Veneers & Crowns',
    treatments: [
      { 
        id: 'porcelain_crown', 
        name: 'Porcelain Crown', 
        priceGBP: 650, 
        priceUSD: 835,
        guarantee: '3-year',
        notes: ' Clinic prices vary based on materials used and specifications.'
      },
      { 
        id: 'zirconia_crown', 
        name: 'Zirconia Crown', 
        priceGBP: 850, 
        priceUSD: 1100,
        guarantee: '5-year',
        notes: ' More durable than porcelain crowns and highly aesthetic.'
      },
      { 
        id: 'porcelain_veneer', 
        name: 'Porcelain Veneer', 
        priceGBP: 600, 
        priceUSD: 770,
        guarantee: '3-year',
        notes: ' Thin shells bonded to the front surface of teeth to improve appearance.'
      },
      { 
        id: 'composite_veneer', 
        name: 'Composite Veneer', 
        priceGBP: 350, 
        priceUSD: 450,
        guarantee: '2-year',
        notes: ' A more affordable alternative to porcelain veneers.'
      },
      { 
        id: 'inlay_onlay', 
        name: 'Inlay/Onlay', 
        priceGBP: 450, 
        priceUSD: 580,
        guarantee: '5-year',
        notes: ' Used when a tooth is too damaged for a filling but not enough for a crown.'
      },
    ],
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    treatments: [
      { 
        id: 'zoom_whitening', 
        name: 'Zoom Whitening (In-office)', 
        priceGBP: 450, 
        priceUSD: 580,
        guarantee: '1-year',
        notes: ' Professional whitening treatment that uses light-activated technology.'
      },
      { 
        id: 'laser_whitening', 
        name: 'Laser Whitening', 
        priceGBP: 550, 
        priceUSD: 710,
        guarantee: '1-year',
        notes: ' Uses laser light to activate the whitening solution for faster results.'
      },
      { 
        id: 'home_whitening_kit', 
        name: 'Professional Home Whitening Kit', 
        priceGBP: 250, 
        priceUSD: 320,
        guarantee: '1-year',
        notes: ' Custom-made trays with professional whitening gel for home use.'
      },
    ],
  },
  {
    id: 'full_mouth',
    name: 'Full Mouth Rehab',
    treatments: [
      { 
        id: 'full_smile_makeover', 
        name: 'Full Smile Makeover', 
        priceGBP: 8000, 
        priceUSD: 10300,
        guarantee: '5-year',
        notes: ' Comprehensive treatment plan combining multiple procedures for a complete smile transformation.'
      },
      { 
        id: 'hollywood_smile', 
        name: 'Hollywood Smile (8-10 Veneers)', 
        priceGBP: 5500, 
        priceUSD: 7100,
        guarantee: '5-year',
        notes: ' Premium full mouth transformation with high-quality veneers or crowns.'
      },
      { 
        id: 'full_mouth_restoration', 
        name: 'Full Mouth Restoration', 
        priceGBP: 12000, 
        priceUSD: 15400,
        guarantee: '5-year',
        notes: ' Complete restoration of all teeth to restore function and aesthetics.'
      },
    ],
  },
  {
    id: 'general',
    name: 'General Dentistry',
    treatments: [
      { 
        id: 'dental_checkup_cleaning', 
        name: 'Dental Check-up & Cleaning', 
        priceGBP: 80, 
        priceUSD: 100,
        guarantee: 'N/A',
        notes: ' Comprehensive examination, professional cleaning, and preventative care advice.'
      },
      { 
        id: 'tooth_fillings', 
        name: 'Tooth Fillings (Composite)', 
        priceGBP: 120, 
        priceUSD: 155,
        guarantee: '2-year',
        notes: ' High-quality composite (tooth-colored) fillings to repair cavities and tooth damage.'
      },
      { 
        id: 'root_canal', 
        name: 'Root Canal Treatment', 
        priceGBP: 500, 
        priceUSD: 645,
        guarantee: '2-year',
        notes: ' Modern, minimally painful root canal therapy to save damaged teeth.'
      },
      { 
        id: 'tooth_extraction', 
        name: 'Tooth Extraction', 
        priceGBP: 150, 
        priceUSD: 195,
        guarantee: 'N/A',
        notes: ' Simple extraction of visible tooth. Surgical extractions may cost more.'
      },
      { 
        id: 'dental_bridge', 
        name: 'Dental Bridge (3-unit)', 
        priceGBP: 1500, 
        priceUSD: 1930,
        guarantee: '5-year',
        notes: ' Fixed prosthetic device to replace missing teeth by joining artificial teeth to adjacent natural teeth.'
      },
    ],
  },
  {
    id: 'other',
    name: 'Other Treatments',
    treatments: [
      { 
        id: 'orthodontics_invisalign', 
        name: 'Invisalign Treatment', 
        priceGBP: 4000, 
        priceUSD: 5150,
        guarantee: '1-year',
        notes: ' Clear aligner system to straighten teeth without traditional braces.'
      },
      { 
        id: 'orthodontics_braces', 
        name: 'Traditional Braces', 
        priceGBP: 3000, 
        priceUSD: 3850,
        guarantee: '1-year',
        notes: ' Metal or ceramic brackets bonded to teeth to correct alignment.'
      },
      { 
        id: 'gum_treatment', 
        name: 'Periodontal (Gum) Treatment', 
        priceGBP: 400, 
        priceUSD: 515,
        guarantee: 'N/A',
        notes: ' Specialized treatment for gum disease, including deep cleaning and medication.'
      },
      { 
        id: 'night_guard', 
        name: 'Night Guard/Splint', 
        priceGBP: 250, 
        priceUSD: 320,
        guarantee: '1-year',
        notes: ' Custom-made device to prevent teeth grinding during sleep.'
      },
    ],
  },
];

// For convenience, export a direct reference to use in components
export default treatmentCategoriesData;