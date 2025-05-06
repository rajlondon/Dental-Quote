import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useTreatmentLines } from "@/hooks/use-treatment-lines-v2";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, AlertCircle, CheckCircle2, Package, HelpCircle, MoreVertical, Pencil, Trash, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { ensureUuidFormat } from "@/lib/id-converter"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PatientTreatmentPlansProps {
  quoteId?: string;
}

const TreatmentPlansSection: React.FC<PatientTreatmentPlansProps> = ({ quoteId }) => {
  const [selectedTreatmentLine, setSelectedTreatmentLine] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // Removed isDeleteConfirmOpen since we're using confirm() directly
  const { toast } = useToast();
  
  // Convert numeric IDs to UUID format consistently using our utility
  const sanitizedQuoteId = useMemo(() => {
    if (!quoteId) return undefined;
    
    // Use the id-converter utility for consistent ID handling
    const uuidFormat = ensureUuidFormat(quoteId);
    
    if (uuidFormat !== quoteId) {
      console.log('[DEBUG] Converted quote ID to UUID format:', uuidFormat);
    } else {
      console.log('[DEBUG] Quote ID already in correct format:', uuidFormat);
    }
    
    return uuidFormat;
  }, [quoteId]);
  
  // Get treatment lines data and functions from the hook
  const { 
    treatmentLines, 
    isLoading, 
    error,
    treatmentSummary,
    isSummaryLoading,
    summaryError,
    updateTreatmentLine,
    deleteTreatmentLine,
    refetch
  } = useTreatmentLines(sanitizedQuoteId);
  
  // Debug: log available hook functions and state
  console.log("Treatment hook functions available:", {
    hasUpdateFn: !!updateTreatmentLine,
    hasDeleteFn: !!deleteTreatmentLine,
    hasRefetchFn: !!refetch,
    treatmentLinesCount: treatmentLines?.length || 0
  });

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        variant = "default";
        break;
      case 'deleted':
        variant = "destructive";
        break;
      case 'draft':
        variant = "secondary";
        break;
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Show treatment line details in a dialog
  const showTreatmentDetails = (treatmentLine: any) => {
    console.log('[DEBUG] Showing treatment details for ID:', treatmentLine.id);
    console.log('[DEBUG] Treatment data:', treatmentLine);
    setSelectedTreatmentLine(treatmentLine);
    setIsDetailsOpen(true);
    console.log('[DEBUG] Details dialog should now be visible');
  };

  // Handle loading states
  if (isLoading || isSummaryLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Treatment Plans</CardTitle>
          <CardDescription>Loading your dental treatment information...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Handle error states
  if (error || summaryError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Treatment Plans</CardTitle>
          <CardDescription>There was an error loading your treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as Error)?.message || (summaryError as Error)?.message || "Failed to load treatment plans. Please try again later."}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  // Handle empty state
  if ((!treatmentLines || treatmentLines.length === 0) && 
      (!treatmentSummary || treatmentSummary.totalTreatmentLines === 0)) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Treatment Plans</CardTitle>
          <CardDescription>You don't have any dental treatments planned yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No treatment plans found</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Treatments will appear here once your dental clinic adds them to your plan or when you select a special offer package.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Treatment Plans</CardTitle>
        <CardDescription>Review and manage your dental treatments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Treatment Details</TabsTrigger>
          </TabsList>
          
          {/* SUMMARY TAB */}
          <TabsContent value="summary">
            {treatmentSummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Treatments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{treatmentSummary.totalTreatmentLines}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Investment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(treatmentSummary.totalSpent, 'GBP')}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Treatment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-lg font-semibold mt-6">Your Clinics</h3>
                <div className="space-y-4">
                  {treatmentSummary.treatmentsByClinic.map((clinicData, index) => (
                    <Accordion type="single" collapsible key={index}>
                      <AccordionItem value={`clinic-${clinicData.clinic.id}`}>
                        <AccordionTrigger>
                          <div className="flex items-center space-x-2">
                            <span>{clinicData.clinic.name}</span>
                            <Badge variant="outline">
                              {clinicData.treatmentLines.length} treatments
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-[250px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Treatment</TableHead>
                                  <TableHead className="text-right">Price</TableHead>
                                  <TableHead className="text-center">Qty</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead className="text-center">Type</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clinicData.treatmentLines.map((tl) => (
                                  <TableRow key={tl.id}>
                                    <TableCell>{tl.description}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(Number(tl.unitPrice), 'GBP')}</TableCell>
                                    <TableCell className="text-center">{tl.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(Number(tl.unitPrice) * tl.quantity, 'GBP')}</TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center space-x-2">
                                        {tl.isPackage ? (
                                          <Package className="h-4 w-4" />
                                        ) : (
                                          <FileText className="h-4 w-4" />
                                        )}
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            showTreatmentDetails(tl);
                                            return false;
                                          }}
                                        >
                                          <Eye className="h-3 w-3" />
                                          <span className="sr-only">View</span>
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* DETAILS TAB */}
          <TabsContent value="details">
            {quoteId && treatmentLines && treatmentLines.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatmentLines.map((tl) => (
                      <TableRow key={tl.id}>
                        <TableCell>
                          <div className="font-medium">{tl.description}</div>
                          <div className="text-sm text-muted-foreground">{tl.procedureCode}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={tl.status} />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(tl.unitPrice), 'GBP')}</TableCell>
                        <TableCell className="text-center">{tl.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(tl.unitPrice) * tl.quantity, 'GBP')}</TableCell>
                        <TableCell>
                          {/* Replace dropdown with direct action buttons */}
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                showTreatmentDetails(tl);
                                return false;
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                
                                try {
                                  console.log("Edit action clicked for treatment line:", tl.id);
                                  setSelectedTreatmentLine(tl);
                                  setIsEditMode(true);
                                  setIsDetailsOpen(true);
                                } catch (error) {
                                  console.error("Error in edit action:", error);
                                  toast({
                                    title: "Error",
                                    description: "Could not open edit dialog",
                                    variant: "destructive",
                                  });
                                }
                                return false;
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                
                                try {
                                  console.log("Delete action clicked for treatment line:", tl.id);
                                  
                                  // Convert to UUID format using the utility function
                                  const treatmentLineId = ensureUuidFormat(tl.id);
                                  console.log('[DEBUG] Using ID for deletion:', treatmentLineId);
                                  
                                  console.log("[DEBUG] Delete action - using API path:", "/api/v1/treatment-lines/" + treatmentLineId);
                                  
                                  if (confirm("Are you sure you want to delete this treatment?")) {
                                    console.log("[DEBUG] Delete action - User confirmed delete");
                                    
                                    deleteTreatmentLine.mutate(treatmentLineId, {
                                      onSuccess: (data) => {
                                        console.log("[DEBUG] Delete treatment line success:", data);
                                      },
                                      onError: (error) => {
                                        console.error("[DEBUG] Delete treatment line error:", error);
                                        console.error("[DEBUG] Error details:", error instanceof Error ? error.message : String(error));
                                      }
                                    });
                                  }
                                } catch (error) {
                                  console.error("Error in delete action:", error);
                                  toast({
                                    title: "Error",
                                    description: "An unexpected error occurred",
                                    variant: "destructive",
                                  });
                                }
                                return false;
                              }}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Show total section */}
                <div className="flex justify-end pt-4">
                  <div className="w-72 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(
                          treatmentLines.reduce(
                            (sum, tl) => sum + Number(tl.unitPrice) * tl.quantity,
                            0
                          ),
                          'GBP'
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          treatmentLines.reduce(
                            (sum, tl) => sum + Number(tl.unitPrice) * tl.quantity,
                            0
                          ),
                          'GBP'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Show info panel for patients */}
                <Alert className="mt-6">
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>Need assistance?</AlertTitle>
                  <AlertDescription>
                    If you have questions about your treatment plan, please contact your dental clinic or our support team through the messaging system.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-6">
                {quoteId ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No treatments found for this quote</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No quote ID provided</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Treatment details can only be viewed for a specific quote.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Treatment details dialog */}
      {selectedTreatmentLine && (
        <Dialog 
          open={isDetailsOpen} 
          onOpenChange={(open) => {
            setIsDetailsOpen(open);
            if (!open) setIsEditMode(false);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Treatment" : "Treatment Details"}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update information about your selected treatment"
                  : "Full information about your selected treatment"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {isEditMode ? (
                // Edit mode view - Would implement form controls here
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Patient Notes:</label>
                    <textarea 
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      defaultValue={selectedTreatmentLine.patientNotes || ''}
                      placeholder="Add your notes about this treatment..."
                      onChange={(e) => {
                        // Update the selected treatment line with the new notes
                        setSelectedTreatmentLine({
                          ...selectedTreatmentLine,
                          patientNotes: e.target.value
                        });
                      }}
                    />
                  </div>
                </div>
              ) : (
                // View mode - Regular details view
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Treatment</p>
                    <p>{selectedTreatmentLine.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Status</p>
                      <StatusBadge status={selectedTreatmentLine.status} />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Type</p>
                      <p>{selectedTreatmentLine.isPackage ? 'Package' : 'Individual Treatment'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Procedure Code</p>
                      <p>{selectedTreatmentLine.procedureCode}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Quantity</p>
                      <p>{selectedTreatmentLine.quantity}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Unit Price</p>
                      <p>{formatCurrency(Number(selectedTreatmentLine.unitPrice), 'GBP')}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Total</p>
                      <p>{formatCurrency(Number(selectedTreatmentLine.unitPrice) * selectedTreatmentLine.quantity, 'GBP')}</p>
                    </div>
                  </div>
                  
                  {selectedTreatmentLine.patientNotes && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Your Notes</p>
                      <p className="text-sm">{selectedTreatmentLine.patientNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              {isEditMode ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditMode(false);
                      // Reset any changes
                      setSelectedTreatmentLine({...selectedTreatmentLine});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      try {
                        console.log("Updating treatment line with ID:", selectedTreatmentLine.id);
                        
                        // Convert to UUID format using the utility function
                        const treatmentLineId = ensureUuidFormat(selectedTreatmentLine.id);
                        console.log('[DEBUG] Using ID for update:', treatmentLineId);
                        
                        const updateData = {
                          patientNotes: selectedTreatmentLine.patientNotes
                        };
                        console.log("Update data:", updateData);
                        
                        // Use the updateTreatmentLine mutation from the hook
                        updateTreatmentLine.mutate(
                          { 
                            id: treatmentLineId, 
                            data: updateData 
                          }, 
                          {
                            onSuccess: (data) => {
                              console.log(`[DEBUG] Update treatment line success:`, data);
                              // No need for additional toast - the hook already shows it
                              setIsEditMode(false);
                              setIsDetailsOpen(false);
                            },
                            onError: (error) => {
                              console.error(`[DEBUG] Update treatment line error:`, error);
                              // No need for additional toast - the hook already shows it
                            }
                          }
                        );
                      } catch (error) {
                        console.error("Error in update action:", error);
                        toast({
                          title: "Error",
                          description: "An unexpected error occurred",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* We no longer need the delete confirmation dialog since we're using confirm() in the dropdown */}
    </Card>
  );
};

export default TreatmentPlansSection;