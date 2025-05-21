import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Eye, 
  Lock,
  CheckCircle2,
  FileImage,
  FileBadge,
  Files,
  Share2,
  ImageIcon,
  FileX,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MedicalDocument {
  id: string | number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string | Date;
  url?: string;
  downloadUrl?: string | null;
  category: string;
  notes?: string | null;
  isSharedWithClinic?: boolean;
  treatmentPlanId?: string | number | null;
}

interface MedicalDocumentViewerProps {
  document: MedicalDocument;
  onClose?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  securityLevel?: 'high' | 'medium' | 'low';
}

// Helper function to format file size (KB, MB, etc.)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to format dates
const formatDate = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString);
  }
};

// Component to determine icon based on file type
const FileTypeIcon: React.FC<{ fileType: string }> = ({ fileType }) => {
  // Simplified file type check
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) {
    return <FileText className="h-6 w-6 text-red-500" />;
  } else if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
    return <ImageIcon className="h-6 w-6 text-blue-500" />;
  } else if (type.includes('x-ray') || type.includes('dicom')) {
    return <FileImage className="h-6 w-6 text-purple-500" />;
  } else if (type.includes('doc') || type.includes('word')) {
    return <FileText className="h-6 w-6 text-blue-700" />;
  } else if (type.includes('xls') || type.includes('excel') || type.includes('sheet')) {
    return <FileText className="h-6 w-6 text-green-700" />;
  } else {
    return <Files className="h-6 w-6 text-gray-500" />;
  }
};

// Medical document category badge
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const lowercaseCategory = category.toLowerCase();
  
  if (lowercaseCategory.includes('x-ray') || lowercaseCategory === 'xray') {
    return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">X-Ray</Badge>;
  } else if (lowercaseCategory.includes('treatment')) {
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Treatment Plan</Badge>;
  } else if (lowercaseCategory.includes('medical')) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Medical</Badge>;
  } else if (lowercaseCategory.includes('consent')) {
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Consent Form</Badge>;
  } else if (lowercaseCategory.includes('insurance')) {
    return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">Insurance</Badge>;
  } else if (lowercaseCategory.includes('prescription')) {
    return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-300">Prescription</Badge>;
  } else {
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">{category}</Badge>;
  }
};

const MedicalDocumentViewer: React.FC<MedicalDocumentViewerProps> = ({ 
  document, 
  onClose,
  onShare,
  onDelete,
  onDownload,
  securityLevel = 'medium'
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  
  // Function to handle document viewing
  const handleViewDocument = () => {
    if (!document.url && !document.downloadUrl) {
      setViewError(t('document_viewer.view_error', 'Document preview not available'));
      return;
    }
    
    setIsLoading(true);
    setViewError(null);
    
    // Simulate loading for demo
    setTimeout(() => {
      if (document.url || document.downloadUrl) {
        window.open(document.url || document.downloadUrl || '', '_blank');
        setIsLoading(false);
      } else {
        setViewError(t('document_viewer.url_error', 'Document URL is invalid'));
        setIsLoading(false);
      }
    }, 1000);
  };
  
  // Function to handle document download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    if (!document.url && !document.downloadUrl) {
      setViewError(t('document_viewer.download_error', 'Document download not available'));
      return;
    }
    
    setIsLoading(true);
    
    // Create a link element and trigger download
    const linkElement = window.document.createElement('a');
    linkElement.href = document.downloadUrl || document.url || '';
    linkElement.download = document.fileName;
    linkElement.target = '_blank';
    window.document.body.appendChild(linkElement);
    linkElement.click();
    window.document.body.removeChild(linkElement);
    
    setIsLoading(false);
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileTypeIcon fileType={document.fileType} />
            </div>
            <div>
              <CardTitle className="text-xl">{document.fileName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <CategoryBadge category={document.category} />
                <span className="text-sm">{formatFileSize(document.fileSize)}</span>
                {document.isSharedWithClinic && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600">
                    <Share2 className="h-3 w-3 mr-1" />
                    {t('document_viewer.shared_with_clinic', 'Shared')}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          
          {securityLevel === 'high' && (
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
              <Lock className="h-3 w-3 mr-1" />
              {t('document_viewer.encrypted', 'Encrypted')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Document details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">{t('document_viewer.uploaded', 'Uploaded')}:</span>
              <div className="font-medium">{formatDate(document.uploadDate)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">{t('document_viewer.file_type', 'File Type')}:</span>
              <div className="font-medium">{document.fileType}</div>
            </div>
            {document.treatmentPlanId && (
              <div className="col-span-2">
                <span className="text-muted-foreground">{t('document_viewer.related_treatment', 'Related Treatment')}:</span>
                <div className="font-medium">ID: {document.treatmentPlanId}</div>
              </div>
            )}
          </div>
          
          {/* Preview area */}
          <div className="mt-4 border rounded-md overflow-hidden">
            {/* For images we could show a preview, but for now we'll show a placeholder */}
            <div className="bg-slate-50 h-56 flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <Progress value={75} className="w-40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('document_viewer.loading', 'Loading document...')}</p>
                </div>
              ) : viewError ? (
                <div className="text-center text-red-500">
                  <FileX className="h-12 w-12 mx-auto mb-2 opacity-70" />
                  <p>{viewError}</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <FileTypeIcon fileType={document.fileType} />
                  <p className="mt-2 text-muted-foreground text-sm">
                    {t('document_viewer.preview_info', 'Click "View Document" to open this file in a new tab')}
                  </p>
                  
                  {document.notes && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-md text-left text-sm">
                      <div className="font-semibold mb-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1 text-amber-600" />
                        {t('document_viewer.notes', 'Notes')}:
                      </div>
                      <p className="text-gray-700">{document.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              {t('document_viewer.close', 'Close')}
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              {t('document_viewer.delete', 'Delete')}
            </Button>
          )}
          
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-1" />
              {t('document_viewer.share', 'Share')}
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            {t('document_viewer.download', 'Download')}
          </Button>
          
          <Button variant="default" size="sm" onClick={handleViewDocument}>
            <Eye className="h-4 w-4 mr-1" />
            {t('document_viewer.view', 'View Document')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MedicalDocumentViewer;