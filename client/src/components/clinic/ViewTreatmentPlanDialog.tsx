import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTreatmentPlan } from '@/hooks/use-treatment-plans';
import { Loader2, Download, Send } from "lucide-react";
import { TreatmentPlanStatus, PaymentStatus } from "@shared/models/treatment-plan";
import { Badge } from "@/components/ui/badge";

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

interface ViewTreatmentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentPlanId: number;
  onDownload: (plan: any) => void;
  onSendToPatient: (plan: any) => void;
}

export const ViewTreatmentPlanDialog = ({
  open,
  onOpenChange,
  treatmentPlanId,
  onDownload,
  onSendToPatient,
}: ViewTreatmentPlanDialogProps) => {
  const { data: treatmentPlanData, isLoading, isError, error } = useTreatmentPlan(treatmentPlanId);

  const handleDownload = () => {
    if (treatmentPlanData?.data) {
      onDownload(treatmentPlanData.data);
    }
  };

  const handleSendToPatient = () => {
    if (treatmentPlanData?.data) {
      onSendToPatient(treatmentPlanData.data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Treatment Plan Details</DialogTitle>
          <DialogDescription>
            View the details of this treatment plan
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            <p>Error loading treatment plan: {error?.message || "Unknown error"}</p>
          </div>
        ) : treatmentPlanData?.data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                <p className="text-base font-medium">{treatmentPlanData.data.patientName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="text-base font-medium">{formatDate(treatmentPlanData.data.createdAt)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="mt-1">
                  <StatusBadge status={treatmentPlanData.data.status} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                <div className="mt-1">
                  <PaymentBadge status={treatmentPlanData.data.paymentStatus} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
              <p className="text-base font-medium">{treatmentPlanData.data.title}</p>
            </div>

            {treatmentPlanData.data.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-base">{treatmentPlanData.data.description}</p>
              </div>
            )}

            {treatmentPlanData.data.estimatedDuration && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estimated Duration</h3>
                <p className="text-base">{treatmentPlanData.data.estimatedDuration}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Treatment Items</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left text-xs font-medium">Item</th>
                      <th className="p-2 text-center text-xs font-medium">Quantity</th>
                      <th className="p-2 text-right text-xs font-medium">Price</th>
                      <th className="p-2 text-right text-xs font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentPlanData.data.treatmentItems?.map((item, index) => (
                      <tr key={index} className={index !== (treatmentPlanData.data.treatmentItems?.length || 0) - 1 ? "border-b" : ""}>
                        <td className="p-2 text-sm">
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="p-2 text-sm text-center">{item.quantity}</td>
                        <td className="p-2 text-sm text-right">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: treatmentPlanData.data.currency || 'GBP'
                          }).format(item.price)}
                        </td>
                        <td className="p-2 text-sm text-right">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: treatmentPlanData.data.currency || 'GBP'
                          }).format(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-medium">
                      <td colSpan={3} className="p-2 text-right">Total:</td>
                      <td className="p-2 text-right">
                        {new Intl.NumberFormat('en-GB', {
                          style: 'currency',
                          currency: treatmentPlanData.data.currency || 'GBP'
                        }).format(treatmentPlanData.data.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {treatmentPlanData.data.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Additional Notes</h3>
                <p className="text-base whitespace-pre-line">{treatmentPlanData.data.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No treatment plan data available</p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
          <div className="flex-1 flex justify-start gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={handleDownload}
              disabled={isLoading || isError}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={handleSendToPatient}
              disabled={isLoading || isError}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to Patient
            </Button>
          </div>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};