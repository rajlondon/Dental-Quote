// Define the basic types for treatment categories
export interface Treatment {
  id: string;
  name: string;
  priceGBP: number;
  priceUSD: number;
  guarantee?: string;
  description?: string;
  additionalInfo?: string;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  treatments: Treatment[];
}

// Treatment categories data
export const treatmentCategoriesData: TreatmentCategory[] = [
  {
    id: 'implants',
    name: 'Dental Implants',
    description: 'Permanent tooth replacement solutions',
    treatments: [
      {
        id: 'single-implant',
        name: 'Single Dental Implant',
        priceGBP: 550,
        priceUSD: 710,
        guarantee: '5 years',
        description: 'Complete single tooth replacement including abutment and crown'
      },
      {
        id: 'implant-abutment',
        name: 'Implant Abutment',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '3 years',
        description: 'Custom abutment for dental implant'
      },
      {
        id: 'implant-crown',
        name: 'Implant Crown',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '5 years',
        description: 'Custom-made crown for dental implant'
      },
      {
        id: 'all-on-4',
        name: 'All-on-4 Implants',
        priceGBP: 4000,
        priceUSD: 5200,
        guarantee: '10 years',
        description: 'Full arch restoration with only 4 implants'
      },
      {
        id: 'all-on-6',
        name: 'All-on-6 Implants',
        priceGBP: 5500,
        priceUSD: 7150,
        guarantee: '10 years',
        description: 'Full arch restoration with 6 implants for maximum stability'
      },
      {
        id: 'bone-graft',
        name: 'Bone Graft',
        priceGBP: 300,
        priceUSD: 390,
        guarantee: '1 year',
        description: 'Procedure to build up bone for implant placement'
      },
      {
        id: 'sinus-lift',
        name: 'Sinus Lift',
        priceGBP: 450,
        priceUSD: 585,
        guarantee: '1 year',
        description: 'Specialized procedure to add bone to upper jaw'
      }
    ]
  },
  {
    id: 'crowns',
    name: 'Crowns & Bridges',
    description: 'Restore damaged teeth and fill gaps',
    treatments: [
      {
        id: 'porcelain-crown',
        name: 'Porcelain Crown',
        priceGBP: 180,
        priceUSD: 234,
        guarantee: '5 years',
        description: 'Metal-free crown with excellent aesthetics'
      },
      {
        id: 'zirconia-crown',
        name: 'Zirconia Crown',
        priceGBP: 220,
        priceUSD: 286,
        guarantee: '7 years',
        description: 'Extremely durable crown with natural appearance'
      },
      {
        id: 'emax-crown',
        name: 'E-max Crown',
        priceGBP: 200,
        priceUSD: 260,
        guarantee: '5 years',
        description: 'All-ceramic crown with superior aesthetics'
      },
      {
        id: 'pfm-crown',
        name: 'PFM Crown',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '5 years',
        description: 'Porcelain-fused-to-metal crown'
      },
      {
        id: '3-unit-bridge',
        name: '3-Unit Bridge',
        priceGBP: 450,
        priceUSD: 585,
        guarantee: '5 years',
        description: 'Bridge to replace a single missing tooth'
      },
      {
        id: 'maryland-bridge',
        name: 'Maryland Bridge',
        priceGBP: 300,
        priceUSD: 390,
        guarantee: '3 years',
        description: 'Minimally invasive bridge with metal or porcelain wings'
      }
    ]
  },
  {
    id: 'veneers',
    name: 'Veneers',
    description: 'Transform your smile with custom facings',
    treatments: [
      {
        id: 'porcelain-veneer',
        name: 'Porcelain Veneer',
        priceGBP: 200,
        priceUSD: 260,
        guarantee: '5 years',
        description: 'Thin ceramic shell bonded to front of tooth'
      },
      {
        id: 'composite-veneer',
        name: 'Composite Veneer',
        priceGBP: 120,
        priceUSD: 156,
        guarantee: '3 years',
        description: 'Direct application of composite resin'
      },
      {
        id: 'lumineers',
        name: 'Lumineers',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '5 years',
        description: 'Ultra-thin veneers requiring minimal tooth preparation'
      },
      {
        id: 'veneer-package-6',
        name: '6 Veneers Package',
        priceGBP: 1000,
        priceUSD: 1300,
        guarantee: '5 years',
        description: 'Transform your smile with 6 porcelain veneers'
      },
      {
        id: 'veneer-package-8',
        name: '8 Veneers Package',
        priceGBP: 1400,
        priceUSD: 1820,
        guarantee: '5 years',
        description: 'Complete smile makeover with 8 porcelain veneers'
      }
    ]
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Professional whitening treatments',
    treatments: [
      {
        id: 'zoom-whitening',
        name: 'Zoom Whitening',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '1 year',
        description: 'In-office whitening with light-activated gel'
      },
      {
        id: 'home-whitening',
        name: 'Home Whitening Kit',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '6 months',
        description: 'Custom trays with professional whitening gel'
      },
      {
        id: 'combined-whitening',
        name: 'Combined Whitening',
        priceGBP: 300,
        priceUSD: 390,
        guarantee: '1 year',
        description: 'In-office treatment plus home kit for best results'
      }
    ]
  },
  {
    id: 'root-canal',
    name: 'Root Canal Treatment',
    description: 'Save infected teeth with endodontic therapy',
    treatments: [
      {
        id: 'anterior-rct',
        name: 'Anterior Root Canal',
        priceGBP: 100,
        priceUSD: 130,
        guarantee: '2 years',
        description: 'Root canal treatment for front teeth'
      },
      {
        id: 'premolar-rct',
        name: 'Premolar Root Canal',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '2 years',
        description: 'Root canal treatment for premolar teeth'
      },
      {
        id: 'molar-rct',
        name: 'Molar Root Canal',
        priceGBP: 200,
        priceUSD: 260,
        guarantee: '2 years',
        description: 'Root canal treatment for molar teeth'
      },
      {
        id: 'retreatment-rct',
        name: 'Root Canal Retreatment',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '1 year',
        description: 'Treatment of previously root canal treated tooth'
      },
      {
        id: 'apicoectomy',
        name: 'Apicoectomy',
        priceGBP: 300,
        priceUSD: 390,
        guarantee: '2 years',
        description: 'Surgical procedure to remove infected root tip'
      }
    ]
  },
  {
    id: 'orthodontics',
    name: 'Orthodontics',
    description: 'Straighten teeth with braces and aligners',
    treatments: [
      {
        id: 'metal-braces',
        name: 'Metal Braces',
        priceGBP: 1500,
        priceUSD: 1950,
        guarantee: '2 years',
        description: 'Traditional metal brackets and wires'
      },
      {
        id: 'ceramic-braces',
        name: 'Ceramic Braces',
        priceGBP: 1800,
        priceUSD: 2340,
        guarantee: '2 years',
        description: 'Tooth-colored brackets for a more discreet appearance'
      },
      {
        id: 'lingual-braces',
        name: 'Lingual Braces',
        priceGBP: 2500,
        priceUSD: 3250,
        guarantee: '2 years',
        description: 'Brackets attached to the back of teeth'
      },
      {
        id: 'clear-aligners',
        name: 'Clear Aligners',
        priceGBP: 2000,
        priceUSD: 2600,
        guarantee: '2 years',
        description: 'Transparent removable aligners'
      },
      {
        id: 'retainers',
        name: 'Retainers (Pair)',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '1 year',
        description: 'Custom-made appliances to maintain treatment results'
      }
    ]
  },
  {
    id: 'extractions',
    name: 'Tooth Extractions',
    description: 'Remove damaged or problematic teeth',
    treatments: [
      {
        id: 'simple-extraction',
        name: 'Simple Extraction',
        priceGBP: 60,
        priceUSD: 78,
        guarantee: 'N/A',
        description: 'Removal of visible tooth'
      },
      {
        id: 'surgical-extraction',
        name: 'Surgical Extraction',
        priceGBP: 120,
        priceUSD: 156,
        guarantee: 'N/A',
        description: 'Removal of tooth with surgical approach'
      },
      {
        id: 'wisdom-tooth-extraction',
        name: 'Wisdom Tooth Extraction',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: 'N/A',
        description: 'Removal of third molar'
      },
      {
        id: 'complex-surgical-extraction',
        name: 'Complex Surgical Extraction',
        priceGBP: 200,
        priceUSD: 260,
        guarantee: 'N/A',
        description: 'Extraction requiring bone removal or sectioning'
      }
    ]
  },
  {
    id: 'fillings',
    name: 'Fillings',
    description: 'Restore teeth damaged by decay',
    treatments: [
      {
        id: 'composite-filling',
        name: 'Composite Filling',
        priceGBP: 40,
        priceUSD: 52,
        guarantee: '2 years',
        description: 'Tooth-colored filling material'
      },
      {
        id: 'amalgam-filling',
        name: 'Amalgam Filling',
        priceGBP: 30,
        priceUSD: 39,
        guarantee: '3 years',
        description: 'Silver-colored metal alloy filling'
      },
      {
        id: 'inlay',
        name: 'Ceramic Inlay',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '5 years',
        description: 'Custom-made ceramic restoration'
      },
      {
        id: 'onlay',
        name: 'Ceramic Onlay',
        priceGBP: 180,
        priceUSD: 234,
        guarantee: '5 years',
        description: 'Extended ceramic restoration covering cusps'
      }
    ]
  },
  {
    id: 'gum-treatment',
    name: 'Gum Treatment',
    description: 'Treat gum disease and improve oral health',
    treatments: [
      {
        id: 'scaling-root-planing',
        name: 'Scaling & Root Planing',
        priceGBP: 100,
        priceUSD: 130,
        guarantee: '6 months',
        description: 'Deep cleaning below the gumline'
      },
      {
        id: 'gingivectomy',
        name: 'Gingivectomy',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '1 year',
        description: 'Surgical reshaping of gum tissue'
      },
      {
        id: 'crown-lengthening',
        name: 'Crown Lengthening',
        priceGBP: 200,
        priceUSD: 260,
        guarantee: '1 year',
        description: 'Procedure to expose more tooth structure'
      },
      {
        id: 'gum-graft',
        name: 'Gum Graft',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '1 year',
        description: 'Treatment for receding gums'
      }
    ]
  },
  {
    id: 'dentures',
    name: 'Dentures',
    description: 'Removable replacements for missing teeth',
    treatments: [
      {
        id: 'full-denture',
        name: 'Full Denture',
        priceGBP: 350,
        priceUSD: 455,
        guarantee: '3 years',
        description: 'Complete replacement for all teeth in an arch'
      },
      {
        id: 'partial-denture',
        name: 'Partial Denture',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '3 years',
        description: 'Replacement for some missing teeth'
      },
      {
        id: 'flexible-denture',
        name: 'Flexible Denture',
        priceGBP: 400,
        priceUSD: 520,
        guarantee: '3 years',
        description: 'Comfortable denture made from flexible material'
      },
      {
        id: 'implant-retained-denture',
        name: 'Implant-Retained Denture',
        priceGBP: 1500,
        priceUSD: 1950,
        guarantee: '5 years',
        description: 'Denture anchored to dental implants'
      }
    ]
  }
];

export default treatmentCategoriesData;