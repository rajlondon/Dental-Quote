/**
 * Clinic Treatment Plan Page
 * 
 * This page displays and manages treatment plans for clinic staff, allowing them to
 * view details, update status, and communicate with patients.
 */
import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Calendar, Loader2, MessageSquare, Plus, Search } from 'lucide-react';
import { ClinicTreatmentPlan } from '@/components/treatment/ClinicTreatmentPlan';
import { useUnifiedTreatmentPlans } from '@/hooks/use-unified-treatment-plans';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/use-navigation';
import { TreatmentPlan } from '@shared/models/treatment-plan';

export default function ClinicTreatmentPlanPage() {
  const [, params] = useRoute('/clinic-portal/treatment-plan/:id');
  const planId = params?.id;
  const { toast } = useToast();
  const { navigateTo } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Use the unified treatment plans hook for consistent data fetching
  const {
    plan,
    plans,
    planLoading,
    plansLoading,
    planError,
    fetchPlan,
    fetchClinicPlans,
    messagePatient,
    scheduleAppointment
  } = useUnifiedTreatmentPlans('clinic');
  
  // Fetch the data based on whether we're viewing a single plan or the list
  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    } else {
      fetchClinicPlans();
    }
  }, [planId, fetchPlan, fetchClinicPlans]);
  
  // Handle messaging a patient
  const handleMessagePatient = async (planId: string) => {
    try {
      await messagePatient(planId);
      toast({
        title: 'Success',
        description: 'Opening messaging interface for this patient.'
      });
      // If implementation of messaging happens in another UI, navigate there
      // navigateTo('/clinic-portal/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message Failed',
        description: 'Failed to open messaging interface. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle scheduling an appointment
  const handleScheduleAppointment = async (planId: string) => {
    try {
      await scheduleAppointment(planId);
      toast({
        title: 'Success',
        description: 'Opening appointment scheduler.'
      });
      navigateTo('/clinic/create-booking');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: 'Scheduling Failed',
        description: 'Failed to open appointment scheduler. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter plans based on search query and active tab
  const filteredPlans = plans
    ? plans.filter(plan => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          searchQuery === '' ||
          plan.title.toLowerCase().includes(searchLower) ||
          plan.patientName?.toLowerCase().includes(searchLower) ||
          plan.id.toLowerCase().includes(searchLower);
        
        // Tab filter
        const matchesTab = 
          activeTab === 'all' ||
          (activeTab === 'pending' && plan.status === 'PENDING') ||
          (activeTab === 'accepted' && plan.status === 'ACCEPTED') ||
          (activeTab === 'completed' && plan.status === 'COMPLETED') ||
          (activeTab === 'cancelled' && plan.status === 'CANCELLED');
        
        return matchesSearch && matchesTab;
      })
    : [];
  
  // ===== Single Plan View =====
  if (planId) {
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
    if (planError) {
      return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error Loading Treatment Plan</AlertTitle>
            <AlertDescription>
              {planError?.message || 'Failed to load treatment plan details.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6">
            <Button onClick={() => navigateTo('/clinic-portal/treatment-plans')}>
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
              <BreadcrumbLink href="/clinic-portal">Clinic Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/clinic-portal/treatment-plans">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{plan?.title || 'Treatment Plan'}</h1>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                onClick={() => handleMessagePatient(planId)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Message Patient
              </Button>
              
              <Button
                onClick={() => handleScheduleAppointment(planId)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule Appointment
              </Button>
            </div>
          </div>
          
          <ClinicTreatmentPlan
            planId={planId}
            showActions={true}
            showFullDetails={true}
            onMessagePatient={handleMessagePatient}
            onScheduleAppointment={handleScheduleAppointment}
          />
        </div>
      </div>
    );
  }
  
  // ===== Plans List View =====
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/clinic-portal">Clinic Portal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="font-medium cursor-default">
              Treatment Plans
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Treatment Plans</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track patient treatment plans
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => navigateTo('/clinic-treatment-mapper')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Treatment Mapper
          </Button>
          
          <Button
            onClick={() => navigateTo('/clinic-portal/treatment-plan/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Plan
          </Button>
        </div>
      </div>
      
      {/* Show loading state */}
      {plansLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Show error state */}
      {planError && !plansLoading && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading Treatment Plans</AlertTitle>
          <AlertDescription>
            {planError?.message || 'Failed to load treatment plans. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Plans list */}
      {!plansLoading && !planError && (
        <>
          {/* Search and filter */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-[350px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search treatment plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Plans grid */}
          {filteredPlans.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No treatment plans found.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan}
                  onViewPlan={() => navigateTo(`/clinic-portal/treatment-plan/${plan.id}`)}
                  onMessagePatient={() => handleMessagePatient(plan.id)}
                  onScheduleAppointment={() => handleScheduleAppointment(plan.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Status badge colors based on status
const getStatusColors = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'ACCEPTED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

// Component for an individual plan card
function PlanCard({ 
  plan, 
  onViewPlan,
  onMessagePatient,
  onScheduleAppointment
}: { 
  plan: TreatmentPlan;
  onViewPlan: () => void;
  onMessagePatient: () => void;
  onScheduleAppointment: () => void;
}) {
  const createdDate = new Date(plan.createdAt).toLocaleDateString();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{plan.title}</CardTitle>
          <Badge className={`${getStatusColors(plan.status)}`}>
            {plan.status}
          </Badge>
        </div>
        <CardDescription>
          {plan.patientName || 'Anonymous Patient'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{createdDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Price:</span>
            <span>£{plan.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Treatments:</span>
            <span>{plan.treatments?.length || 0}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          <Button 
            onClick={onViewPlan}
            className="w-full"
          >
            View Details
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={onMessagePatient}
              className="w-full text-xs"
            >
              Message
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onScheduleAppointment}
              className="w-full text-xs"
            >
              Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}