// Enhanced package response that merges database with rich data
import { hardcodedTreatmentPackages } from '../routes/treatment-package-routes';

export function enhancePackageFromDatabase(dbPackage: any) {
  // Find matching hardcoded package for rich data
  const hardcodedPkg = hardcodedTreatmentPackages.find(pkg => pkg.id === dbPackage.id);
  
  if (!hardcodedPkg) {
    // Return basic structure if no match
    return {
      ...dbPackage,
      title: dbPackage.name,
      price: parseInt(dbPackage.packagePrice),
      currency: 'GBP'
    };
  }
  
  // Merge database data with rich hardcoded data
  return {
    ...hardcodedPkg,  // All rich data
    // Override with database values
    title: dbPackage.name,
    description: dbPackage.description,
    price: parseInt(dbPackage.packagePrice),
    originalPrice: parseInt(dbPackage.originalPrice),
    // Keep timestamps from database
    createdAt: dbPackage.createdAt,
    updatedAt: dbPackage.updatedAt
  };
}
