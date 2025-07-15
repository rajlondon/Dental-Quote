import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  PlusCircle,
  MinusCircle,
  Info,
  AlertCircle,
  Plane,
  Hotel,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  Package,
  Calculator,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PromoCodeInput } from "./PromoCodeInput";
import { useToast } from "@/hooks/use-toast";

// Treatment ID mapping function
const mapBackendToFrontend = (backendId: string) => {
  const mappings: { [key: string]: string } = {
    // Implants
    "dental-implant": "dental_implant_standard",
    "dental-implant-standard": "dental_implant_standard",
    "dental-implant-premium": "dental_implant_premium",
    "single-dental-implant": "dental_implant_standard",
    "premium-dental-implant": "dental_implant_premium",
    "all-on-4": "all_on_4_implants",
    "all-on-4-implants": "all_on_4_implants",
    "all-on-6": "all_on_6_implants",
    "all-on-6-implants": "all_on_6_implants",
    "bone-graft": "bone_graft",
    "sinus-lift": "sinus_lift",

    // Crowns and Veneers
    "porcelain-crown": "porcelain_crown",
    "zirconia-crown": "zirconia_crown",
    "premium-porcelain-veneer": "porcelain_veneer",
    "porcelain-veneer": "porcelain_veneer",
    "composite-veneer": "composite_veneer",
    "e-max-veneer": "porcelain_veneer",
    "inlay-onlay": "inlay_onlay",

    // Whitening
    "teeth-whitening": "zoom_whitening",
    "zoom-whitening": "zoom_whitening",
    "laser-whitening": "laser_whitening",
    "home-whitening": "home_whitening_kit",
    "professional-whitening": "zoom_whitening",

    // Full Mouth
    "full-smile-makeover": "full_smile_makeover",
    "hollywood-smile": "hollywood_smile",
    "full-mouth-restoration": "full_mouth_restoration",
    "smile-makeover": "full_smile_makeover",
    "complete-smile-reconstruction": "full_mouth_restoration",

    // General Dentistry
    "dental-checkup": "dental_checkup_cleaning",
    "dental-cleaning": "dental_checkup_cleaning",
    "smile-design-consultation": "dental_checkup_cleaning",
    "dental-consultation": "dental_checkup_cleaning",
    "tooth-filling": "tooth_fillings",
    "composite-filling": "tooth_fillings",
    "root-canal": "root_canal",
    "root-canal-treatment": "root_canal",
    "tooth-extraction": "tooth_extraction",
    "dental-bridge": "dental_bridge",
    "bridge-3-unit": "dental_bridge",

    // Other Treatments
    "invisalign": "orthodontics_invisalign",
    "invisalign-treatment": "orthodontics_invisalign",
    "clear-aligners": "orthodontics_invisalign",
    "braces": "orthodontics_braces",
    "traditional-braces": "orthodontics_braces",
    "metal-braces": "orthodontics_braces",
    "ceramic-braces": "orthodontics_braces",
    "gum-treatment": "gum_treatment",
    "periodontal-treatment": "gum_treatment",
    "night-guard": "night_guard",
    "dental-splint": "night_guard",
  };

  // Direct mapping if exists
  if (mappings[backendId]) {
    return mappings[backendId];
  }

  // Fallback logic: try to find a similar treatment by name matching
  const normalizedBackendId = backendId.toLowerCase().replace(/[-_]/g, '');

  // Search through all treatment categories for a partial match
  for (const category of TREATMENT_CATEGORIES) {
    for (const treatment of category.treatments) {
      const normalizedTreatmentId = treatment.id.toLowerCase().replace(/[-_]/g, '');
      const normalizedTreatmentName = treatment.name.toLowerCase().replace(/[-_\s]/g, '');

      // Check if backend ID contains key words from treatment name or ID
      if (normalizedBackendId.includes(normalizedTreatmentId) || 
          normalizedTreatmentId.includes(normalizedBackendId) ||
          normalizedBackendId.includes(normalizedTreatmentName) ||
          normalizedTreatmentName.includes(normalizedBackendId)) {
        return treatment.id;
      }
    }
  }

  // Final fallback: return the original ID with underscores instead of hyphens
  return backendId.replace(/-/g, '_');
};

// Make function globally accessible for testing
if (typeof window !== "undefined") {
  (window as any).mapBackendToFrontend = mapBackendToFrontend;
}

// Define TreatmentData structure
export interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee?: string;
  ukPriceGBP?: number;
  ukPriceUSD?: number;
  fromPackage?: boolean; // Flag to indicate if the treatment is from a package promo code
  specialOffer?: {
    id: string;
    title: string;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
    clinicId: string;
  };
}

export interface TreatmentCategory {
  id: string;
  name: string;
  treatments: {
    id: string;
    name: string;
    priceGBP: number;
    priceUSD: number;
    guarantee?: string;
    notes?: string;
  }[];
}

// Treatment categories data
const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    id: "implants",
    name: "Implants",
    treatments: [
      {
        id: "dental_implant_standard",
        name: "Dental Implant (Standard)",
        priceGBP: 875,
        priceUSD: 1120,
        guarantee: "5-year",
        notes:
          "Actual prices vary based on materials used and clinic quality. Final quotes will be confirmed after your dental records are reviewed.",
      },
      {
        id: "dental_implant_premium",
        name: "Dental Implant (Premium)",
        priceGBP: 3000,
        priceUSD: 3850,
        guarantee: "10-year",
        notes:
          "for premium brands like Straumann or Nobel Biocare. Clinic prices vary based on materials used.",
      },
      {
        id: "all_on_4_implants",
        name: "All-on-4 Implants (Full Arch)",
        priceGBP: 12000,
        priceUSD: 15400,
        guarantee: "10-year",
        notes:
          " Includes 4 implants and a full arch restoration. Clinic prices vary based on materials used.",
      },
      {
        id: "all_on_6_implants",
        name: "All-on-6 Implants (Full Arch)",
        priceGBP: 14000,
        priceUSD: 18000,
        guarantee: "10-year",
        notes:
          " Includes 6 implants and a full arch restoration, providing additional support and stability, particularly in the upper jaw.",
      },
      {
        id: "bone_graft",
        name: "Bone Graft (Per Site)",
        priceGBP: 650,
        priceUSD: 835,
        guarantee: "N/A",
        notes:
          " May be required if your jaw bone lacks sufficient volume to support implants.",
      },
      {
        id: "sinus_lift",
        name: "Sinus Lift",
        priceGBP: 900,
        priceUSD: 1160,
        guarantee: "N/A",
        notes:
          " May be needed for upper jaw implants when there is insufficient bone height.",
      },
    ],
  },
  {
    id: "crowns_veneers",
    name: "Veneers & Crowns",
    treatments: [
      {
        id: "porcelain_crown",
        name: "Porcelain Crown",
        priceGBP: 650,
        priceUSD: 835,
        guarantee: "3-year",
        notes:
          " Clinic prices vary based on materials used and specifications.",
      },
      {
        id: "zirconia_crown",
        name: "Zirconia Crown",
        priceGBP: 850,
        priceUSD: 1100,
        guarantee: "5-year",
        notes: " More durable than porcelain crowns and highly aesthetic.",
      },
      {
        id: "porcelain_veneer",
        name: "Porcelain Veneer",
        priceGBP: 600,
        priceUSD: 770,
        guarantee: "3-year",
        notes:
          " Thin shells bonded to the front surface of teeth to improve appearance.",
      },
      {
        id: "composite_veneer",
        name: "Composite Veneer",
        priceGBP: 350,
        priceUSD: 450,
        guarantee: "2-year",
        notes: " A more affordable alternative to porcelain veneers.",
      },
      {
        id: "inlay_onlay",
        name: "Inlay/Onlay",
        priceGBP: 450,
        priceUSD: 580,
        guarantee: "5-year",
        notes:
          " Used when a tooth is too damaged for a filling but not enough for a crown.",
      },
    ],
  },
  {
    id: "whitening",
    name: "Teeth Whitening",
    treatments: [
      {
        id: "zoom_whitening",
        name: "Zoom Whitening (In-office)",
        priceGBP: 450,
        priceUSD: 580,
        guarantee: "1-year",
        notes:
          " Professional whitening treatment that uses light-activated technology.",
      },
      {
        id: "laser_whitening",
        name: "Laser Whitening",
        priceGBP: 550,
        priceUSD: 710,
        guarantee: "1-year",
        notes:
          " Uses laser light to activate the whitening solution for faster results.",
      },
      {
        id: "home_whitening_kit",
        name: "Professional Home Whitening Kit",
        priceGBP: 250,
        priceUSD: 320,
        guarantee: "1-year",
        notes:
          " Custom-made trays with professional whitening gel for home use.",
      },
    ],
  },
  {
    id: "full_mouth",
    name: "Full Mouth Rehab",
    treatments: [
      {
        id: "full_smile_makeover",
        name: "Full Smile Makeover",
        priceGBP: 8000,
        priceUSD: 10300,
        guarantee: "5-year",
        notes:
          " Comprehensive treatment plan combining multiple procedures for a complete smile transformation.",
      },
      {
        id: "hollywood_smile",
        name: "Hollywood Smile (8-10 Veneers)",
        priceGBP: 5500,
        priceUSD: 7100,
        guarantee: "5-year",
        notes:
          " Premium full mouth transformation with high-quality veneers or crowns.",
      },
      {
        id: "full_mouth_restoration",
        name: "Full Mouth Restoration",
        priceGBP: 12000,
        priceUSD: 15400,
        guarantee: "5-year",
        notes:
          " Complete restoration of all teeth to restore function and aesthetics.",
      },
    ],
  },
  {
    id: "general",
    name: "General Dentistry",
    treatments: [
      {
        id: "dental_checkup_cleaning",
        name: "Dental Check-up & Cleaning",
        priceGBP: 80,
        priceUSD: 100,
        guarantee: "N/A",
        notes:
          " Comprehensive examination, professional cleaning, and preventative care advice.",
      },
      {
        id: "tooth_fillings",
        name: "Tooth Fillings (Composite)",
        priceGBP: 120,
        priceUSD: 155,
        guarantee: "2-year",
        notes:
          " High-quality composite (tooth-colored) fillings to repair cavities and tooth damage.",
      },
      {
        id: "root_canal",
        name: "Root Canal Treatment",
        priceGBP: 500,
        priceUSD: 645,
        guarantee: "2-year",
        notes:
          " Modern, minimally painful root canal therapy to save damaged teeth.",
      },
      {
        id: "tooth_extraction",
        name: "Tooth Extraction",
        priceGBP: 150,
        priceUSD: 195,
        guarantee: "N/A",
        notes:
          " Simple extraction of visible tooth. Surgical extractions may cost more.",
      },
      {
        id: "dental_bridge",
        name: "Dental Bridge (3-unit)",
        priceGBP: 1500,
        priceUSD: 1930,
        guarantee: "5-year",
        notes:
          " Fixed prosthetic device to replace missing teeth by joining artificial teeth to adjacent natural teeth.",
      },
    ],
  },
  {
    id: "other",
    name: "Other Treatments",
    treatments: [
      {
        id: "orthodontics_invisalign",
        name: "Invisalign Treatment",
        priceGBP: 4000,
        priceUSD: 5150,
        guarantee: "1-year",
        notes:
          " Clear aligner system to straighten teeth without traditional braces.",
      },
      {
        id: "orthodontics_braces",
        name: "Traditional Braces",
        priceGBP: 3000,
        priceUSD: 3850,
        guarantee: "1-year",
        notes:
          " Metal or ceramic brackets bonded to teeth to correct alignment.",
      },
      {
        id: "gum_treatment",
        name: "Periodontal (Gum) Treatment",
        priceGBP: 400,
        priceUSD: 515,
        guarantee: "N/A",
        notes:
          " Specialized treatment for gum disease, including deep cleaning and medication.",
      },
      {
        id: "night_guard",
        name: "Night Guard/Splint",
        priceGBP: 250,
        priceUSD: 320,
        guarantee: "1-year",
        notes: " Custom-made device to prevent teeth grinding during sleep.",
      },
    ],
  },
];

