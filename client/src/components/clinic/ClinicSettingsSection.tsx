import React, { useState } from 'react';
// Removed react-i18next
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowRight, Settings, Building, Users, PlusCircle, Save, Trash2,
  Award, BadgeCheck, Stethoscope, Tag, ImagePlus, Edit,
  User, Sparkles, Hospital, ShieldCheck
} from 'lucide-react';

// Mock data for treatments (in a real app this would come from an API)
const initialTreatments = [
  { id: 1, name: "Dental Implant", category: "Implants", priceGBP: 750, priceUSD: 975, priceEUR: 862, guarantee: "Lifetime" },
  { id: 2, name: "Porcelain Crown", category: "Crowns", priceGBP: 200, priceUSD: 260, priceEUR: 230, guarantee: "5 Years" },
  { id: 3, name: "Teeth Whitening", category: "Cosmetic", priceGBP: 180, priceUSD: 234, priceEUR: 207, guarantee: "1 Year" }
];

// Mock data for doctors (in a real app this would come from an API)
const initialDoctors = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Implantology", experience: 15, education: "DDS, University of London", languages: ["English", "Spanish"] },
  { id: 2, name: "Dr. Mehmet Yilmaz", specialty: "Cosmetic Dentistry", experience: 12, education: "DMD, Istanbul University", languages: ["Turkish", "English", "German"] }
];

// Mock data for accreditations (in a real app this would come from an API)
const initialAccreditations = [
  { id: 1, name: "International Dental Association", year: 2015, description: "Excellence in Dental Care" },
  { id: 2, name: "European Dental Quality Institute", year: 2018, description: "5-Star Dental Service Provider" }
];

// Mock data for promotions (in a real app this would come from an API)
const initialPromotions = [
  { 
    id: 1, 
    title: "Summer Special", 
    description: "20% off on all cosmetic treatments", 
    discountPercentage: 20, 
    applicableTreatments: ["Teeth Whitening", "Porcelain Veneers"], 
    startDate: "2025-06-01", 
    endDate: "2025-08-31", 
    isActive: true 
  }
];

