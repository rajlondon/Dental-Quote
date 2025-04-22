import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface TreatmentPaymentFormProps {
  userId: number;
  bookingId?: number;
  treatmentPlanId?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  amount: z.number().positive({ message: "Please enter a valid amount" }),
  paymentType: z.string().min(1, { message: "Please select a payment type" }),
  description: z.string().optional(),
  agreeToPay: z.boolean().refine(val => val === true, {
    message: "You must agree to pay for the treatment"
  })
});

type FormValues = z.infer<typeof formSchema>;

export default function TreatmentPaymentForm({
  userId,
  bookingId,
  treatmentPlanId,
  onSuccess,
  onError
}: TreatmentPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Get user details
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/user/${userId}`],
  });
  
  // Get treatment plan details if provided
  const { data: treatmentPlan, isLoading: isLoadingTreatment } = useQuery({
    queryKey: [`/api/treatment-plans/${treatmentPlanId}`],
    enabled: !!treatmentPlanId,
  });
  
  // Get booking details if provided
  const { data: booking, isLoading: isLoadingBooking } = useQuery({
    queryKey: [`/api/booking/${bookingId}`],
    enabled: !!bookingId,
  });
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      amount: 0,
      paymentType: 'treatment',
      description: '',
      agreeToPay: false
    }
  });
  
  // Update form when user data is loaded
  useEffect(() => {
    if (userData) {
      form.setValue('email', userData.email || '');
    }
  }, [userData, form]);
  
  // Update form when treatment plan data is loaded
  useEffect(() => {
    if (treatmentPlan) {
      // If we have a treatment plan, set the amount to the estimated cost
      const amount = parseFloat(treatmentPlan.estimatedTotalCost) || 0;
      form.setValue('amount', amount);
      form.setValue('description', `Payment for treatment plan #${treatmentPlan.id}`);
    }
  }, [treatmentPlan, form]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create payment intent through our API
      const response = await apiRequest('POST', '/api/payments/create-treatment-payment-intent', {
        email: data.email,
        amount: data.amount,
        currency: 'gbp', // Default to GBP
        description: data.description,
        bookingId,
        treatmentPlanId,
        metadata: {
          paymentType: data.paymentType,
          userId: userId.toString()
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
      
      const paymentData = await response.json();
      
      // Call the success callback with payment data
      if (onSuccess) {
        onSuccess(paymentData);
      }
      
      // Show success message
      toast({
        title: 'Payment initiated',
        description: 'You will now be redirected to complete your payment',
      });
      
      // Invalidate any related queries
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/${bookingId}`] });
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      
      // Show error message
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      
      // Call error callback
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingUser || isLoadingTreatment || isLoadingBooking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment Payment</CardTitle>
          <CardDescription>Loading payment information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Payment</CardTitle>
        <CardDescription>
          Complete your payment for dental treatments
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
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
                        <SelectValue placeholder="Select a payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="treatment">Treatment Payment</SelectItem>
                      <SelectItem value="balance">Balance Payment</SelectItem>
                      <SelectItem value="other">Other Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (£)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Details about this payment" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agreeToPay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to pay the amount shown above
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Payments are securely processed by Stripe.
        </p>
      </CardFooter>
    </Card>
  );
}