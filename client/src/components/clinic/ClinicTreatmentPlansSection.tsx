import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  User, 
  Calendar, 
  MoreHorizontal, 
  Edit, 
  History, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  Trash,
  Download,
  Send,
  Eye,
  Database,
  ListChecks,
  Copy,
  Upload,
  Layers,
  Settings,
  Timer,
  Shield,
  Star,
  Info,
  Heart,
  Stethoscope,
  ClipboardList,
  Minus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreatmentPlanViewer } from '@/components/TreatmentPlanViewer';
import TreatmentPlanBuilder, { TreatmentItem as BuilderTreatmentItem } from '@/components/TreatmentPlanBuilder';
import { useToast } from '@/hooks/use-toast';
import type { TreatmentPlan, TreatmentItem } from '@/types/clientPortal';

// Helper function to convert clinical treatment items to builder format
// Using any[] as the return type because it's easier than defining the exact shape
// In a real app with more strict typing, we would create a proper interface
// Convert treatment items to builder-compatible format with all required fields
const convertToBuilderItems = (items: TreatmentItem[] | undefined): any[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
    id: item.id,
    category: 'Dental',
    name: item.treatment,
    quantity: item.quantity || 1,
    priceGBP: item.priceGBP,
    priceUSD: item.priceUSD || Math.round(item.priceGBP * 1.3), // Default conversion if missing
    subtotalGBP: item.subtotalGBP || item.priceGBP * (item.quantity || 1),
    subtotalUSD: item.subtotalUSD || (item.priceUSD || Math.round(item.priceGBP * 1.3)) * (item.quantity || 1),
    guarantee: item.guarantee || "Standard guarantee"
  }));
};

// Sample treatment plans data - in a real app, this would come from an API
// Sample treatments data for the clinic's catalog
interface TreatmentCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  materials: string[];
  priceGBP: number;
  guaranteePeriod?: string;  // Optional guarantee period in years
  isPopular?: boolean;       // Flag for popular treatments
  clinicNotes?: string;      // Internal notes for clinic staff
  preparationTime?: string;  // Time needed for preparation
  recoveryTime?: string;     // Expected recovery time
  technicalDetails?: string; // Technical specifications
}

const sampleTreatments: TreatmentCatalogItem[] = [
  {
    id: "T001",
    name: "Dental Implant (Straumann)",
    category: "implants",
    description: "Premium Swiss dental implant system with lifetime guarantee on the implant fixture",
    duration: "2-3 sessions",
    materials: ["Straumann", "Titanium", "Premium"],
    priceGBP: 550,
    guaranteePeriod: "Lifetime on fixture, 5 years on crown",
    isPopular: true,
    clinicNotes: "Use Straumann tissue-level implants for posterior and bone-level for anterior region",
    preparationTime: "1-2 weeks for fabrication",
    recoveryTime: "3-5 days for initial healing, 3-6 months for osseointegration",
    technicalDetails: "4.1mm diameter, 10-12mm length, SLA surface treatment"
  },
  {
    id: "T002",
    name: "Dental Implant (MIS)",
    category: "implants",
    description: "High-quality Israeli implant system with excellent long-term performance",
    duration: "2-3 sessions",
    materials: ["MIS", "Titanium", "Standard"],
    priceGBP: 450
  },
  {
    id: "T003",
    name: "Porcelain Crown",
    category: "prosthetics",
    description: "Highly durable and aesthetic crown made from E-max porcelain",
    duration: "2 sessions",
    materials: ["E-max", "Porcelain", "Premium"],
    priceGBP: 175
  },
  {
    id: "T004",
    name: "Zirconia Crown",
    category: "prosthetics",
    description: "Ultra-strong and natural-looking crown made from zirconia",
    duration: "2 sessions",
    materials: ["Zirconia", "Premium"],
    priceGBP: 190
  },
  {
    id: "T005",
    name: "Porcelain Veneer",
    category: "cosmetic",
    description: "Thin porcelain shell designed to improve the appearance of front teeth",
    duration: "2 sessions",
    materials: ["Porcelain", "E-max"],
    priceGBP: 220
  },
  {
    id: "T006",
    name: "Root Canal Treatment",
    category: "general",
    description: "Procedure to remove infected pulp and save the tooth",
    duration: "1-2 sessions",
    materials: ["Standard"],
    priceGBP: 195
  },
  {
    id: "T007",
    name: "Bone Graft",
    category: "implants",
    description: "Procedure to build up bone structure for implant placement",
    duration: "1 session",
    materials: ["Synthetic Bone", "Membrane"],
    priceGBP: 300
  },
  {
    id: "T008",
    name: "All-on-4 Full Arch",
    category: "implants",
    description: "Complete full arch restoration using 4 implants",
    duration: "Multiple sessions",
    materials: ["Straumann", "Zirconia", "Premium"],
    priceGBP: 3500
  }
];

