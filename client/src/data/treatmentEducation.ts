
export interface TreatmentEducation {
  materials: string;
  warranty: string;
  process: string;
  description: string;
  benefits: string[];
  ukEquivalentPrice?: number;
}

export const treatmentEducation: Record<string, TreatmentEducation> = {
  "porcelain_veneer": {
    materials: "Premium porcelain ceramic with natural translucency",
    warranty: "5-year guarantee against chipping or staining",
    process: "Digital smile design + precision crafting with shade matching",
    description: "Ultra-thin porcelain shells that transform your smile while preserving natural tooth structure",
    benefits: [
      "Natural appearance with custom color matching",
      "Stain-resistant and durable material",
      "Minimal tooth preparation required",
      "Immediate dramatic smile transformation"
    ],
    ukEquivalentPrice: 850
  },
  "dental_implant_standard": {
    materials: "Straumann Swiss titanium implants with osseointegration technology",
    warranty: "10-year guarantee on implant fixture",
    process: "3D CT planning + computer-guided surgical placement",
    description: "Premium Swiss-engineered dental implants that replace missing teeth permanently",
    benefits: [
      "Lifetime solution for missing teeth",
      "Preserves jawbone density",
      "Functions like natural teeth",
      "No impact on adjacent teeth"
    ],
    ukEquivalentPrice: 875
  },
  "zirconia_crown": {
    materials: "High-strength zirconia ceramic with natural aesthetics",
    warranty: "5-year guarantee against fracture",
    process: "Digital impression + CAD/CAM precision milling",
    description: "Strong, biocompatible crowns that restore damaged teeth with natural appearance",
    benefits: [
      "Superior strength and durability",
      "Metal-free for natural appearance",
      "Biocompatible and gum-friendly",
      "Precision fit for comfort"
    ],
    ukEquivalentPrice: 850
  },
  "dental_checkup_cleaning": {
    materials: "Professional ultrasonic and hand scaling instruments",
    warranty: "N/A - routine maintenance procedure",
    process: "Comprehensive examination + professional cleaning + oral health assessment",
    description: "Essential preventive care to maintain optimal oral health and detect issues early",
    benefits: [
      "Early detection of dental problems",
      "Removes plaque and tartar buildup",
      "Prevents gum disease progression",
      "Maintains overall oral hygiene"
    ],
    ukEquivalentPrice: 80
  },
  "teeth_whitening": {
    materials: "Professional-grade whitening gel with enamel protection",
    warranty: "Results guaranteed for 6 months with proper care",
    process: "In-office professional whitening treatment with custom trays",
    description: "Safe, effective teeth whitening that can lighten teeth by several shades",
    benefits: [
      "Immediate visible results",
      "Safe for tooth enamel",
      "Long-lasting whitening effect",
      "Professional supervision ensures safety"
    ],
    ukEquivalentPrice: 350
  },
  "single_dental_implant": {
    materials: "Straumann Swiss titanium implants with osseointegration technology",
    warranty: "10-year guarantee on implant fixture",
    process: "3D CT planning + computer-guided surgical placement",
    description: "Premium Swiss-engineered dental implants that replace missing teeth permanently",
    benefits: [
      "Lifetime solution for missing teeth",
      "Preserves jawbone density",
      "Functions like natural teeth",
      "No impact on adjacent teeth"
    ],
    ukEquivalentPrice: 875
  }
};

export const getEducationContent = (treatmentId: string): TreatmentEducation | null => {
  return treatmentEducation[treatmentId] || null;
};
