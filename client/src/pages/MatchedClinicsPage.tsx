import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Check,
  Columns,
  FileCheck,
  Gem,
  Heart,
  HeartPulse,
  Mail,
  MapPin,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  User,
  Zap,
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import ClientPdfGenerator from '@/components/ClientPdfGenerator';

interface TreatmentItem {
  id: string;
  name: string;
  quantity: number;
  subtotalGBP: number;
  category: string;
}

interface PatientInfo {
  fullName: string;
  email: string;
  phone: string;
  hasXrays: boolean;
  hasCtScan: boolean;
  hasDentalPhotos: boolean;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  travelMonth?: string;
  departureCity?: string;
  additionalNotesForClinic?: string;
}

interface MatchedClinicsPageProps {
  treatmentItems?: TreatmentItem[];
  patientInfo?: PatientInfo;
  totalGBP?: number;
  onSelectClinic?: (clinicId: string) => void;
  onBackToInfo?: () => void;
  onQuoteDownload?: () => void;
  onEmailQuote?: () => void;
}

interface ClinicTreatmentPrice {
  treatmentName: string;
  originalName: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  category: string;
}

const MatchedClinicsPage: React.FC<MatchedClinicsPageProps> = ({
  treatmentItems = [],
  patientInfo,
  totalGBP = 0,
  onSelectClinic,
  onBackToInfo,
  onQuoteDownload,
  onEmailQuote,
}) => {
  const [, setLocation] = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('default');
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');
  const { toast } = useToast();
  
  // New function to handle direct PDF download
  const downloadPdf = (clinicId: string) => {
    try {
      // Get the clinic data from filtered clinics state
      const clinic = filteredClinics.find((c: any) => c.id === clinicId);
      if (!clinic) return;
      
      const { clinicTreatments, totalPrice } = getClinicPricing(clinicId, treatmentPlan);
      
      // Store in localStorage for compatibility with existing code
      localStorage.setItem('selectedClinicId', clinicId);
      localStorage.setItem('selectedClinicData', JSON.stringify({
        name: clinic?.name,
        treatments: clinicTreatments,
        totalPrice: totalPrice
      }));
      
      // If onQuoteDownload is provided, use that first
      if (onQuoteDownload) {
        onQuoteDownload();
        return;
      }

      // Use the same format as the working JSPDFGenerator component
      const quoteData = {
        items: treatmentPlan.map(item => ({
          treatment: item.name,
          priceGBP: item.subtotalGBP / item.quantity,
          priceUSD: Math.round((item.subtotalGBP / item.quantity) * 1.25), // Rough GBP to USD conversion
          quantity: item.quantity,
          subtotalGBP: item.subtotalGBP,
          subtotalUSD: Math.round(item.subtotalGBP * 1.25), // Rough GBP to USD conversion
          guarantee: "2-5 years"
        })),
        totalGBP: totalGBP,
        totalUSD: Math.round(totalGBP * 1.25), // Rough GBP to USD conversion
        patientName: patientInfo?.fullName || "",
        patientEmail: patientInfo?.email || "",
        patientPhone: patientInfo?.phone || "",
        travelMonth: patientInfo?.travelMonth || "year-round", // Ensure a fallback value
        departureCity: patientInfo?.departureCity || "UK", // Ensure a fallback value
        clinics: [
          {
            name: clinic.name,
            priceGBP: totalPrice,
            extras: clinic.features?.slice(0, 3).join(", ") || "",
            location: `${clinic.location.area}, ${clinic.location.city}`,
            guarantee: clinic.guarantees?.implants || "5 years",
            rating: clinic.ratings?.overall.toString() || "4.8"
          }
        ],
        selectedClinicIndex: 0 // First (and only) clinic in the array
      };
      
      toast({
        title: "Generating PDF",
        description: "Preparing your quote PDF...",
      });

      // Create a form to submit directly to the server instead of using AJAX
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/jspdf-quote-v2';
      form.target = '_blank'; // Open in new tab or trigger download
      
      // Add the quote data as hidden fields
      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'quoteData';
      dataInput.value = JSON.stringify(quoteData);
      form.appendChild(dataInput);
      
      // Submit the form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      toast({
        title: "Download Started",
        description: "Your quote PDF is being generated and will download shortly.",
      });
    } catch (error) {
      console.error('Error in downloadPdf:', error);
      toast({
        title: "Download Failed",
        description: "There was an error preparing your PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Mock data for clinics
  const treatmentPlan = treatmentItems;
  
  // Get promo code information from session storage if available
  const promoCodeClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
  const [filteredClinics, setFilteredClinics] = useState<any[]>([]);
  const [ukTotalPrice, setUkTotalPrice] = useState<number>(0);
  
  useEffect(() => {
    // Calculate value for UK for comparison (MOCK DATA)
    const ukTotal = Math.ceil(totalGBP * 2.2); // UK is typically 2-3x the cost of Turkey
    setUkTotalPrice(ukTotal);
    
    // Check if this is a promo code with a specific clinic ID
    console.log('Promo code clinic ID:', promoCodeClinicId);
    
    // Define the clinics data first
    const allClinicsDataList = [
      {
        id: 'dentspa',
        name: 'DentSpa Dental Clinic',
        city: 'Istanbul',
        country: 'Turkey',
        rating: 4.9,
        reviewCount: 453,
        address: 'Bağdat Caddesi No:35, Kadıköy',
        specialties: ['Implants', 'Veneers', 'Full Mouth Reconstruction'],
        accreditations: ['JCI Accredited', 'ISO Certified'],
        technologies: ['3D CBCT Scanning', 'Digital Smile Design', 'CAD/CAM'],
        languages: ['English', 'Turkish', 'German', 'Arabic'],
        acceptsInsurance: true,
        features: ['Free Airport Transfer', 'Hotel Arrangement', 'Multilingual Staff'],
        mainImage: 'https://example.com/dentspa.jpg',
        gallery: ['https://example.com/dentspa1.jpg', 'https://example.com/dentspa2.jpg'],
        priceLevel: 'mid-range',
        description: 'DentSpa is a premier dental clinic in Istanbul specializing in cosmetic and restorative dentistry with a spa-like atmosphere.',
        doctors: [
          {
            name: 'Dr. Mehmet Yilmaz',
            title: 'Chief Dental Surgeon',
            specialties: ['Implantology', 'Cosmetic Dentistry'],
            qualifications: ['DDS, Istanbul University', 'PhD in Implantology'],
            experience: '15+ years',
            photo: 'https://example.com/dr-yilmaz.jpg'
          },
          {
            name: 'Dr. Ayşe Kaya',
            title: 'Cosmetic Dentistry Specialist',
            specialties: ['Veneers', 'Smile Design'],
            qualifications: ['DDS, Ankara University', 'Certificate in Advanced Cosmetic Dentistry'],
            experience: '12+ years',
            photo: 'https://example.com/dr-kaya.jpg'
          }
        ],
        certificates: ['ISO 9001', 'European Dental Association']
      },
      {
        id: 'dentalharmony',
        name: 'Dental Harmony Center',
        city: 'Istanbul',
        country: 'Turkey',
        rating: 4.8,
        reviewCount: 389,
        address: 'Nişantaşı, Şişli',
        specialties: ['Cosmetic Dentistry', 'Orthodontics', 'Dental Implants'],
        accreditations: ['Turkish Dental Association Certified', 'European Dental Certification'],
        technologies: ['Laser Dentistry', 'Digital X-rays', 'Intraoral Cameras'],
        languages: ['English', 'Turkish', 'French', 'Russian'],
        acceptsInsurance: true,
        features: ['Airport Shuttle', 'Accommodation Assistance', 'Virtual Consultations'],
        mainImage: 'https://example.com/harmony.jpg',
        gallery: ['https://example.com/harmony1.jpg', 'https://example.com/harmony2.jpg'],
        priceLevel: 'premium',
        description: 'Dental Harmony Center offers state-of-the-art dental care with a focus on precision, comfort, and aesthetic results.',
        doctors: [
          {
            name: 'Dr. Emre Demir',
            title: 'Orthodontics Specialist',
            specialties: ['Invisible Braces', 'Functional Orthodontics'],
            qualifications: ['DDS, Marmara University', 'Orthodontics Specialty'],
            experience: '20+ years',
            photo: 'https://example.com/dr-demir.jpg'
          },
          {
            name: 'Dr. Selin Aksoy',
            title: 'Cosmetic Dentistry Expert',
            specialties: ['Smile Makeovers', 'Dental Veneers'],
            qualifications: ['DDS, Ege University', 'Advanced Cosmetic Dentistry Certificate'],
            experience: '10+ years',
            photo: 'https://example.com/dr-aksoy.jpg'
          }
        ],
        certificates: ['Turkish Health Ministry Approved', 'International Dental Federation']
      },
      {
        id: 'smiledesigners',
        name: 'Smile Designers Clinic',
        city: 'Istanbul',
        country: 'Turkey',
        rating: 4.7,
        reviewCount: 312,
        address: 'Levent, Beşiktaş',
        specialties: ['Hollywood Smile', 'Dental Implants', 'Zirconium Crowns'],
        accreditations: ['JCI Accredited', 'American Dental Association Recognized'],
        technologies: ['Computer-Guided Implantology', '3D Printing', 'Digital Smile Design'],
        languages: ['English', 'Turkish', 'Arabic', 'Spanish'],
        acceptsInsurance: false,
        features: ['Luxury Patient Lounge', 'VIP Transportation', 'Concierge Service'],
        mainImage: 'https://example.com/smiledesigners.jpg',
        gallery: ['https://example.com/smiledesign1.jpg', 'https://example.com/smiledesign2.jpg'],
        priceLevel: 'luxury',
        description: 'Smile Designers Clinic is a luxury dental center specializing in advanced cosmetic dentistry and smile transformations.',
        doctors: [
          {
            name: 'Dr. Kemal Özturk',
            title: 'Celebrity Smile Specialist',
            specialties: ['Porcelain Veneers', 'Full Mouth Reconstruction'],
            qualifications: ['DDS, Harvard University', 'Cosmetic Dentistry Fellowship'],
            experience: '18+ years',
            photo: 'https://example.com/dr-ozturk.jpg'
          },
          {
            name: 'Dr. Zeynep Yildiz',
            title: 'Implantology Expert',
            specialties: ['All-on-4 Implants', 'Bone Grafting'],
            qualifications: ['DDS, Istanbul University', 'PhD in Implantology'],
            experience: '15+ years',
            photo: 'https://example.com/dr-yildiz.jpg'
          }
        ],
        certificates: ['ISO 9001', 'European Quality in Dentistry']
      }
    ];
    
    // Filter clinics if there's a promo code with a specific clinic ID
    const codeClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
    if (codeClinicId) {
      const filtered = allClinicsDataList.filter(clinic => clinic.id === codeClinicId);
      setFilteredClinics(filtered.length > 0 ? filtered : allClinicsDataList);
      
      // If we have exactly one clinic, automatically select the tab
      if (filtered.length === 1) {
        setSelectedTab(filtered[0].id);
        toast({
          title: "Package Clinic Selected",
          description: `Your package is available at ${filtered[0].name}`,
        });
      }
    } else {
      setFilteredClinics(allClinicsDataList);
    }
    
    // Clear promo code session storage after navigation away
    return () => {
      const hasVisited = sessionStorage.getItem('visitedMatchedClinics');
      if (hasVisited) {
        // Clear the promo code data to prevent it from persisting indefinitely
        sessionStorage.removeItem('pendingPromoCode');
        sessionStorage.removeItem('pendingPackageData');
        sessionStorage.removeItem('pendingPromoCodeClinicId');
        sessionStorage.removeItem('visitedMatchedClinics');
      } else {
        // Mark that we've visited this page
        sessionStorage.setItem('visitedMatchedClinics', 'true');
      }
    };
  }, [totalGBP]);
  
  // Define clinic data
  const allClinics = [
    {
      id: 'dentspa',
      name: 'DentSpa Istanbul',
      tier: 'premium',
      description: 'A premium clinic offering luxury dental services with state-of-the-art technology and experienced international dentists. Includes hotel stay and VIP transfers.',
      priceFactor: 0.4, // 40% of UK price (premium experience)
      ratings: {
        overall: 4.9,
        reviews: 187,
        cleanliness: 5.0,
        staff: 4.9,
        value: 4.8,
        location: 4.7
      },
      location: {
        area: 'Nişantaşı',
        city: 'Istanbul',
        fullAddress: 'Teşvikiye Mahallesi, Nişantaşı, Istanbul'
      },
      features: [
        'Luxury modern facility',
        'VIP airport transfers',
        '5-star hotel accommodation included',
        'Multilingual staff',
        'Digital X-ray equipment',
        'In-house dental lab',
        'Patient lounge with refreshments',
        'Painless dentistry technology'
      ],
      certifications: [
        { name: 'ISO 9001', year: 2023 },
        { name: 'JCI Accredited', year: 2022 }
      ],
      doctors: [
        { name: 'Dr. Ahmet Yılmaz', specialty: 'Implantology', experience: 15 },
        { name: 'Dr. Elif Kaya', specialty: 'Cosmetic Dentistry', experience: 12 },
        { name: 'Dr. Mehmet Demir', specialty: 'Prosthodontics', experience: 10 }
      ],
      paymentOptions: ['Credit Card', 'Bank Transfer', 'Cash'],
      guarantees: {
        implants: '10 years',
        veneers: '5 years',
        crowns: '5 years',
        fillings: '2 years'
      }
    },
    {
      id: 'beyazada',
      name: 'Beyaz Ada Dental Clinic',
      tier: 'standard',
      description: 'A well-established mid-range clinic offering quality dental treatments at competitive prices. Includes hotel arrangements and airport pickup.',
      priceFactor: 0.35, // 35% of UK price (standard)
      ratings: {
        overall: 4.7,
        reviews: 243,
        cleanliness: 4.8,
        staff: 4.7,
        value: 4.9,
        location: 4.5
      },
      location: {
        area: 'Kadıköy',
        city: 'Istanbul',
        fullAddress: 'Caferağa Mahallesi, Kadıköy, Istanbul'
      },
      features: [
        'Modern clinic facilities',
        'Complimentary airport pickup',
        'Hotel booking assistance',
        'Digital dental technology',
        'Multilingual staff',
        'Free Wi-Fi'
      ],
      certifications: [
        { name: 'Turkish Dental Association', year: 2020 }
      ],
      doctors: [
        { name: 'Dr. Ozan Aydın', specialty: 'Oral Surgery', experience: 8 },
        { name: 'Dr. Seda Yıldız', specialty: 'Orthodontics', experience: 9 }
      ],
      paymentOptions: ['Credit Card', 'Bank Transfer', 'Cash'],
      guarantees: {
        implants: '5 years',
        veneers: '3 years',
        crowns: '3 years',
        fillings: '1 year'
      }
    },
    {
      id: 'maltepe',
      name: 'Maltepe Dental Clinic',
      tier: 'premium',
      description: 'A boutique premium clinic specializing in cosmetic dentistry and full-mouth reconstructions with personalized care and luxury amenities.',
      priceFactor: 0.45, // 45% of UK price (highest premium)
      ratings: {
        overall: 4.8,
        reviews: 156,
        cleanliness: 5.0,
        staff: 4.9,
        value: 4.6,
        location: 4.8
      },
      location: {
        area: 'Maltepe',
        city: 'Istanbul',
        fullAddress: 'Bağlarbaşı Mahallesi, Maltepe, Istanbul'
      },
      features: [
        'Luxury boutique clinic',
        'VIP chauffeur service',
        'Luxury hotel accommodations',
        'CAD/CAM same-day restorations',
        '3D scanning and treatment planning',
        'Sedation dentistry',
        'Spa amenities',
        'Post-treatment follow-up service'
      ],
      certifications: [
        { name: 'ISO 9001', year: 2022 },
        { name: 'International Dental Federation', year: 2021 }
      ],
      doctors: [
        { name: 'Dr. Canan Toprak', specialty: 'Cosmetic Dentistry', experience: 18 },
        { name: 'Dr. Emre Şahin', specialty: 'Implantology', experience: 14 },
        { name: 'Dr. Zeynep Kara', specialty: 'Endodontics', experience: 10 }
      ],
      paymentOptions: ['Credit Card', 'Bank Transfer', 'Cash'],
      guarantees: {
        implants: '15 years',
        veneers: '10 years',
        crowns: '10 years',
        fillings: '3 years'
      }
    },
    {
      id: 'dentalcare',
      name: 'Istanbul Dental Care',
      tier: 'affordable',
      description: 'A budget-friendly clinic offering quality dental treatments at the most affordable prices, ideal for routine procedures and basic cosmetic work.',
      priceFactor: 0.30, // 30% of UK price (affordable)
      ratings: {
        overall: 4.5,
        reviews: 312,
        cleanliness: 4.6,
        staff: 4.5,
        value: 5.0,
        location: 4.3
      },
      location: {
        area: 'Fatih',
        city: 'Istanbul',
        fullAddress: 'Aksaray Mahallesi, Fatih, Istanbul'
      },
      features: [
        'Clean, modern facilities',
        'Airport pickup service',
        'Hotel recommendations',
        'Multilingual coordinators',
        'Free initial consultation',
        'Flexible scheduling'
      ],
      certifications: [
        { name: 'Turkish Dental Association', year: 2019 }
      ],
      doctors: [
        { name: 'Dr. Berk Yılmaz', specialty: 'General Dentistry', experience: 6 },
        { name: 'Dr. Ayşe Çelik', specialty: 'Restorative Dentistry', experience: 8 }
      ],
      paymentOptions: ['Credit Card', 'Cash'],
      guarantees: {
        implants: '3 years',
        veneers: '2 years',
        crowns: '2 years',
        fillings: '1 year'
      }
    }
  ];
  
  // Define the full list of clinics
  const allClinicsDataList = [
    {
      id: 'dentspa',
      name: 'DentSpa Dental Clinic',
      tier: 'premium',
      description: 'DentSpa is a premier dental clinic in Istanbul specializing in cosmetic and restorative dentistry with a spa-like atmosphere.',
      priceFactor: 0.25, // 25% of UK price (premium)
      ratings: {
        overall: 4.9,
        reviews: 453,
        cleanliness: 4.9,
        staff: 4.9,
        value: 4.8,
        location: 4.8
      },
      location: {
        area: 'Kadıköy',
        city: 'Istanbul',
        fullAddress: 'Bağdat Caddesi No:35, Kadıköy, Istanbul'
      },
      features: [
        'Free Airport Transfer',
        'Hotel Arrangement',
        'Multilingual Staff',
        'Spa-like Environment',
        'VIP Treatment Options'
      ]
    },
    {
      id: 'beyazada',
      name: 'Beyaz Ada Dental Clinic',
      tier: 'standard',
      description: 'A well-established mid-range clinic offering quality dental treatments at competitive prices. Includes hotel arrangements and airport pickup.',
      priceFactor: 0.35, // 35% of UK price (standard)
      ratings: {
        overall: 4.7,
        reviews: 243,
        cleanliness: 4.8,
        staff: 4.7,
        value: 4.9,
        location: 4.5
      },
      location: {
        area: 'Kadıköy',
        city: 'Istanbul',
        fullAddress: 'Caferağa Mahallesi, Kadıköy, Istanbul'
      },
      features: [
        'Modern clinic facilities',
        'Complimentary airport pickup',
        'Affordable hotel arrangements',
        'Multi-language service'
      ]
    },
    {
      id: 'dentalharmony',
      name: 'Dental Harmony',
      tier: 'affordable',
      description: 'Budget-friendly clinic providing essential dental services at very competitive rates. Great value for routine treatments and basic cosmetic procedures.',
      priceFactor: 0.45, // 45% of UK price (affordable)
      ratings: {
        overall: 4.5,
        reviews: 178,
        cleanliness: 4.6,
        staff: 4.4,
        value: 4.9,
        location: 4.2
      },
      location: {
        area: 'Şişli',
        city: 'Istanbul',
        fullAddress: 'Halaskargazi Caddesi, Şişli, Istanbul'
      },
      features: [
        'Budget-friendly options',
        'Basic airport transfer',
        'Hotel recommendations',
        'English-speaking staff'
      ]
    }
  ];
  
  // Initialize filtered clinics
  useEffect(() => {
    // Set initial clinics for first render
    setFilteredClinics(allClinicsDataList);
  }, []);
  
  // Apply clinic filtering based on promo code - in a separate effect to ensure it runs after initialization and force it to work
  useEffect(() => {
    const pendingPromoCode = window.sessionStorage.getItem('pendingPromoCode');
    
    console.log('Checking promo code for clinic filtering:', pendingPromoCode);
    
    // Directly map promo codes to specific clinics - this is the critical part to make it work
    if (pendingPromoCode === 'IMPLANT2023') {
      console.log('Filtering to show only DentSpa clinic for IMPLANT2023');
      const dentSpaClinic = allClinicsDataList.find(clinic => clinic.id === 'dentspa');
      if (dentSpaClinic) {
        setFilteredClinics([dentSpaClinic]);
        console.log('Filtered to only show DentSpa clinic');
      }
    } 
    else if (pendingPromoCode === 'SMILE2023') {
      console.log('Filtering to show only Beyaz Ada clinic for SMILE2023');
      const beyazAdaClinic = allClinicsDataList.find(clinic => clinic.id === 'beyazada');
      if (beyazAdaClinic) {
        setFilteredClinics([beyazAdaClinic]);
        console.log('Filtered to only show Beyaz Ada clinic');
      }
    }
    else if (pendingPromoCode === 'FULLMOUTH2023') {
      console.log('Filtering to show only Dental Harmony clinic for FULLMOUTH2023');
      const dentalHarmonyClinic = allClinicsDataList.find(clinic => clinic.id === 'dentalharmony');
      if (dentalHarmonyClinic) {
        setFilteredClinics([dentalHarmonyClinic]);
        console.log('Filtered to only show Dental Harmony clinic');
      }
    }
    // If promoCodeClinicId is set, use that for filtering as a fallback
    else if (promoCodeClinicId) {
      console.log('Filtering using promoCodeClinicId:', promoCodeClinicId);
      const targetClinic = allClinicsDataList.find(clinic => clinic.id === promoCodeClinicId);
      if (targetClinic) {
        setFilteredClinics([targetClinic]);
        console.log('Filtered to show only clinic with ID:', promoCodeClinicId);
      }
    }
  }, [promoCodeClinicId, window.sessionStorage.getItem('pendingPromoCode')]);

  const getClinicPricing = (clinicId: string, treatments: TreatmentItem[]) => {
    // Get the price factor from the filtered clinics, with a fallback to default
    const clinic = filteredClinics && filteredClinics.length > 0 
      ? filteredClinics.find((c: any) => c.id === clinicId) 
      : null;
    const priceFactor = clinic?.priceFactor || 0.35; // Default to 35% if clinic not found
    
    const clinicTreatments: ClinicTreatmentPrice[] = treatments.map(treatment => {
      const ukPricePerUnit = treatment.subtotalGBP / treatment.quantity;
      const clinicPricePerUnit = Math.round(ukPricePerUnit * priceFactor);
      
      return {
        treatmentName: treatment.name,
        originalName: treatment.name,
        quantity: treatment.quantity,
        pricePerUnit: clinicPricePerUnit,
        subtotal: clinicPricePerUnit * treatment.quantity,
        category: treatment.category
      };
    });
    
    const totalPrice = clinicTreatments.reduce((sum, item) => sum + item.subtotal, 0);
    
    return { clinicTreatments, totalPrice };
  };
  
  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'premium':
        return { label: 'Premium', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'standard':
        return { label: 'Standard', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'affordable':
        return { label: 'Affordable', color: 'bg-green-50 text-green-700 border-green-200' };
      default:
        return { label: 'Standard', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };
  
  // Calculate UK total
  const ukTotal = treatmentPlan.reduce((sum, item) => sum + item.subtotalGBP, 0);
  
  // Extract promo code information from session storage
  const pendingPromoCode = sessionStorage.getItem('pendingPromoCode');
  const pendingPackageData = sessionStorage.getItem('pendingPackageData') 
    ? JSON.parse(sessionStorage.getItem('pendingPackageData') || '{}') 
    : null;
  
  if (!treatmentPlan.length) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Treatment Plan Available</h1>
        <p className="mb-6">Please create a treatment plan first to view matched clinics.</p>
        <Button onClick={() => setLocation('/your-quote')}>Return to Quote</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Quote Progress */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <div className="relative flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">1</div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Step 1</div>
                <div className="font-medium">Treatment Plan</div>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-blue-200 ml-2"></div>
            </div>
            
            <div className="relative flex items-center ml-0 md:ml-2">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">2</div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Step 2</div>
                <div className="font-medium">Patient Info</div>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-blue-200 ml-2"></div>
            </div>
            
            <div className="relative flex items-center ml-0 md:ml-2">
              <div className="h-10 w-10 rounded-full bg-blue-500 border-4 border-blue-100 flex items-center justify-center text-white font-semibold">3</div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Step 3</div>
                <div className="font-medium">Matched Clinics</div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="flex items-center" 
            onClick={() => {
              toast({
                title: "Quote Details Available in Portal",
                description: "After selecting a clinic, you can access your full treatment details and quote in the Patient Portal.",
              });
            }}
          >
            <FileCheck className="mr-2 h-4 w-4" />
            View Quote in Portal
          </Button>
        </div>
      </div>
    
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Matched Clinics</h1>
            <p className="text-gray-600">
              We've matched your treatment needs with {filteredClinics.length} top-rated Istanbul dental clinics
            </p>
          </div>
          

        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <div className="text-blue-500 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium mb-1">About Your Matched Clinics</h3>
              <p className="text-sm text-gray-600">
                All clinics are verified, accredited, and experienced with international patients. 
                Your treatment plan has been shared with these clinics, and each has provided a personalized quote.
                Compare prices, reviews, and clinic details before making your decision.
              </p>
            </div>
          </div>
        </div>
        
        {/* Treatment Summary */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Your Treatment Plan Summary</h2>
          <div className="space-y-1 mb-3">
            {treatmentPlan.map((treatment) => (
              <div key={treatment.id} className="flex justify-between">
                <span className="text-gray-700">
                  {treatment.name} {treatment.quantity > 1 && `x${treatment.quantity}`}
                </span>
                <span className="font-medium">£{treatment.subtotalGBP}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Estimated Istanbul Price:</span>
            <span>£{Math.round(treatmentPlan.reduce((sum, item) => sum + item.subtotalGBP, 0) * 0.35)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Hotel stays often included in treatment packages depending on the cost of your treatment.
          </div>
        </div>
      </div>
      
      {/* Clinic Comparison */}
      <div className="space-y-8">
        {filteredClinics.map((clinic: any) => {
          const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
          const tierInfo = getTierLabel(clinic.tier);
          
          return (
            <Card key={clinic.id} className="overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-colors shadow-md">
              <div className="border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Clinic Info */}
                  <div className="md:col-span-1">
                    <div className="aspect-video rounded-lg overflow-hidden mb-4 relative shadow-md border-2 border-gray-100">
                      {/* Clinic image */}
                      <img 
                        src={`/images/clinics/${clinic.id}/exterior.jpg`} 
                        alt={`${clinic.name} Exterior`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback if image doesn't load
                          e.currentTarget.src = clinic.tier === 'premium' 
                            ? 'https://placehold.co/600x400/fef3c7/92400e?text=Premium+Clinic'
                            : clinic.tier === 'standard'
                              ? 'https://placehold.co/600x400/e0f2fe/1e40af?text=Standard+Clinic'
                              : 'https://placehold.co/600x400/f0fdf4/166534?text=Affordable+Clinic';
                        }}
                      />
                      
                      {/* Small badge in the corner to indicate tier */}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${clinic.tier === 'premium' 
                              ? 'bg-amber-500/90 text-white border-amber-400' 
                              : clinic.tier === 'standard' 
                                ? 'bg-blue-500/90 text-white border-blue-400' 
                                : 'bg-green-500/90 text-white border-green-400'
                            }
                          `}
                        >
                          {tierInfo.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-1">{clinic.name}</h2>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={tierInfo.color}>
                        {tierInfo.label}
                      </Badge>
                      
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm font-medium">{clinic.ratings ? clinic.ratings.overall : 'N/A'}</span>
                        <span className="ml-1 text-xs text-gray-500">({clinic.ratings && clinic.ratings.reviews ? clinic.ratings.reviews : '0'})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{clinic.location ? `${clinic.location.area}, ${clinic.location.city}` : 'Location information unavailable'}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {clinic.description}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      {clinic.certifications && clinic.certifications.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Certifications</span>
                            <div className="text-xs text-gray-600 flex flex-wrap gap-1 mt-1">
                              {clinic.certifications.map((cert, i) => (
                                <Badge key={i} variant="outline" className="font-normal">
                                  {cert.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {clinic.doctors && clinic.doctors.length > 0 && (
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Lead Dentists</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {clinic.doctors.slice(0, 2).map((doctor, i) => (
                                <div key={i} className="mb-1">
                                  {doctor.name} - {doctor.specialty} ({doctor.experience} yrs)
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {clinic.features && clinic.features.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Clinic Features</span>
                            <div className="text-xs text-gray-600 mt-1">
                              <div className="grid grid-cols-1 gap-1">
                                {clinic.features.slice(0, 3).map((feature, i) => (
                                  <div key={i} className="flex items-center">
                                    <Check className="h-3 w-3 text-green-500 mr-1 shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                                {clinic.features.length > 3 && (
                                  <div className="text-blue-600 text-xs">+{clinic.features.length - 3} more features</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quote Details */}
                  <div className="md:col-span-2">
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-4">Your Personalized Treatment Quote</h3>
                      
                      <div className="overflow-hidden mb-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="mb-3">
                            <h4 className="font-medium mb-2">Treatment Details</h4>
                            <div className="space-y-2">
                              {clinicTreatments.map((treatment, i) => (
                                <div key={i} className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {treatment.treatmentName}
                                    </span>
                                    {treatment.quantity > 1 && (
                                      <span className="text-sm text-gray-500 ml-1">
                                        (x{treatment.quantity})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">
                                      £{treatment.subtotal}
                                    </div>
                                    {treatment.quantity > 1 && (
                                      <div className="text-xs text-gray-500">
                                        £{treatment.pricePerUnit} each
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Treatment Total:</span>
                              <span className="font-medium">£{totalPrice}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-3">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium text-blue-700">UK Cost Comparison:</span>
                              <span className="text-sm font-medium text-blue-700">£{ukTotal}</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                              <span>Your Savings:</span>
                              <span>£{ukTotal - totalPrice} ({Math.round((ukTotal - totalPrice) / ukTotal * 100)}%)</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            <p>* Final quote will be confirmed after clinic review of your dental records</p>
                            <p>* Hotel stays often included in treatment packages depending on the cost of your treatment</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex flex-wrap justify-end">
                          <Button 
                            className="md:w-auto" 
                            onClick={() => {
                              // Save the selected clinic in localStorage
                              setSelectedClinic(clinic.id);
                              localStorage.setItem('selectedClinicId', clinic.id);
                              
                              // Save clinic pricing data for use in the portal
                              const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
                              
                              // If there's a pending promo code, include the discount info
                              const pendingPromoCode = sessionStorage.getItem('pendingPromoCode');
                              const hasDiscount = pendingPromoCode && pendingPromoCode.length > 0;
                              
                              // Store comprehensive booking data
                              const bookingData = {
                                clinicId: clinic.id,
                                clinicName: clinic.name,
                                treatments: clinicTreatments,
                                totalPrice: totalPrice,
                                discountApplied: hasDiscount ? pendingPromoCode : null,
                                selectedCity: selectedCity,
                                treatmentPlan: treatmentPlan,
                                timestamp: new Date().toISOString()
                              };
                              
                              localStorage.setItem('selectedClinicData', JSON.stringify(bookingData));
                              localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
                              
                              // Call the onSelectClinic callback if provided
                              if (onSelectClinic) {
                                onSelectClinic(clinic.id);
                              }
                              
                              // Redirect directly to patient portal
                              setLocation('/patient-portal');
                              
                              toast({
                                title: "Clinic Selected",
                                description: "Continue to your patient portal to complete your booking.",
                              });
                            }}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Select This Clinic
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Info Tabs */}
              {(
                <div className="p-6">
                  <Tabs defaultValue="ratings">
                    <TabsList className="mb-4 flex flex-wrap">
                      <TabsTrigger value="ratings">Clinic Ratings</TabsTrigger>
                      <TabsTrigger value="doctors">Doctors & Staff</TabsTrigger>
                      <TabsTrigger value="amenities">Amenities</TabsTrigger>
                      <TabsTrigger value="before-after">Before & After</TabsTrigger>
                      <TabsTrigger value="videos">Videos</TabsTrigger>
                      <TabsTrigger value="reviews">More Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="ratings">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Patient Ratings</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Overall</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        clinic.ratings && i < Math.floor(clinic.ratings.overall || 0) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : clinic.ratings && i < (clinic.ratings.overall || 0)
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings ? clinic.ratings.overall : 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Cleanliness</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        clinic.ratings && i < Math.floor(clinic.ratings.cleanliness || 0) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : clinic.ratings && i < (clinic.ratings.cleanliness || 0)
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings ? clinic.ratings.cleanliness : 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Staff</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        clinic.ratings && i < Math.floor(clinic.ratings.staff || 0) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : clinic.ratings && i < (clinic.ratings.staff || 0)
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings ? clinic.ratings.staff : 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Value</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        clinic.ratings && i < Math.floor(clinic.ratings.value || 0) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : clinic.ratings && i < (clinic.ratings.value || 0)
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings ? clinic.ratings.value : 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Location</span>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        clinic.ratings && i < Math.floor(clinic.ratings.location || 0) 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : clinic.ratings && i < (clinic.ratings.location || 0)
                                            ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                                            : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{clinic.ratings ? clinic.ratings.location : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Total Reviews</span>
                              <span className="font-medium">{clinic.ratings && clinic.ratings.reviews ? clinic.ratings.reviews : '0'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Patient Testimonials</h4>
                          <div className="space-y-4">
                            <div className="border-l-4 border-blue-200 pl-3 py-1">
                              <p className="text-sm italic mb-1">
                                "I had a fantastic experience at {clinic.name}. The staff was professional, and my treatment was pain-free. The hotel accommodation was superb!"
                              </p>
                              <div className="text-xs text-gray-500 flex items-center">
                                <div className="flex mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  ))}
                                </div>
                                <span>Rebecca, UK</span>
                              </div>
                            </div>
                            
                            <div className="border-l-4 border-blue-200 pl-3 py-1">
                              <p className="text-sm italic mb-1">
                                "The quality of dental work at {clinic.name} is exceptional and at a fraction of UK prices. I'm so pleased with the results!"
                              </p>
                              <div className="text-xs text-gray-500 flex items-center">
                                <div className="flex mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span>Michael, UK</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="doctors">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Lead Dentists</h4>
                          <div className="space-y-4">
                            {clinic.doctors && Array.isArray(clinic.doctors) ? 
                              clinic.doctors.map((doctor, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="rounded-full bg-blue-100 p-2">
                                    <User className="h-6 w-6 text-blue-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{doctor.name}</div>
                                    <div className="text-sm text-gray-500">{doctor.specialty}</div>
                                    <div className="text-xs text-gray-500">{doctor.experience} years experience</div>
                                  </div>
                                </div>
                              )) : 
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Experienced, international team of dentists</span>
                              </div>
                            }
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Clinic Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {clinic.features && Array.isArray(clinic.features) ? 
                              clinic.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              )) : 
                              <>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">Digital X-ray equipment</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">Multilingual staff</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">Airport transfer service</span>
                                </div>
                              </>
                            }
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="amenities">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Clinic Amenities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Free WiFi</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Refreshments</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Comfortable waiting area</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">TV entertainment</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Air conditioning</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Private consultation rooms</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Treatment Guarantees</h4>
                          <div className="space-y-3">
                            {clinic.guarantees ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm">Dental Implants</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.implants} guarantee</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Veneers</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.veneers} guarantee</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Crowns</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.crowns} guarantee</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Fillings</span>
                                  <span className="text-sm font-medium">{clinic.guarantees.fillings} guarantee</span>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-600">
                                All treatments come with a minimum 1-year guarantee. Premium treatments like implants include longer guarantees.
                              </p>
                            )}
                            <div className="text-sm text-gray-600 pt-3 border-t mt-3">
                              <p>A detailed guarantee certificate will be provided with your treatment package.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="before-after">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Dental Implants</h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs font-medium mb-1 text-gray-500">Before</div>
                                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                  <div className="text-center px-3">
                                    <div className="text-gray-400 mb-2">
                                      <span className="text-xs">Missing teeth image</span>
                                    </div>
                                    <span className="text-xs text-blue-500">Before treatment</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium mb-1 text-gray-500">After</div>
                                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                  <div className="text-center px-3">
                                    <div className="text-gray-400 mb-2">
                                      <span className="text-xs">Dental implants image</span>
                                    </div>
                                    <span className="text-xs text-blue-500">After treatment</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p>Dental implants treatment result, 3 months after surgery.</p>
                              <p className="text-xs text-gray-500 mt-1">Patient reported improved chewing ability and confidence.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Veneers & Crowns</h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs font-medium mb-1 text-gray-500">Before</div>
                                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                  <div className="text-center px-3">
                                    <div className="text-gray-400 mb-2">
                                      <span className="text-xs">Discolored teeth image</span>
                                    </div>
                                    <span className="text-xs text-blue-500">Before treatment</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium mb-1 text-gray-500">After</div>
                                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                  <div className="text-center px-3">
                                    <div className="text-gray-400 mb-2">
                                      <span className="text-xs">Veneers image</span>
                                    </div>
                                    <span className="text-xs text-blue-500">After treatment</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p>Complete smile makeover with porcelain veneers.</p>
                              <p className="text-xs text-gray-500 mt-1">Treatment completed in just 5 days during patient's stay in Istanbul.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <Button variant="outline" size="sm">
                          View More Before & After Cases
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="videos">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Clinic Tour</h4>
                          <div className="space-y-4">
                            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                              <div className="text-center px-6 py-8">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-500 border-b-8 border-b-transparent ml-1"></div>
                                </div>
                                <div className="text-gray-500 mb-2">
                                  <span className="text-sm">Clinic Tour Video</span>
                                </div>
                                <span className="text-xs text-blue-500">Click to play</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p>Take a virtual tour of our state-of-the-art dental facility in Istanbul.</p>
                              <p className="text-xs text-gray-500 mt-1">See our treatment rooms, waiting areas, and meet our staff.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium mb-3">Patient Testimonial Video</h4>
                          <div className="space-y-4">
                            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                              <div className="text-center px-6 py-8">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-500 border-b-8 border-b-transparent ml-1"></div>
                                </div>
                                <div className="text-gray-500 mb-2">
                                  <span className="text-sm">UK Patient Review</span>
                                </div>
                                <span className="text-xs text-blue-500">Click to play</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p>Hear from Sarah from Manchester about her dental treatment experience.</p>
                              <p className="text-xs text-gray-500 mt-1">Full smile makeover with dental implants and veneers.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <Button variant="outline" size="sm">
                          View More Videos
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews">
                      <div className="bg-white rounded-lg p-6 border mb-6">
                        <h4 className="font-medium mb-4">Patient Reviews</h4>
                        <div className="space-y-6">
                          <div className="border-b pb-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-full bg-blue-100 p-2 mt-1">
                                <User className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <div className="font-medium mr-2">James W.</div>
                                  <div className="text-xs text-gray-500">London, UK</div>
                                  <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm mb-2">
                                  "I was extremely nervous about getting dental work abroad, but the entire experience exceeded my expectations. From airport pickup to the final check-up, everything was professional and well-organized. My dental implants look and feel completely natural."
                                </p>
                                <div className="text-xs text-gray-500">Treatment: Dental Implants • April 2025</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-b pb-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-full bg-blue-100 p-2 mt-1">
                                <User className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <div className="font-medium mr-2">Emma T.</div>
                                  <div className="text-xs text-gray-500">Manchester, UK</div>
                                  <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm mb-2">
                                  "I saved over £8,000 compared to UK prices for my veneers. The quality is excellent, and the hotel accommodation was lovely. The clinic was modern with state-of-the-art equipment. My only minor issue was sometimes communication was a bit difficult with some staff."
                                </p>
                                <div className="text-xs text-gray-500">Treatment: Veneers • March 2025</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-b pb-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-full bg-blue-100 p-2 mt-1">
                                <User className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <div className="font-medium mr-2">Robert M.</div>
                                  <div className="text-xs text-gray-500">Edinburgh, UK</div>
                                  <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm mb-2">
                                  "The entire experience was superb from start to finish. My dentist was extremely knowledgeable and took time to explain every procedure. I combined my treatment with a mini holiday in Istanbul which was fantastic. The clinic arranged all my transfers and accommodation."
                                </p>
                                <div className="text-xs text-gray-500">Treatment: Full Mouth Restoration • February 2025</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-start gap-4">
                              <div className="rounded-full bg-blue-100 p-2 mt-1">
                                <User className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <div className="font-medium mr-2">Sophia L.</div>
                                  <div className="text-xs text-gray-500">Bristol, UK</div>
                                  <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm mb-2">
                                  "I was initially worried about language barriers, but the clinic staff spoke excellent English. My treatment was completed faster than expected, and the results are amazing. The aftercare service has been great too - they follow up regularly to check how I'm doing."
                                </p>
                                <div className="text-xs text-gray-500">Treatment: Crowns & Root Canal • January 2025</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 text-center">
                          <Button variant="outline" size="sm">
                            Load More Reviews
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Bottom Action Bar */}
      <div className="mt-10 border-t pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p>
              Need help choosing the right clinic? Our dental tourism specialists are here to help.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setLocation('/your-quote')} className="w-full sm:w-auto">
              Back to Quote
            </Button>

          </div>
        </div>
      </div>
    </main>
  );
};

export default MatchedClinicsPage;