const ClinicSettingsSection: React.FC = () => {
  // Translation placeholder function
  const t = (key: string, fallback?: string) => {
    const translations: { [key: string]: string } = {
      "clinic.settings.tabs.profile": "Profile",
      "clinic.settings.tabs.treatments": "Treatments",
      "clinic.settings.tabs.doctors": "Doctors",
      "clinic.settings.tabs.accreditations": "Accreditations",
      "clinic.settings.tabs.promotions": "Promotions",
      "clinic.settings.profile.title": "Clinic Profile",
      "clinic.settings.profile.description": "Manage your clinic's basic information",
      "clinic.settings.profile.name": "Clinic Name",
      "clinic.settings.profile.tier": "Clinic Tier",
      "clinic.settings.profile.select_tier": "Select tier",
      "clinic.settings.profile.tier_premium": "Premium",
      "clinic.settings.profile.tier_standard": "Standard",
      "clinic.settings.profile.tier_affordable": "Affordable",
      "clinic.settings.profile.description": "Description",
      "clinic.settings.profile.address": "Address",
      "clinic.settings.profile.phone": "Phone Number",
      "clinic.settings.profile.email": "Email",
      "clinic.settings.profile.website": "Website",
      "clinic.settings.profile.year_established": "Year Established",
      "clinic.settings.profile.photos": "Clinic Photos",
      "clinic.settings.profile.add_photo": "Add Clinic Photo",
      "clinic.settings.profile.save": "Save Profile",
      "clinic.settings.treatments.title": "Treatment Management",
      "clinic.settings.treatments.description": "Add, edit, and manage the treatments your clinic offers",
      "clinic.settings.treatments.your_treatments": "Your Treatments",
      "clinic.settings.treatments.no_treatments": "No treatments added yet.",
      "clinic.settings.treatments.name": "Name",
      "clinic.settings.treatments.category": "Category",
      "clinic.settings.treatments.price_gbp": "Price (£)",
      "clinic.settings.treatments.price_usd": "Price ($)",
      "clinic.settings.treatments.actions": "Actions",
      "clinic.settings.treatments.add_new": "Add New Treatment",
      "clinic.settings.treatments.treatment_name": "Treatment Name",
      "clinic.settings.treatments.treatment_name_placeholder": "e.g., Dental Implant",
      "clinic.settings.treatments.select_category": "Select category",
      "clinic.settings.treatments.category_implants": "Implants",
      "clinic.settings.treatments.category_crowns": "Crowns",
      "clinic.settings.treatments.category_cosmetic": "Cosmetic",
      "clinic.settings.treatments.category_oral_surgery": "Oral Surgery",
      "clinic.settings.treatments.category_orthodontics": "Orthodontics",
      "clinic.settings.treatments.category_general": "General",
      "clinic.settings.treatments.guarantee": "Guarantee",
      "clinic.settings.treatments.select_guarantee": "Select guarantee period",
      "clinic.settings.treatments.guarantee_1_year": "1 Year",
      "clinic.settings.treatments.guarantee_2_years": "2 Years",
      "clinic.settings.treatments.guarantee_3_years": "3 Years",
      "clinic.settings.treatments.guarantee_5_years": "5 Years",
      "clinic.settings.treatments.guarantee_10_years": "10 Years",
      "clinic.settings.treatments.guarantee_lifetime": "Lifetime",
      "clinic.settings.treatments.price_gbp2": "Price (EUR)",
      "clinic.settings.treatments.add_treatment": "Add Treatment",
      "clinic.settings.doctors.title": "Doctor Management",
      "clinic.settings.doctors.description": "Add, edit, and manage your clinic's dental professionals",
      "clinic.settings.doctors.your_team": "Your Dental Team",
      "clinic.settings.doctors.no_doctors": "No doctors added yet.",
      "clinic.settings.doctors.experience": "Experience",
      "clinic.settings.doctors.years": "years",
      "clinic.settings.doctors.education": "Education",
      "clinic.settings.doctors.languages": "Languages",
      "clinic.settings.doctors.add_new": "Add New Doctor",
      "clinic.settings.doctors.doctor_name": "Doctor Name",
      "clinic.settings.doctors.doctor_name_placeholder": "Dr. Full Name",
      "clinic.settings.doctors.specialty": "Specialty",
      "clinic.settings.doctors.specialty_placeholder": "e.g., Implantology",
      "clinic.settings.doctors.experience_years": "Experience (Years)",
      "clinic.settings.doctors.languages_comma": "Languages (comma separated)",
      "clinic.settings.doctors.languages_placeholder": "e.g., English, Turkish, German",
      "clinic.settings.doctors.add_doctor": "Add Doctor",
      "clinic.settings.accreditations.title": "Accreditations & Certifications",
      "clinic.settings.accreditations.description": "Showcase your clinic's quality and credentials",
      "clinic.settings.accreditations.your_accreditations": "Your Accreditations",
      "clinic.settings.accreditations.no_accreditations": "No accreditations added yet.",
      "clinic.settings.accreditations.awarded": "Awarded",
      "clinic.settings.accreditations.add_new": "Add New Accreditation",
      "clinic.settings.accreditations.name": "Accreditation Name",
      "clinic.settings.accreditations.name_placeholder": "e.g., Dental Quality Institute",
      "clinic.settings.accreditations.year": "Year Awarded",
      "clinic.settings.accreditations.year_placeholder": "e.g., 2020",
      "clinic.settings.accreditations.description": "Description",
      "clinic.settings.accreditations.description_placeholder": "Describe what this accreditation means",
      "clinic.settings.accreditations.add_accreditation": "Add Accreditation",
      "clinic.settings.promotions.title": "Special Offers & Promotions",
      "clinic.settings.promotions.description": "Create and manage limited-time offers and promotions",
      "clinic.settings.promotions.your_promotions": "Your Promotions",
      "clinic.settings.promotions.no_promotions": "No promotions added yet.",
      "clinic.settings.promotions.active": "Active",
      "clinic.settings.promotions.inactive": "Inactive",
      "clinic.settings.promotions.discount": "Discount",
      "clinic.settings.promotions.start_date": "Start Date",
      "clinic.settings.promotions.end_date": "End Date",
      "clinic.settings.promotions.applicable_to": "Applicable to",
      "clinic.settings.promotions.add_new": "Add New Promotion",
      "clinic.settings.promotions.title_field": "Promotion Title",
      "clinic.settings.promotions.title_placeholder": "e.g., Summer Special",
      "clinic.settings.promotions.discount_percentage": "Discount Percentage",
      "clinic.settings.promotions.discount_placeholder": "e.g., 20",
      "clinic.settings.promotions.description_placeholder": "Describe your special offer",
      "clinic.settings.promotions.applicable_treatments": "Applicable Treatments (comma separated)",
      "clinic.settings.promotions.applicable_treatments_placeholder": "e.g., Teeth Whitening, Porcelain Veneers",
      "clinic.settings.promotions.activate_immediately": "Activate this promotion immediately",
      "clinic.settings.promotions.add_promotion": "Add Promotion"
    };
    return translations[key] || fallback || key;
  };
  
  const [activeTab, setActiveTab] = useState("profile");
  
  // States for clinic profile
  const [clinicProfile, setClinicProfile] = useState({
    name: "DentGroup Istanbul",
    description: "Premium dental clinic specializing in implants and cosmetic dentistry in the heart of Istanbul.",
    tier: "premium",
    address: "Sisli District, Istanbul",
    phoneNumber: "+90 212 555 1234",
    email: "info@dentgroup-istanbul.com",
    website: "https://dentgroup-istanbul.com",
    yearEstablished: 2010,
    facilities: ["Free WiFi", "Airport Pickup", "Translation Services", "Hotel Arrangements"]
  });
  
  // States for treatments, doctors, accreditations, and promotions
  const [treatments, setTreatments] = useState(initialTreatments);
  const [newTreatment, setNewTreatment] = useState({ name: "", category: "", priceGBP: 0, priceUSD: 0, priceEUR: 0, guarantee: "" });
  
  const [doctors, setDoctors] = useState(initialDoctors);
  const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "", experience: 0, education: "", languages: [] });
  
  const [accreditations, setAccreditations] = useState(initialAccreditations);
  const [newAccreditation, setNewAccreditation] = useState({ name: "", year: 0, description: "" });
  
  const [promotions, setPromotions] = useState(initialPromotions);
  const [newPromotion, setNewPromotion] = useState({ 
    title: "", 
    description: "", 
    discountPercentage: 0, 
    applicableTreatments: [], 
    startDate: "", 
    endDate: "", 
    isActive: true 
  });

  // Treatment management functions
  const handleAddTreatment = () => {
    setTreatments([...treatments, { ...newTreatment, id: Date.now() }]);
    setNewTreatment({ name: "", category: "", priceGBP: 0, priceUSD: 0, priceEUR: 0, guarantee: "" });
  };

  const handleDeleteTreatment = (id: number) => {
    setTreatments(treatments.filter(treatment => treatment.id !== id));
  };

  // Doctor management functions
  const handleAddDoctor = () => {
    setDoctors([...doctors, { ...newDoctor, id: Date.now() }]);
    setNewDoctor({ name: "", specialty: "", experience: 0, education: "", languages: [] });
  };

  const handleDeleteDoctor = (id: number) => {
    setDoctors(doctors.filter(doctor => doctor.id !== id));
  };

  // Accreditation management functions
  const handleAddAccreditation = () => {
    setAccreditations([...accreditations, { ...newAccreditation, id: Date.now() }]);
    setNewAccreditation({ name: "", year: 0, description: "" });
  };

  const handleDeleteAccreditation = (id: number) => {
    setAccreditations(accreditations.filter(accreditation => accreditation.id !== id));
  };

  // Promotion management functions
  const handleAddPromotion = () => {
    setPromotions([...promotions, { ...newPromotion, id: Date.now() }]);
    setNewPromotion({ 
      title: "", 
      description: "", 
      discountPercentage: 0, 
      applicableTreatments: [], 
      startDate: "", 
      endDate: "", 
      isActive: true 
    });
  };

  const handleDeletePromotion = (id: number) => {
    setPromotions(promotions.filter(promotion => promotion.id !== id));
  };

  // Handle clinic profile updates
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClinicProfile({
      ...clinicProfile,
      [name]: value
    });
  };

  const handleSaveProfile = () => {
    // In a real app, this would save the profile to the backend
    alert("Profile saved successfully!");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-4 w-4" /> {t("clinic.settings.tabs.profile", "Profile")}
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" /> {t("clinic.settings.tabs.treatments", "Treatments")}
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <User className="h-4 w-4" /> {t("clinic.settings.tabs.doctors", "Doctors")}
          </TabsTrigger>
          <TabsTrigger value="accreditations" className="flex items-center gap-2">
            <Award className="h-4 w-4" /> {t("clinic.settings.tabs.accreditations", "Accreditations")}
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> {t("clinic.settings.tabs.promotions", "Promotions")}
          </TabsTrigger>
        </TabsList>
        
        {/* Clinic Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clinic.settings.profile.title", "Clinic Profile")}</CardTitle>
              <CardDescription>
                {t("clinic.settings.profile.description", "Manage your clinic's basic information")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">{t("clinic.settings.profile.name", "Clinic Name")}</Label>
                  <Input 
                    id="clinicName" 
                    name="name" 
                    value={clinicProfile.name} 
                    onChange={handleProfileChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tier">{t("clinic.settings.profile.tier", "Clinic Tier")}</Label>
                  <Select 
                    value={clinicProfile.tier} 
                    onValueChange={(value) => setClinicProfile({...clinicProfile, tier: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("clinic.settings.profile.select_tier", "Select tier")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">{t("clinic.settings.profile.tier_premium", "Premium")}</SelectItem>
                      <SelectItem value="standard">{t("clinic.settings.profile.tier_standard", "Standard")}</SelectItem>
                      <SelectItem value="affordable">{t("clinic.settings.profile.tier_affordable", "Affordable")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">{t("clinic.settings.profile.description", "Description")}</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={clinicProfile.description} 
                    onChange={handleProfileChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">{t("clinic.settings.profile.address", "Address")}</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={clinicProfile.address} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t("clinic.settings.profile.phone", "Phone Number")}</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={clinicProfile.phoneNumber} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t("clinic.settings.profile.email", "Email")}</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={clinicProfile.email} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">{t("clinic.settings.profile.website", "Website")}</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    value={clinicProfile.website} 
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">{t("clinic.settings.profile.year_established", "Year Established")}</Label>
                  <Input 
                    id="yearEstablished" 
                    name="yearEstablished" 
                    type="number" 
                    value={clinicProfile.yearEstablished} 
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <Label className="mb-2 block">{t("clinic.settings.profile.photos", "Clinic Photos")}</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-32 cursor-pointer hover:border-primary hover:bg-primary/5">
                    <ImagePlus className="h-10 w-10 text-gray-400" />
                    <span className="text-sm mt-2 text-gray-500">{t("clinic.settings.profile.add_photo", "Add Clinic Photo")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="h-4 w-4" /> {t("clinic.settings.profile.save", "Save Profile")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clinic.settings.treatments.title", "Treatment Management")}</CardTitle>
              <CardDescription>
                {t("clinic.settings.treatments.description", "Add, edit, and manage the treatments your clinic offers")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Existing Treatments List */}
                <div>
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.treatments.your_treatments", "Your Treatments")}</h3>
                  {treatments.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("clinic.settings.treatments.no_treatments", "No treatments added yet.")}</p>
                  ) : (
                    <div className="bg-neutral-50 rounded-md">
                      <div className="grid grid-cols-7 gap-2 p-3 font-medium border-b text-sm">
                        <div className="col-span-2">{t("clinic.settings.treatments.name", "Name")}</div>
                        <div>{t("clinic.settings.treatments.category", "Category")}</div>
                        <div>{t("clinic.settings.treatments.price_gbp", "Price (£)")}</div>
                        <div>{t("clinic.settings.treatments.price_usd", "Price ($)")}</div>
                        <div>{t("clinic.settings.treatments.price_gbp", "Price (£)")}</div>
                        <div>{t("clinic.settings.treatments.actions", "Actions")}</div>
                      </div>
                      {treatments.map((treatment) => (
                        <div key={treatment.id} className="grid grid-cols-7 gap-2 p-3 border-b text-sm items-center">
                          <div className="col-span-2">{treatment.name}</div>
                          <div>{treatment.category}</div>
                          <div>£{treatment.priceGBP}</div>
                          <div>${treatment.priceUSD}</div>
                          <div>£{treatment.priceEUR}</div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteTreatment(treatment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add New Treatment Form */}
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.treatments.add_new", "Add New Treatment")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="treatmentName">{t("clinic.settings.treatments.treatment_name", "Treatment Name")}</Label>
                      <Input 
                        id="treatmentName" 
                        value={newTreatment.name} 
                        onChange={(e) => setNewTreatment({...newTreatment, name: e.target.value})}
                        placeholder={t("clinic.settings.treatments.treatment_name_placeholder", "e.g., Dental Implant")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">{t("clinic.settings.treatments.category", "Category")}</Label>
                      <Select 
                        value={newTreatment.category} 
                        onValueChange={(value) => setNewTreatment({...newTreatment, category: value})}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder={t("clinic.settings.treatments.select_category", "Select category")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Implants">{t("clinic.settings.treatments.category_implants", "Implants")}</SelectItem>
                          <SelectItem value="Crowns">{t("clinic.settings.treatments.category_crowns", "Crowns")}</SelectItem>
                          <SelectItem value="Cosmetic">{t("clinic.settings.treatments.category_cosmetic", "Cosmetic")}</SelectItem>
                          <SelectItem value="Oral Surgery">{t("clinic.settings.treatments.category_oral_surgery", "Oral Surgery")}</SelectItem>
                          <SelectItem value="Orthodontics">{t("clinic.settings.treatments.category_orthodontics", "Orthodontics")}</SelectItem>
                          <SelectItem value="General">{t("clinic.settings.treatments.category_general", "General")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priceGBP">{t("clinic.settings.treatments.price_gbp", "Price (GBP)")}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                        <Input 
                          id="priceGBP" 
                          type="number" 
                          className="pl-7"
                          value={newTreatment.priceGBP || ""} 
                          onChange={(e) => {
                            const gbpPrice = Number(e.target.value);
                            setNewTreatment({
                              ...newTreatment, 
                              priceGBP: gbpPrice,
                              priceUSD: Math.round(gbpPrice * 1.3),
                              priceEUR: Math.round(gbpPrice * 1.15)
                            })
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="guarantee">{t("clinic.settings.treatments.guarantee", "Guarantee")}</Label>
                      <Select 
                        value={newTreatment.guarantee} 
                        onValueChange={(value) => setNewTreatment({...newTreatment, guarantee: value})}
                      >
                        <SelectTrigger id="guarantee">
                          <SelectValue placeholder={t("clinic.settings.treatments.select_guarantee", "Select guarantee period")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 Year">{t("clinic.settings.treatments.guarantee_1_year", "1 Year")}</SelectItem>
                          <SelectItem value="2 Years">{t("clinic.settings.treatments.guarantee_2_years", "2 Years")}</SelectItem>
                          <SelectItem value="3 Years">{t("clinic.settings.treatments.guarantee_3_years", "3 Years")}</SelectItem>
                          <SelectItem value="5 Years">{t("clinic.settings.treatments.guarantee_5_years", "5 Years")}</SelectItem>
                          <SelectItem value="10 Years">{t("clinic.settings.treatments.guarantee_10_years", "10 Years")}</SelectItem>
                          <SelectItem value="Lifetime">{t("clinic.settings.treatments.guarantee_lifetime", "Lifetime")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priceUSD">{t("clinic.settings.treatments.price_usd", "Price (USD)")}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          id="priceUSD" 
                          type="number" 
                          className="pl-7"
                          value={newTreatment.priceUSD || ""} 
                          onChange={(e) => setNewTreatment({...newTreatment, priceUSD: Number(e.target.value)})}
                          placeholder="0"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priceEUR">{t("clinic.settings.treatments.price_gbp2", "Price (GBP)")}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                        <Input 
                          id="priceEUR" 
                          type="number" 
                          className="pl-7"
                          value={newTreatment.priceEUR || ""} 
                          onChange={(e) => setNewTreatment({...newTreatment, priceEUR: Number(e.target.value)})}
                          placeholder="0"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddTreatment} 
                    className="mt-4 gap-2"
                    disabled={!newTreatment.name || !newTreatment.category || !newTreatment.priceGBP || !newTreatment.guarantee}
                  >
                    <PlusCircle className="h-4 w-4" /> {t("clinic.settings.treatments.add_treatment", "Add Treatment")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clinic.settings.doctors.title", "Doctor Management")}</CardTitle>
              <CardDescription>
                {t("clinic.settings.doctors.description", "Add, edit, and manage your clinic's dental professionals")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Existing Doctors List */}
                <div>
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.doctors.your_team", "Your Dental Team")}</h3>
                  {doctors.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("clinic.settings.doctors.no_doctors", "No doctors added yet.")}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white border rounded-lg p-4 relative">
                          <div className="absolute right-2 top-2 flex space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{doctor.name}</h4>
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500 block">{t("clinic.settings.doctors.experience", "Experience")}:</span>
                              <span>{doctor.experience} {t("clinic.settings.doctors.years", "years")}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">{t("clinic.settings.doctors.education", "Education")}:</span>
                              <span>{doctor.education}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500 block">{t("clinic.settings.doctors.languages", "Languages")}:</span>
                              <span>{doctor.languages.join(", ")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add New Doctor Form */}
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.doctors.add_new", "Add New Doctor")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctorName">{t("clinic.settings.doctors.doctor_name", "Doctor Name")}</Label>
                      <Input 
                        id="doctorName" 
                        value={newDoctor.name} 
                        onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                        placeholder={t("clinic.settings.doctors.doctor_name_placeholder", "Dr. Full Name")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialty">{t("clinic.settings.doctors.specialty", "Specialty")}</Label>
                      <Input 
                        id="specialty" 
                        value={newDoctor.specialty} 
                        onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                        placeholder={t("clinic.settings.doctors.specialty_placeholder", "e.g., Implantology")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">{t("clinic.settings.doctors.experience_years", "Experience (Years)")}</Label>
                      <Input 
                        id="experience" 
                        type="number" 
                        value={newDoctor.experience || ""} 
                        onChange={(e) => setNewDoctor({...newDoctor, experience: Number(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="education">{t("clinic.settings.doctors.education", "Education")}</Label>
                      <Input 
                        id="education" 
                        value={newDoctor.education} 
                        onChange={(e) => setNewDoctor({...newDoctor, education: e.target.value})}
                        placeholder={t("clinic.settings.doctors.education_placeholder", "e.g., DDS, University of London")}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="languages">{t("clinic.settings.doctors.languages_comma", "Languages (comma separated)")}</Label>
                      <Input 
                        id="languages" 
                        value={newDoctor.languages.join(", ")} 
                        onChange={(e) => setNewDoctor({
                          ...newDoctor, 
                          languages: e.target.value.split(",").map(lang => lang.trim()).filter(Boolean)
                        })}
                        placeholder={t("clinic.settings.doctors.languages_placeholder", "e.g., English, Turkish, German")}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddDoctor} 
                    className="mt-4 gap-2"
                    disabled={!newDoctor.name || !newDoctor.specialty}
                  >
                    <PlusCircle className="h-4 w-4" /> {t("clinic.settings.doctors.add_doctor", "Add Doctor")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Accreditations Tab */}
        <TabsContent value="accreditations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clinic.settings.accreditations.title", "Accreditations & Certifications")}</CardTitle>
              <CardDescription>
                {t("clinic.settings.accreditations.description", "Showcase your clinic's quality and credentials")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Existing Accreditations List */}
                <div>
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.accreditations.your_accreditations", "Your Accreditations")}</h3>
                  {accreditations.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("clinic.settings.accreditations.no_accreditations", "No accreditations added yet.")}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {accreditations.map((accreditation) => (
                        <div key={accreditation.id} className="bg-white border rounded-lg p-4 relative">
                          <div className="absolute right-2 top-2 flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteAccreditation(accreditation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <BadgeCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{accreditation.name}</h4>
                              <p className="text-sm text-gray-600">{t("clinic.settings.accreditations.awarded", "Awarded")} {accreditation.year}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700">{accreditation.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add New Accreditation Form */}
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.accreditations.add_new", "Add New Accreditation")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accreditationName">{t("clinic.settings.accreditations.name", "Accreditation Name")}</Label>
                      <Input 
                        id="accreditationName" 
                        value={newAccreditation.name} 
                        onChange={(e) => setNewAccreditation({...newAccreditation, name: e.target.value})}
                        placeholder={t("clinic.settings.accreditations.name_placeholder", "e.g., Dental Quality Institute")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">{t("clinic.settings.accreditations.year", "Year Awarded")}</Label>
                      <Input 
                        id="year" 
                        type="number" 
                        value={newAccreditation.year || ""} 
                        onChange={(e) => setNewAccreditation({...newAccreditation, year: Number(e.target.value)})}
                        placeholder={t("clinic.settings.accreditations.year_placeholder", "e.g., 2020")}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">{t("clinic.settings.accreditations.description", "Description")}</Label>
                      <Textarea 
                        id="description" 
                        value={newAccreditation.description} 
                        onChange={(e) => setNewAccreditation({...newAccreditation, description: e.target.value})}
                        placeholder={t("clinic.settings.accreditations.description_placeholder", "Describe what this accreditation means")}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddAccreditation} 
                    className="mt-4 gap-2"
                    disabled={!newAccreditation.name || !newAccreditation.year}
                  >
                    <PlusCircle className="h-4 w-4" /> {t("clinic.settings.accreditations.add_accreditation", "Add Accreditation")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clinic.settings.promotions.title", "Special Offers & Promotions")}</CardTitle>
              <CardDescription>
                {t("clinic.settings.promotions.description", "Create and manage limited-time offers and promotions")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Existing Promotions List */}
                <div>
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.promotions.your_promotions", "Your Promotions")}</h3>
                  {promotions.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("clinic.settings.promotions.no_promotions", "No promotions added yet.")}</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {promotions.map((promotion) => (
                        <div key={promotion.id} className="bg-white border rounded-lg p-4 relative">
                          <div className="absolute right-2 top-2 flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeletePromotion(promotion.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                              <Tag className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="font-medium">{promotion.title}</h4>
                                <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {promotion.isActive ? t("clinic.settings.promotions.active", "Active") : t("clinic.settings.promotions.inactive", "Inactive")}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-700 mt-1">{promotion.description}</p>
                              
                              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm">
                                <div>
                                  <span className="text-gray-500 block">{t("clinic.settings.promotions.discount", "Discount")}:</span>
                                  <span className="font-medium">{promotion.discountPercentage}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block">{t("clinic.settings.promotions.start_date", "Start Date")}:</span>
                                  <span>{promotion.startDate}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block">{t("clinic.settings.promotions.end_date", "End Date")}:</span>
                                  <span>{promotion.endDate}</span>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <span className="text-gray-500 block">{t("clinic.settings.promotions.applicable_to", "Applicable to")}:</span>
                                  <span>{promotion.applicableTreatments.join(", ")}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add New Promotion Form */}
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">{t("clinic.settings.promotions.add_new", "Add New Promotion")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">{t("clinic.settings.promotions.title_field", "Promotion Title")}</Label>
                      <Input 
                        id="title" 
                        value={newPromotion.title} 
                        onChange={(e) => setNewPromotion({...newPromotion, title: e.target.value})}
                        placeholder={t("clinic.settings.promotions.title_placeholder", "e.g., Summer Special")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">{t("clinic.settings.promotions.discount_percentage", "Discount Percentage")}</Label>
                      <div className="relative">
                        <Input 
                          id="discountPercentage" 
                          type="number" 
                          min="1"
                          max="100"
                          value={newPromotion.discountPercentage || ""} 
                          onChange={(e) => setNewPromotion({...newPromotion, discountPercentage: Number(e.target.value)})}
                          placeholder={t("clinic.settings.promotions.discount_placeholder", "e.g., 20")}
                          className="pr-7"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">{t("clinic.settings.promotions.description", "Description")}</Label>
                      <Textarea 
                        id="description" 
                        value={newPromotion.description} 
                        onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                        placeholder={t("clinic.settings.promotions.description_placeholder", "Describe your special offer")}
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startDate">{t("clinic.settings.promotions.start_date", "Start Date")}</Label>
                      <Input 
                        id="startDate" 
                        type="date" 
                        value={newPromotion.startDate} 
                        onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">{t("clinic.settings.promotions.end_date", "End Date")}</Label>
                      <Input 
                        id="endDate" 
                        type="date" 
                        value={newPromotion.endDate} 
                        onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="applicableTreatments">{t("clinic.settings.promotions.applicable_treatments", "Applicable Treatments (comma separated)")}</Label>
                      <Input 
                        id="applicableTreatments" 
                        value={newPromotion.applicableTreatments.join(", ")} 
                        onChange={(e) => setNewPromotion({
                          ...newPromotion, 
                          applicableTreatments: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                        })}
                        placeholder={t("clinic.settings.promotions.applicable_treatments_placeholder", "e.g., Teeth Whitening, Porcelain Veneers")}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="isActive" 
                        checked={newPromotion.isActive} 
                        onCheckedChange={(checked) => setNewPromotion({...newPromotion, isActive: checked})}
                      />
                      <Label htmlFor="isActive">{t("clinic.settings.promotions.activate_immediately", "Activate this promotion immediately")}</Label>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddPromotion} 
                    className="mt-4 gap-2"
                    disabled={!newPromotion.title || !newPromotion.discountPercentage || !newPromotion.startDate || !newPromotion.endDate}
                  >
                    <Sparkles className="h-4 w-4" /> {t("clinic.settings.promotions.add_promotion", "Add Promotion")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicSettingsSection;