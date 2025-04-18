import React, { useState } from 'react';
import { 
  FileIcon, 
  Image, 
  FileText, 
  Stethoscope, // Using Stethoscope instead of FileMedical
  Trash2, 
  Download, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

export interface File {
  id: number;
  filename: string;
  originalName?: string;
  mimetype?: string;
  fileType?: string;
  fileCategory?: string;
  fileUrl?: string;
  visibility?: 'private' | 'clinic' | 'admin' | 'public';
  description?: string;
  createdAt: string;
  userId: number;
  uploadedById?: number;
  fileSize?: number;
}

export interface FileViewerProps {
  files: File[];
  onDelete?: (fileId: number) => void;
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  error?: string;
  className?: string;
  canDelete?: boolean;
  canPreview?: boolean;
  onRefresh?: () => void;
}

export function FileViewer({
  files,
  onDelete,
  isLoading = false,
  title = 'Files',
  emptyMessage = 'No files uploaded yet',
  error,
  className,
  canDelete = false,
  canPreview = true,
  onRefresh
}: FileViewerProps) {
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDownload = async (fileId: number) => {
    setDownloadingFileId(fileId);
    
    try {
      const response = await apiRequest('GET', `/api/files/download/${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `file_${fileId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      } else {
        // Fallback to the original name if available
        const file = files.find(f => f.id === fileId);
        if (file && (file.originalName || file.filename)) {
          filename = file.originalName || file.filename;
        }
      }
      
      // Create a blob URL and trigger the download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Download Success',
        description: 'File downloaded successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the file',
        variant: 'destructive'
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!onDelete) return;
    
    setDeletingFileId(fileId);
    
    try {
      const response = await apiRequest('DELETE', `/api/files/${fileId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
      
      toast({
        title: 'File Deleted',
        description: 'File was deleted successfully',
        variant: 'default'
      });
      
      onDelete(fileId);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete the file',
        variant: 'destructive'
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  // Helper to get the appropriate icon based on file type
  const getFileIcon = (file: File) => {
    if (!file.mimetype) return <FileIcon className="h-6 w-6" />;
    
    if (file.mimetype.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (file.mimetype === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (file.mimetype === 'application/dicom' || file.fileCategory === 'xray') {
      return <Stethoscope className="h-6 w-6 text-green-500" />;
    }
    
    return <FileIcon className="h-6 w-6 text-gray-500" />;
  };

  // Helper to format the file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i === 0) return bytes + ' ' + sizes[i];
    
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  };

  // Helper to determine if a file can be previewed
  const canPreviewFile = (file: File): boolean => {
    if (!file.mimetype) return false;
    
    // Images can be previewed in the browser
    if (file.mimetype.startsWith('image/')) {
      return true;
    }
    
    // PDFs can often be previewed in browsers
    if (file.mimetype === 'application/pdf') {
      return true;
    }
    
    return false;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh} 
              disabled={isLoading}
            >
              {isLoading ? 
                <Loader2 className="h-4 w-4 animate-spin" /> : 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              <span className="ml-1 sr-only">Refresh</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-6">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again or contact support</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-10">
            <FileIcon className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {getFileIcon(file)}
                  <div className="overflow-hidden">
                    <p className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                      {file.originalName || file.filename}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      {file.visibility && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            {file.visibility === 'private' ? (
                              <EyeOff className="h-3 w-3 mr-1" />
                            ) : (
                              <Eye className="h-3 w-3 mr-1" />
                            )}
                            {file.visibility}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 ml-2 shrink-0">
                  {/* Preview button for compatible files */}
                  {canPreview && canPreviewFile(file) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <div className="pt-6">
                          {file.mimetype?.startsWith('image/') ? (
                            <img 
                              src={file.fileUrl?.startsWith('http') ? file.fileUrl : `/${file.fileUrl}`} 
                              alt={file.originalName || file.filename}
                              className="max-w-full max-h-[70vh] mx-auto"
                            />
                          ) : file.mimetype === 'application/pdf' ? (
                            <iframe 
                              src={file.fileUrl?.startsWith('http') ? file.fileUrl : `/${file.fileUrl}`} 
                              title={file.originalName || file.filename}
                              className="w-full h-[70vh]"
                            />
                          ) : (
                            <div className="text-center p-8">
                              <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                              <p>Preview not available for this file type</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Download button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(file.id)}
                    disabled={downloadingFileId === file.id}
                  >
                    {downloadingFileId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="sr-only">Download</span>
                  </Button>
                  
                  {/* Delete button */}
                  {canDelete && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingFileId === file.id}
                    >
                      {deletingFileId === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}