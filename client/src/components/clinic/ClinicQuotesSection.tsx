import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Download, FileText, Search, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClinicQuotesSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [quoteDetailsOpen, setQuoteDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quotes from the API
  const { data: quotesData, isLoading, error } = useQuery({
    queryKey: ['/api/portal/quotes'],
    retry: 1,
  });

  // Update quote status mutation
  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, status, clinicNotes }: { id: number; status: string; clinicNotes?: string }) => {
      const response = await apiRequest('PATCH', `/api/portal/quotes/${id}`, {
        status,
        clinicNotes
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/quotes'] });
      toast({
        title: "Quote updated",
        description: "The quote has been successfully updated.",
      });
      setQuoteDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating quote",
        description: error.message || "There was an error updating the quote.",
        variant: "destructive",
      });
    },
  });

  // Handle viewing the details of a quote
  const handleViewQuote = (quote: any) => {
    setSelectedQuote(quote);
    setQuoteDetailsOpen(true);
  };

  // Handle updating the quote status
  const handleUpdateQuote = (status: string) => {
    if (!selectedQuote) return;
    
    updateQuoteMutation.mutate({
      id: selectedQuote.id,
      status,
      clinicNotes: selectedQuote.clinicNotes
    });
  };

  // Filter and search quotes
  const filteredQuotes = React.useMemo(() => {
    if (!quotesData?.quotes) return [];
    
    return quotesData.quotes.filter((quote: any) => {
      const matchesSearch = searchTerm === '' || 
        (quote.patientName && quote.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (quote.patientEmail && quote.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotesData, searchTerm, filterStatus]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
        <h3 className="text-lg font-semibold">Error loading quotes</h3>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes by patient name or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Requests</CardTitle>
          <CardDescription>
            Manage quotes sent to your clinic. Review, approve, or decline quote requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold">No quotes found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? "Try adjusting your search or filter criteria" 
                  : "New quote requests will appear here when received"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Treatments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote: any) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">
                      {quote.patientName || "Anonymous"}
                      {quote.patientEmail && (
                        <div className="text-xs text-muted-foreground">{quote.patientEmail}</div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {quote.treatments?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {quote.treatments.slice(0, 2).map((treatment: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {treatment}
                            </Badge>
                          ))}
                          {quote.treatments.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{quote.treatments.length - 2} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No treatments specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewQuote(quote)}
                        title="View quote details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={quoteDetailsOpen} onOpenChange={setQuoteDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>
              Review and manage this quote request
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Patient Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>{" "}
                      <span className="font-medium">{selectedQuote.patientName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>{" "}
                      <span className="font-medium">{selectedQuote.patientEmail || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Phone:</span>{" "}
                      <span className="font-medium">{selectedQuote.patientPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Quote Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>{" "}
                      <StatusBadge status={selectedQuote.status} />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Created:</span>{" "}
                      <span className="font-medium">
                        {new Date(selectedQuote.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Request ID:</span>{" "}
                      <span className="font-medium">#{selectedQuote.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Requested Treatments</h3>
                {selectedQuote.treatments?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.treatments.map((treatment: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {treatment}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific treatments requested</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Additional Notes</h3>
                <div className="bg-secondary/50 p-3 rounded text-sm">
                  {selectedQuote.patientNotes || "No additional notes provided by the patient."}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Clinic Notes</h3>
                <Textarea
                  placeholder="Add your notes about this quote request..."
                  value={selectedQuote.clinicNotes || ""}
                  onChange={(e) => {
                    setSelectedQuote({
                      ...selectedQuote,
                      clinicNotes: e.target.value
                    });
                  }}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {selectedQuote.status === "pending" && (
                <div className="bg-secondary/30 p-4 rounded-md">
                  <h3 className="text-sm font-semibold mb-3">Quote Response</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleUpdateQuote("declined")}
                      disabled={updateQuoteMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Quote
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleUpdateQuote("approved")}
                      disabled={updateQuoteMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Quote
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    This action will update the quote status and notify the patient.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setQuoteDetailsOpen(false)}
            >
              Close
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                updateQuoteMutation.mutate({
                  id: selectedQuote.id,
                  status: selectedQuote.status,
                  clinicNotes: selectedQuote.clinicNotes
                });
              }}
              disabled={updateQuoteMutation.isPending}
            >
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for displaying status badges
function StatusBadge({ status }: { status: string }) {
  const getStatusDetails = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { variant: 'outline', label: 'Pending', className: 'text-yellow-600 border-yellow-200 bg-yellow-50' };
      case 'approved':
        return { variant: 'outline', label: 'Approved', className: 'text-green-600 border-green-200 bg-green-50' };
      case 'declined':
        return { variant: 'outline', label: 'Declined', className: 'text-red-600 border-red-200 bg-red-50' };
      case 'converted':
        return { variant: 'outline', label: 'Converted', className: 'text-blue-600 border-blue-200 bg-blue-50' };
      default:
        return { variant: 'outline', label: status.charAt(0).toUpperCase() + status.slice(1), className: '' };
    }
  };

  const { label, className } = getStatusDetails(status);

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}