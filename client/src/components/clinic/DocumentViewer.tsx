import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image, 
  FileQuestion, 
  Download, 
  Share,
  User,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Archive,
  Edit
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Document {
  id: string;
  name: string;
  type: string;
  category: 'patient_record' | 'x_ray' | 'treatment_plan' | 'consent_form' | 'lab_report' | 'other';
  size: number;
  uploaded: string;
  uploadedBy: string;
  patientId?: string;
  patientName?: string;
  shared: boolean;
  thumbnail?: string;
  url?: string; // URL from cloud storage (AWS S3, etc.)
  description?: string;
  key?: string; // Cloud storage key
}

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onDownload: (document: Document) => void;
  onEdit: (document: Document) => void;
  onShare: (document: Document) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  open, 
  onOpenChange, 
  document, 
  onDownload,
  onEdit,
  onShare
}) => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Get document category info
  const getCategoryInfo = (category: Document['category']) => {
    switch (category) {
      case 'patient_record':
        return { 
          label: t("clinic.documents.categories.patient_record", "Patient Record"),
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'x_ray':
        return { 
          label: t("clinic.documents.categories.x_ray", "X-Ray / Scan"),
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'treatment_plan':
        return { 
          label: t("clinic.documents.categories.treatment_plan", "Treatment Plan"),
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'consent_form':
        return { 
          label: t("clinic.documents.categories.consent_form", "Consent Form"),
          color: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'lab_report':
        return { 
          label: t("clinic.documents.categories.lab_report", "Lab Report"),
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'other':
      default:
        return { 
          label: t("clinic.documents.categories.other", "Other"),
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Handle page navigation
  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };
  
  const prevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };
  
  // Handle zoom
  const zoomIn = () => {
    setZoom(prev => Math.min(200, prev + 10));
  };
  
  const zoomOut = () => {
    setZoom(prev => Math.max(50, prev - 10));
  };
  
  // Handle rotation
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  // Reset view controls when document changes
  React.useEffect(() => {
    setCurrentPage(1);
    setZoom(100);
    setRotation(0);
  }, [document]);
  
  if (!document) return null;
  
  // Get document icon based on file type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-700" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center">
              {getDocumentIcon(document.type)}
              <span className="ml-2 mr-3">{document.name}</span>
              
              {/* Category badge */}
              {document.category && (
                <Badge className={getCategoryInfo(document.category).color}>
                  {getCategoryInfo(document.category).label}
                </Badge>
              )}
            </DialogTitle>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(document)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t("clinic.documents.edit", "Edit")}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onShare(document)}
              >
                <Share className="h-4 w-4 mr-2" />
                {t("clinic.documents.share", "Share")}
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onDownload(document)}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("clinic.documents.download", "Download")}
              </Button>
            </div>
          </div>
          
          <DialogDescription className="flex items-center pt-1">
            {document.patientName && (
              <div className="flex items-center mr-4">
                <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                <span>{document.patientName}</span>
              </div>
            )}
            
            {document.description && (
              <p className="text-muted-foreground">{document.description}</p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {/* Document Viewer Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls Bar */}
          {(document.type === 'pdf' || document.type === 'jpg' || document.type === 'png' || document.type === 'jpeg') && (
            <div className="bg-gray-100 p-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={zoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{zoom}%</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={zoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={rotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Only show page navigation for PDFs */}
              {document.type === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {t("clinic.documents.page_number", "Page {{current}} of {{total}}", {
                      current: currentPage,
                      total: 3 // In a real app, this would be from document metadata
                    })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={nextPage}
                    disabled={currentPage >= 3} // In a real app, this would be from document metadata
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Document Content */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-auto p-4">
            {document.type === 'jpg' || document.type === 'png' || document.type === 'jpeg' ? (
              // Image Preview
              document.url || document.thumbnail ? (
                <div className="flex items-center justify-center w-full h-full">
                  {/* Container for image with transform */}
                  <div 
                    className="relative" 
                    style={{
                      transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                      transformOrigin: 'center center'
                    }}
                  >
                    <img 
                      src={document.url || document.thumbnail} 
                      alt={document.name}
                      className="max-w-full max-h-[60vh] object-contain shadow-lg"
                    />
                  </div>
                </div>
              ) : (
                // Fallback for when no image URL is available
                <div className="text-center p-6">
                  <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                    <Image className="h-16 w-16 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("clinic.documents.image_preview", "Image Preview")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("clinic.documents.image_preview_not_available", "Image preview is not available. The file might be processing or unavailable.")}
                  </p>
                </div>
              )
            ) : document.type === 'pdf' ? (
              // PDF Preview
              <div 
                className="bg-white shadow-lg rounded max-w-2xl w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
              >
                {/* In a real app, you would use a PDF viewer library like react-pdf */}
                <div className="text-center p-8">
                  <div className="p-4 bg-red-50 rounded-full inline-block mb-4">
                    <FileText className="h-16 w-16 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("clinic.documents.pdf_preview", "PDF Preview")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("clinic.documents.pdf_preview_page", "Viewing page {{page}}", {
                      page: currentPage
                    })}
                  </p>
                </div>
              </div>
            ) : (
              // Other File Types
              <div className="text-center p-6">
                <div className="mx-auto mb-4">
                  {document.type.startsWith('doc') ? (
                    <div className="p-4 bg-blue-50 rounded-full inline-block">
                      <FileText className="h-16 w-16 text-blue-700" />
                    </div>
                  ) : document.type === 'zip' || document.type === 'rar' ? (
                    <div className="p-4 bg-yellow-50 rounded-full inline-block">
                      <Archive className="h-16 w-16 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-full inline-block">
                      <FileQuestion className="h-16 w-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {t("clinic.documents.preview_not_available", "Preview not available")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("clinic.documents.preview_description", "This document type cannot be previewed directly. Please download the file to view its contents.")}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Document Details Footer */}
        <div className="pt-3 mt-auto border-t">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">{t("clinic.documents.type", "Type")}:</span>
              <span className="font-medium uppercase">{document.type}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">{t("clinic.documents.size", "Size")}:</span>
              <span>{formatFileSize(document.size)}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">{t("clinic.documents.uploaded", "Uploaded")}:</span>
              <span>
                {new Date(document.uploaded).toLocaleDateString(
                  i18n.language === 'tr' ? 'tr-TR' : 'en-GB'
                )}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">{t("clinic.documents.uploaded_by", "By")}:</span>
              <span>{document.uploadedBy}</span>
            </div>
            
            <div className="flex items-center ml-auto">
              <span className="text-muted-foreground mr-2">{t("clinic.documents.sharing_status", "Sharing")}:</span>
              {document.shared ? (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  {t("clinic.documents.shared_with_patient", "Shared with Patient")}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
                  {t("clinic.documents.private", "Private")}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;