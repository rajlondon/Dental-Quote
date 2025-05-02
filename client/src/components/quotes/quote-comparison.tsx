import React, { useState } from "react";
import { QuoteVersion } from "@/types/quote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuotes } from "@/hooks/use-quotes";

interface QuoteComparisonProps {
  versions: QuoteVersion[];
  quoteId: number;
  onClose: () => void;
}

export default function QuoteComparison({
  versions,
  quoteId,
  onClose,
}: QuoteComparisonProps) {
  const { updateQuoteMutation } = useQuotes();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1]);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Only get versions that have been sent to the patient
  const sentVersions = versions
    .filter(version => version.status === "sent")
    .sort((a, b) => b.versionNumber - a.versionNumber);
    
  if (sentVersions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Quote Versions To Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">There are no quotes that have been sent for you to compare.</p>
          <Button onClick={onClose}>Back</Button>
        </CardContent>
      </Card>
    );
  }
  
  const handleAccept = async (versionId: number) => {
    setIsAccepting(true);
    try {
      // Update the quote version status to accepted
      await updateQuoteMutation.mutateAsync({
        id: quoteId,
        data: {
          status: "accepted"
        }
      });
      
      // Close the comparison dialog and refresh the details page
      onClose();
    } catch (error) {
      console.error("Error accepting quote:", error);
    } finally {
      setIsAccepting(false);
    }
  };
  
  const handleReject = async (versionId: number) => {
    setIsRejecting(true);
    try {
      // Update the quote version status to rejected
      await updateQuoteMutation.mutateAsync({
        id: quoteId,
        data: {
          status: "rejected"
        }
      });
      
      // Close the comparison dialog and refresh the details page
      onClose();
    } catch (error) {
      console.error("Error rejecting quote:", error);
    } finally {
      setIsRejecting(false);
    }
  };
  
  // Navigate through versions for comparison
  const navigateVersion = (index: number, direction: "prev" | "next") => {
    const newIndices = [...selectedIndices];
    if (direction === "prev") {
      newIndices[index] = Math.max(0, newIndices[index] - 1);
    } else {
      newIndices[index] = Math.min(sentVersions.length - 1, newIndices[index] + 1);
    }
    setSelectedIndices(newIndices);
  };
  
  // Get the selected versions to compare
  const getSelectedVersions = () => {
    const uniqueIndices = [...new Set(selectedIndices)];
    return uniqueIndices.map(index => sentVersions[index]).filter(Boolean);
  };
  
  const selectedVersions = getSelectedVersions();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Compare Quote Versions</span>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sentVersions.length === 1 ? (
          // If only one version, just show it
          <div className="space-y-6">
            <SingleQuoteDisplay 
              version={sentVersions[0]} 
              onAccept={handleAccept} 
              onReject={handleReject}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
            />
          </div>
        ) : (
          // If multiple versions, show comparison
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {selectedIndices.map((selectedIndex, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      Version {sentVersions[selectedIndex]?.versionNumber || "?"}
                    </Badge>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={selectedIndex === 0}
                        onClick={() => navigateVersion(index, "prev")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={selectedIndex === sentVersions.length - 1}
                        onClick={() => navigateVersion(index, "next")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    {selectedVersions.map((version, index) => (
                      <TableHead key={version.id}>
                        Version {version.versionNumber}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Created On</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`date-${version.id}`}>
                        {formatDate(version.createdAt)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Price</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`price-${version.id}`} className="font-bold text-lg">
                        {formatCurrency(version.quoteData.total, version.quoteData.currency)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Treatments</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`treatments-${version.id}`}>
                        {version.quoteData.treatments.length} treatments
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Valid Until</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`valid-${version.id}`}>
                        {version.quoteData.validUntil ? formatDate(version.quoteData.validUntil) : "Not specified"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Accommodation</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`accommodation-${version.id}`}>
                        {version.quoteData.accommodationIncluded ? 
                          <Check className="h-5 w-5 text-green-500" /> : 
                          <X className="h-5 w-5 text-red-500" />}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Transport</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`transport-${version.id}`}>
                        {version.quoteData.transportIncluded ? 
                          <Check className="h-5 w-5 text-green-500" /> : 
                          <X className="h-5 w-5 text-red-500" />}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Discount</TableCell>
                    {selectedVersions.map((version, index) => (
                      <TableCell key={`discount-${version.id}`}>
                        {version.quoteData.discount ? formatCurrency(version.quoteData.discount, version.quoteData.currency) : "No discount"}
                        {version.quoteData.discountReason && <div className="text-xs text-muted-foreground">{version.quoteData.discountReason}</div>}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Treatment Breakdown</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Treatment</TableHead>
                      {selectedVersions.map((version) => (
                        <TableHead key={`header-${version.id}`}>
                          Version {version.versionNumber}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Get all unique treatment names across all versions */}
                    {[...new Set(
                      selectedVersions.flatMap(v => 
                        v.quoteData.treatments.map(t => t.treatmentName)
                      )
                    )].map((treatmentName, i) => (
                      <TableRow key={`treatment-${i}`}>
                        <TableCell className="font-medium">{treatmentName}</TableCell>
                        {selectedVersions.map((version) => {
                          const treatment = version.quoteData.treatments.find(
                            t => t.treatmentName === treatmentName
                          );
                          return (
                            <TableCell key={`treatment-${version.id}-${i}`}>
                              {treatment ? (
                                <div>
                                  <div>{treatment.quantity} × {formatCurrency(treatment.unitPrice, version.quoteData.currency)}</div>
                                  <div className="font-bold">{formatCurrency(treatment.total, version.quoteData.currency)}</div>
                                  {treatment.description && (
                                    <div className="text-xs text-muted-foreground mt-1">{treatment.description}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not included</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleReject(selectedVersions[0].id)}
                disabled={isRejecting || isAccepting}
              >
                {isRejecting ? "Declining..." : "Decline All Quotes"}
              </Button>
              <Button
                className="gap-2"
                onClick={() => handleAccept(selectedVersions[0].id)}
                disabled={isRejecting || isAccepting}
              >
                {isAccepting ? "Accepting..." : `Accept Quote (Version ${selectedVersions[0].versionNumber})`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SingleQuoteDisplayProps {
  version: QuoteVersion;
  onAccept: (versionId: number) => Promise<void>;
  onReject: (versionId: number) => Promise<void>;
  isAccepting: boolean;
  isRejecting: boolean;
}

function SingleQuoteDisplay({ 
  version, 
  onAccept, 
  onReject,
  isAccepting,
  isRejecting
}: SingleQuoteDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Quote Version {version.versionNumber}</h3>
          <p className="text-sm text-muted-foreground">Created on {formatDate(version.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">
            {formatCurrency(version.quoteData.total, version.quoteData.currency)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {version.quoteData.validUntil && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Valid until: {formatDate(version.quoteData.validUntil)}</span>
          </div>
        )}
        {(version.quoteData.accommodationIncluded || version.quoteData.transportIncluded) && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {version.quoteData.accommodationIncluded && "Accommodation"}
              {version.quoteData.accommodationIncluded && version.quoteData.transportIncluded && " & "}
              {version.quoteData.transportIncluded && "Transport"} included
            </span>
          </div>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {version.quoteData.treatments.map((treatment, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {treatment.treatmentName}
                  {treatment.description && (
                    <div className="text-xs text-muted-foreground mt-1">{treatment.description}</div>
                  )}
                </TableCell>
                <TableCell>{treatment.quantity}</TableCell>
                <TableCell>
                  {formatCurrency(treatment.unitPrice, version.quoteData.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(treatment.total, version.quoteData.currency)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">
                Subtotal
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(version.quoteData.subtotal, version.quoteData.currency)}
              </TableCell>
            </TableRow>
            {version.quoteData.discount && version.quoteData.discount > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Discount
                  {version.quoteData.discountReason && (
                    <span className="font-normal text-muted-foreground ml-2">
                      ({version.quoteData.discountReason})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium text-destructive">
                  -{formatCurrency(version.quoteData.discount, version.quoteData.currency)}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(version.quoteData.total, version.quoteData.currency)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {version.quoteData.notes && (
        <div className="bg-muted/20 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Additional Information</h4>
          <p className="text-sm whitespace-pre-line">{version.quoteData.notes}</p>
        </div>
      )}

      {version.quoteData.paymentTerms && (
        <div className="border p-4 rounded-md">
          <h4 className="font-semibold mb-2">Payment Terms</h4>
          <p className="text-sm whitespace-pre-line">{version.quoteData.paymentTerms}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => onReject(version.id)}
          disabled={isRejecting || isAccepting}
        >
          {isRejecting ? "Declining..." : "Decline Quote"}
        </Button>
        <Button
          className="gap-2"
          onClick={() => onAccept(version.id)}
          disabled={isRejecting || isAccepting}
        >
          {isAccepting ? "Accepting..." : "Accept Quote"}
        </Button>
      </div>
    </div>
  );
}