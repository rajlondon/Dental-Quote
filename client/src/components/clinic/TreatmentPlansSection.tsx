import { useState } from "react";
import { useTreatmentPlans, useDeleteTreatmentPlan } from "@/hooks/use-treatment-plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, PlusCircle, FileEdit, Trash2, CalendarRange } from "lucide-react";
import { TreatmentPlanStatus, PaymentStatus } from "../../../shared/models/treatment-plan";
import { CreateTreatmentPlanDialog } from "./CreateTreatmentPlanDialog";
import { UpdateTreatmentPlanDialog } from "./UpdateTreatmentPlanDialog";

// Helper function to format date strings
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: TreatmentPlanStatus }) => {
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

  return (
    <Badge variant={getVariant()}>{status}</Badge>
  );
};

// Payment status badge component
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
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

  return (
    <Badge variant={getVariant()}>{status}</Badge>
  );
};

export const TreatmentPlansSection = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);

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

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
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
            <CardTitle>Treatment Plans</CardTitle>
            <CardDescription>
              Manage treatment plans for your patients
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Treatment Plan
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or title..."
              className="w-full pl-8"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="all" className="mx-6" onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.DRAFT}>Draft</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.SENT}>Sent</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.ACCEPTED}>Accepted</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.IN_PROGRESS}>In Progress</TabsTrigger>
          <TabsTrigger value={TreatmentPlanStatus.COMPLETED}>Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-0">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading treatment plans: {error?.message || "Unknown error"}</p>
              </div>
            ) : data?.data?.treatmentPlans?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No treatment plans found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="p-4 text-left font-medium">Patient</th>
                      <th className="p-4 text-left font-medium">Title</th>
                      <th className="p-4 text-left font-medium">Created</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Payment</th>
                      <th className="p-4 text-left font-medium">Total</th>
                      <th className="p-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.treatmentPlans.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 text-sm">{plan.patientName}</td>
                        <td className="p-4 text-sm">{plan.title}</td>
                        <td className="p-4 text-sm">{formatDate(plan.createdAt)}</td>
                        <td className="p-4 text-sm">
                          <StatusBadge status={plan.status} />
                        </td>
                        <td className="p-4 text-sm">
                          <PaymentBadge status={plan.paymentStatus} />
                        </td>
                        <td className="p-4 text-sm">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: plan.currency || 'GBP'
                          }).format(plan.totalPrice)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                setIsUpdateDialogOpen(true);
                              }}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    treatment plan and remove it from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(plan.id)}>
                                    {deleteMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1} 
                      />
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
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages} 
                      />
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

      {/* Update Plan Dialog (placeholder) */}
      {isUpdateDialogOpen && selectedPlanId && (
        <UpdateTreatmentPlanDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          treatmentPlanId={selectedPlanId}
        />
      )}
    </Card>
  );
};