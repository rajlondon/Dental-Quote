/**
 * Centralized treatment categories data for consistent use across components
 * This file defines the treatment categories, their display names, and other metadata
 */

export interface TreatmentCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
}

/**
 * Default treatment categories used throughout the application
 */
export const treatmentCategoriesData: TreatmentCategory[] = [
  {
    id: 'basic-dentistry',
    name: 'Basic Dentistry',
    description: 'Regular dental procedures including checkups, cleanings, and fillings',
    order: 1
  },
  {
    id: 'implants',
    name: 'Dental Implants',
    description: 'Permanent replacements for missing teeth and related procedures',
    order: 2
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic Dentistry',
    description: 'Procedures focused on improving the appearance of teeth and smile',
    order: 3
  },
  {
    id: 'orthodontics',
    name: 'Orthodontics',
    description: 'Treatments to correct teeth alignment and bite issues',
    order: 4
  },
  {
    id: 'root-canal',
    name: 'Root Canal & Endodontics',
    description: 'Procedures to treat infected tooth pulp and save natural teeth',
    order: 5
  },
  {
    id: 'surgical',
    name: 'Oral Surgery',
    description: 'Surgical procedures including extractions and bone grafting',
    order: 6
  },
  {
    id: 'special-offers',
    name: 'Special Offers',
    description: 'Limited-time promotional packages and discounted treatments',
    order: 7
  },
  {
    id: 'packages',
    name: 'Treatment Packages',
    description: 'Bundled treatments offering comprehensive care at a reduced price',
    order: 8
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