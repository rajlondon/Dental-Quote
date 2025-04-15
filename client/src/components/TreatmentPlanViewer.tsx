import React, { useEffect, useState } from 'react';
import { FileUploader } from './FileUploader';
import { FileViewer, type File } from './FileViewer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, FilePlus, CalendarDays, ListChecks, Banknote } from 'lucide-react';

export interface TreatmentPlan {
  id: number;
  patientId: number;
  clinicId: number;
  createdById?: number;
  status: 'draft' | 'finalized' | 'in_treatment' | 'completed';
  treatmentDetails: any;
  estimatedTotalCost?: number;
  currency?: string;
  notes?: string;
  portalStatus?: string;
  quoteRequestId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentPlanViewerProps {
  treatmentPlanId: number;
  readOnly?: boolean;
  canUploadFiles?: boolean;
  patientView?: boolean;
  onTreatmentPlanUpdated?: (treatmentPlan: TreatmentPlan) => void;
  onFileUploaded?: (file: File) => void;
  className?: string;
}

export function TreatmentPlanViewer({
  treatmentPlanId,
  readOnly = false,
  canUploadFiles = true,
  patientView = false,
  onTreatmentPlanUpdated,
  onFileUploaded,
  className
}: TreatmentPlanViewerProps) {
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const { toast } = useToast();

  // Query to fetch the treatment plan
  const {
    data: treatmentPlan,
    isLoading: isLoadingPlan,
    error: planError,
    refetch: refetchPlan
  } = useQuery({
    queryKey: ['/api/treatment-plans', treatmentPlanId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/treatment-plans/${treatmentPlanId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch treatment plan');
      }
      return response.json();
    },
    enabled: !!treatmentPlanId
  });

  // Query to fetch files associated with the treatment plan with enhanced error handling
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles
  } = useQuery({
    queryKey: ['/api/files/treatmentPlan', treatmentPlanId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/files/treatmentPlan/${treatmentPlanId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch treatment plan files');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching treatment plan files:', error);
        throw error;
      }
    },
    enabled: !!treatmentPlanId,
    retry: 1, // Only retry once to avoid infinite loops on permission issues
    staleTime: 30000 // Cache results for 30 seconds
  });

  // Mutation to delete a file
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await apiRequest('DELETE', `/api/files/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      return fileId;
    },
    onSuccess: () => {
      // Refetch files after successful deletion
      refetchFiles();
    }
  });

  const handleFileUpload = (fileData: any) => {
    setUploadInProgress(false);
    
    toast({
      title: 'File Uploaded',
      description: 'The file has been successfully uploaded to treatment plan',
    });
    
    // Refetch files to get the updated list
    refetchFiles();
    
    // Also refetch the treatment plan to update any related data
    refetchPlan();
    
    if (onFileUploaded) {
      onFileUploaded(fileData);
    }
  };

  const handleFileUploadError = (error: string) => {
    setUploadInProgress(false);
    
    toast({
      title: 'Upload Failed',
      description: error,
      variant: 'destructive'
    });
  };

  const handleDeleteFile = (fileId: number) => {
    // Ask for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      toast({
        title: 'Deleting File',
        description: 'Please wait while we delete the file...'
      });
      
      deleteFileMutation.mutate(fileId, {
        onSuccess: () => {
          toast({
            title: 'File Deleted',
            description: 'The file has been successfully removed from the treatment plan',
          });
        },
        onError: (error) => {
          toast({
            title: 'Delete Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: 'destructive'
          });
        }
      });
    }
  };

  // Format currency amounts
  const formatCurrency = (amount?: number, currency = 'GBP') => {
    if (amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'finalized': return 'bg-blue-100 text-blue-800';
      case 'in_treatment': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {isLoadingPlan ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading Treatment Plan...</span>
              </div>
            ) : planError ? (
              <span className="text-destructive">Error: Treatment plan not found</span>
            ) : (
              <div className="flex justify-between items-center">
                <span>Treatment Plan #{treatmentPlanId}</span>
                <Badge 
                  className={getStatusColor(treatmentPlan?.status || 'draft')}
                  variant="outline"
                >
                  {treatmentPlan?.status === 'in_treatment' ? 'In Treatment' : 
                   treatmentPlan?.status.charAt(0).toUpperCase() + treatmentPlan?.status.slice(1)}
                </Badge>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {isLoadingPlan ? 'Loading details...' : (
              <>
                Created on {new Date(treatmentPlan?.createdAt).toLocaleDateString()}
                {treatmentPlan?.updatedAt && (
                  <> • Last updated on {new Date(treatmentPlan?.updatedAt).toLocaleDateString()}</>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPlan ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : planError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Failed to load treatment plan</p>
              <Button 
                variant="outline" 
                onClick={() => refetchPlan()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Treatment Details */}
              <div>
                <h3 className="text-lg font-medium flex items-center mb-3">
                  <ListChecks className="h-5 w-5 mr-2 text-primary" />
                  Treatment Details
                </h3>
                
                {treatmentPlan?.treatmentDetails && typeof treatmentPlan.treatmentDetails === 'object' ? (
                  <div className="rounded-md border p-4 bg-muted/50">
                    {Array.isArray(treatmentPlan.treatmentDetails) ? (
                      <ul className="space-y-2">
                        {treatmentPlan.treatmentDetails.map((treatment: any, index: number) => (
                          <li key={index} className="flex justify-between">
                            <span>{treatment.name || treatment.treatment || treatment.description}</span>
                            {treatment.cost && (
                              <span className="font-medium">
                                {formatCurrency(treatment.cost, treatmentPlan.currency)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(treatmentPlan.treatmentDetails, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No treatment details available</p>
                )}
              </div>
              
              {/* Estimated Cost */}
              {treatmentPlan?.estimatedTotalCost && (
                <div>
                  <h3 className="text-lg font-medium flex items-center mb-1">
                    <Banknote className="h-5 w-5 mr-2 text-primary" />
                    Estimated Total Cost
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(treatmentPlan.estimatedTotalCost, treatmentPlan.currency)}
                  </p>
                </div>
              )}
              
              {/* Notes */}
              {treatmentPlan?.notes && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="whitespace-pre-line">{treatmentPlan.notes}</p>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Treatment Files */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <FilePlus className="h-5 w-5 mr-2 text-primary" />
                  Treatment Files
                </h3>
                
                <FileViewer
                  files={files}
                  isLoading={isLoadingFiles}
                  error={filesError?.message}
                  onDelete={!readOnly ? handleDeleteFile : undefined}
                  onRefresh={refetchFiles}
                  canDelete={!readOnly}
                  emptyMessage="No files have been uploaded for this treatment plan"
                />
              </div>
              
              {/* File Upload Area (if not in read-only mode) */}
              {canUploadFiles && !readOnly && (
                <div className="pt-4">
                  <FileUploader
                    onUploadComplete={handleFileUpload}
                    onUploadError={handleFileUploadError}
                    fileCategory="medical"
                    treatmentPlanId={treatmentPlanId}
                    label="Add Files to Treatment Plan"
                    helperText="Upload X-rays, medical records, or other relevant documents"
                    allowedFileTypes={[
                      'image/jpeg', 
                      'image/png', 
                      'application/pdf', 
                      'application/dicom',
                      'image/dicom'
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
        {(!readOnly || patientView) && (
          <CardFooter className="flex justify-between border-t pt-6">
            {patientView && (
              <Button variant="outline">
                <CalendarDays className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
            )}
            {!readOnly && (
              <Button variant="default" className="ml-auto">
                Update Treatment Plan
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}