import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronDown, ExternalLink, Copy, Check, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Helper to format currency amount from cents to display format
const formatAmount = (amount: number, currency: string = 'GBP') => {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};

// Status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  
  switch (status.toLowerCase()) {
    case 'succeeded':
    case 'paid':
    case 'completed':
      variant = 'default';
      break;
    case 'pending':
    case 'processing':
      variant = 'secondary';
      break;
    case 'failed':
    case 'canceled':
    case 'cancelled':
      variant = 'destructive';
      break;
    default:
      variant = 'outline';
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

interface PaymentHistoryProps {
  userId: number;
  bookingId?: number;
  limit?: number;
  title?: string;
}

export default function PaymentHistory({
  userId,
  bookingId,
  limit,
  title = 'Payment History',
}: PaymentHistoryProps) {
  const { toast } = useToast();
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null);
  
  // Payment type definition
  interface Payment {
    id: number;
    userId: number;
    bookingId?: number;
    amount: number;
    currency: string;
    status: string;
    paymentType: string;
    paymentMethod?: string;
    transactionId?: string;
    stripePaymentIntentId?: string;
    receiptUrl?: string;
    notes?: string;
    createdAt: string;
  }
  
  // Fetch payments
  const { data, isLoading, error } = useQuery<{ success: boolean; payments: Payment[] }>({
    queryKey: bookingId 
      ? [`/api/payments/booking/${bookingId}`] 
      : [`/api/payments/user/${userId}`],
    enabled: !!userId || !!bookingId,
  });
  
  // Extract payments array from response
  const payments = data?.payments || [];
  
  const handleCopyPaymentId = (paymentId: string) => {
    navigator.clipboard.writeText(paymentId).then(
      () => {
        setCopiedPaymentId(paymentId);
        setTimeout(() => setCopiedPaymentId(null), 2000);
        toast({
          title: 'Copied to clipboard',
          description: 'Payment ID has been copied to clipboard',
        });
      },
      (err) => {
        console.error('Could not copy payment ID', err);
        toast({
          title: 'Copy failed',
          description: 'Failed to copy payment ID to clipboard',
          variant: 'destructive',
        });
      }
    );
  };
  
  // Open receipt in new tab
  const openReceiptUrl = (receiptUrl: string | undefined) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          View your payment history and transaction details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Skeleton loader for payment history
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md text-center">
            <p className="text-sm text-destructive">
              Failed to load payment history. Please try again later.
            </p>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="p-8 border border-dashed rounded-md text-center">
            <p className="text-muted-foreground">No payment transactions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, limit || payments.length).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.paymentType || 'payment'}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {payment.receiptUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReceiptUrl(payment.receiptUrl)}
                            title="View Receipt"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>
                  <span className="text-sm font-medium">Transaction Details</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {payments.slice(0, limit || payments.length).map((payment) => (
                      <div key={payment.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{formatAmount(payment.amount, payment.currency)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy, HH:mm') : 'N/A'}
                            </p>
                          </div>
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-muted-foreground">Payment Type:</span>{' '}
                            <span className="capitalize">{payment.paymentType || 'payment'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payment Method:</span>{' '}
                            <span className="capitalize">{payment.paymentMethod || 'card'}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Transaction ID:</span>{' '}
                            <code className="px-1 py-0.5 bg-muted rounded text-xs">
                              {payment.transactionId || payment.stripePaymentIntentId || 'N/A'}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                const id = payment.transactionId || payment.stripePaymentIntentId;
                                if (id) handleCopyPaymentId(id);
                              }}
                              title="Copy transaction ID"
                            >
                              {copiedPaymentId === (payment.transactionId || payment.stripePaymentIntentId) ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {payment.notes && (
                          <div className="text-sm border-t pt-2 mt-2">
                            <span className="text-muted-foreground">Notes:</span>{' '}
                            <span>{payment.notes}</span>
                          </div>
                        )}
                        
                        {payment.receiptUrl && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => openReceiptUrl(payment.receiptUrl)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Receipt
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {payments && payments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {Math.min(limit || payments.length, payments.length)} of {payments.length} payments
          </p>
        )}
      </CardFooter>
    </Card>
  );
}