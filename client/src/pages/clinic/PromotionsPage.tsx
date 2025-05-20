import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import PromotionsList from '@/components/clinic/PromotionsList';
import PromotionForm from '@/components/clinic/PromotionForm';

interface PromotionsPageProps {
  mode?: 'list' | 'create' | 'edit';
  id?: string;
  initialSection?: string;
  subView?: string;
}

export default function PromotionsPage({
  mode = 'list',
  id,
  initialSection = 'active',
  subView,
}: PromotionsPageProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentId, setCurrentId] = useState(id);
  const [activeTab, setActiveTab] = useState(initialSection);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [, navigate] = useLocation();

  // Update state when props change
  useEffect(() => {
    setCurrentMode(mode);
    setCurrentId(id);
  }, [mode, id]);

  // Handle creating a new promotion
  const handleCreate = () => {
    setCurrentMode('create');
    setCurrentId(undefined);
  };

  // Handle editing an existing promotion
  const handleEdit = (id: string) => {
    setCurrentMode('edit');
    setCurrentId(id);
  };

  // Handle going back to the list view
  const handleBack = () => {
    setCurrentMode('list');
    setCurrentId(undefined);
  };

  // Handle refreshing the promotions list
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle successful submission (creation or edit)
  const handleSubmitSuccess = () => {
    setCurrentMode('list');
    setCurrentId(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  // Render create/edit form
  if (currentMode === 'create' || currentMode === 'edit') {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {currentMode === 'create' ? 'Create New Promotion' : 'Edit Promotion'}
          </h1>
        </div>
        
        <Separator />
        
        <PromotionForm
          id={currentId}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleBack}
        />
      </div>
    );
  }

  // Render promotions list
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
        <p className="text-muted-foreground">
          Create and manage special promotions for your clinic
        </p>
      </div>
      
      <Separator />
      
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              <PromotionsList 
                status="ACTIVE" 
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit} 
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              <PromotionsList 
                status="PENDING_APPROVAL" 
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit} 
              />
            </TabsContent>
            
            <TabsContent value="draft" className="mt-4">
              <PromotionsList 
                status="DRAFT" 
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit} 
              />
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-4">
              <PromotionsList 
                status="REJECTED" 
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit} 
              />
            </TabsContent>
            
            <TabsContent value="expired" className="mt-4">
              <PromotionsList 
                status="EXPIRED" 
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit} 
              />
            </TabsContent>
            
            <TabsContent value="all" className="mt-4">
              <PromotionsList 
                status="ALL" 
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button 
            onClick={handleCreate}
            className="whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>
      </div>
    </div>
  );
}