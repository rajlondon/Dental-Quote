import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Eye
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
import TreatmentPlanViewer from '@/components/TreatmentPlanViewer';
import TreatmentPlanBuilder from '@/components/TreatmentPlanBuilder';
import { useToast } from '@/hooks/use-toast';
import type { TreatmentPlan, TreatmentItem } from '@/types/clientPortal';

// Sample treatment plans data - in a real app, this would come from an API
const sampleTreatmentPlans = [
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
    status: "active",
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
    status: "active",
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
    status: "pending_approval",
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
    status: "active",
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
    status: "draft",
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
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        {/* Search and filter section */}
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
            <TreatmentPlanBuilder 
              patientId={selectedPlan?.patientId} 
              existingPlan={selectedPlan?.treatmentPlan}
              onSave={(plan) => {
                toast({
                  title: t("clinic.treatment_plans.saved", "Treatment Plan Saved"),
                  description: t("clinic.treatment_plans.saved_desc", "The treatment plan has been saved successfully."),
                });
                
                // In a real app, this would save to the API
                // Here we just go back to the list view
                setCurrentView('list');
              }}
              onCancel={handleBackToList}
            />
          )}
          
          {currentView === 'viewer' && selectedPlan && (
            <TreatmentPlanViewer 
              treatmentPlanId={parseInt(selectedPlan.id.replace('TP', ''))} 
              canUploadFiles={true}
              patientView={false}
              onFileUploaded={(file) => {
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
    </div>
  );
};

export default ClinicTreatmentPlansSection;