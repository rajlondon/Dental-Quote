import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema for treatment payment
const treatmentPaymentSchema = z.object({
  amount: z.string()
    .min(1, { message: 'Amount is required' })
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  currency: z.string().default('GBP'),
  paymentType: z.enum(['treatment', 'deposit', 'balance', 'other']).default('treatment'),
  notes: z.string().optional(),
});

type TreatmentPaymentFormValues = z.infer<typeof treatmentPaymentSchema>;

interface TreatmentPaymentFormProps {
  userId: number;
  bookingId?: number;
  treatmentPlanId?: number;
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
}

export default function TreatmentPaymentForm({
  userId,
  bookingId,
  treatmentPlanId,
  onSuccess,
  onError
}: TreatmentPaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false);
  
  // Define user data interface
  interface UserData {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    username: string;
  }
  
  // Define treatment plan interface
  interface TreatmentPlan {
    id: number;
    userId: number;
    treatmentType: string;
    estimatedTotalCost: number;
    status: string;
    notes?: string;
    createdAt: string;
  }
  
  // Get user details
  const { data: userData } = useQuery<UserData>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });
  
  // IMPORTANT: Using '/api/treatment-module/' for consistent API path usage
  const API_BASE_URL = "/api/treatment-module";

  // Get treatment plan details if treatmentPlanId is provided
  const { data: treatmentPlan } = useQuery<TreatmentPlan>({
    queryKey: [`${API_BASE_URL}/treatment-plans/${treatmentPlanId}`],
    enabled: !!treatmentPlanId,
  });
  
  // Payment creation mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: TreatmentPaymentFormValues & { userId: number, bookingId?: number }) => {
      setIsSubmitting(true);
      const response = await apiRequest('POST', '/api/payments/create-treatment-payment-intent', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      onSuccess(data);
      toast({
        title: 'Payment process initiated',
        description: 'Please complete your payment using the card form',
      });
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      onError(error);
      toast({
        title: 'Payment setup failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Form setup
  const form = useForm<TreatmentPaymentFormValues>({
    resolver: zodResolver(treatmentPaymentSchema),
    defaultValues: {
      amount: treatmentPlan?.estimatedTotalCost ? String(treatmentPlan?.estimatedTotalCost) : '',
      currency: 'GBP',
      paymentType: 'treatment',
      notes: '',
    },
  });
  
  // Update form value when treatment plan data loads
  useEffect(() => {
    if (treatmentPlan?.id && treatmentPlan.estimatedTotalCost) {
      form.setValue('amount', String(treatmentPlan.estimatedTotalCost));
    }
  }, [treatmentPlan, form]);
  
  // Check for Stripe configuration
  useEffect(() => {
    async function checkStripeConfig() {
      try {
        const response = await fetch('/api/config/stripe');
        const data = await response.json();
        setIsStripeReady(data.isConfigured);
        
        if (!data.isConfigured) {
          toast({
            title: 'Payment system unavailable',
            description: 'The payment system is currently unavailable. Please try again later.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking Stripe configuration', error);
        setIsStripeReady(false);
      }
    }
    
    checkStripeConfig();
  }, [toast]);
  
  // Form submission
  const onSubmit = (values: TreatmentPaymentFormValues) => {
    if (!isStripeReady) {
      toast({
        title: 'Payment system unavailable',
        description: 'The payment system is currently unavailable. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    createPaymentIntentMutation.mutate({
      ...values,
      userId,
      bookingId,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Payment</CardTitle>
        <CardDescription>
          Please enter the payment details for your dental treatment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {userData ? (
              <div className="rounded-md bg-primary/5 p-4 mb-4">
                <h3 className="text-sm font-medium">Patient Information</h3>
                <div className="mt-2 text-sm">
                  <p>Name: {userData.firstName || ''} {userData.lastName || ''}</p>
                  <p>Email: {userData.email}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-muted/20 p-4 mb-4 animate-pulse">
                <h3 className="text-sm font-medium">Loading patient information...</h3>
              </div>
            )}
            
            {treatmentPlan ? (
              <div className="rounded-md bg-primary/5 p-4 mb-4">
                <h3 className="text-sm font-medium">Treatment Plan Information</h3>
                <div className="mt-2 text-sm">
                  <p>Estimated Total Cost: £{treatmentPlan.estimatedTotalCost}</p>
                  <p>Treatment Type: {treatmentPlan.treatmentType}</p>
                </div>
              </div>
            ) : treatmentPlanId ? (
              <div className="rounded-md bg-muted/20 p-4 mb-4 animate-pulse">
                <h3 className="text-sm font-medium">Loading treatment plan...</h3>
              </div>
            ) : null}
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (£)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you wish to pay for your treatment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="treatment">Full Treatment Payment</SelectItem>
                      <SelectItem value="deposit">Deposit Payment</SelectItem>
                      <SelectItem value="balance">Balance Payment</SelectItem>
                      <SelectItem value="other">Other Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of payment you are making.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information about this payment"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !isStripeReady} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-xs text-muted-foreground">
          {isStripeReady ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Secure payments processed by Stripe</span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span>Payment system unavailable</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}