import { useState } from 'react';
import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Media types matching the backend enum
export enum MediaType {
  BEFORE_AFTER = 'before_after',
  CLINIC_TOUR = 'clinic_tour',
  TESTIMONIAL = 'testimonial'
}

// Media item interface
export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  type: string;
  displayOrder?: number;
  isActive: boolean;
  metadata?: {
    mimeType: string;
    size: number;
  };
}

// Hook for managing clinic media
export function useClinicMedia(clinicId: number, mediaType: MediaType) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all media of specific type for a clinic
  const mediaQuery: UseQueryResult<MediaItem[]> = useQuery({
    queryKey: ['/api/clinic-media', clinicId, mediaType],
    queryFn: async () => {
      const res = await apiRequest(
        'GET', 
        `/api/clinic-media/${clinicId}/media/${mediaType}`
      );
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch media');
      }
      
      return data.media || [];
    },
    enabled: !!clinicId && !!mediaType
  });

  // Upload new media
  const uploadMutation = useMutation({
    mutationFn: async ({ file, title, description }: { 
      file: File;
      title: string;
      description?: string;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      
      if (description) {
        formData.append('description', description);
      }
      
      // Create custom fetch with upload progress
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<MediaItem>((resolve, reject) => {
        xhr.open('POST', `/api/clinic-media/${clinicId}/media/${mediaType}`);
        
        // Setup authentication - use the credentials from current session
        xhr.withCredentials = true;
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              setUploadProgress(100);
              resolve(response.media);
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };
        
        xhr.onabort = () => {
          reject(new Error('Upload aborted'));
        };
        
        xhr.send(formData);
      });
      
      return uploadPromise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic-media', clinicId, mediaType] });
      toast({
        title: "Media uploaded successfully",
        variant: "default"
      });
      setUploadProgress(0); // Reset progress
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      setUploadProgress(0); // Reset progress
    }
  });

  // Delete media
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await apiRequest(
        'DELETE', 
        `/api/clinic-media/${clinicId}/media/${mediaType}/${mediaId}`
      );
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete media');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic-media', clinicId, mediaType] });
      toast({
        title: "Media deleted successfully",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update media
  const updateMutation = useMutation({
    mutationFn: async ({ 
      mediaId, 
      updates 
    }: { 
      mediaId: string;
      updates: Partial<MediaItem>;
    }) => {
      const res = await apiRequest(
        'PATCH', 
        `/api/clinic-media/${clinicId}/media/${mediaType}/${mediaId}`,
        updates
      );
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update media');
      }
      
      return data.media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic-media', clinicId, mediaType] });
      toast({
        title: "Media updated successfully",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    media: mediaQuery.data || [],
    isLoading: mediaQuery.isLoading,
    isError: mediaQuery.isError,
    error: mediaQuery.error,
    uploadMedia: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    deleteMedia: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateMedia: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch: mediaQuery.refetch
  };
}