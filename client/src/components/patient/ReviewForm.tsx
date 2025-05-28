import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { insertReviewSchema, type InsertReview } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import StarRating from '@/components/ui/StarRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ReviewFormProps {
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const { toast } = useToast();
  
  const form = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      title: '',
      content: '',
      isPublic: true,
      treatmentType: ''
    }
  });
  
  const reviewMutation = useMutation({
    mutationFn: async (data: InsertReview & { rating: number }) => {
      const response = await apiRequest('POST', '/api/patient/reviews', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience. You can now refer friends and earn rewards!",
      });
      form.reset();
      setRating(0);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Review",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: InsertReview) => {
    console.log('Form submitted with data:', data, 'rating:', rating);
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Submitting review with data:', { ...data, rating });
    reviewMutation.mutate({ ...data, rating });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold mb-2 text-blue-900">Share Your Experience</h2>
      <p className="text-gray-600 mb-6">
        Before referring others, please share your experience with us. Your feedback helps us improve and helps others make informed decisions.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FormLabel className="text-sm font-medium mb-3 block">Your Rating *</FormLabel>
            <StarRating 
              rating={rating} 
              onChange={setRating} 
              size="large"
            />
            {rating === 0 && (
              <p className="text-red-500 text-sm mt-1">Please select a rating</p>
            )}
          </div>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Summarize your experience"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="treatmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Dental Implants, Veneers, Teeth Whitening"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review *</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Tell us about your experience with our dental services, the quality of care, staff, facilities, and overall satisfaction..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-600">
                    I allow my review to be shared publicly (your name will not be displayed)
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Why Reviews Matter</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Help future patients make informed decisions</li>
              <li>• Allow us to continually improve our services</li>
              <li>• Unlock the referral program to earn £50 for each friend you refer</li>
              <li>• Contribute to the dental tourism community</li>
            </ul>
          </div>
          
          <Button
            type="button"
            className="w-full"
            disabled={reviewMutation.isPending}
            onClick={async () => {
              console.log('Button clicked!');
              
              if (rating === 0) {
                toast({
                  title: "Rating Required",
                  description: "Please select a star rating",
                  variant: "destructive",
                });
                return;
              }
              
              const formData = form.getValues();
              console.log('Direct API call with:', { ...formData, rating });
              
              try {
                const response = await fetch('/api/patient/reviews', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({ ...formData, rating }),
                });
                
                const result = await response.json();
                console.log('API Response:', result);
                
                if (response.ok) {
                  toast({
                    title: "Review Submitted Successfully!",
                    description: "You can now refer friends and earn £50 rewards.",
                  });
                  
                  // Reset form
                  form.reset();
                  setRating(0);
                  
                  if (onReviewSubmitted) {
                    onReviewSubmitted();
                  }
                } else {
                  throw new Error(result.message || 'Failed to submit review');
                }
              } catch (error) {
                console.error('Submission error:', error);
                toast({
                  title: "Failed to Submit Review",
                  description: error.message,
                  variant: "destructive",
                });
              }
            }}
          >
            {reviewMutation.isPending ? 'Submitting...' : 'Submit Review & Unlock Referrals'}
          </Button>
        </form>
      </Form>
    </div>
  );
}