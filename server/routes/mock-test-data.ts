/**
 * Mock test data for testing quote functionality
 */

// Mock treatments for testing
export const TEST_TREATMENTS = [
  {
    id: "tr-001",
    name: "Standard Dental Implant",
    description: "Titanium implant with abutment",
    price: 700,
    type: "treatment"
  },
  {
    id: "tr-002", 
    name: "Premium Dental Implant",
    description: "Premium titanium implant with custom abutment",
    price: 900,
    type: "treatment"
  },
  {
    id: "tr-003",
    name: "Porcelain Veneer",
    description: "High-quality porcelain veneer for front teeth",
    price: 350,
    type: "treatment"
  },
  {
    id: "tr-004",
    name: "Zirconia Crown",
    description: "High-quality zirconia crown",
    price: 450,
    type: "treatment"
  },
  {
    id: "tr-005",
    name: "Teeth Whitening",
    description: "Professional teeth whitening procedure",
    price: 250,
    type: "treatment"
  },
  {
    id: "tr-006",
    name: "Root Canal Treatment",
    description: "Complete root canal procedure",
    price: 400,
    type: "treatment"
  }
];

// Mock treatment packages for testing
export const TEST_PACKAGES = [
  {
    id: "pkg-001",
    name: "Dental Implant Package",
    description: "Complete dental implant package with premium materials",
    price: 1200,
    type: "package",
    treatments: [
      {
        id: "tr-001",
        name: "Standard Dental Implant",
        description: "Titanium implant with abutment",
        price: 700,
        type: "treatment"
      },
      {
        id: "tr-004",
        name: "Zirconia Crown",
        description: "High-quality zirconia crown",
        price: 450,
        type: "treatment"
      }
    ]
  },
  {
    id: "pkg-002",
    name: "Smile Makeover Package",
    description: "Complete smile transformation with veneers and whitening",
    price: 1800,
    type: "package",
    treatments: [
      {
        id: "tr-003",
        name: "Porcelain Veneer",
        description: "High-quality porcelain veneer for front teeth (x6)",
        price: 350 * 6,
        type: "treatment"
      },
      {
        id: "tr-005",
        name: "Teeth Whitening",
        description: "Professional teeth whitening procedure",
        price: 250,
        type: "treatment"
      }
    ]
  },
  {
    id: "pkg-003",
    name: "Hollywood Smile Package",
    description: "Complete smile transformation with premium veneers for all visible teeth",
    price: 3500,
    type: "package",
    treatments: [
      {
        id: "tr-003",
        name: "Porcelain Veneer",
        description: "High-quality porcelain veneer for front teeth (x10)",
        price: 350 * 10,
        type: "treatment"
      },
      {
        id: "tr-005",
        name: "Teeth Whitening",
        description: "Professional teeth whitening procedure",
        price: 250,
        type: "treatment"
      }
    ]
  }
];

// Mock add-ons for testing
export const TEST_ADDONS = [
  {
    id: "add-001",
    name: "Airport Transfer",
    description: "Luxury airport transfer service",
    price: 80,
    type: "addon"
  },
  {
    id: "add-002",
    name: "Hotel Accommodation (3 nights)",
    description: "3 nights stay at a luxury hotel",
    price: 300,
    type: "addon"
  },
  {
    id: "add-003",
    name: "Dental Care Kit",
    description: "Premium dental care kit for post-treatment care",
    price: 50,
    type: "addon"
  }
];

// Mock promo codes for testing
export const TEST_PROMO_CODES = [
  {
    id: "promo-001",
    code: "WELCOME20",
    title: "Welcome Discount",
    description: "20% off for new patients",
    discount_type: "percentage",
    discount_value: 20,
    is_active: true,
    min_purchase_amount: 0,
    max_discount_amount: 500,
    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
  },
  {
    id: "promo-002",
    code: "SUMMER100",
    title: "Summer Special",
    description: "£100 off any treatment package",
    discount_type: "fixed_amount",
    discount_value: 100,
    is_active: true,
    min_purchase_amount: 500,
    max_discount_amount: 100,
    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString()
  },
  {
    id: "promo-003",
    code: "IMPLANT30",
    title: "Implant Special",
    description: "30% off dental implant packages",
    discount_type: "percentage",
    discount_value: 30,
    is_active: true,
    min_purchase_amount: 700,
    max_discount_amount: 350,
    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
  }
];