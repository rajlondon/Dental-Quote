/**
 * Centralized treatment categories data for consistent use across components
 * This file defines the treatment categories, their display names, and other metadata
 */

export interface TreatmentOption {
  id: string;
  name: string;
  priceGBP: number;
  priceUSD: number;
  guarantee?: string;
  description?: string;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  treatments: TreatmentOption[];
}

/**
 * Default treatment categories used throughout the application
 */
export const treatmentCategoriesData: TreatmentCategory[] = [
  {
    id: 'basic-dentistry',
    name: 'Basic Dentistry',
    description: 'Regular dental procedures including checkups, cleanings, and fillings',
    order: 1,
    treatments: [
      {
        id: 'dental-checkup',
        name: 'Dental Checkup & Cleaning',
        priceGBP: 100,
        priceUSD: 130,
        guarantee: '1-year'
      },
      {
        id: 'tooth-filling',
        name: 'Tooth Filling',
        priceGBP: 150,
        priceUSD: 195,
        guarantee: '2-year'
      },
      {
        id: 'tooth-extraction',
        name: 'Simple Tooth Extraction',
        priceGBP: 180,
        priceUSD: 234,
        guarantee: '1-year'
      }
    ]
  },
  {
    id: 'implants',
    name: 'Dental Implants',
    description: 'Permanent replacements for missing teeth and related procedures',
    order: 2,
    treatments: [
      {
        id: 'single-implant',
        name: 'Single Dental Implant',
        priceGBP: 1200,
        priceUSD: 1560,
        guarantee: '10-year'
      },
      {
        id: 'multiple-implants',
        name: 'Multiple Dental Implants (3 units)',
        priceGBP: 3400,
        priceUSD: 4420,
        guarantee: '10-year'
      },
      {
        id: 'all-on-4',
        name: 'All-on-4 Dental Implants',
        priceGBP: 8500,
        priceUSD: 11050,
        guarantee: '10-year'
      }
    ]
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic Dentistry',
    description: 'Procedures focused on improving the appearance of teeth and smile',
    order: 3,
    treatments: [
      {
        id: 'teeth-whitening',
        name: 'Professional Teeth Whitening',
        priceGBP: 350,
        priceUSD: 455,
        guarantee: '1-year'
      },
      {
        id: 'porcelain-veneers',
        name: 'Porcelain Veneers (per tooth)',
        priceGBP: 500,
        priceUSD: 650,
        guarantee: '5-year'
      },
      {
        id: 'composite-bonding',
        name: 'Composite Bonding',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '3-year'
      }
    ]
  },
  {
    id: 'orthodontics',
    name: 'Orthodontics',
    description: 'Treatments to correct teeth alignment and bite issues',
    order: 4,
    treatments: [
      {
        id: 'metal-braces',
        name: 'Traditional Metal Braces',
        priceGBP: 2500,
        priceUSD: 3250,
        guarantee: '2-year'
      },
      {
        id: 'clear-aligners',
        name: 'Clear Aligners (Full Treatment)',
        priceGBP: 3000,
        priceUSD: 3900,
        guarantee: '2-year'
      },
      {
        id: 'ceramic-braces',
        name: 'Ceramic Braces',
        priceGBP: 2800,
        priceUSD: 3640,
        guarantee: '2-year'
      }
    ]
  },
  {
    id: 'root-canal',
    name: 'Root Canal & Endodontics',
    description: 'Procedures to treat infected tooth pulp and save natural teeth',
    order: 5,
    treatments: [
      {
        id: 'single-root-canal',
        name: 'Single Root Canal Treatment',
        priceGBP: 400,
        priceUSD: 520,
        guarantee: '2-year'
      },
      {
        id: 'multi-root-canal',
        name: 'Multi-Root Canal Treatment',
        priceGBP: 600,
        priceUSD: 780,
        guarantee: '2-year'
      },
      {
        id: 'apicoectomy',
        name: 'Apicoectomy',
        priceGBP: 750,
        priceUSD: 975,
        guarantee: '2-year'
      }
    ]
  },
  {
    id: 'surgical',
    name: 'Oral Surgery',
    description: 'Surgical procedures including extractions and bone grafting',
    order: 6,
    treatments: [
      {
        id: 'wisdom-extraction',
        name: 'Wisdom Tooth Extraction',
        priceGBP: 300,
        priceUSD: 390,
        guarantee: '1-year'
      },
      {
        id: 'bone-grafting',
        name: 'Bone Grafting',
        priceGBP: 800,
        priceUSD: 1040,
        guarantee: '5-year'
      },
      {
        id: 'sinus-lift',
        name: 'Sinus Lift',
        priceGBP: 1100,
        priceUSD: 1430,
        guarantee: '5-year'
      }
    ]
  },
  {
    id: 'special-offers',
    name: 'Special Offers',
    description: 'Limited-time promotional packages and discounted treatments',
    order: 7,
    treatments: [
      {
        id: 'free-consultation',
        name: 'Free Dental Consultation',
        priceGBP: 0,
        priceUSD: 0
      },
      {
        id: 'whitening-special',
        name: 'Teeth Whitening Special',
        priceGBP: 250,
        priceUSD: 325,
        guarantee: '1-year'
      }
    ]
  },
  {
    id: 'packages',
    name: 'Treatment Packages',
    description: 'Bundled treatments offering comprehensive care at a reduced price',
    order: 8,
    treatments: [
      {
        id: 'smile-makeover',
        name: 'Complete Smile Makeover',
        priceGBP: 2200,
        priceUSD: 2860,
        guarantee: '5-year'
      },
      {
        id: 'implant-package',
        name: 'Implant & Crown Package',
        priceGBP: 1500,
        priceUSD: 1950,
        guarantee: '10-year'
      }
    ]
  }
];

/**
 * Get a treatment category by its ID
 * @param categoryId The ID of the category to retrieve
 * @returns The matching treatment category or undefined if not found
 */
export function getTreatmentCategory(categoryId: string): TreatmentCategory | undefined {
  return treatmentCategoriesData.find(category => category.id === categoryId);
}

/**
 * Check if a category ID is valid within the defined categories
 * @param categoryId The ID to check
 * @returns Boolean indicating if the category exists
 */
export function isValidCategory(categoryId: string): boolean {
  return !!getTreatmentCategory(categoryId);
}

/**
 * Get a sorted array of categories based on their order property
 * @returns Sorted array of treatment categories
 */
export function getSortedCategories(): TreatmentCategory[] {
  return [...treatmentCategoriesData].sort((a, b) => {
    // Default to a high number if order is not specified
    const orderA = a.order !== undefined ? a.order : 999;
    const orderB = b.order !== undefined ? b.order : 999;
    return orderA - orderB;
  });
}

/**
 * Convert a category ID to a properly formatted display name
 * @param categoryId The ID of the category
 * @returns The formatted name or the original ID if not found
 */
export function getCategoryDisplayName(categoryId: string): string {
  const category = getTreatmentCategory(categoryId);
  return category ? category.name : categoryId;
}

/**
 * Get a cleaned category name without spaces and special characters
 * Useful for CSS class names or other identifiers
 * @param categoryId The ID of the category
 * @returns A cleaned version of the category name
 */
export function getCategorySlug(categoryId: string): string {
  const category = getTreatmentCategory(categoryId);
  return category 
    ? category.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : categoryId;
}