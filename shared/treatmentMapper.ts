/**
 * Treatment Mapper Schema
 * 
 * This file defines the schema for mapping standardized treatment names
 * to clinic-specific variants with their own labels, pricing, and inclusions.
 */

export interface ClinicTreatmentVariant {
  clinic_id: string;
  label: string;
  price: string;
  includes: string[];
  optional_addons?: string[];
  note?: string;
  clinic_name?: string;
}

export interface StandardTreatment {
  category: string;
  clinic_variants: ClinicTreatmentVariant[];
}

export interface TreatmentMap {
  [standardName: string]: StandardTreatment;
}

export interface CustomTreatment {
  id: string;
  name: string;
  category: string;
  description: string;
  clinic_id: string;
  variant: ClinicTreatmentVariant;
  created_at: string;
}

// Sample treatment mapper data structure
export const INITIAL_TREATMENT_MAP: TreatmentMap = {
  "Dental Implant (Standard)": {
    category: "Implants",
    clinic_variants: [
      {
        clinic_id: "clinic_001",
        label: "Standard Titanium Dental Implant (implant only)",
        price: "£400 - £600",
        includes: ["implant"],
        optional_addons: ["abutment", "crown"]
      },
      {
        clinic_id: "clinic_002",
        label: "Implant + Abutment + Zirconia Crown Package",
        price: "£950",
        includes: ["implant", "abutment", "crown"],
        note: "Includes free consultation and 5-night hotel"
      }
    ]
  },
  "Porcelain Veneer": {
    category: "Veneers & Crowns",
    clinic_variants: [
      {
        clinic_id: "clinic_003",
        label: "E.max Layered Porcelain Veneer",
        price: "£220",
        includes: ["veneer"]
      }
    ]
  },
  "Zirconia Crown": {
    category: "Veneers & Crowns",
    clinic_variants: [
      {
        clinic_id: "clinic_001",
        label: "Premium Zirconia Crown",
        price: "£190",
        includes: ["crown"]
      },
      {
        clinic_id: "clinic_002",
        label: "Monolithic Zirconia Crown",
        price: "£175",
        includes: ["crown"]
      }
    ]
  },
  "Root Canal Treatment": {
    category: "General",
    clinic_variants: [
      {
        clinic_id: "clinic_001",
        label: "Standard Root Canal (1-3 canals)",
        price: "£90 - £150",
        includes: ["root canal treatment"]
      },
      {
        clinic_id: "clinic_002",
        label: "Complete Endodontic Therapy",
        price: "£120 - £190",
        includes: ["root canal treatment", "temporary filling"],
        note: "Price varies based on tooth position and canal complexity"
      }
    ]
  },
  "Full Mouth Restoration": {
    category: "Full Mouth",
    clinic_variants: [
      {
        clinic_id: "clinic_001",
        label: "Complete Smile Reconstruction",
        price: "£4000 - £7000",
        includes: ["consultation", "treatment planning", "all necessary procedures"],
        note: "Customized treatment plan for comprehensive rehabilitation"
      }
    ]
  }
};