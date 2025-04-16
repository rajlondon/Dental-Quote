import { TreatmentMap } from "../types/treatmentMapper";

// Sample treatment map data based on the provided JSON structure
// This would typically come from an API endpoint
export const sampleTreatmentMap: TreatmentMap = {
  "Dental Implant": {
    "category": "Implants",
    "clinic_variants": [
      {
        "clinic_id": "clinic_001",
        "label": "Standard Titanium Dental Implant (implant only)",
        "price": "£400 - £600",
        "includes": [
          "implant"
        ],
        "optional_addons": [
          "abutment",
          "crown"
        ]
      },
      {
        "clinic_id": "clinic_002",
        "label": "Implant + Abutment + Zirconia Crown Package",
        "price": "£950",
        "includes": [
          "implant",
          "abutment",
          "crown"
        ],
        "note": "Includes free consultation and 5-night hotel"
      }
    ]
  },
  "Porcelain Veneer": {
    "category": "Veneers & Crowns",
    "clinic_variants": [
      {
        "clinic_id": "clinic_003",
        "label": "E.max Layered Porcelain Veneer",
        "price": "£220",
        "includes": [
          "veneer"
        ]
      }
    ]
  },
  "All-on-4 Implants": {
    "category": "Implants",
    "clinic_variants": [
      {
        "clinic_id": "clinic_001",
        "label": "All-on-4 Full Arch Implants",
        "price": "£3,500",
        "includes": [
          "4 implants",
          "fixed bridge",
          "temporary denture"
        ],
        "note": "Includes CT scan and all surgical procedures"
      },
      {
        "clinic_id": "clinic_002",
        "label": "All-on-4 Premium Package",
        "price": "£4,200",
        "includes": [
          "4 implants",
          "permanent zirconia bridge",
          "temporary denture",
          "sedation"
        ],
        "note": "Includes 7-night hotel stay and airport transfers"
      }
    ]
  },
  "Zirconia Crown": {
    "category": "Veneers & Crowns",
    "clinic_variants": [
      {
        "clinic_id": "clinic_001",
        "label": "Standard Zirconia Crown",
        "price": "£180",
        "includes": [
          "crown"
        ]
      },
      {
        "clinic_id": "clinic_002",
        "label": "Premium Layered Zirconia Crown",
        "price": "£230",
        "includes": [
          "crown",
          "temporary crown"
        ],
        "note": "Includes custom shade matching"
      }
    ]
  },
  "Root Canal Treatment": {
    "category": "Endodontics",
    "clinic_variants": [
      {
        "clinic_id": "clinic_001",
        "label": "Root Canal Treatment (per tooth)",
        "price": "£120 - £220",
        "includes": [
          "root canal procedure",
          "medication"
        ],
        "note": "Price varies based on tooth type (incisor to molar)"
      },
      {
        "clinic_id": "clinic_003",
        "label": "Advanced Root Canal Therapy",
        "price": "£250",
        "includes": [
          "root canal procedure",
          "medication",
          "post-procedure care"
        ],
        "note": "Uses microscope-assisted technique"
      }
    ]
  },
  "Teeth Whitening": {
    "category": "Cosmetic Dentistry",
    "clinic_variants": [
      {
        "clinic_id": "clinic_002",
        "label": "In-Office Laser Whitening",
        "price": "£150",
        "includes": [
          "whitening procedure",
          "home maintenance kit"
        ]
      },
      {
        "clinic_id": "clinic_003",
        "label": "Premium Whitening Package",
        "price": "£220",
        "includes": [
          "in-office whitening",
          "custom trays",
          "whitening gel supply"
        ],
        "note": "Includes 12-month maintenance supplies"
      }
    ]
  }
};

// Sample clinic data
export const sampleClinics = [
  {
    id: "clinic_001",
    name: "Istanbul Dental Excellence",
    location: "Istanbul, Turkey",
    description: "Leading dental clinic specializing in implantology and advanced restorative treatments.",
    features: {
      "airport_transfer": true,
      "hotel_included": true,
      "free_consultation": true,
      "multilingual_staff": true,
      "warranty": true
    }
  },
  {
    id: "clinic_002",
    name: "Premium Smile Istanbul",
    location: "Istanbul, Turkey",
    description: "Luxury dental facility offering comprehensive treatment packages with premium accommodation.",
    features: {
      "airport_transfer": true,
      "hotel_included": true,
      "free_consultation": true,
      "multilingual_staff": true,
      "warranty": true,
      "spa_facilities": true
    }
  },
  {
    id: "clinic_003",
    name: "Dental Aesthetics Turkey",
    location: "Antalya, Turkey",
    description: "Specialized in cosmetic dentistry with focus on natural-looking aesthetic results.",
    features: {
      "airport_transfer": true,
      "hotel_discount": true,
      "free_consultation": true,
      "multilingual_staff": true,
      "warranty": true
    }
  }
];

// Sample clinic features for comparison
export const clinicFeatures = [
  {
    id: "airport_transfer",
    name: "Airport Transfer",
    description: "Free transfers between airport, hotel, and clinic"
  },
  {
    id: "hotel_included",
    name: "Hotel Included",
    description: "Complimentary hotel accommodation included in treatment price"
  },
  {
    id: "hotel_discount",
    name: "Hotel Discount",
    description: "Special rates at partner hotels"
  },
  {
    id: "free_consultation",
    name: "Free Consultation",
    description: "Initial consultation at no cost"
  },
  {
    id: "multilingual_staff",
    name: "Multilingual Staff",
    description: "Staff speaks English and other languages"
  },
  {
    id: "warranty",
    name: "Treatment Warranty",
    description: "Warranty on dental work performed"
  },
  {
    id: "spa_facilities",
    name: "Spa Facilities",
    description: "On-site spa and wellness facilities"
  }
];