import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Payment } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface PaymentHistoryProps {
  userId?: number;
  bookingId?: number;
  limit?: number;
  title?: string;
  showDownload?: boolean;
}

export default function PaymentHistory({ 
  userId, 
  bookingId, 
  limit = 10,
  title = "Payment History",
  showDownload = true
}: PaymentHistoryProps) {
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Create query string based on provided filters
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId.toString());
  if (bookingId) queryParams.append('bookingId', bookingId.toString());
  if (limit) queryParams.append('limit', limit.toString());
  
  // Fetch payment history
  const { data, isLoading, isError } = useQuery<{payments: Payment[]}>({
    queryKey: [`/api/payments?${queryParams.toString()}`],
  });
  
  // Format currency
  const formatCurrency = (amount: string | number, currency = 'GBP') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get payment type badge
  const getPaymentTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Deposit</Badge>;
      case 'treatment':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Treatment</Badge>;
      case 'refund':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Refund</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  // View receipt
  const viewReceipt = (url: string | null) => {
    if (!url) {
      toast({
        title: "Receipt Unavailable",
        description: "No receipt is available for this payment.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(url, '_blank');
  };

  // Toggle expanded view for a payment
  const toggleDetails = (paymentId: number) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
    } else {
      setExpandedPayment(paymentId);
    }
  };
  
  // Download payment history as CSV
  const downloadHistory = () => {
    if (!data?.payments || data.payments.length === 0) {
      toast({
        title: "No Data to Download",
        description: "There are no payment records to download.",
        variant: "destructive",
      });
      return;
    }
    
    // Format payments for CSV
    const headers = "Date,Amount,Currency,Payment Type,Status,Transaction ID\n";
    const rows = data.payments.map(p => {
      const date = p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd') : 'N/A';
      return `${date},${p.amount},${p.currency},${p.paymentType},${p.status},${p.transactionId || 'N/A'}`;
    }).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loading payment history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Error loading payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            An error occurred while loading your payment history. Please try again later.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/payments?${queryParams.toString()}`] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!data?.payments || data.payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No payment records found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No payment records have been found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Showing {data.payments.length} payment {data.payments.length === 1 ? 'record' : 'records'}
          </CardDescription>
        </div>
        
        {showDownload && (
          <Button variant="outline" size="sm" onClick={downloadHistory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => (
                <React.Fragment key={payment.id}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>{getPaymentTypeBadge(payment.paymentType)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleDetails(payment.id)}
                        >
                          <Search className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        
                        {payment.receiptUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewReceipt(payment.receiptUrl)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View receipt</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedPayment === payment.id && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={5} className="p-4">
                        <div className="rounded-md bg-muted p-4 text-sm">
                          <h4 className="font-medium mb-2">Payment Details</h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            <div>
                              <dt className="text-muted-foreground">Transaction ID</dt>
                              <dd className="font-mono text-xs break-all">{payment.transactionId || 'N/A'}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Payment Method</dt>
                              <dd>{payment.paymentMethod || 'N/A'}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Date & Time</dt>
                              <dd>
                                {payment.createdAt 
                                  ? format(new Date(payment.createdAt), 'dd MMM yyyy, HH:mm:ss') 
                                  : 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Receipt</dt>
                              <dd>
                                {payment.receiptUrl ? (
                                  <Button 
                                    variant="link" 
                                    className="p-0 h-auto font-normal text-primary"
                                    onClick={() => viewReceipt(payment.receiptUrl)}
                                  >
                                    View Receipt
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground">Not available</span>
                                )}
                              </dd>
                            </div>
                            {payment.notes && (
                              <div className="col-span-2">
                                <dt className="text-muted-foreground">Notes</dt>
                                <dd className="whitespace-pre-wrap">{payment.notes}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}