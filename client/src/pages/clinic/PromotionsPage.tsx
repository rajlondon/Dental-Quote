import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import PromotionsList from '@/components/clinic/PromotionsList';
import PromotionForm from '@/components/clinic/PromotionForm';
import { useToast } from '@/hooks/use-toast';

interface PromotionsPageProps {
  mode?: 'list' | 'create' | 'edit';
  id?: string;
  initialSection?: string;
  subView?: string;
}

export default function PromotionsPage({
  mode = 'list',
  id,
  initialSection = 'all',
  subView
}: PromotionsPageProps) {
  const [activeTab, setActiveTab] = useState(initialSection);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Handle the different subviews
  useEffect(() => {
    if (subView === 'create') {
      setActiveTab('create');
    } else if (subView === 'edit' && id) {
      setActiveTab('edit');
    }
  }, [subView, id]);

  // Refresh promotions
  const handleRefresh = () => {
    setLoading(true);
    // Trigger refresh by incrementing the refreshTrigger state
    setRefreshTrigger(prev => prev + 1);
    
    // Simulate loading for a better UX
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Refreshed',
        description: 'Promotions list has been refreshed',
      });
    }, 1000);
  };

  // Navigate to create promotion form
  const handleCreate = () => {
    navigate('/clinic-portal/promotions/create');
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
        <p className="text-muted-foreground">
          Create and manage your special offers and treatment packages
        </p>
      </div>
      
      <Separator />
      
      {mode === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="all">All Promotions</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <PromotionsList 
              status="all" 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="draft" className="mt-0">
            <PromotionsList 
              status="DRAFT" 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            <PromotionsList 
              status="PENDING_APPROVAL" 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            <PromotionsList 
              status="APPROVED" 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <PromotionsList 
              status="ACTIVE" 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            <PromotionsList 
              status="REJECTED" 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
        </>
      )}
      
      {(mode === 'create' || subView === 'create') && (
        <PromotionForm />
      )}
      
      {(mode === 'edit' || (subView === 'edit' && id)) && (
        <PromotionForm id={id} />
      )}
    </div>
  );
}

// Export named components for specific views
PromotionsPage.Create = function Create() {
  return <PromotionsPage mode="create" />;
};

PromotionsPage.Edit = function Edit({ id }: { id: string }) {
  return <PromotionsPage mode="edit" id={id} />;
};