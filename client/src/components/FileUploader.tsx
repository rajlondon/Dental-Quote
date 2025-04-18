import React, { useState, useRef } from 'react';
import { Upload, X, FileIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

export interface FileUploaderProps {
  onUploadComplete?: (fileData: any) => void;
  onUploadError?: (error: string) => void;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  fileCategory?: 'xray' | 'document' | 'medical' | 'image';
  visibility?: 'private' | 'clinic' | 'admin' | 'public';
  description?: string;
  bookingId?: number;
  quoteRequestId?: number;
  treatmentPlanId?: number;
  label?: string;
  helperText?: string;
  multiple?: boolean;
  className?: string;
}

const ALLOWED_FILE_TYPES_MAP = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  xray: ['image/jpeg', 'image/png', 'image/dicom', 'application/dicom'],
  medical: [
    'image/jpeg', 
    'image/png', 
    'application/pdf', 
    'application/dicom', 
    'image/dicom'
  ]
};

export function FileUploader({
  onUploadComplete,
  onUploadError,
  allowedFileTypes,
  maxSizeMB = 15, // 15MB default limit
  fileCategory = 'document',
  visibility = 'private',
  description = '',
  bookingId,
  quoteRequestId,
  treatmentPlanId,
  label = 'Upload File',
  helperText = 'Drag and drop a file here or click to browse',
  multiple = false,
  className
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Determine which file types to allow
  const effectiveAllowedTypes = allowedFileTypes || ALLOWED_FILE_TYPES_MAP[fileCategory] || [];

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  // Process and upload files
  const uploadFiles = async (files: FileList) => {
    // Reset any previous errors
    setError(null);

    // Convert FileList to array for easier processing
    const filesArray = Array.from(files);
    
    // Validate file types and sizes
    const invalidFiles = filesArray.filter(file => 
      !effectiveAllowedTypes.includes(file.type) || (file.size > maxSizeMB * 1024 * 1024)
    );

    if (invalidFiles.length > 0) {
      const errorMessage = `${invalidFiles.length} file(s) were rejected due to invalid type or size over ${maxSizeMB}MB`;
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      
      toast({
        title: 'Invalid Files',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Filter out invalid files
      const validFiles = filesArray.filter(file => 
        effectiveAllowedTypes.includes(file.type) && (file.size <= maxSizeMB * 1024 * 1024)
      );
      
      if (validFiles.length === 0) return;
    }

    // Start uploading valid files
    setIsUploading(true);
    setProgress(0);
    
    try {
      const uploadPromises = filesArray.map(async (file) => {
        // Skip invalid files
        if (!effectiveAllowedTypes.includes(file.type) || (file.size > maxSizeMB * 1024 * 1024)) {
          return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileCategory);
        formData.append('fileCategory', fileCategory);
        formData.append('visibility', visibility);
        
        if (description) formData.append('description', description);
        if (bookingId) formData.append('bookingId', bookingId.toString());
        if (quoteRequestId) formData.append('quoteRequestId', quoteRequestId.toString());
        if (treatmentPlanId) formData.append('treatmentPlanId', treatmentPlanId.toString());

        try {
          // Modified to match apiRequest signature - custom config without the upload progress tracking
          // Will rely on the standard progress instead
          const response = await apiRequest('POST', '/api/files/upload', formData);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          return await response.json();
        } catch (error) {
          console.error('File upload error:', error);
          throw error;
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Filter out nulls (failed uploads)
      const successfulUploads = results.filter(Boolean);
      
      if (successfulUploads.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulUploads]);
        
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${successfulUploads.length} file(s)`,
          variant: 'default'
        });
        
        if (onUploadComplete) {
          onUploadComplete(multiple ? successfulUploads : successfulUploads[0]);
        }
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'An error occurred during upload';
      
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
          "flex flex-col items-center justify-center gap-2"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={effectiveAllowedTypes.join(',')}
          multiple={multiple}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-sm text-muted-foreground">Uploading... {progress}%</div>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm">{helperText}</p>
              <p className="text-xs text-muted-foreground">
                Accepted formats: {effectiveAllowedTypes.map(type => type.split('/')[1]).join(', ')}
              </p>
              <p className="text-xs text-muted-foreground">Max size: {maxSizeMB}MB</p>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Uploaded Files:</div>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate max-w-[200px]">
                    {file.originalName || file.filename}
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}