/**
 * Admin Treatment Plans Page
 * 
 * This page displays and manages treatment plans across the platform, allowing administrators
 * to view, edit, and assign treatment plans to specific clinics.
 */
import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { 
  BarChart3, 
  Download, 
  FileDown, 
  Loader2, 
  Plus, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { AdminTreatmentPlan } from '@/components/treatment/AdminTreatmentPlan';
import { useUnifiedTreatmentPlans } from '@/hooks/use-unified-treatment-plans';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/use-navigation';
import { TreatmentPlan } from '@shared/models/treatment-plan';

export default function AdminTreatmentPlansPage() {
  const [, params] = useRoute('/admin-portal/treatment-plan/:id');
  const planId = params?.id;
  const { toast } = useToast();
  const { navigateTo } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  
  // Use the unified treatment plans hook for consistent data fetching
  const {
    plan,
    plans,
    planLoading,
    plansLoading,
    planError,
    fetchPlan,
    fetchAllPlans,
    exportData
  } = useUnifiedTreatmentPlans('admin');
  
  // Fetch the data based on whether we're viewing a single plan or the list
  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    } else {
      fetchAllPlans();
    }
  }, [planId, fetchPlan, fetchAllPlans]);
  
  // Handle exporting all data
  const handleExportData = async () => {
    try {
      await exportData();
      toast({
        title: 'Export Successful',
        description: 'Treatment plan data has been exported.'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export treatment plan data.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle viewing analytics
  const handleViewAnalytics = () => {
    setAnalyticsVisible(true);
  };
  
  // Filter plans based on search query and active tab
  const filteredPlans = plans
    ? plans.filter(plan => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          searchQuery === '' ||
          plan.title.toLowerCase().includes(searchLower) ||
          plan.id.toLowerCase().includes(searchLower) ||
          plan.clinicName?.toLowerCase().includes(searchLower) ||
          plan.patientName?.toLowerCase().includes(searchLower);
        
        // Tab filter
        const matchesTab = 
          activeTab === 'all' ||
          (activeTab === 'pending' && plan.status === 'PENDING') ||
          (activeTab === 'accepted' && plan.status === 'ACCEPTED') ||
          (activeTab === 'completed' && plan.status === 'COMPLETED') ||
          (activeTab === 'cancelled' && plan.status === 'CANCELLED') ||
          (activeTab === 'unassigned' && !plan.clinicId);
        
        return matchesSearch && matchesTab;
      })
    : [];
  
  // Calculate plan statistics
  const planStats = plans ? {
    total: plans.length,
    pending: plans.filter(p => p.status === 'PENDING').length,
    accepted: plans.filter(p => p.status === 'ACCEPTED').length,
    completed: plans.filter(p => p.status === 'COMPLETED').length,
    cancelled: plans.filter(p => p.status === 'CANCELLED').length,
    unassigned: plans.filter(p => !p.clinicId).length,
    totalValue: plans.reduce((sum, p) => sum + p.finalPrice, 0)
  } : {
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    unassigned: 0,
    totalValue: 0
  };
  
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
            <Button onClick={() => navigateTo('/admin-portal/treatment-plans')}>
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
              <BreadcrumbLink href="/admin-portal">Admin Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin-portal/treatment-plans">
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
            
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={() => navigateTo('/admin-portal/treatment-plan/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </div>
          </div>
          
          <AdminTreatmentPlan
            planId={planId}
            showActions={true}
            showFullDetails={true}
          />
        </div>
      </div>
    );
  }
  
  // ===== Analytics View =====
  if (analyticsVisible) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin-portal">Admin Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin-portal/treatment-plans">
                Treatment Plans
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="font-medium cursor-default">
                Analytics
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Treatment Plan Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive treatment plan metrics and insights
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={() => setAnalyticsVisible(false)}
              className="flex items-center gap-2"
            >
              Back to Plans
            </Button>
            
            <Button
              onClick={handleExportData}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
        
        {/* Analytics content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Plan Status Overview</CardTitle>
              <CardDescription>Distribution of treatment plans by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Plans</span>
                  <span className="font-medium">{planStats.total}</span>
                </div>
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                  {planStats.total > 0 && (
                    <>
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${(planStats.pending / planStats.total) * 100}%`, float: 'left' }} 
                      />
                      <div 
                        className="h-full bg-blue-400" 
                        style={{ width: `${(planStats.accepted / planStats.total) * 100}%`, float: 'left' }} 
                      />
                      <div 
                        className="h-full bg-green-400" 
                        style={{ width: `${(planStats.completed / planStats.total) * 100}%`, float: 'left' }} 
                      />
                      <div 
                        className="h-full bg-red-400" 
                        style={{ width: `${(planStats.cancelled / planStats.total) * 100}%`, float: 'left' }} 
                      />
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span>Pending: {planStats.pending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <span>Accepted: {planStats.accepted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span>Completed: {planStats.completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <span>Cancelled: {planStats.cancelled}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Clinic Assignment</CardTitle>
              <CardDescription>Plans assigned to clinics vs unassigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Plans</span>
                  <span className="font-medium">{planStats.total}</span>
                </div>
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                  {planStats.total > 0 && (
                    <>
                      <div 
                        className="h-full bg-green-400" 
                        style={{ width: `${((planStats.total - planStats.unassigned) / planStats.total) * 100}%`, float: 'left' }} 
                      />
                      <div 
                        className="h-full bg-red-400" 
                        style={{ width: `${(planStats.unassigned / planStats.total) * 100}%`, float: 'left' }} 
                      />
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span>Assigned: {planStats.total - planStats.unassigned}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <span>Unassigned: {planStats.unassigned}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Total value of treatment plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold">£{planStats.totalValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-2">Total Value</div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                    <span className="text-sm">Average per Plan</span>
                    <span className="font-medium">
                      £{planStats.total > 0 ? (planStats.totalValue / planStats.total).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                    <span className="text-sm">Completed Value</span>
                    <span className="font-medium">
                      £{plans ? plans.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.finalPrice, 0).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional analytics sections could go here */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plans by Time Period</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">
                Analytics visualization would go here
              </div>
            </CardContent>
          </Card>
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
            <BreadcrumbLink href="/admin-portal">Admin Portal</BreadcrumbLink>
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
            Manage and track all treatment plans across the platform
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleViewAnalytics}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            onClick={() => navigateTo('/admin-portal/treatment-plan/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
      
      {/* Stats overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{planStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-600">{planStats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">{planStats.accepted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{planStats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600">{planStats.cancelled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-gray-600">{planStats.unassigned}</div>
          </CardContent>
        </Card>
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
                <TabsList className="grid grid-cols-6 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="self-end ml-auto">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Order by</DropdownMenuLabel>
                  <DropdownMenuItem>Newest First</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Source</DropdownMenuLabel>
                  <DropdownMenuItem>Quote Requests</DropdownMenuItem>
                  <DropdownMenuItem>Special Offers</DropdownMenuItem>
                  <DropdownMenuItem>Treatment Packages</DropdownMenuItem>
                  <DropdownMenuItem>Custom</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  onViewPlan={() => navigateTo(`/admin-portal/treatment-plan/${plan.id}`)}
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
  onViewPlan
}: { 
  plan: TreatmentPlan;
  onViewPlan: () => void;
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
      
      <CardContent className="pb-0">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{createdDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Clinic:</span>
            <span>{plan.clinicName || 'Unassigned'}</span>
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
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          onClick={onViewPlan}
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}