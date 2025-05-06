/**
 * Admin Treatment Plans Page
 * 
 * Provides admin oversight and management of all treatment plans
 * Uses the unified treatment plan components
 */
import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown, BarChart } from 'lucide-react';
import { AdminTreatmentPlan } from '@/components/treatment';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminTreatmentPlansPage() {
  const params = useParams<{id?: string}>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Get the plan ID from the URL params
  const planId = params?.id;
  
  // Function to handle going back to the list
  const handleBackToList = () => {
    setLocation('/admin-portal/treatment-plans');
  };
  
  // Function to export all treatment plan data
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const response = await apiRequest('GET', '/api/v1/treatment-plans/export', null, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and click it to download the CSV
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment-plans-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export successful',
        description: 'Treatment plans data has been exported successfully.',
      });
    } catch (error) {
      console.error('Error exporting treatment plans data:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export treatment plans data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Set the title based on whether we're viewing a specific plan or the list
  const pageTitle = planId ? 'Treatment Plan Details' : 'Treatment Plans Management';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
          <p className="text-muted-foreground">
            {planId
              ? 'View and manage the details of this treatment plan'
              : 'Oversee and manage all treatment plans across the platform'}
          </p>
        </div>
        
        {planId ? (
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Plans
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="flex items-center gap-2"
              disabled={isExporting}
            >
              <FileDown className="h-4 w-4" />
              Export Data
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setLocation('/admin-portal/treatment-plans/analytics')}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
        )}
      </div>
      
      {/* Display the treatment plan or plans list */}
      <AdminTreatmentPlan
        planId={planId}
        showActions={true}
        showFullDetails={true}
        onExportData={handleExportData}
      />
    </div>
  );
}