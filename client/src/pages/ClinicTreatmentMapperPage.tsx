import React, { useState, useEffect } from 'react';
import { TreatmentMappingManager } from '@/components/admin/TreatmentMappingManager';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Server } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import treatmentMapperApi from '@/services/api/treatmentMapperApi';

/**
 * Page for clinic administrators to manage their treatment mappings
 */
const ClinicTreatmentMapperPage: React.FC = () => {
  // In a real implementation, we would get the clinic ID from authentication
  // For now, we'll use a placeholder
  const clinicId = 'clinic_001';
  
  // Fetch the treatment map from the API
  const { 
    data: treatmentMap,
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/treatment-mapper'],
    queryFn: async () => {
      try {
        return await treatmentMapperApi.getTreatmentMap();
      } catch (error) {
        console.error('Error fetching treatment map:', error);
        throw error;
      }
    }
  });
  
  if (isLoading) {
    return (
      <div className="container py-10 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load treatment map data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Clinic Treatment Mapper</h1>
        <p className="text-muted-foreground mt-2">
          Customize how your clinic's treatments appear to patients in the quote results.
        </p>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">How it works</h3>
            <p className="text-sm text-muted-foreground">
              Patients see standardized treatment names when building their quotes.
              Here, you can define how your clinic's specific treatment packages are presented to them.
              Add your custom labels, pricing, and included services to help patients understand your offerings.
            </p>
          </div>
        </div>
      </div>
      
      <TreatmentMappingManager clinicId={clinicId} />
    </div>
  );
};

export default ClinicTreatmentMapperPage;