interface TreatmentPlanBuilderProps {
  initialTreatments?: TreatmentItem[];
  onTreatmentsChange?: (treatments: TreatmentItem[]) => void;
  hideHeader?: boolean; // Add option to hide the "Build Your Treatment Plan" header
  initialPromoCode?: string | null;
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({
  initialTreatments = [],
  onTreatmentsChange,
  hideHeader = false,
  initialPromoCode,
}) => {

  // Initialize treatments from props or empty array
  const [treatments, setTreatments] = useState<TreatmentItem[]>(
    initialTreatments && initialTreatments.length > 0
      ? initialTreatments.map((item) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          quantity: item.quantity,
          priceGBP: item.priceGBP,
          priceUSD: item.priceUSD,
          subtotalGBP: item.subtotalGBP,
          subtotalUSD: item.subtotalUSD,
          guarantee: item.guarantee,
          specialOffer: item.specialOffer,
        }))
      : [],
  );

  // Update treatments when initialTreatments prop changes
  useEffect(() => {
    if (initialTreatments && initialTreatments.length > 0) {
      setTreatments(
        initialTreatments.map((item) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          quantity: item.quantity,
          priceGBP: item.priceGBP,
          priceUSD: item.priceUSD,
          subtotalGBP: item.subtotalGBP,
          subtotalUSD: item.subtotalUSD,
          guarantee: item.guarantee,
          specialOffer: item.specialOffer,
        })),
      );
    }
  }, [initialTreatments]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Calculate totals
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);

  // Update parent component when treatments change - with debouncing to prevent spam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onTreatmentsChange) {
        onTreatmentsChange(treatments);
      }
    }, 100); // Small debounce to prevent excessive calls

    return () => clearTimeout(timeoutId);
  }, [treatments]);

  // Listen for promo code package events - simplified to reduce state updates
  useEffect(() => {
    const handlePackagePromo = (e: CustomEvent) => {
      console.log("🎯 Package promo event received:", e.detail);
      const { packageData } = e.detail;

      if (!packageData || !packageData.treatments) return;

      // Map package treatments to our treatment format
      const packageTreatments = packageData.treatments.map((treatment: any) => {
        console.log("🔄 Processing treatment:", treatment.id);
        // Find matching treatment in our catalog using exact mapping
        let treatmentDetails = null;

        // Use mapping function for exact matches
        const mappedId = mapBackendToFrontend(treatment.id);
        console.log("📍 Mapped ID:", treatment.id, "→", mappedId);

        for (const category of TREATMENT_CATEGORIES) {
          const found = category.treatments.find((t) => t.id === mappedId);
          if (found) {
            treatmentDetails = { ...found, category: category.id };
            console.log("✅ Found matching treatment:", found.name);
            break;
          }
        }

        // If no match found, create a generic treatment
        if (!treatmentDetails) {
          console.log("❌ No match found, creating generic treatment");
          treatmentDetails = {
            id: `generic-${treatment.id}`,
            name: treatment.id
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            priceGBP: 400, // Default price
            priceUSD: 520,
            category: "other",
          };
        }

        // Calculate Istanbul prices (35% of UK costs)
        const istanbulPriceGBP = Math.round(treatmentDetails.priceGBP * 0.35);
        const istanbulPriceUSD = Math.round(treatmentDetails.priceUSD * 0.35);
        const quantity = treatment.quantity || 1;

        return {
          id: `${treatmentDetails.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          category: treatmentDetails.category,
          name: treatmentDetails.name,
          quantity: quantity,
          priceGBP: istanbulPriceGBP,
          priceUSD: istanbulPriceUSD,
          subtotalGBP: istanbulPriceGBP * quantity,
          subtotalUSD: istanbulPriceUSD * quantity,
          guarantee: treatmentDetails.guarantee,
          ukPriceGBP: treatmentDetails.priceGBP,
          ukPriceUSD: treatmentDetails.priceUSD,
          fromPackage: true,
        };
      });

      console.log("🔧 Setting treatments:", packageTreatments);
      // Clear existing treatments and set new ones
      setTreatments(packageTreatments);
    };

    // Add event listener
    window.addEventListener(
      "packagePromoApplied",
      handlePackagePromo as EventListener,
    );

    // Clean up
    return () => {
      window.removeEventListener(
        "packagePromoApplied",
        handlePackagePromo as EventListener,
      );
    };
  }, []); // Fixed dependency array - no more jittering!

  // Get available treatments for the selected category
  const availableTreatments =
    TREATMENT_CATEGORIES.find((cat) => cat.id === selectedCategory)
      ?.treatments || [];

  // Get promo code from session storage
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed_amount" | null
  >(null);
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Load promo code from session storage on mount - run only once
  useEffect(() => {
    const storedPromoCode = sessionStorage.getItem("pendingPromoCode");
    if (storedPromoCode && !promoCode) {
      setPromoCode(storedPromoCode);

      // Auto-apply package codes immediately
      const packageCodes = [
        "HOLLYWOOD_SMILE",
        "DENTAL_IMPLANT_CITY",
        "VALUE_VENEER_ISTANBUL",
      ];
      if (packageCodes.includes(storedPromoCode.toUpperCase())) {
        console.log("Auto-applying package promo code:", storedPromoCode);

        // Use setTimeout to ensure context is ready
        setTimeout(() => {
          if (typeof applyPromoCode === "function") {
            applyPromoCode(storedPromoCode);
            sessionStorage.removeItem("pendingPromoCode");
          }
        }, 1000);
      }

      // Try to get discount info from session storage
      const packageData = sessionStorage.getItem("pendingPackageData");
      if (packageData) {
        try {
          const parsedPackage = JSON.parse(packageData);
          if (parsedPackage.originalPrice && parsedPackage.packagePrice) {
            setDiscountAmount(
              parsedPackage.originalPrice - parsedPackage.packagePrice,
            );
          }

          // If there's discount type and value information, save it
          if (parsedPackage.discountType && parsedPackage.discountValue) {
            setDiscountType(parsedPackage.discountType);
            setDiscountValue(parsedPackage.discountValue);
          }
        } catch (e) {
          console.error("Failed to parse package data from session storage", e);
        }
      }
    }
  }, []); // Empty dependency array - run only once on mount

  // Get the selected treatment details
  const treatmentDetails = availableTreatments.find(
    (t) => t.id === selectedTreatment,
  );

  const handleAddTreatment = () => {
    if (!selectedTreatment || !treatmentDetails) return;

    // Calculate Istanbul prices (35% of UK costs)
    const istanbulPriceGBP = Math.round(treatmentDetails.priceGBP * 0.35);
    const istanbulPriceUSD = Math.round(treatmentDetails.priceUSD * 0.35);
    const subtotalGBP = istanbulPriceGBP * quantity;
    const subtotalUSD = istanbulPriceUSD * quantity;

    const newTreatment: TreatmentItem = {
      id: `${selectedTreatment}_${Date.now()}`, // Unique ID
      category: selectedCategory,
      name: treatmentDetails.name,
      quantity,
      priceGBP: istanbulPriceGBP,
      priceUSD: istanbulPriceUSD,
      subtotalGBP,
      subtotalUSD,
      guarantee: treatmentDetails.guarantee,
      ukPriceGBP: treatmentDetails.priceGBP, // Store original UK price for comparison
      ukPriceUSD: treatmentDetails.priceUSD,
    };

    setTreatments([...treatments, newTreatment]);
    resetForm();
  };

  const handleRemoveTreatment = (id: string) => {
    setTreatments(treatments.filter((t) => t.id !== id));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setTreatments(
      treatments.map((t) => {
        if (t.id === id) {
          const subtotalGBP = t.priceGBP * newQuantity;
          const subtotalUSD = t.priceUSD * newQuantity;
          return { ...t, quantity: newQuantity, subtotalGBP, subtotalUSD };
        }
        return t;
      }),
    );
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSelectedTreatment("");
    setQuantity(1);
    setShowAddForm(false);
  };

  // Find treatment notes for display
  const getTreatmentNote = (categoryId: string, treatmentId: string) => {
    const category = TREATMENT_CATEGORIES.find((cat) => cat.id === categoryId);
    if (!category) return null;

    const treatment = category.treatments.find((t) => t.id === treatmentId);
    return treatment?.notes;
  };

  // New direct add treatment without modal
  const handleDirectAddTreatment = (treatment: any, categoryId: string) => {
    // Check if treatment is already in the list
    const existingTreatment = treatments.find((t) => t.name === treatment.name);

    if (existingTreatment) {
      // Increment quantity if already in list
      handleQuantityChange(
        existingTreatment.id,
        existingTreatment.quantity + 1,
      );
      return;
    }

    // Calculate Istanbul prices (35% of UK costs)
    const istanbulPriceGBP = Math.round(treatment.priceGBP * 0.35);
    const istanbulPriceUSD = Math.round(treatment.priceUSD * 0.35);

    // Add new treatment with Istanbul prices
    const newTreatment: TreatmentItem = {
      id: `${treatment.id}_${Date.now()}`, // Unique ID
      category: categoryId,
      name: treatment.name,
      quantity: 1,
      priceGBP: istanbulPriceGBP, // Use Istanbul price
      priceUSD: istanbulPriceUSD, // Use Istanbul price
      subtotalGBP: istanbulPriceGBP, // Use Istanbul price
      subtotalUSD: istanbulPriceUSD, // Use Istanbul price
      guarantee: treatment.guarantee,
      ukPriceGBP: treatment.priceGBP, // Store original UK price for comparison
      ukPriceUSD: treatment.priceUSD,
    };

    setTreatments([...treatments, newTreatment]);
  };

  // Check if a treatment is already in the list
  const isTreatmentSelected = (treatmentName: string): boolean => {
    return treatments.some((t) => t.name === treatmentName);
  };

  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle Continue to Booking
  const handleContinueToBooking = () => {
    if (treatments.length === 0) {
      toast({
        title: "No Treatments Selected",
        description: "Please add treatments to your plan before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Store treatment plan data for the clinic matching page
    const treatmentData = {
      treatments: treatments,
      totalGBP: totalGBP,
      totalUSD: totalUSD,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("treatmentPlanData", JSON.stringify(treatmentData));

    // Navigate to the clinic matching page with full clinic cards
    setLocation("/matched-clinics");

    toast({
      title: "Finding Clinics",
      description:
        "Matching you with top-rated clinics for your treatment plan...",
    });
  };

  // Notify parent component of changes
  useEffect(() => {
    onTreatmentsChange?.(treatments);
  }, [treatments]);

  // Call onTreatmentsChange on initial load if we have treatments
  useEffect(() => {
    if (treatments.length > 0) {
      onTreatmentsChange?.(treatments);
    }
  }, []); // Only run on mount

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8 hover:shadow-lg transition-shadow duration-200">
        {!hideHeader && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Build Your Treatment Plan</h2>
              <p className="text-gray-600 text-sm">
                Select treatments from the categories below
              </p>
            </div>

            <div className="flex items-center gap-3">
              {treatments.length > 0 && (
                <div className="bg-blue-50 px-3 py-2 rounded text-sm font-medium text-blue-700">
                  {treatments.length} treatment
                  {treatments.length !== 1 ? "s" : ""} added
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promo Code Summary - shows when a promo code is active */}
        {promoCode && (
          <div className="mb-6 p-4 border rounded-md bg-green-50 border-green-200">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-green-800">
                  Promo Code Applied: {promoCode}
                </h3>
                {discountAmount > 0 && (
                  <p className="text-sm text-green-700 mt-1">
                    Discount: £{discountAmount}{" "}
                    {discountType === "percentage" && `(${discountValue}% off)`}
                  </p>
                )}

                {/* If it's a package code from storage, show that info */}
                {sessionStorage.getItem("pendingPackageData") && (
                  <div className="mt-2">
                    <div className="text-sm text-green-700">
                      This is a special treatment package that includes multiple
                      treatments.
                    </div>
                    {treatments.length > 0 &&
                      treatments.some((t) => t.fromPackage) && (
                        <div className="mt-1 text-xs text-green-800">
                          Package treatments have been auto-populated above.
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Treatment List and Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Treatment List</h3>

          {treatments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No treatments added yet. Select treatments from the categories
                above to build your treatment plan.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Treatment</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price (GBP)</TableHead>
                    <TableHead className="text-right">Subtotal (GBP)</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">
                        {treatment.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                treatment.id,
                                treatment.quantity - 1,
                              )
                            }
                            disabled={treatment.quantity <= 1}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={treatment.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (!isNaN(newQuantity)) {
                                handleQuantityChange(treatment.id, newQuantity);
                              }
                            }}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(
                                treatment.id,
                                treatment.quantity + 1,
                              )
                            }
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        £{treatment.priceGBP.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        £{treatment.subtotalGBP.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTreatment(treatment.id)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total:</TableCell>
                    <TableCell className="text-right font-medium">
                      £{totalGBP.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </div>

        {/* Treatment Categories Tabs */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Tabs defaultValue="implants" className="w-full">
              {/* Improved mobile-friendly with scrollable design */}
              <div className="overflow-x-auto pb-2 mb-3 -mx-1 px-1">
                <TabsList className="flex flex-nowrap md:grid md:grid-cols-6 w-max min-w-full h-auto p-1 mb-2">
                  <TabsTrigger
                    value="implants"
                    className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Implants
                  </TabsTrigger>
                  <TabsTrigger
                    value="crowns_veneers"
                    className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Veneers & Crowns
                  </TabsTrigger>
                  <TabsTrigger
                    value="full_mouth"
                    className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Full Mouth
                  </TabsTrigger>
                  <TabsTrigger
                    value="general"
                    className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="whitening"
                    className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Whitening
                  </TabsTrigger>
                  <TabsTrigger
                    value="other"
                    className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Other
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Implants Tab */}
              <TabsContent value="implants" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Implants</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 text-sm cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span>Estimated Istanbul Prices</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These are average prices in Istanbul. Your final
                          treatment quote will be confirmed by your chosen
                          clinic after reviewing your dental information.
                          Payment is only made in-person after consultation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.find(
                    (cat) => cat.id === "implants",
                  )?.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            id={treatment.id}
                            checked={isTreatmentSelected(treatment.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleDirectAddTreatment(treatment, "implants");
                              } else {
                                const matchingTreatment = treatments.find(
                                  (t) => t.name === treatment.name,
                                );
                                if (matchingTreatment) {
                                  handleRemoveTreatment(matchingTreatment.id);
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={treatment.id}
                            className="font-medium cursor-pointer text-gray-800"
                          >
                            {treatment.name}
                          </label>
                          <div className="flex flex-wrap items-center mt-1">
                            {treatment.guarantee &&
                              treatment.guarantee !== "N/A" && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2 mb-1">
                                  {treatment.guarantee} guarantee
                                </span>
                              )}
                            {treatment.notes && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="inline-flex items-center text-xs text-blue-600 mb-1">
                                    <Info className="h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{treatment.notes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm"
                        >
                          Price varies by clinic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Veneers & Crowns Tab */}
              <TabsContent
                value="crowns_veneers"
                className="border rounded-md p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Veneers & Crowns</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 text-sm cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span>Estimated Istanbul Prices</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These are average prices in Istanbul. Your final
                          treatment quote will be confirmed by your chosen
                          clinic after reviewing your dental information.
                          Payment is only made in-person after consultation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.find(
                    (cat) => cat.id === "crowns_veneers",
                  )?.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            id={treatment.id}
                            checked={isTreatmentSelected(treatment.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleDirectAddTreatment(
                                  treatment,
                                  "crowns_veneers",
                                );
                              } else {
                                const matchingTreatment = treatments.find(
                                  (t) => t.name === treatment.name,
                                );
                                if (matchingTreatment) {
                                  handleRemoveTreatment(matchingTreatment.id);
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={treatment.id}
                            className="font-medium cursor-pointer text-gray-800"
                          >
                            {treatment.name}
                          </label>
                          <div className="flex items-center mt-1">
                            {treatment.guarantee &&
                              treatment.guarantee !== "N/A" && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                                  {treatment.guarantee} guarantee
                                </span>
                              )}
                            {treatment.notes && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                    <Info className="h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{treatment.notes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm"
                        >
                          Price varies by clinic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Teeth Whitening Tab */}
              <TabsContent value="whitening" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Teeth Whitening</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 text-sm cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span>Estimated Istanbul Prices</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These are average prices in Istanbul. Your final
                          treatment quote will be confirmed by your chosen
                          clinic after reviewing your dental information.
                          Payment is only made in-person after consultation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.find(
                    (cat) => cat.id === "whitening",
                  )?.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            id={treatment.id}
                            checked={isTreatmentSelected(treatment.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleDirectAddTreatment(
                                  treatment,
                                  "whitening",
                                );
                              } else {
                                const matchingTreatment = treatments.find(
                                  (t) => t.name === treatment.name,
                                );
                                if (matchingTreatment) {
                                  handleRemoveTreatment(matchingTreatment.id);
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={treatment.id}
                            className="font-medium cursor-pointer text-gray-800"
                          >
                            {treatment.name}
                          </label>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm"
                        >
                          Price varies by clinic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Full Mouth Rehab Tab */}
              <TabsContent value="full_mouth" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Full Mouth Rehab</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 text-sm cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span>Estimated Istanbul Prices</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These are average prices in Istanbul. Your final
                          treatment quote will be confirmed by your chosen
                          clinic after reviewing your dental information.
                          Payment is only made in-person after consultation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.find(
                    (cat) => cat.id === "full_mouth",
                  )?.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            id={treatment.id}
                            checked={isTreatmentSelected(treatment.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleDirectAddTreatment(
                                  treatment,
                                  "full_mouth",
                                );
                              } else {
                                const matchingTreatment = treatments.find(
                                  (t) => t.name === treatment.name,
                                );
                                if (matchingTreatment) {
                                  handleRemoveTreatment(matchingTreatment.id);
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={treatment.id}
                            className="font-medium cursor-pointer text-gray-800"
                          >
                            {treatment.name}
                          </label>
                          <div className="flex items-center mt-1">
                            {treatment.guarantee &&
                              treatment.guarantee !== "N/A" && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                                  {treatment.guarantee} guarantee
                                </span>
                              )}
                            {treatment.notes && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                    <Info className="h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{treatment.notes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm"
                        >
                          Price varies by clinic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* General Dentistry Tab */}
              <TabsContent value="general" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">General Dentistry</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 text-sm cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span>Estimated Istanbul Prices</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These are average prices in Istanbul. Your final
                          treatment quote will be confirmed by your chosen
                          clinic after reviewing your dental information.
                          Payment is only made in-person after consultation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.find(
                    (cat) => cat.id === "general",
                  )?.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            id={treatment.id}
                            checked={isTreatmentSelected(treatment.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleDirectAddTreatment(treatment, "general");
                              } else {
                                const matchingTreatment = treatments.find(
                                  (t) => t.name === treatment.name,
                                );
                                if (matchingTreatment) {
                                  handleRemoveTreatment(matchingTreatment.id);
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={treatment.id}
                            className="font-medium cursor-pointer text-gray-800"
                          >
                            {treatment.name}
                          </label>
                          <div className="flex items-center mt-1">
                            {treatment.guarantee &&
                              treatment.guarantee !== "N/A" && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                                  {treatment.guarantee} guarantee
                                </span>
                              )}
                            {treatment.notes && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                    <Info className="h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{treatment.notes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm"
                        >
                          Price varies by clinic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Other Treatments Tab */}
              <TabsContent value="other" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Other Treatments</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 text-sm cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span>Estimated Istanbul Prices</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These are average prices in Istanbul. Your final
                          treatment quote will be confirmed by your chosen
                          clinic after reviewing your dental information.
                          Payment is only made in-person after consultation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.find(
                    (cat) => cat.id === "other",
                  )?.treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            id={treatment.id}
                            checked={isTreatmentSelected(treatment.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleDirectAddTreatment(treatment, "other");
                              } else {
                                const matchingTreatment = treatments.find(
                                  (t) => t.name === treatment.name,
                                );
                                if (matchingTreatment) {
                                  handleRemoveTreatment(matchingTreatment.id);
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={treatment.id}
                            className="font-medium cursor-pointer text-gray-800"
                          >
                            {treatment.name}
                          </label>
                          <div className="flex items-center mt-1">
                            {treatment.guarantee &&
                              treatment.guarantee !== "N/A" && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                                  {treatment.guarantee} guarantee
                                </span>
                              )}
                            {treatment.notes && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                    <Info className="h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{treatment.notes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="font-medium text-sm"
                        >
                          Price varies by clinic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Treatment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quote Summary section */}
                <div className="mb-6">
                  {/* Treatment list */}
                  {treatments.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Selected Treatments
                      </h4>

                      {treatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          className="flex justify-between"
                          data-treatment-id={treatment.id}
                        >
                          <span>
                            {treatment.name}
                            {treatment.quantity &&
                              treatment.quantity > 1 &&
                              ` (x${treatment.quantity})`}
                          </span>
                          <span className="font-medium">
                            £
                            {(
                              treatment.priceGBP * (treatment.quantity || 1)
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subtotal */}
                  {treatments.length > 0 && (
                    <div className="flex justify-between py-2 border-t">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        £{totalGBP.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Discount (if applied) */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span>
                        {promoCode
                          ? `Discount (${promoCode})`
                          : "Package Discount"}
                      </span>
                      <span className="font-medium">
                        -£{discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Total with dynamic pricing display */}
                  {treatments.length > 0 && (
                    <div className="flex justify-between py-2 border-t border-b mb-6">
                      {(() => {
                        // Check if promo code or package is applied
                        const hasPendingPromo = sessionStorage.getItem('pendingPromoCode');
                        const hasPendingPackage = sessionStorage.getItem('pendingPackageData');
                        const promoClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
                        
                        // First check if it's a package promo code
                        if (hasPendingPackage) {
                          try {
                            const packageData = JSON.parse(hasPendingPackage);
                            const clinicPricingMap = {
                              'maltepe-dental-clinic': { name: 'Maltepe Dental Clinic', factor: 0.35 },
                              'dentgroup-istanbul': { name: 'DentGroup Istanbul', factor: 0.30 },
                              'istanbul-dental-care': { name: 'Istanbul Dental Care', factor: 0.25 }
                            };
                            
                            let clinicName = 'Selected Clinic';
                            if (promoClinicId && clinicPricingMap[promoClinicId]) {
                              clinicName = clinicPricingMap[promoClinicId].name;
                            }
                            
                            const packagePrice = packageData.packagePrice || packageData.totalPrice || totalGBP;
                            const packageName = packageData.name || 'Treatment Package';
                            
                            // Map package names to their correct IDs for URL generation
                            const packageUrlMap: Record<string, string> = {
                              'Hollywood Smile Vacation Package': 'hollywood-smile-vacation',
                              'Hollywood Smile Luxury Family Vacation': 'hollywood-smile-vacation',
                              'Dental Implant & City Experience': 'dental-implant-city-experience',
                              'Value Veneer & Istanbul Discovery': 'value-veneer-istanbul-discovery',
                              'Complete Smile Makeover': 'pkg_1',
                              'VIP Dental Holiday': 'pkg_2',
                              'Budget Implant Package': 'pkg_3',
                              'Summer Dental Special': 'pkg_4',
                              'Family Dental Package': 'pkg_5',
                              'Test Discount Package': 'test_package'
                            };
                            
                            // Get the correct package ID, fallback to simplified name if not found
                            const packageId = packageUrlMap[packageName] || packageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                            const packageUrl = `/packages/${packageId}`;
                            
                            return (
                              <>
                                <span className="font-semibold">
                                  <a 
                                    href={packageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                  >
                                    {packageName}
                                  </a>
                                  {' from '}{clinicName}
                                </span>
                                <span className="font-bold text-lg">
                                  £{(packagePrice - discountAmount).toLocaleString()}
                                </span>
                              </>
                            );
                          } catch (error) {
                            console.error('Error parsing package data:', error);
                            // Fall through to clinic-specific pricing
                          }
                        }
                        
                        // Handle special offer codes or clinic-specific pricing
                        if (hasPendingPromo || promoClinicId) {
                          // Calculate clinic-specific pricing
                          let clinicSpecificTotal = totalGBP;
                          let clinicName = 'Selected Clinic';
                          
                          // Get clinic pricing factor and name
                          if (promoClinicId) {
                            const clinicPricingMap = {
                              'maltepe-dental-clinic': { name: 'Maltepe Dental Clinic', factor: 0.35 },
                              'dentgroup-istanbul': { name: 'DentGroup Istanbul', factor: 0.30 },
                              'istanbul-dental-care': { name: 'Istanbul Dental Care', factor: 0.25 }
                            };
                            
                            const clinicData = clinicPricingMap[promoClinicId];
                            if (clinicData) {
                              clinicName = clinicData.name;
                              // Recalculate total using clinic's specific pricing factor
                              // Current prices are already at 35% of UK, so adjust proportionally
                              const adjustmentFactor = clinicData.factor / 0.35;
                              clinicSpecificTotal = Math.round(totalGBP * adjustmentFactor);
                            }
                          }
                          
                          return (
                            <>
                              <span className="font-semibold">Total from {clinicName}</span>
                              <span className="font-bold text-lg">
                                £{(clinicSpecificTotal - discountAmount).toLocaleString()}
                              </span>
                            </>
                          );
                        } else {
                          // Show average pricing for normal searches
                          return (
                            <>
                              <span className="font-semibold">Estimated Istanbul Average</span>
                              <span className="font-bold text-lg">
                                £{(totalGBP - discountAmount).toLocaleString()}
                              </span>
                            </>
                          );
                        }
                      })()}
                    </div>
                  )}
                  
                  {/* Comparison note for normal searches only */}
                  {treatments.length > 0 && !sessionStorage.getItem('pendingPromoCode') && !sessionStorage.getItem('pendingPackageData') && !sessionStorage.getItem('pendingPromoCodeClinicId') && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Next page:</strong> Compare exact prices from verified clinics in Istanbul
                      </p>
                    </div>
                  )}

                  {/* Promo code input */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Promo Code</h4>
                    <PromoCodeInput initialPromoCode={initialPromoCode} />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      disabled={treatments.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleContinueToBooking}
                    >
                      Continue to Booking
                    </Button>
                    <Button variant="outline">Save Quote for Later</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* "Add Special Treatment" Form (Modal-like) */}
        {showAddForm && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h4 className="text-lg font-semibold mb-4">
              Add Special Treatment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREATMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="treatment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Treatment
                </label>
                <Select
                  value={selectedTreatment}
                  onValueChange={(value) => setSelectedTreatment(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTreatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTreatment && treatmentDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Price:</span> £
                    {Math.round(
                      treatmentDetails.priceGBP * 0.35,
                    ).toLocaleString()}
                    <br />
                    {getTreatmentNote(selectedCategory, selectedTreatment) && (
                      <>
                        <span className="font-medium">Note:</span>{" "}
                        {getTreatmentNote(selectedCategory, selectedTreatment)}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                    disabled={quantity <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value);
                      if (!isNaN(newQuantity)) {
                        setQuantity(newQuantity);
                      }
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTreatment}
                disabled={!selectedTreatment}
              >
                Add Treatment
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* How Others Built Their Treatment Plan Section */}
      <div className="mt-12 mb-8">
        <h3 className="text-xl font-bold mb-2">
          How Others Built Their Treatment Plan
        </h3>
        <p className="text-gray-600 mb-6">
          Real examples from our patients who found the right dental solutions
          in Istanbul
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mr. Roberts Example */}
          <div className="bg-blue-50 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">MR</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Mr. Roberts</p>
                <p className="text-sm text-gray-600">London, UK</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">
              <strong>Treatment Plan:</strong> Needed Dental Implants & Bone
              Graft due to missing teeth and bone loss after extractions.
            </p>

            <div className="space-y-1 mb-4">
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />3 Dental
                Implants
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />
                Bone Graft Procedure
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />
                CT Scan & X-rays
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-green-600 font-semibold">
                Istanbul Cost: £2,200
              </p>
              <p className="text-sm text-gray-500">Estimated UK Cost: £7,500</p>
              <p className="text-sm font-medium text-green-600">
                Saved over £5,300
              </p>
            </div>
          </div>

          {/* Sarah Example */}
          <div className="bg-purple-50 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-semibold text-sm">S</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sarah</p>
                <p className="text-sm text-gray-600">Manchester, UK</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">
              <strong>Treatment Plan:</strong> Chose Veneers & Whitening to
              improve her smile aesthetics.
            </p>

            <div className="space-y-1 mb-4">
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />8 Porcelain
                Veneers
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />
                Professional Teeth Whitening
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />
                Digital Smile Design
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-green-600 font-semibold">
                Istanbul Cost: £1,850
              </p>
              <p className="text-sm text-gray-500">Estimated UK Cost: £5,200</p>
              <p className="text-sm font-medium text-green-600">
                Saved over £3,350
              </p>
            </div>
          </div>

          {/* James Example */}
          <div className="bg-green-50 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold text-sm">J</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">James</p>
                <p className="text-sm text-gray-600">Edinburgh, UK</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">
              <strong>Treatment Plan:</strong> Required Full Mouth
              Reconstruction due to years of dental neglect.
            </p>

            <div className="space-y-1 mb-4">
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />
                Full Mouth Reconstruction
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />8 Dental
                Implants
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-3 w-3 text-green-500 mr-2" />
                16 Zirconia Crowns
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-green-600 font-semibold">
                Istanbul Cost: £6,500
              </p>
              <p className="text-sm text-gray-500">
                Estimated UK Cost: £19,800
              </p>
              <p className="text-sm font-medium text-green-600">
                Saved over £13,300
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Don't have X-rays or a CT scan? No problem. You can upload them
              later after booking. Many Istanbul clinics provide free X-rays
              during your first consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Display added treatments if any exist */}
      {treatments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Added Treatments</h3>
          {/* Display added treatments here */}
        </div>
      )}
    </>
  );
};

export default TreatmentPlanBuilder;