import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import PendingApprovalsList from '@/components/admin/PendingApprovalsList';
import PromotionReview from '@/components/admin/PromotionReview';

interface PendingApprovalsPageProps {
  initialSection?: string;
  subView?: string;
}

export default function PendingApprovalsPage({
  initialSection = 'pending',
  subView,
}: PendingApprovalsPageProps) {
  const [activeTab, setActiveTab] = useState(initialSection);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Open the review dialog for a specific promotion
  const handleOpenReview = (promotionId: string) => {
    setSelectedPromotionId(promotionId);
    setReviewDialogOpen(true);
  };

  // Callback when a promotion has been approved or rejected
  const handleApproveReject = () => {
    setReviewDialogOpen(false);
    // Trigger a refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Promotion Management</h1>
        <p className="text-muted-foreground">
          Review and manage clinic-initiated promotions
        </p>
      </div>
      
      <Separator />
      
      <div className="flex justify-between items-center">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
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
        </div>
      </div>
      
      <TabsContent value="pending" className="mt-0">
        <PendingApprovalsList 
          status="PENDING_APPROVAL" 
          refreshTrigger={refreshTrigger}
          onOpenReview={handleOpenReview}
        />
      </TabsContent>
      
      <TabsContent value="approved" className="mt-0">
        <PendingApprovalsList 
          status="APPROVED" 
          refreshTrigger={refreshTrigger} 
          onOpenReview={handleOpenReview}
        />
      </TabsContent>
      
      <TabsContent value="rejected" className="mt-0">
        <PendingApprovalsList 
          status="REJECTED" 
          refreshTrigger={refreshTrigger}
          onOpenReview={handleOpenReview} 
        />
      </TabsContent>
      
      {/* Promotion Review Dialog */}
      {selectedPromotionId && (
        <PromotionReview
          promotionId={selectedPromotionId}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onApproveReject={handleApproveReject}
        />
      )}
    </div>
  );
}