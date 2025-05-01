import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useTreatmentPlans, useDeleteTreatmentPlan } from "@/hooks/use-treatment-plans";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, PlusCircle, FileEdit, Trash2, CalendarRange, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Download, Send } from "lucide-react";
import { TreatmentPlanStatus, PaymentStatus } from "@shared/models/treatment-plan";
import { CreateTreatmentPlanDialog } from "./CreateTreatmentPlanDialog";
import { UpdateTreatmentPlanDialog } from "./UpdateTreatmentPlanDialog";
import { ViewTreatmentPlanDialog } from "./ViewTreatmentPlanDialog";

// Helper function to format date strings with locale support
const formatDate = (dateString?: string, locale?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(locale || 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: TreatmentPlanStatus }) => {
  const { t } = useTranslation();
  
  const getVariant = () => {
    switch (status) {
      case TreatmentPlanStatus.DRAFT:
        return "outline";
      case TreatmentPlanStatus.SENT:
        return "secondary";
      case TreatmentPlanStatus.ACCEPTED:
        return "default";
      case TreatmentPlanStatus.IN_PROGRESS:
        return "default";
      case TreatmentPlanStatus.COMPLETED:
        return "default";
      case TreatmentPlanStatus.REJECTED:
        return "destructive";
      case TreatmentPlanStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getLabel = () => {
    switch (status) {
      case TreatmentPlanStatus.DRAFT:
        return t("clinic.treatment_plans.status.draft", "Draft");
      case TreatmentPlanStatus.SENT:
        return t("clinic.treatment_plans.status.sent", "Sent");
      case TreatmentPlanStatus.ACCEPTED:
        return t("clinic.treatment_plans.status.accepted", "Accepted");
      case TreatmentPlanStatus.IN_PROGRESS:
        return t("clinic.treatment_plans.status.in_progress", "In Progress");
      case TreatmentPlanStatus.COMPLETED:
        return t("clinic.treatment_plans.status.completed", "Completed");
      case TreatmentPlanStatus.REJECTED:
        return t("clinic.treatment_plans.status.rejected", "Rejected");
      case TreatmentPlanStatus.CANCELLED:
        return t("clinic.treatment_plans.status.cancelled", "Cancelled");
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()}>{getLabel()}</Badge>
  );
};

// Payment status badge component
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
  const { t } = useTranslation();

  const getVariant = () => {
    switch (status) {
      case PaymentStatus.PAID:
        return "default";
      case PaymentStatus.PARTIAL:
        return "secondary";
      case PaymentStatus.PENDING:
        return "outline";
      case PaymentStatus.REFUNDED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getLabel = () => {
    switch (status) {
      case PaymentStatus.PAID:
        return t("clinic.treatment_plans.payment.paid", "Paid");
      case PaymentStatus.PARTIAL:
        return t("clinic.treatment_plans.payment.partial", "Partial");
      case PaymentStatus.PENDING:
        return t("clinic.treatment_plans.payment.pending", "Pending");
      case PaymentStatus.REFUNDED:
        return t("clinic.treatment_plans.payment.refunded", "Refunded");
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()}>{getLabel()}</Badge>
  );
};

export const TreatmentPlansSection = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  
  // Get current locale for formatting
  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-GB';

  // Convert tab to filter status
  const getStatusFilter = (): string | undefined => {
    if (currentTab === "all") return undefined;
    return currentTab;
  };

  // Use the treatment plans hook
  const { data, isLoading, isError, error } = useTreatmentPlans(
    page, 
    10, 
    getStatusFilter(), 
    search.length >= 2 ? search : undefined
  );

  // Delete mutation
  const deleteMutation = useDeleteTreatmentPlan();

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  // Handle view
  const handleView = (plan: any) => {
    setSelectedPlanId(plan.id);
    setIsViewDialogOpen(true);
  };

  // Handle download
  const handleDownload = async (plan: any) => {
    try {
      toast({
        title: t("clinic.treatment_plans.download.title", "Downloading treatment plan"),
        description: t("clinic.treatment_plans.download.preparing", "Preparing the document for download..."),
      });
      
      // Make API call to get the PDF file
      const response = await fetch(`/api/files/treatmentPlan/${plan.id}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `treatment-plan-${plan.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        toast({
          title: t("clinic.treatment_plans.download.complete_title", "Download complete"),
          description: t("clinic.treatment_plans.download.complete_description", "Treatment plan has been downloaded successfully."),
        });
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading treatment plan:", error);
      toast({
        title: t("clinic.treatment_plans.download.failed_title", "Download failed"),
        description: t("clinic.treatment_plans.download.failed_description", "Could not download the treatment plan."),
        variant: "destructive",
      });
    }
  };

  // Handle send to patient
  const handleSendToPatient = async (plan: any) => {
    try {
      toast({
        title: t("clinic.treatment_plans.send.title", "Sending to patient"),
        description: t("clinic.treatment_plans.send.description", "Sending treatment plan to {{name}}...", { name: plan.patientName }),
      });
      
      // Make API call to send the treatment plan to the patient
      const response = await fetch(`/api/treatment-plans/${plan.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Update the plan status to "sent" in the local state
        if (plan.status === TreatmentPlanStatus.DRAFT) {
          await updateStatus(plan.id, TreatmentPlanStatus.SENT);
        }
        
        toast({
          title: t("clinic.treatment_plans.send.success_title", "Success"),
          description: t("clinic.treatment_plans.send.success_description", "Treatment plan has been sent to {{name}}.", { name: plan.patientName }),
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send treatment plan");
      }
    } catch (error) {
      console.error("Error sending treatment plan:", error);
      toast({
        title: t("clinic.treatment_plans.send.failed_title", "Send failed"),
        description: t("clinic.treatment_plans.send.failed_description", "Could not send the treatment plan to the patient."),
        variant: "destructive",
      });
    }
  };
  
  // Helper function to update treatment plan status
  const updateStatus = async (id: number, status: TreatmentPlanStatus) => {
    try {
      const response = await fetch(`/api/treatment-plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/treatment-plans'] });
    } catch (error) {
      console.error("Error updating treatment plan status:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: t("clinic.treatment_plans.delete.success_title", "Success"),
        description: t("clinic.treatment_plans.delete.success_description", "Treatment plan has been deleted."),
      });
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
      toast({
        title: t("clinic.treatment_plans.delete.failed_title", "Delete failed"),
        description: t("clinic.treatment_plans.delete.failed_description", "Could not delete the treatment plan."),
        variant: "destructive",
      });
    }
  };

  // Calculate page controls
  const totalPages = data?.data?.pagination?.pages || 1;
  const showPagination = totalPages > 1;

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>{t("clinic.treatment_plans.title", "Treatment Plans")}</CardTitle>
            <CardDescription>
              {t("clinic.treatment_plans.description", "Manage treatment plans for your patients")}
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("clinic.treatment_plans.new_button", "New Treatment Plan")}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("clinic.treatment_plans.search_placeholder", "Search by name or title...")}
              className="w-full pl-8"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="all" className="mx-6" onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("clinic.treatment_plans.tabs.all", "All")}</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.DRAFT}>{t("clinic.treatment_plans.tabs.draft", "Draft")}</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.SENT}>{t("clinic.treatment_plans.tabs.sent", "Sent")}</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.ACCEPTED}>{t("clinic.treatment_plans.tabs.accepted", "Accepted")}</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.IN_PROGRESS}>{t("clinic.treatment_plans.tabs.in_progress", "In Progress")}</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.COMPLETED}>{t("clinic.treatment_plans.tabs.completed", "Completed")}</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-0">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                <p>{t("clinic.treatment_plans.error_loading", "Error loading treatment plans:")}{" "}{error?.message || t("common.unknown_error", "Unknown error")}</p>
              </div>
            ) : data?.data?.treatmentPlans?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("clinic.treatment_plans.no_plans_found", "No treatment plans found")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="p-4 text-left font-medium">{t("clinic.treatment_plans.columns.patient", "Patient")}</th>
                      <th className="p-4 text-left font-medium">{t("clinic.treatment_plans.columns.title", "Title")}</th>
                      <th className="p-4 text-left font-medium">{t("clinic.treatment_plans.columns.created", "Created")}</th>
                      <th className="p-4 text-left font-medium">{t("clinic.treatment_plans.columns.status", "Status")}</th>
                      <th className="p-4 text-left font-medium">{t("clinic.treatment_plans.columns.payment", "Payment")}</th>
                      <th className="p-4 text-left font-medium">{t("clinic.treatment_plans.columns.total", "Total")}</th>
                      <th className="p-4 text-right font-medium">{t("clinic.treatment_plans.columns.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.treatmentPlans.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 text-sm">{plan.patientName}</td>
                        <td className="p-4 text-sm">{plan.title}</td>
                        <td className="p-4 text-sm">{formatDate(plan.createdAt, locale)}</td>
                        <td className="p-4 text-sm">
                          <StatusBadge status={plan.status} />
                        </td>
                        <td className="p-4 text-sm">
                          <PaymentBadge status={plan.paymentStatus} />
                        </td>
                        <td className="p-4 text-sm">
                          {new Intl.NumberFormat(locale, {
                            style: 'currency',
                            currency: plan.currency || 'GBP'
                          }).format(plan.totalPrice)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("common.actions", "Actions")}</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(plan)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("common.view", "View")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPlanId(plan.id);
                                  setIsUpdateDialogOpen(true);
                                }}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                {t("common.edit", "Edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(plan)}>
                                <Download className="mr-2 h-4 w-4" />
                                {t("common.download", "Download")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendToPatient(plan)}>
                                <Send className="mr-2 h-4 w-4" />
                                {t("clinic.treatment_plans.actions.send_to_patient", "Send to Patient")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()} // Prevent closing dropdown
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete", "Delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("common.confirm_delete.title", "Are you sure?")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("common.confirm_delete.description", "This action cannot be undone. This will permanently delete the treatment plan and remove it from our servers.")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(plan.id)}>
                                      {deleteMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          {t("common.deleting", "Deleting...")}
                                        </>
                                      ) : t("common.delete", "Delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showPagination && (
              <div className="py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog (placeholder) */}
      {isCreateDialogOpen && (
        <CreateTreatmentPlanDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}

      {/* Update Plan Dialog */}
      {isUpdateDialogOpen && selectedPlanId && (
        <UpdateTreatmentPlanDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          treatmentPlanId={selectedPlanId}
        />
      )}

      {/* View Plan Dialog */}
      {isViewDialogOpen && selectedPlanId && (
        <ViewTreatmentPlanDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          treatmentPlanId={selectedPlanId}
          onDownload={handleDownload}
          onSendToPatient={handleSendToPatient}
        />
      )}
    </Card>
  );
};