/**
 * Patient Treatment Plan Page
 * 
 * This page displays a specific treatment plan for a patient, including details,
 * status, and available actions.
 */
import React, { useEffect } from 'react';
import { useRoute } from 'wouter';
import { Loader2 } from 'lucide-react';
import { PatientTreatmentPlan } from '@/components/treatment/PatientTreatmentPlan';
import { useUnifiedTreatmentPlans } from '@/hooks/use-unified-treatment-plans';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/use-navigation';

export default function PatientTreatmentPlanPage() {
  const [, params] = useRoute('/portal/treatment-plan/:id');
  const planId = params?.id;
  const { toast } = useToast();
  const { navigateTo } = useNavigation();
  
  // Use the unified treatment plans hook for consistent data fetching
  const {
    plan,
    planLoading,
    planError,
    fetchPlan,
    bookAppointmentWithClinic
  } = useUnifiedTreatmentPlans('patient');
  
  // Fetch the treatment plan data when the component mounts or the ID changes
  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    }
  }, [planId, fetchPlan]);
  
  // Handle booking appointment with the clinic assigned to this plan
  const handleBookAppointment = async (plan) => {
    if (!plan.clinicId) {
      toast({
        title: 'No Clinic Assigned',
        description: 'This treatment plan has not been assigned to a clinic yet.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await bookAppointmentWithClinic(plan);
      toast({
        title: 'Appointment Request Sent',
        description: 'Your appointment request has been sent to the clinic.',
      });
      navigateTo('/portal/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to book an appointment. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Show loading state
  if (planLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading treatment plan...</p>
      </div>
    );
  }
  
  // Show error state
  if (planError || !planId) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading Treatment Plan</AlertTitle>
          <AlertDescription>
            {planError?.message || 'Treatment plan ID is missing or invalid.'}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigateTo('/portal/treatment-plans')}>
            Back to Treatment Plans
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/client-portal">Patient Portal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/client-portal?section=treatment-plans">
              Treatment Plans
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="font-medium cursor-default">
              {plan?.title || 'Treatment Plan Details'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Treatment plan display */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-6">{plan?.title || 'Treatment Plan'}</h1>
        
        <PatientTreatmentPlan
          planId={planId}
          showActions={true}
          showFullDetails={true}
          onBookAppointment={handleBookAppointment}
        />
      </div>
    </div>
  );
}