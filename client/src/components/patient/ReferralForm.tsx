import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { insertReferralSchema, type InsertReferral } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, Gift } from 'lucide-react';

export default function ReferralForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InsertReferral>({
    resolver: zodResolver(insertReferralSchema),
    defaultValues: {
      referredName: '',
      referredEmail: '',
      message: ''
    }
  });
  
  const referralMutation = useMutation({
    mutationFn: async (data: InsertReferral) => {
      const response = await apiRequest('POST', '/api/patient/referrals', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Referral Sent Successfully!",
        description: "Your friend will receive an email with information about our dental services.",
      });
      setShowSuccess(true);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Referral",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: InsertReferral) => {
    referralMutation.mutate(data);
  };
  
  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-green-800 mb-2">Referral Sent!</h3>
        <p className="text-green-700 mb-4">
          Your friend will receive an email with information about our dental services and your personal message.
        </p>
        <div className="bg-white border border-green-300 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
            <Gift className="w-5 h-5" />
            <span className="font-medium">Earn £50 Reward</span>
          </div>
          <p className="text-sm text-green-600">
            When your friend registers and books a treatment, you'll receive £50 that can be used toward your next visit!
          </p>
        </div>
        <Button
          onClick={() => setShowSuccess(false)}
          className="bg-green-600 hover:bg-green-700"
        >
          Refer Another Friend
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold mb-2 text-blue-900">Refer a Friend</h2>
      <p className="text-gray-600 mb-6">
        Know someone who might benefit from our dental services? Refer them and earn rewards when they book treatments!
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="referredName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Friend's Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your friend's full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="referredEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Friend's Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your friend's email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Add a personal message to your friend about why you recommend our dental services..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">How It Works</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your friend will receive an invitation email with your personal message</li>
              <li>• When they register using your referral link, you'll be notified</li>
              <li>• Once they book and complete a treatment, you'll receive a £50 reward</li>
              <li>• Your reward can be used toward your next treatment or follow-up care</li>
              <li>• Track all your referrals and rewards in your patient portal</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-green-800">£50 Reward Per Successful Referral</span>
            </div>
            <p className="text-sm text-gray-700">
              No limit on referrals! The more friends you refer, the more you can save on future treatments.
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={referralMutation.isPending}
          >
            {referralMutation.isPending ? 'Sending Referral...' : 'Send Referral Invitation'}
          </Button>
        </form>
      </Form>
    </div>
  );
}