const sampleTreatmentPlans: TreatmentPlanItem[] = [
  {
    id: "TP001",
    patientName: "James Wilson",
    patientId: 1,
    treatmentPlan: {
      items: [
        {
          id: "1",
          treatment: "Dental Implant (Straumann)",
          priceGBP: 550,
          priceUSD: 720,
          quantity: 2,
          subtotalGBP: 1100,
          subtotalUSD: 1440,
          guarantee: "Lifetime guarantee on implant, 5 years on crown"
        },
        {
          id: "2",
          treatment: "Porcelain Crown",
          priceGBP: 175,
          priceUSD: 230,
          quantity: 4,
          subtotalGBP: 700,
          subtotalUSD: 920,
          guarantee: "5-year guarantee"
        }
      ],
      totalGBP: 1800,
      totalUSD: 2360,
      notes: "Standard treatment plan for dental implants and crowns",
      guaranteeDetails: "Implants have lifetime guarantee on fixture, 5 years on crown",
      version: 2,
      lastUpdated: "2025-04-11T14:30:00Z",
      approvedByPatient: true,
      approvedByClinic: true
    },
    depositPaid: true,
    status: "active" as const,
    createdAt: "2025-04-01T09:00:00Z",
    startDate: "2025-05-10T09:00:00Z"
  },
  {
    id: "TP002",
    patientName: "Sarah Johnson",
    patientId: 2,
    treatmentPlan: {
      items: [
        {
          id: "1",
          treatment: "Porcelain Veneers",
          priceGBP: 220,
          priceUSD: 290,
          quantity: 8,
          subtotalGBP: 1760,
          subtotalUSD: 2320,
          guarantee: "5-year guarantee"
        }
      ],
      totalGBP: 1760,
      totalUSD: 2320,
      notes: "Premium veneers treatment for full smile makeover",
      guaranteeDetails: "5-year guarantee on all veneers",
      version: 1,
      lastUpdated: "2025-04-08T10:15:00Z",
      approvedByPatient: true,
      approvedByClinic: true
    },
    depositPaid: true,
    status: "active" as const,
    createdAt: "2025-04-05T14:30:00Z",
    startDate: "2025-04-20T09:00:00Z"
  },
  {
    id: "TP003",
    patientName: "Michael Brown",
    patientId: 3,
    treatmentPlan: {
      items: [
        {
          id: "1",
          treatment: "Dental Crown",
          priceGBP: 175,
          priceUSD: 230,
          quantity: 3,
          subtotalGBP: 525,
          subtotalUSD: 690,
          guarantee: "5-year guarantee"
        },
        {
          id: "2",
          treatment: "Root Canal Treatment",
          priceGBP: 195,
          priceUSD: 255,
          quantity: 1,
          subtotalGBP: 195,
          subtotalUSD: 255,
          guarantee: "2-year guarantee"
        }
      ],
      totalGBP: 720,
      totalUSD: 945,
      notes: "Treatment plan for damaged molars",
      guaranteeDetails: "Standard guarantees apply",
      version: 1,
      lastUpdated: "2025-04-07T11:45:00Z",
      approvedByPatient: false,
      approvedByClinic: true
    },
    depositPaid: false,
    status: "pending_approval" as const,
    createdAt: "2025-04-06T09:30:00Z",
    startDate: "2025-05-15T10:00:00Z"
  },
  {
    id: "TP004",
    patientName: "Emma Davis",
    patientId: 4,
    treatmentPlan: {
      items: [
        {
          id: "1",
          treatment: "Dental Implant (Straumann)",
          priceGBP: 550,
          priceUSD: 720,
          quantity: 1,
          subtotalGBP: 550,
          subtotalUSD: 720,
          guarantee: "Lifetime guarantee on implant, 5 years on crown"
        },
        {
          id: "2",
          treatment: "Bone Graft",
          priceGBP: 300,
          priceUSD: 395,
          quantity: 1,
          subtotalGBP: 300,
          subtotalUSD: 395,
          guarantee: "Included with implant guarantee"
        }
      ],
      totalGBP: 850,
      totalUSD: 1115,
      notes: "Implant with bone graft due to bone loss",
      guaranteeDetails: "Lifetime guarantee on implant fixture",
      version: 3,
      lastUpdated: "2025-04-14T16:20:00Z",
      approvedByPatient: true,
      approvedByClinic: true
    },
    depositPaid: true,
    status: "active" as const,
    createdAt: "2025-03-25T13:45:00Z",
    startDate: "2025-04-28T09:00:00Z"
  },
  {
    id: "TP005",
    patientName: "Robert Taylor",
    patientId: 5,
    treatmentPlan: {
      items: [
        {
          id: "1",
          treatment: "All-on-4 Implants",
          priceGBP: 3500,
          priceUSD: 4600,
          quantity: 1,
          subtotalGBP: 3500,
          subtotalUSD: 4600,
          guarantee: "Lifetime guarantee on implants, 10 years on prosthesis"
        }
      ],
      totalGBP: 3500,
      totalUSD: 4600,
      notes: "Premium all-on-4 treatment for full arch restoration",
      guaranteeDetails: "Extended guarantee package included",
      version: 1,
      lastUpdated: "2025-04-09T09:10:00Z",
      approvedByPatient: false,
      approvedByClinic: true
    },
    depositPaid: false,
    status: "draft" as const,
    createdAt: "2025-04-08T11:30:00Z",
    startDate: null
  }
];

interface TreatmentPlanItem {
  id: string;
  patientName: string;
  patientId: number;
  treatmentPlan: TreatmentPlan;
  depositPaid: boolean;
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  startDate: string | null;
}

const ClinicTreatmentPlansSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlanItem[]>(sampleTreatmentPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'viewer'>('list');
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlanItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCatalogDialog, setShowCatalogDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentCatalogItem | null>(null);
  const [selectedCatalogItems, setSelectedCatalogItems] = useState<string[]>([]);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [catalogFilterCategory, setCatalogFilterCategory] = useState('all');
  
  // Status badge styles
  const statusStyles = {
    "draft": "bg-gray-100 text-gray-800",
    "pending_approval": "bg-yellow-100 text-yellow-800",
    "active": "bg-green-100 text-green-800",
    "completed": "bg-blue-100 text-blue-800",
    "cancelled": "bg-red-100 text-red-800"
  };
  
  // Status display text mapping
  const statusText = {
    "draft": t("clinic.treatment_plans.status.draft", "Draft"),
    "pending_approval": t("clinic.treatment_plans.status.pending_approval", "Pending Approval"),
    "active": t("clinic.treatment_plans.status.active", "Active"),
    "completed": t("clinic.treatment_plans.status.completed", "Completed"),
    "cancelled": t("clinic.treatment_plans.status.cancelled", "Cancelled")
  };

  // Filter treatment plans based on search term and status filter
  const filteredTreatmentPlans = treatmentPlans
    .filter(plan => 
      (filterStatus === 'all' || plan.status === filterStatus) &&
      (plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       plan.id.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Function to create a new treatment plan
  const handleCreateNewPlan = () => {
    // In a real app, this would create a new treatment plan or navigate to the builder
    setCurrentView('builder');
    setSelectedPlan(null);
    
    toast({
      title: t("clinic.treatment_plans.new_plan_started", "New Treatment Plan"),
      description: t("clinic.treatment_plans.new_plan_started_desc", "You're now creating a new treatment plan."),
    });
  };
  
  // Function to view a treatment plan
  const handleViewPlan = (plan: TreatmentPlanItem) => {
    setSelectedPlan(plan);
    setCurrentView('viewer');
  };
  
  // Function to edit a treatment plan
  const handleEditPlan = (plan: TreatmentPlanItem) => {
    setSelectedPlan(plan);
    setCurrentView('builder');
  };
  
  // Function to delete a treatment plan
  const handleDeletePlan = () => {
    if (!selectedPlan) return;
    
    // In a real app, this would be an API call
    setTreatmentPlans(treatmentPlans.filter(plan => plan.id !== selectedPlan.id));
    setShowDeleteDialog(false);
    
    toast({
      title: t("clinic.treatment_plans.plan_deleted", "Treatment Plan Deleted"),
      description: t("clinic.treatment_plans.plan_deleted_desc", "The treatment plan has been deleted successfully."),
    });
    
    setSelectedPlan(null);
    setCurrentView('list');
  };
  
  // Function to send a treatment plan to a patient
  const handleSendPlan = () => {
    if (!selectedPlan) return;
    
    // In a real app, this would be an API call
    setShowSendDialog(false);
    
    toast({
      title: t("clinic.treatment_plans.plan_sent", "Treatment Plan Sent"),
      description: t("clinic.treatment_plans.plan_sent_desc", "The treatment plan has been sent to the patient successfully."),
    });
  };

  // Function to download a treatment plan
  const handleDownloadPlan = (plan: TreatmentPlanItem) => {
    // In a real app, this would download the plan
    toast({
      title: t("clinic.treatment_plans.downloading", "Downloading"),
      description: t("clinic.treatment_plans.download_started", "Your download has started."),
    });
  };
  
  // Function to back to list view
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPlan(null);
  };

  // Render treatment plans table
  const renderTreatmentPlansTable = () => (
    <>
      <div className="flex flex-col gap-6 mb-6">
        {/* Top row with tabs for section switch */}
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="plans">
              <ListChecks className="h-4 w-4 mr-2" />
              {t("clinic.treatment_plans.patient_plans", "Patient Plans")}
            </TabsTrigger>
            <TabsTrigger value="catalog">
              <Database className="h-4 w-4 mr-2" />
              {t("clinic.treatment_plans.treatment_catalog", "Treatment Catalog")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="mt-4">
            {/* Patient plans controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-10 w-full sm:w-80" 
                    placeholder={t("clinic.treatment_plans.search", "Search treatment plans...")} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs 
                  defaultValue="all" 
                  className="w-full sm:w-auto" 
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <TabsList className="grid grid-cols-3 sm:grid-cols-5 h-auto p-1">
                    <TabsTrigger value="all" className="text-xs h-8">
                      {t("clinic.treatment_plans.filter.all", "All")}
                    </TabsTrigger>
                    <TabsTrigger value="draft" className="text-xs h-8">
                      {t("clinic.treatment_plans.filter.draft", "Draft")}
                    </TabsTrigger>
                    <TabsTrigger value="pending_approval" className="text-xs h-8">
                      {t("clinic.treatment_plans.filter.pending", "Pending")}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="text-xs h-8">
                      {t("clinic.treatment_plans.filter.active", "Active")}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs h-8">
                      {t("clinic.treatment_plans.filter.completed", "Completed")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Button className="w-full sm:w-auto gap-2" onClick={handleCreateNewPlan}>
                <Plus className="h-4 w-4" />
                {t("clinic.treatment_plans.create_plan", "Create Treatment Plan")}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="catalog" className="mt-4">
            {/* Treatment catalog controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-10 w-full sm:w-80" 
                    placeholder={t("clinic.treatment_plans.search_treatments", "Search treatments...")} 
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder={t("clinic.treatment_plans.filter_category", "Filter by category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("clinic.treatment_plans.all_categories", "All Categories")}</SelectItem>
                    <SelectItem value="implants">{t("clinic.treatment_plans.categories.implants", "Dental Implants")}</SelectItem>
                    <SelectItem value="cosmetic">{t("clinic.treatment_plans.categories.cosmetic", "Cosmetic Dentistry")}</SelectItem>
                    <SelectItem value="prosthetics">{t("clinic.treatment_plans.categories.prosthetics", "Prosthetics")}</SelectItem>
                    <SelectItem value="orthodontics">{t("clinic.treatment_plans.categories.orthodontics", "Orthodontics")}</SelectItem>
                    <SelectItem value="general">{t("clinic.treatment_plans.categories.general", "General Dentistry")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto gap-2" onClick={() => {
                  // In a real app, this would open a dialog to add a new treatment
                  toast({
                    title: t("clinic.treatment_plans.add_treatment", "Add Treatment"),
                    description: t("clinic.treatment_plans.add_treatment_desc", "Treatment creation form would open here."),
                  });
                }}>
                  <Plus className="h-4 w-4" />
                  {t("clinic.treatment_plans.add_treatment", "Add Treatment")}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <FileText className="h-4 w-4 mr-2" />
                      {t("clinic.treatment_plans.import_export", "Import/Export")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: t("clinic.treatment_plans.import", "Import Treatments"),
                        description: t("clinic.treatment_plans.import_desc", "Import treatments from CSV or Excel file."),
                      });
                    }}>
                      <Upload className="h-4 w-4 mr-2" />
                      {t("clinic.treatment_plans.import", "Import Treatments")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: t("clinic.treatment_plans.export", "Export Treatments"),
                        description: t("clinic.treatment_plans.export_desc", "Treatments exported to CSV file."),
                      });
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("clinic.treatment_plans.export", "Export Treatments")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="ghost" className="w-full sm:w-auto" onClick={() => {
                  toast({
                    title: t("clinic.treatment_plans.manage_materials", "Manage Materials"),
                    description: t("clinic.treatment_plans.manage_materials_desc", "Material management interface would open here."),
                  });
                }}>
                  <Layers className="h-4 w-4 mr-2" />
                  {t("clinic.treatment_plans.manage_materials", "Manage Materials")}
                </Button>
              </div>
            </div>
            
            {/* Treatment catalog table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("clinic.treatment_plans.treatment_name", "Treatment Name")}</TableHead>
                    <TableHead>{t("clinic.treatment_plans.category", "Category")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("clinic.treatment_plans.description", "Description")}</TableHead>
                    <TableHead>{t("clinic.treatment_plans.duration", "Duration")}</TableHead>
                    <TableHead>{t("clinic.treatment_plans.materials", "Materials")}</TableHead>
                    <TableHead>{t("clinic.treatment_plans.price", "Price (GBP)")}</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTreatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">{treatment.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {treatment.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-md">
                        <span className="line-clamp-1">{treatment.description}</span>
                      </TableCell>
                      <TableCell>{treatment.duration}</TableCell>
                      <TableCell>
                        {treatment.materials.map((material, idx) => (
                          <Badge key={idx} className="mr-1 mb-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
                            {material}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                          style: 'currency', 
                          currency: 'GBP',
                          minimumFractionDigits: 0
                        }).format(treatment.priceGBP)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("clinic.treatment_plans.actions", "Actions")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedTreatment(treatment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("clinic.treatment_plans.view", "View Details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast({
                                title: t("clinic.treatment_plans.edit", "Edit"),
                                description: t("clinic.treatment_plans.edit_desc", "Editing treatment: ") + treatment.name,
                              });
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t("clinic.treatment_plans.edit", "Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast({
                                title: t("clinic.treatment_plans.duplicate", "Duplicate"),
                                description: t("clinic.treatment_plans.duplicate_desc", "Duplicating treatment: ") + treatment.name,
                              });
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              {t("clinic.treatment_plans.duplicate", "Duplicate")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => {
                              toast({
                                title: t("clinic.treatment_plans.delete", "Delete"),
                                description: t("clinic.treatment_plans.delete_desc", "Deleting treatment: ") + treatment.name,
                                variant: "destructive"
                              });
                            }}>
                              <Trash className="h-4 w-4 mr-2" />
                              {t("clinic.treatment_plans.delete", "Delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination for treatment catalog */}
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" size="sm" disabled>
                {t("common.previous", "Previous")}
              </Button>
              <div className="text-sm text-muted-foreground">
                {t("common.pagination", "Showing {{start}} to {{end}} of {{total}} items", { 
                  start: 1, 
                  end: sampleTreatments.length,
                  total: sampleTreatments.length
                })}
              </div>
              <Button variant="outline" size="sm" disabled>
                {t("common.next", "Next")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Treatment plans table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("clinic.treatment_plans.id", "ID")}</TableHead>
              <TableHead>{t("clinic.treatment_plans.patient", "Patient")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("clinic.treatment_plans.created", "Created")}</TableHead>
              <TableHead>{t("clinic.treatment_plans.start_date", "Start Date")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("clinic.treatment_plans.treatments", "Treatments")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("clinic.treatment_plans.total", "Total")}</TableHead>
              <TableHead>{t("clinic.treatment_plans.status", "Status")}</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTreatmentPlans.length > 0 ? (
              filteredTreatmentPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span>{plan.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(plan.createdAt).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-GB')}
                  </TableCell>
                  <TableCell>
                    {plan.startDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{new Date(plan.startDate).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-GB')}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">{t("clinic.treatment_plans.not_scheduled", "Not scheduled")}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm">{plan.treatmentPlan.items.length} {t("clinic.treatment_plans.items", "items")}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                      style: 'currency', 
                      currency: 'GBP',
                      minimumFractionDigits: 0
                    }).format(plan.treatmentPlan.totalGBP)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[plan.status]}`}>
                        {statusText[plan.status]}
                      </span>
                      {plan.depositPaid && (
                        <Badge className="bg-blue-600">
                          {t("clinic.treatment_plans.deposit_paid", "Deposit Paid")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("clinic.treatment_plans.actions", "Actions")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewPlan(plan)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("clinic.treatment_plans.view", "View")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("clinic.treatment_plans.edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPlan(plan)}>
                          <Download className="h-4 w-4 mr-2" />
                          {t("clinic.treatment_plans.download", "Download")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowSendDialog(true);
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {t("clinic.treatment_plans.send", "Send to Patient")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          {t("clinic.treatment_plans.delete", "Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' ? (
                    <>
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>
                        {t("clinic.treatment_plans.no_results", "No treatment plans match your filter criteria.")}
                      </p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('all');
                        }}
                      >
                        {t("clinic.treatment_plans.clear_filters", "Clear filters")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>
                        {t("clinic.treatment_plans.no_plans", "No treatment plans created yet.")}
                      </p>
                      <Button 
                        variant="link" 
                        onClick={handleCreateNewPlan}
                      >
                        {t("clinic.treatment_plans.create_first", "Create your first treatment plan")}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredTreatmentPlans.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" disabled>
            {t("common.previous", "Previous")}
          </Button>
          <div className="text-sm text-muted-foreground">
            {t("common.pagination", "Showing {{start}} to {{end}} of {{total}} items", { 
              start: 1, 
              end: filteredTreatmentPlans.length,
              total: filteredTreatmentPlans.length
            })}
          </div>
          <Button variant="outline" size="sm" disabled>
            {t("common.next", "Next")}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentView === 'list' 
                  ? t("clinic.treatment_plans.title", "Treatment Plans") 
                  : currentView === 'builder'
                    ? selectedPlan
                      ? t("clinic.treatment_plans.edit_plan", "Edit Treatment Plan")
                      : t("clinic.treatment_plans.new_plan", "New Treatment Plan")
                    : t("clinic.treatment_plans.view_plan", "View Treatment Plan")
                }
              </CardTitle>
              <CardDescription>
                {currentView === 'list' 
                  ? t("clinic.treatment_plans.description", "Manage patient treatment plans")
                  : currentView === 'builder'
                    ? t("clinic.treatment_plans.builder_desc", "Create or edit treatment plans for your patients")
                    : t("clinic.treatment_plans.viewer_desc", "View details for the selected treatment plan")
                }
              </CardDescription>
            </div>
            
            {currentView !== 'list' && (
              <Button variant="outline" size="sm" onClick={handleBackToList}>
                {t("common.back_to_list", "Back to List")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentView === 'list' && renderTreatmentPlansTable()}
          
          {currentView === 'builder' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-md border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      {selectedPlan 
                        ? t("clinic.treatment_plans.edit_patient_plan", "Edit Treatment Plan") 
                        : t("clinic.treatment_plans.create_patient_plan", "Create New Treatment Plan")
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan 
                        ? t("clinic.treatment_plans.edit_desc", "Make changes to the existing treatment plan for this patient") 
                        : t("clinic.treatment_plans.create_desc", "Create a customized treatment plan for your patient")
                      }
                    </p>
                  </div>
                  
                  {selectedPlan && (
                    <Badge className="px-3 py-1 text-sm" variant={selectedPlan.status === 'draft' ? 'outline' : 'default'}>
                      {statusText[selectedPlan.status]}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("clinic.treatment_plans.select_patient", "Select Patient")}
                      </label>
                      <Select defaultValue={selectedPlan ? `patient${selectedPlan.patientId}` : undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("clinic.treatment_plans.select_patient_placeholder", "Select a patient")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient1">John Smith</SelectItem>
                          <SelectItem value="patient2">Emily Johnson</SelectItem>
                          <SelectItem value="patient3">Michael Brown</SelectItem>
                          <SelectItem value="patient4">Sarah Williams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("clinic.treatment_plans.plan_name", "Plan Name (Optional)")}
                      </label>
                      <Input 
                        placeholder={t("clinic.treatment_plans.plan_name_placeholder", "e.g. Full Smile Makeover")}
                        defaultValue={selectedPlan?.treatmentPlan.notes}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("clinic.treatment_plans.start_date", "Start Date")}
                      </label>
                      <Input 
                        type="date" 
                        className="w-full"
                        defaultValue={selectedPlan?.startDate ? selectedPlan.startDate.split('T')[0] : undefined}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("clinic.treatment_plans.guarantee_details", "Guarantee Details (Optional)")}
                      </label>
                      <Input 
                        placeholder={t("clinic.treatment_plans.guarantee_placeholder", "e.g. 5-year guarantee on all treatments")}
                        defaultValue={selectedPlan?.treatmentPlan.guaranteeDetails}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          {t("clinic.treatment_plans.selected_treatments", "Selected Treatments")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("clinic.treatment_plans.treatments_helper", "Add treatments from your catalog to build the treatment plan")}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowCatalogDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("clinic.treatment_plans.add_from_catalog", "Add from Catalog")}
                      </Button>
                    </div>
                    
                    {/* Selected Treatments Table */}
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("clinic.treatment_plans.treatment_name", "Treatment")}</TableHead>
                            <TableHead>{t("clinic.treatment_plans.quantity", "Quantity")}</TableHead>
                            <TableHead>{t("clinic.treatment_plans.price", "Price")}</TableHead>
                            <TableHead>{t("clinic.treatment_plans.subtotal", "Subtotal")}</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {convertToBuilderItems(selectedPlan?.treatmentPlan.items)?.length ? (
                            convertToBuilderItems(selectedPlan?.treatmentPlan.items).map((treatment) => (
                              <TableRow key={treatment.id}>
                                <TableCell className="font-medium">{treatment.name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        if (treatment.quantity > 1) {
                                          // Create new updated list with decreased quantity
                                          const updatedTreatments = convertToBuilderItems(selectedPlan?.treatmentPlan.items).map(t => {
                                            if (t.id === treatment.id) {
                                              const newQuantity = t.quantity - 1;
                                              return {
                                                ...t,
                                                quantity: newQuantity,
                                                subtotalGBP: t.priceGBP * newQuantity,
                                                subtotalUSD: t.priceUSD * newQuantity
                                              };
                                            }
                                            return t;
                                          });
                                          // Update the plan with the new quantity
                                          if (selectedPlan) {
                                            // Convert updated treatments to proper format
                                            const updatedItems = updatedTreatments.map(t => ({
                                              id: t.id,
                                              treatment: t.name,
                                              priceGBP: t.priceGBP,
                                              priceUSD: t.priceUSD,
                                              quantity: t.quantity,
                                              subtotalGBP: t.subtotalGBP,
                                              subtotalUSD: t.subtotalUSD,
                                              guarantee: t.guarantee || "Standard guarantee"
                                            }));
                                            
                                            // Calculate updated totals
                                            const totalGBP = updatedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
                                            const totalUSD = updatedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
                                            
                                            // Create updated plan
                                            const updatedPlan = {
                                              ...selectedPlan,
                                              treatmentPlan: {
                                                ...selectedPlan.treatmentPlan,
                                                items: updatedItems,
                                                totalGBP,
                                                totalUSD
                                              }
                                            };
                                            
                                            // Debug logging
                                            console.log("Decreasing treatment quantity:", {
                                              treatmentId: treatment.id,
                                              treatmentName: treatment.name,
                                              oldQuantity: treatment.quantity,
                                              newQuantity: treatment.quantity - 1,
                                              updatedPlan
                                            });
                                            
                                            // Update state
                                            setSelectedPlan(updatedPlan);
                                          }
                                        }
                                      }}
                                      disabled={treatment.quantity <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-5 text-center">{treatment.quantity}</span>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        // Create new updated list with increased quantity
                                        const updatedTreatments = convertToBuilderItems(selectedPlan?.treatmentPlan.items).map(t => {
                                          if (t.id === treatment.id) {
                                            const newQuantity = t.quantity + 1;
                                            return {
                                              ...t,
                                              quantity: newQuantity,
                                              subtotalGBP: t.priceGBP * newQuantity,
                                              subtotalUSD: t.priceUSD * newQuantity
                                            };
                                          }
                                          return t;
                                        });
                                        // Update the plan with the new quantity
                                        if (selectedPlan) {
                                          // Convert updated treatments to proper format
                                          const updatedItems = updatedTreatments.map(t => ({
                                            id: t.id,
                                            treatment: t.name,
                                            priceGBP: t.priceGBP,
                                            priceUSD: t.priceUSD,
                                            quantity: t.quantity,
                                            subtotalGBP: t.subtotalGBP,
                                            subtotalUSD: t.subtotalUSD,
                                            guarantee: t.guarantee || "Standard guarantee"
                                          }));
                                          
                                          // Calculate updated totals
                                          const totalGBP = updatedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
                                          const totalUSD = updatedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
                                          
                                          // Create updated plan
                                          const updatedPlan = {
                                            ...selectedPlan,
                                            treatmentPlan: {
                                              ...selectedPlan.treatmentPlan,
                                              items: updatedItems,
                                              totalGBP,
                                              totalUSD
                                            }
                                          };
                                          
                                          // Debug logging
                                          console.log("Increasing treatment quantity:", {
                                            treatmentId: treatment.id,
                                            treatmentName: treatment.name,
                                            oldQuantity: treatment.quantity,
                                            newQuantity: treatment.quantity + 1,
                                            updatedPlan
                                          });
                                          
                                          // Update state
                                          setSelectedPlan(updatedPlan);
                                        }
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                                    style: 'currency', 
                                    currency: 'GBP',
                                    minimumFractionDigits: 0
                                  }).format(treatment.priceGBP)}
                                </TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                                    style: 'currency', 
                                    currency: 'GBP',
                                    minimumFractionDigits: 0
                                  }).format(treatment.subtotalGBP)}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => {
                                      // Filter out the treatment being deleted
                                      const updatedTreatments = convertToBuilderItems(selectedPlan?.treatmentPlan.items)
                                        .filter(t => t.id !== treatment.id);
                                      
                                      // Update the plan without the deleted treatment
                                      if (selectedPlan) {
                                        // Convert updated treatments to proper format
                                        const updatedItems = updatedTreatments.map(t => ({
                                          id: t.id,
                                          treatment: t.name,
                                          priceGBP: t.priceGBP,
                                          priceUSD: t.priceUSD,
                                          quantity: t.quantity,
                                          subtotalGBP: t.subtotalGBP,
                                          subtotalUSD: t.subtotalUSD,
                                          guarantee: t.guarantee || "Standard guarantee"
                                        }));
                                        
                                        // Calculate new totals
                                        const totalGBP = updatedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
                                        const totalUSD = updatedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
                                        
                                        // Create updated plan
                                        const updatedPlan = {
                                          ...selectedPlan,
                                          treatmentPlan: {
                                            ...selectedPlan.treatmentPlan,
                                            items: updatedItems,
                                            totalGBP,
                                            totalUSD
                                          }
                                        };
                                        
                                        // Debug logging
                                        console.log("Removing treatment:", {
                                          treatmentId: treatment.id,
                                          treatmentName: treatment.name,
                                          updatedPlan
                                        });
                                        
                                        // Update state
                                        setSelectedPlan(updatedPlan);
                                        
                                        toast({
                                          title: t("clinic.treatment_plans.treatment_removed", "Treatment Removed"),
                                          description: `${treatment.name} ${t("clinic.treatment_plans.removed_from_plan", "has been removed from the plan")}`
                                        });
                                      }
                                    }}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                {t("clinic.treatment_plans.no_treatments", "No treatments added yet. Click 'Add from Catalog' to select treatments.")}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              {t("clinic.treatment_plans.total", "Total")}:
                            </TableCell>
                            <TableCell className="font-bold">
                              {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                                style: 'currency', 
                                currency: 'GBP',
                                minimumFractionDigits: 0
                              }).format(selectedPlan?.treatmentPlan.totalGBP || 0)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleBackToList}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button 
                    onClick={() => {
                      toast({
                        title: selectedPlan 
                          ? t("clinic.treatment_plans.plan_updated", "Treatment Plan Updated") 
                          : t("clinic.treatment_plans.plan_created", "Treatment Plan Created"),
                        description: selectedPlan
                          ? t("clinic.treatment_plans.plan_updated_desc", "The treatment plan has been updated successfully.") 
                          : t("clinic.treatment_plans.plan_created_desc", "The treatment plan has been created successfully.")
                      });
                      handleBackToList();
                    }}
                  >
                    {selectedPlan 
                      ? t("clinic.treatment_plans.update_plan", "Update Plan") 
                      : t("clinic.treatment_plans.save_plan", "Save Plan")
                    }
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {currentView === 'viewer' && selectedPlan && (
            <TreatmentPlanViewer 
              treatmentPlanId={parseInt(selectedPlan.id.replace('TP', ''))} 
              canUploadFiles={true}
              patientView={false}
              onFileUploaded={(file: {filename: string}) => {
                toast({
                  title: t("clinic.treatment_plans.file_uploaded", "File Uploaded"),
                  description: t("clinic.treatment_plans.file_uploaded_desc", "The file has been uploaded successfully."),
                });
              }}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t("clinic.treatment_plans.confirm_delete", "Confirm Deletion")}
            </DialogTitle>
            <DialogDescription>
              {t("clinic.treatment_plans.delete_warning", "Are you sure you want to delete this treatment plan? This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="border rounded-md p-3 bg-gray-50 my-2">
              <p className="font-medium">{selectedPlan.id} - {selectedPlan.patientName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedPlan.treatmentPlan.items.length} treatments, 
                {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                  style: 'currency', 
                  currency: 'GBP',
                  minimumFractionDigits: 0
                }).format(selectedPlan.treatmentPlan.totalGBP)}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">
                {t("common.cancel", "Cancel")}
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeletePlan}>
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send to Patient Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              {t("clinic.treatment_plans.send_to_patient", "Send to Patient")}
            </DialogTitle>
            <DialogDescription>
              {t("clinic.treatment_plans.send_desc", "The patient will receive a notification to review this treatment plan.")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedPlan.patientName}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan.treatmentPlan.items.length} treatments, 
                  {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                    style: 'currency', 
                    currency: 'GBP',
                    minimumFractionDigits: 0
                  }).format(selectedPlan.treatmentPlan.totalGBP)}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("clinic.treatment_plans.additional_message", "Additional Message (Optional)")}</h4>
                <Input placeholder={t("clinic.treatment_plans.message_placeholder", "Add a personalized message to the patient...")} />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">
                {t("common.cancel", "Cancel")}
              </Button>
            </DialogClose>
            <Button onClick={handleSendPlan}>
              <Send className="h-4 w-4 mr-2" />
              {t("clinic.treatment_plans.send", "Send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Treatment Detail Dialog */}
      <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              {selectedTreatment?.name || t("clinic.treatment_plans.treatment_detail", "Treatment Details")}
              {selectedTreatment?.isPopular && (
                <Badge className="ml-2 bg-amber-500">
                  <Star className="h-3 w-3 mr-1" fill="currentColor" />
                  {t("clinic.treatment_plans.popular", "Popular")}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTreatment?.description || t("clinic.treatment_plans.treatment_detail_desc", "View detailed information about this treatment.")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTreatment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-white">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-primary" />
                      {t("clinic.treatment_plans.basic_info", "Basic Information")}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("clinic.treatment_plans.category", "Category")}:</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedTreatment.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("clinic.treatment_plans.price", "Price")}:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                            style: 'currency', 
                            currency: 'GBP',
                            minimumFractionDigits: 0
                          }).format(selectedTreatment.priceGBP)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("clinic.treatment_plans.duration", "Duration")}:</span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {selectedTreatment.duration}
                        </span>
                      </div>
                      {selectedTreatment.guaranteePeriod && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t("clinic.treatment_plans.guarantee", "Guarantee")}:</span>
                          <span className="flex items-center">
                            <Shield className="h-3.5 w-3.5 mr-1 text-green-600" />
                            {selectedTreatment.guaranteePeriod}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-white">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-primary" />
                      {t("clinic.treatment_plans.materials", "Materials")}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedTreatment.materials.map((material, idx) => (
                        <Badge key={idx} className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-4">
                  {selectedTreatment.preparationTime && (
                    <div className="border rounded-md p-4 bg-white">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Timer className="h-4 w-4 mr-2 text-primary" />
                        {t("clinic.treatment_plans.preparation", "Preparation")}
                      </h3>
                      <p className="text-sm">{selectedTreatment.preparationTime}</p>
                    </div>
                  )}
                  
                  {selectedTreatment.recoveryTime && (
                    <div className="border rounded-md p-4 bg-white">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-primary" />
                        {t("clinic.treatment_plans.recovery", "Recovery")}
                      </h3>
                      <p className="text-sm">{selectedTreatment.recoveryTime}</p>
                    </div>
                  )}
                  
                  {selectedTreatment.technicalDetails && (
                    <div className="border rounded-md p-4 bg-white">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-primary" />
                        {t("clinic.treatment_plans.technical", "Technical Details")}
                      </h3>
                      <p className="text-sm">{selectedTreatment.technicalDetails}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedTreatment.clinicNotes && (
                <div className="border rounded-md p-4 bg-yellow-50">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-amber-600" />
                    {t("clinic.treatment_plans.clinic_notes", "Clinic Notes")}
                  </h3>
                  <p className="text-sm">{selectedTreatment.clinicNotes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTreatment(null)}
            >
              {t("common.close", "Close")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                // This would open the edit form
                if (!selectedTreatment) return;
                toast({
                  title: t("clinic.treatment_plans.edit", "Edit"),
                  description: t("clinic.treatment_plans.edit_desc", "Editing treatment: ") + selectedTreatment.name,
                });
                setSelectedTreatment(null);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("clinic.treatment_plans.edit", "Edit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Treatment Catalog Selection Dialog */}
      <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              {t("clinic.treatment_plans.select_from_catalog", "Select Treatments from Catalog")}
            </DialogTitle>
            <DialogDescription>
              {t("clinic.treatment_plans.select_from_catalog_desc", "Select treatments to add to the patient's treatment plan.")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  placeholder={t("clinic.treatment_plans.search_treatments", "Search treatments...")} 
                  value={catalogSearchTerm}
                  onChange={(e) => setCatalogSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                value={catalogFilterCategory} 
                onValueChange={setCatalogFilterCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("clinic.treatment_plans.filter_category", "Filter by category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("clinic.treatment_plans.all_categories", "All Categories")}</SelectItem>
                  <SelectItem value="implants">{t("clinic.treatment_plans.categories.implants", "Dental Implants")}</SelectItem>
                  <SelectItem value="cosmetic">{t("clinic.treatment_plans.categories.cosmetic", "Cosmetic Dentistry")}</SelectItem>
                  <SelectItem value="prosthetics">{t("clinic.treatment_plans.categories.prosthetics", "Prosthetics")}</SelectItem>
                  <SelectItem value="orthodontics">{t("clinic.treatment_plans.categories.orthodontics", "Orthodontics")}</SelectItem>
                  <SelectItem value="general">{t("clinic.treatment_plans.categories.general", "General Dentistry")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <ScrollArea className="h-[50vh] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>{t("clinic.treatment_plans.treatment_name", "Treatment Name")}</TableHead>
                    <TableHead>{t("clinic.treatment_plans.category", "Category")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("clinic.treatment_plans.duration", "Duration")}</TableHead>
                    <TableHead>{t("clinic.treatment_plans.price", "Price (GBP)")}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTreatments
                    .filter(treatment => 
                      (catalogFilterCategory === 'all' || treatment.category === catalogFilterCategory) &&
                      (treatment.name.toLowerCase().includes(catalogSearchTerm.toLowerCase()) ||
                       treatment.description.toLowerCase().includes(catalogSearchTerm.toLowerCase()))
                    )
                    .map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell>
                        <Checkbox 
                          id={`select-${treatment.id}`}
                          checked={selectedCatalogItems.includes(treatment.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCatalogItems([...selectedCatalogItems, treatment.id]);
                            } else {
                              setSelectedCatalogItems(selectedCatalogItems.filter(id => id !== treatment.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{treatment.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {treatment.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{treatment.duration}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                          style: 'currency', 
                          currency: 'GBP',
                          minimumFractionDigits: 0
                        }).format(treatment.priceGBP)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedTreatment(treatment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          
          <DialogFooter className="flex items-center justify-between flex-col sm:flex-row gap-2">
            <div className="text-sm text-muted-foreground">
              {t("clinic.treatment_plans.treatments_selected", "Selected treatments:")}{" "}
              <span className="font-medium">{selectedCatalogItems.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCatalogDialog(false)}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // Get selected treatments from catalog
                  const selectedTreatments = sampleTreatments.filter(t => 
                    selectedCatalogItems.includes(t.id)
                  );
                  
                  // Debug logging
                  console.log("Selected catalog items:", selectedCatalogItems);
                  console.log("Selected treatments to add:", selectedTreatments);
                  
                  if (selectedTreatments.length === 0) {
                    toast({
                      title: t("clinic.treatment_plans.no_treatments_selected", "No Treatments Selected"),
                      description: t("clinic.treatment_plans.select_treatments_first", "Please select treatments to add to the plan."),
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  // Convert to treatment items with unique IDs to prevent duplicates
                  const newTreatmentItems = selectedTreatments.map(treatment => ({
                    id: `${treatment.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Create truly unique ID
                    treatment: treatment.name,
                    priceGBP: treatment.priceGBP,
                    priceUSD: Math.round(treatment.priceGBP * 1.3), // Simple conversion for demo
                    quantity: 1,
                    subtotalGBP: treatment.priceGBP,
                    subtotalUSD: Math.round(treatment.priceGBP * 1.3),
                    guarantee: treatment.guaranteePeriod || "Standard guarantee"
                  }));
                  
                  // Update the plan with the new treatments
                  if (selectedPlan) {
                    // Ensure the treatment plan has an initialized items array
                    const treatmentPlan = selectedPlan.treatmentPlan || {
                      items: [],
                      totalGBP: 0,
                      totalUSD: 0
                    };
                    
                    // Get existing items, ensuring it's an array
                    const existingItems = treatmentPlan.items || [];
                    
                    // Check for duplicate treatments by name instead of by ID
                    // This ensures we don't add the same treatment type multiple times
                    const existingTreatmentNames = existingItems.map(item => item.treatment);
                    
                    // Filter out any treatments that are already in the plan by name
                    const uniqueNewItems = newTreatmentItems.filter(item => 
                      !existingTreatmentNames.includes(item.treatment)
                    );
                    
                    if (uniqueNewItems.length === 0) {
                      toast({
                        title: t("clinic.treatment_plans.already_added", "Treatments Already in Plan"),
                        description: t("clinic.treatment_plans.already_added_desc", "All selected treatments are already in the plan."),
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    const combinedItems = [...existingItems, ...uniqueNewItems];
                    const totalGBP = combinedItems.reduce((sum, item) => sum + item.subtotalGBP, 0);
                    const totalUSD = combinedItems.reduce((sum, item) => sum + item.subtotalUSD, 0);
                    
                    // Create updated plan
                    const updatedPlan = {
                      ...selectedPlan,
                      treatmentPlan: {
                        ...treatmentPlan,
                        items: combinedItems,
                        totalGBP,
                        totalUSD
                      }
                    };
                    
                    // Debug log the update
                    console.log("Updating plan with new treatments:", {
                      existingItemsCount: existingItems.length,
                      newItemsCount: uniqueNewItems.length,
                      totalItemsCount: combinedItems.length,
                      totalGBP,
                      totalUSD,
                      updatedPlan
                    });
                    
                    // Update state
                    setSelectedPlan(updatedPlan);
                  } else {
                    // For new plans, this would be handled differently
                    // We would need to create a new plan with these treatments
                    // But for now, we'll just show a toast
                    toast({
                      title: t("clinic.treatment_plans.create_plan_first", "Create Plan First"),
                      description: t("clinic.treatment_plans.create_plan_first_desc", "Please create a new plan before adding treatments."),
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  toast({
                    title: t("clinic.treatment_plans.treatments_added", "Treatments Added"),
                    description: t("clinic.treatment_plans.treatments_added_desc", "Selected treatments have been added to the plan."),
                  });
                  
                  // Reset selection and close dialog
                  setSelectedCatalogItems([]);
                  setShowCatalogDialog(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("clinic.treatment_plans.add_selected", "Add Selected")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicTreatmentPlansSection;