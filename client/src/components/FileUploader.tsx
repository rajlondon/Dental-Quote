import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  File, 
  FileText, 
  ImageIcon, 
  X, 
  AlertCircle,
  UploadCloud, 
  FileUp,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface FileUploaderProps {
  onUpload?: (files: File[]) => Promise<void>;
  onCancel?: () => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  showDocumentTypeSelector?: boolean;
  showNotes?: boolean;
  containerClassName?: string;
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Helper to get the appropriate icon for a file
const getFileIcon = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') {
    return <FileText className="h-8 w-8 text-red-500" />;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  } else {
    return <File className="h-8 w-8 text-gray-500" />;
  }
};

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onUpload,
  onCancel,
  multiple = false,
  accept = '*',
  maxSize = 10, // 10MB default
  showDocumentTypeSelector = true,
  showNotes = true,
  containerClassName = ''
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for selected files, notes, and document type
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [documentType, setDocumentType] = useState('medical');
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };
  
  // Common file validation and selection logic
  const handleFileSelection = (fileList: FileList) => {
    const files = Array.from(fileList);
    const newErrors: {[key: string]: string} = {};
    const validFiles: File[] = [];
    
    files.forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        newErrors[file.name] = t('uploader.error_file_too_large', 'File is too large (max {{maxSize}}MB)', { maxSize });
        return;
      }
      
      // Check file type if accept is specified
      if (accept !== '*') {
        const fileType = file.type;
        const acceptTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptTypes.some(type => {
          if (type.startsWith('.')) {
            // Check extension
            const extension = file.name.substring(file.name.lastIndexOf('.'));
            return extension.toLowerCase() === type.toLowerCase();
          } else if (type.includes('*')) {
            // Handle wildcards like image/*
            const mimePrefix = type.split('*')[0];
            return fileType.startsWith(mimePrefix);
          } else {
            // Exact match
            return fileType === type;
          }
        });
        
        if (!isAccepted) {
          newErrors[file.name] = t('uploader.error_file_type', 'File type not allowed');
          return;
        }
      }
      
      validFiles.push(file);
    });
    
    // Update selected files and any errors
    if (multiple) {
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1)); // Just take the first file if not multiple
    }
    
    setErrors(newErrors);
    
    // Show toast for errors
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: t('uploader.error_invalid_files', 'Some files could not be added'),
        description: Object.values(newErrors)[0],
        variant: 'destructive'
      });
    }
  };
  
  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  // Clear all selected files
  const clearFiles = () => {
    setSelectedFiles([]);
    setNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle upload button click
  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: t('uploader.error_no_files', 'No files selected'),
        description: t('uploader.error_select_files', 'Please select at least one file to upload.'),
        variant: 'destructive'
      });
      return;
    }
    
    if (onUpload) {
      try {
        await onUpload(selectedFiles);
        clearFiles(); // Clear files after successful upload
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: t('uploader.error_upload_failed', 'Upload failed'),
          description: error instanceof Error ? error.message : t('uploader.error_unknown', 'An unknown error occurred'),
          variant: 'destructive'
        });
      }
    }
  };
  
  return (
    <div className={`${containerClassName}`}>
      {/* File drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-1">
          {t('uploader.drop_files', 'Drop files here or click to upload')}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {multiple 
            ? t('uploader.select_multiple', 'You can upload multiple files') 
            : t('uploader.select_single', 'Select a single file to upload')}
        </p>
        <p className="text-xs text-gray-400">
          {t('uploader.max_size', 'Maximum file size: {{maxSize}}MB', { maxSize })}
        </p>
        
        {/* Security note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <Shield className="h-3.5 w-3.5" />
          <span>
            {t('uploader.secure_storage', 'Files are stored securely and encrypted')}
          </span>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      
      {/* File list */}
      {selectedFiles.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-medium mb-3">{t('uploader.selected_files', 'Selected files')}</h4>
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center p-3 border rounded-md bg-gray-50 group hover:bg-gray-100"
              >
                <div className="mr-3 flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  {errors[file.name] && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors[file.name]}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Document type and notes */}
      {selectedFiles.length > 0 && (
        <div className="mt-5 space-y-4">
          {showDocumentTypeSelector && (
            <div className="space-y-2">
              <Label htmlFor="document-type">{t('uploader.document_type', 'Document type')}</Label>
              <Select
                value={documentType}
                onValueChange={setDocumentType}
              >
                <SelectTrigger id="document-type">
                  <SelectValue placeholder={t('uploader.select_type', 'Select document type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">{t('uploader.type_medical', 'Medical Record')}</SelectItem>
                  <SelectItem value="x-ray">{t('uploader.type_xray', 'X-Ray / Scan')}</SelectItem>
                  <SelectItem value="treatment-plan">{t('uploader.type_treatment', 'Treatment Plan')}</SelectItem>
                  <SelectItem value="contract">{t('uploader.type_contract', 'Contract / Agreement')}</SelectItem>
                  <SelectItem value="other">{t('uploader.type_other', 'Other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {showNotes && (
            <div className="space-y-2">
              <Label htmlFor="document-notes">{t('uploader.notes', 'Notes')}</Label>
              <Textarea
                id="document-notes"
                placeholder={t('uploader.notes_placeholder', 'Add notes about this document...')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Action buttons */}
      {selectedFiles.length > 0 && (
        <div className="mt-5 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={() => {
              clearFiles();
              onCancel && onCancel();
            }}
          >
            {t('uploader.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleUploadClick}>
            <FileUp className="h-4 w-4 mr-2" />
            {t('uploader.upload', 'Upload')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;