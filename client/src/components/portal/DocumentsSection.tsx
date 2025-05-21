import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { uploadFileToS3, getUserDocuments, deleteDocument } from '@/services/s3Service';
import FileUploader from '@/components/FileUploader';
import MedicalDocumentViewer from '@/components/MedicalDocumentViewer';
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  File, 
  Image as ImageIcon, 
  FileX,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Calendar,
  Edit,
  Save,
  X,
  FilePlus2,
  FileUp,
  Shield,
  Cloud,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'x-ray' | 'treatment-plan' | 'medical' | 'contract' | 'other';
  format: 'pdf' | 'jpg' | 'png';
  size: string;
  uploadedBy: 'you' | 'clinic' | 'admin';
  uploadedAt: string;
  notes?: string;
  thumbnail?: string;
  locked?: boolean;
  editable?: boolean;
  url?: string; // S3 URL for the document
  fileKey?: string; // S3 file key
}

// Mock documents
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Panoramic X-ray",
    type: "x-ray",
    format: "jpg",
    size: "2.4 MB",
    uploadedBy: "clinic",
    uploadedAt: "2025-04-10T14:30:00Z",
    notes: "Panoramic X-ray taken before treatment planning"
  },
  {
    id: "2",
    name: "Treatment Plan v1",
    type: "treatment-plan",
    format: "pdf",
    size: "1.2 MB",
    uploadedBy: "clinic",
    uploadedAt: "2025-04-11T10:15:00Z",
    notes: "Initial treatment plan for dental implants and crowns"
  },
  {
    id: "3",
    name: "Medical History Form",
    type: "medical",
    format: "pdf",
    size: "450 KB",
    uploadedBy: "you",
    uploadedAt: "2025-04-08T09:20:00Z",
    notes: "Completed medical history form"
  },
  {
    id: "4",
    name: "Deposit Contract",
    type: "contract",
    format: "pdf",
    size: "320 KB",
    uploadedBy: "admin",
    uploadedAt: "2025-04-12T16:45:00Z",
    notes: "Deposit agreement for dental treatment",
    locked: true
  },
  {
    id: "5",
    name: "Allergies and Medications",
    type: "medical",
    format: "pdf",
    size: "215 KB",
    uploadedBy: "you",
    uploadedAt: "2025-04-09T11:30:00Z",
    notes: "List of allergies and current medications",
    editable: true
  }
];

// Allergies document content
const allergiesContent = `
# Allergies and Medications

## Patient: John Smith
## Date: April 9, 2025

### Allergies
- Penicillin (Severe reaction - anaphylaxis)
- Latex (Mild skin irritation)

### Current Medications
- Lisinopril 10mg (1 tablet daily for hypertension)
- Multivitamin (1 tablet daily)

### Known Medical Conditions
- Hypertension (controlled with medication)

### Notes for Dental Team
Please ensure local anesthetic does not contain epinephrine due to hypertension. 
Patient experiences mild anxiety during dental procedures.

Last updated: April 9, 2025
`;

// Contract deposit content
const depositContract = `
# MyDentalFly Deposit Agreement

## Patient: John Smith
## Date: April 12, 2025
## Treatment Plan ID: TP-2025-04-123

This agreement confirms that the patient agrees to pay a £200 deposit to secure their dental treatment as described in the approved treatment plan.

## Treatment Summary
- 2 × Dental Implant (Straumann): £1,100
- 4 × Porcelain Crown: £700
- 1 × Teeth Whitening (Professional): £120
- Total Treatment Cost: £1,920

## Deposit Terms
- The £200 deposit will be deducted from your final treatment cost
- 100% refundable if canceled 14+ days before your scheduled appointment
- 50% refundable if canceled 7-13 days before your scheduled appointment
- Non-refundable if canceled less than 7 days before your scheduled appointment

## Important Notes
- Current pricing is guaranteed for 14 days from the approval date (April 10, 2025)
- After this period, prices may change based on clinic availability and material costs
- Your deposit secures both your appointment slot and the current pricing
- All treatments come with guarantees as specified in your treatment plan

By paying this deposit, you confirm you have read and understood these terms.

Deposit Payment Date: April 12, 2025
Payment Method: Credit Card (•••• •••• •••• 4242)
Payment Status: Paid

MyDentalFly Ltd
Registration No: 12345678
VAT No: GB123456789
`;

const DocumentsSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch real documents from API/S3
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      try {
        const result = await getUserDocuments();
        if (result.success && result.documents) {
          // Transform API documents to our format
          const fetchedDocs = result.documents.map((doc: any) => ({
            id: String(doc.id) || doc.fileKey,
            name: doc.fileName || doc.filename || doc.originalName,
            type: doc.category || doc.fileCategory || doc.fileType || 'other' as 'x-ray' | 'treatment-plan' | 'medical' | 'contract' | 'other',
            format: (doc.fileName || doc.filename || doc.originalName || '').split('.').pop()?.toLowerCase() as 'pdf' | 'jpg' | 'png',
            size: doc.size || (doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '0 KB'),
            uploadedBy: 'you',
            uploadedAt: doc.uploadDate || doc.createdAt || new Date().toISOString(),
            notes: doc.notes || doc.description || '',
            url: doc.downloadUrl || doc.fileUrl,
            fileKey: doc.fileKey || doc.fileUrl,
            locked: doc.isProtected || doc.isLocked || false,
            treatmentPlanId: doc.treatmentPlanId,
            isSharedWithClinic: doc.isSharedWithClinic || doc.visibility === 'clinic' || false
          }));
          
          setDocuments(fetchedDocs);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Failed to Load Documents",
          description: "Could not retrieve your documents. Please try again later.",
          variant: "destructive"
        });
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user?.id, toast]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewerDialog, setShowViewerDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState('medical');
  const [documentNotes, setDocumentNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For editable document
  const [showEditDocumentDialog, setShowEditDocumentDialog] = useState(false);
  const [editableContent, setEditableContent] = useState(allergiesContent);
  const [isEditing, setIsEditing] = useState(false);
  
  // Function to filter documents by type and search query
  const filterDocuments = (tab: string) => {
    return documents.filter(doc => {
      const matchesTab = 
        tab === 'all' || 
        (tab === 'x-rays' && doc.type === 'x-ray') ||
        (tab === 'treatment-plans' && doc.type === 'treatment-plan') ||
        (tab === 'medical' && doc.type === 'medical') ||
        (tab === 'other' && !['x-ray', 'treatment-plan', 'medical'].includes(doc.type));
      
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesTab && matchesSearch;
    });
  };
  
  // State for upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // Function to handle file upload with our new FileUploader component
  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadedDocuments: Document[] = [];
    const totalFiles = files.length;
    let successCount = 0;
    
    try {
      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `file-${i}`;
        
        // Initialize progress for this file
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: 0
        }));
        
        // Update progress indication
        const updateProgress = (percent: number) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: percent
          }));
        };
        
        // Start at 10% to show something is happening
        updateProgress(10);
        
        try {
          // Upload the file to S3 through our secure service
          const uploadResult = await uploadFileToS3(
            file,
            documentType as 'x-ray' | 'treatment-plan' | 'medical' | 'contract' | 'other',
            documentNotes
          );
          
          updateProgress(90);
          
          if (uploadResult.success) {
            // Create document record from the upload result
            const newDocument: Document = {
              id: uploadResult.fileKey || String(Date.now()),
              name: file.name,
              type: documentType as 'x-ray' | 'treatment-plan' | 'medical' | 'contract' | 'other',
              format: file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'jpg' | 'png',
              size: `${(file.size / 1024).toFixed(0)} KB`,
              uploadedBy: 'you' as const,
              uploadedAt: new Date().toISOString(),
              notes: documentNotes || undefined,
              url: uploadResult.fileUrl,
              fileKey: uploadResult.fileKey,
              treatmentPlanId: null,
              isSharedWithClinic: false
            };
            
            uploadedDocuments.push(newDocument);
            successCount++;
            updateProgress(100);
          } else {
            console.error('Failed to upload file:', file.name, uploadResult.error);
            toast({
              title: "Upload Failed",
              description: `Failed to upload ${file.name}: ${uploadResult.error}`,
              variant: "destructive"
            });
            updateProgress(0);
          }
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          toast({
            title: "Upload Error",
            description: `Error uploading ${file.name}. Please try again.`,
            variant: "destructive"
          });
          updateProgress(0);
        }
      }
      
      // Add the successfully uploaded documents to the state
      if (uploadedDocuments.length > 0) {
        setDocuments(prev => [...prev, ...uploadedDocuments]);
        
        toast({
          title: "Documents Uploaded",
          description: `Successfully uploaded ${successCount} of ${totalFiles} document(s) to secure cloud storage.`,
        });
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      toast({
        title: "Upload Process Failed",
        description: "An unexpected error occurred during the upload process.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      setUploadFiles([]);
      setDocumentType('medical');
      setDocumentNotes('');
      setShowUploadDialog(false);
    }
  };
  
  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadFiles(files);
    }
  };
  
  // Function to handle document deletion
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      // Call the API to delete the document from cloud storage
      const result = await deleteDocument(selectedDocument.id);
      
      if (result.success) {
        // Remove the document from local state
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocument.id));
        setSelectedDocument(null);
        setShowDeleteConfirm(false);
        
        toast({
          title: "Document Deleted",
          description: `${selectedDocument.name} has been securely deleted from storage.`,
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete document. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Deletion Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  // Function to get document icon
  const getDocumentIcon = (doc: Document) => {
    if (doc.format === 'pdf') {
      return <FileText className="h-6 w-6 text-red-600" />;
    } else if (['jpg', 'png'].includes(doc.format)) {
      return <ImageIcon className="h-6 w-6 text-blue-600" />;
    } else {
      return <File className="h-6 w-6 text-gray-600" />;
    }
  };
  
  // Function to handle document viewing
  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewerDialog(true);
    
    // If this is an editable document, set the content
    if (doc.editable && doc.type === 'medical') {
      setEditableContent(allergiesContent);
    }
  };
  
  // Function to save editable document
  const handleSaveDocument = () => {
    // In a real app, this would save the content to the server
    setIsEditing(false);
    
    toast({
      title: "Document Saved",
      description: "Your changes have been saved successfully.",
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>{t('portal.documents.title', 'Documents')}</CardTitle>
            <Button 
              size="sm"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('portal.documents.upload', 'Upload Document')}
            </Button>
          </div>
          <CardDescription>
            {t('portal.documents.description', 'Upload and manage your dental records and treatment plans')}
          </CardDescription>
          
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder={t('portal.documents.search', 'Search documents by name or notes')}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-0">
          <Tabs defaultValue="all" className="h-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">{t('portal.documents.all', 'All')}</TabsTrigger>
                <TabsTrigger value="x-rays">{t('portal.documents.x_rays', 'X-Rays')}</TabsTrigger>
                <TabsTrigger value="treatment-plans">{t('portal.documents.treatment_plans', 'Treatment Plans')}</TabsTrigger>
                <TabsTrigger value="medical">{t('portal.documents.medical', 'Medical')}</TabsTrigger>
                <TabsTrigger value="other">{t('portal.documents.other_tab', 'Other')}</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-muted-foreground">{t('portal.documents.loading', 'Loading your secure documents...')}</p>
              </div>
            )}
            
            {['all', 'x-rays', 'treatment-plans', 'medical', 'other'].map(tab => (
              <TabsContent key={tab} value={tab} className="flex-grow mt-0">
                <ScrollArea className="h-[calc(65vh-10rem)]">
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filterDocuments(tab).map(document => (
                        <Card key={document.id} className="overflow-hidden border">
                          <CardContent className="p-0">
                            <div className="flex p-4">
                              <div className="mr-4 flex items-center justify-center h-12 w-12 rounded-md bg-gray-50 border">
                                {getDocumentIcon(document)}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <h3 className="font-medium truncate">{document.name}</h3>
                                <div className="flex text-xs text-gray-500 mt-1">
                                  <span className="uppercase">{document.format}</span>
                                  <span className="mx-2">•</span>
                                  <span>{document.size}</span>
                                </div>
                                {document.notes && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">{document.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
                              <div className="text-xs text-gray-500 flex items-center">
                                <span>{t('portal.documents.uploaded_by', 'Uploaded by')}: </span>
                                <Badge variant="outline" className="ml-1 text-xs border-gray-200 font-normal">
                                  {document.uploadedBy === 'you' ? 'You' : 
                                   document.uploadedBy === 'clinic' ? 'Clinic' : 'MyDentalFly'}
                                </Badge>
                                <span className="ml-2">{formatDate(document.uploadedAt)}</span>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleViewDocument(document)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {document.uploadedBy === 'you' && !document.locked && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7 text-red-500"
                                    onClick={() => {
                                      setSelectedDocument(document);
                                      setShowDeleteConfirm(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {filterDocuments(tab).length === 0 && (
                        <div className="col-span-2 py-12 text-center">
                          <FileX className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">No documents found</h3>
                          <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {searchQuery ? 
                              `No documents match your search criteria "${searchQuery}". Try a different search term.` : 
                              'There are no documents in this category yet. Upload a document to see it here.'}
                          </p>
                          {!searchQuery && (
                            <Button onClick={() => setShowUploadDialog(true)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 p-4">
          <div className="w-full text-sm text-gray-500">
            <p>{t('portal.documents.footer_info', 'Files uploaded here are securely shared with your dental team.')}</p>
          </div>
        </CardFooter>
      </Card>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-500" />
              {t('portal.documents.upload_title', 'Upload Medical Document')}
            </DialogTitle>
            <DialogDescription>
              {t('portal.documents.upload_description', 'Upload X-rays, scans, or other documents to your secure cloud storage.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4">
            {/* New FileUploader Component */}
            <FileUploader
              onUpload={handleUploadFiles}
              onCancel={() => {
                setShowUploadDialog(false);
                setUploadFiles([]);
                setDocumentNotes('');
              }}
              multiple={true}
              accept=".pdf,.jpg,.jpeg,.png,.dicom,application/pdf,image/jpeg,image/png,application/dicom"
              maxSize={10}
              showDocumentTypeSelector={true}
              showNotes={true}
              containerClassName="py-2"
            />
          </div>
          
          {/* Upload progress indicators */}
          {isUploading && (
            <div className="px-4 pb-4">
              <div className="text-sm font-medium mb-2">Uploading...</div>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span>File {parseInt(fileId.replace('file-', '')) + 1}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md mt-2">
                <div className="text-xs text-blue-700 flex items-start">
                  <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  Your documents are encrypted and stored securely using AWS S3.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Document Viewer Dialog */}
      <Dialog 
        open={showViewerDialog} 
        onOpenChange={(open) => {
          setShowViewerDialog(open);
          if (!open) {
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 sm:p-6">
          {selectedDocument && (
            <>
              {selectedDocument.url || selectedDocument.fileKey ? (
                <MedicalDocumentViewer 
                  document={{
                    id: selectedDocument.id,
                    fileName: selectedDocument.name,
                    fileType: selectedDocument.format,
                    fileSize: parseInt(selectedDocument.size.replace(/[^0-9.]/g, '')) || 0,
                    uploadDate: selectedDocument.uploadedAt,
                    url: selectedDocument.url,
                    downloadUrl: selectedDocument.url,
                    category: selectedDocument.type,
                    notes: selectedDocument.notes || null,
                    isSharedWithClinic: selectedDocument.uploadedBy === 'clinic',
                    treatmentPlanId: selectedDocument.type === 'treatment-plan' ? selectedDocument.id : null,
                    fileKey: selectedDocument.fileKey
                  }}
                  onClose={() => setShowViewerDialog(false)}
                  onDelete={() => {
                    if (!selectedDocument.locked && selectedDocument.uploadedBy === 'you') {
                      setShowViewerDialog(false);
                      setTimeout(() => setShowDeleteConfirm(true), 100);
                    } else {
                      toast({
                        title: "Cannot Delete",
                        description: "You don't have permission to delete this document.",
                        variant: "destructive"
                      });
                    }
                  }}
                  onDownload={() => {
                    if (selectedDocument.url) {
                      const link = document.createElement('a');
                      link.href = selectedDocument.url;
                      link.download = selectedDocument.name;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      toast({
                        title: "Download Unavailable",
                        description: "This document cannot be downloaded at this time.",
                        variant: "destructive",
                      });
                    }
                  }}
                  securityLevel={selectedDocument.locked ? 'high' : 'medium'}
                />
              ) : (
                <div className="w-full">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      {getDocumentIcon(selectedDocument)}
                      <span className="ml-2">{selectedDocument.name}</span>
                  {selectedDocument.locked && (
                    <Badge variant="outline" className="ml-2 bg-gray-100">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-gray-500" />
                      Official
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Uploaded {formatDate(selectedDocument.uploadedAt)} by {" "}
                  {selectedDocument.uploadedBy === 'you' ? 'You' : 
                   selectedDocument.uploadedBy === 'clinic' ? 'Clinic' : 'MyDentalFly Admin'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-2">
                {selectedDocument.editable ? (
                  <div className="relative">
                    <div className="absolute right-2 top-2 z-10">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditableContent(allergiesContent);
                              setIsEditing(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleSaveDocument}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <textarea 
                        className="w-full min-h-[60vh] p-6 border rounded-md font-mono text-sm"
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                      />
                    ) : (
                      <div className="border rounded-md p-6 min-h-[60vh] max-h-[60vh] overflow-y-auto bg-white">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{editableContent}</pre>
                      </div>
                    )}
                  </div>
                ) : selectedDocument.type === 'contract' ? (
                  <div className="border rounded-md p-6 min-h-[60vh] max-h-[60vh] overflow-y-auto bg-white">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{depositContract}</pre>
                  </div>
                ) : (
                  <div className="border rounded-md flex items-center justify-center min-h-[60vh] max-h-[60vh] bg-gray-50 text-center p-6">
                    <div>
                      {getDocumentIcon(selectedDocument)}
                      <p className="mt-2 text-gray-500">Document preview not available</p>
                      <Button 
                        className="mt-4"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {selectedDocument.uploadedBy === 'you' && !selectedDocument.locked && !selectedDocument.editable && (
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      setShowViewerDialog(false);
                      setTimeout(() => setShowDeleteConfirm(true), 100);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setShowViewerDialog(false)}
                >
                  Close
                </Button>
                
                {!selectedDocument.editable && (
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="p-4 border rounded-md bg-gray-50 flex items-center">
              {getDocumentIcon(selectedDocument)}
              <div className="ml-3">
                <p className="font-medium">{selectedDocument.name}</p>
                <p className="text-sm text-gray-500">
                  Uploaded on {formatDate(selectedDocument.uploadedAt)}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
            >
              Delete Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Editor Dialog - For creating new editable documents */}
      <Dialog open={showEditDocumentDialog} onOpenChange={setShowEditDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FilePlus2 className="h-5 w-5 mr-2 text-blue-500" />
              Create New Medical Document
            </DialogTitle>
            <DialogDescription>
              Enter your medical information to share with your dental team
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <div className="space-y-4">
              <div>
                <Label>Document Title</Label>
                <Input 
                  placeholder="e.g., 'Medical History', 'Allergies and Medications'"
                  value="Allergies and Medications"
                />
              </div>
              
              <div>
                <Label>Content</Label>
                <textarea 
                  className="w-full min-h-[50vh] p-4 border rounded-md font-mono text-sm"
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  placeholder="Enter medical information here..."
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEditDocumentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // In a real app, this would create a new document
                const newDocument: Document = {
                  id: Date.now().toString(),
                  name: "Allergies and Medications",
                  type: "medical",
                  format: "pdf",
                  size: "215 KB",
                  uploadedBy: "you",
                  uploadedAt: new Date().toISOString(),
                  notes: "List of allergies and current medications",
                  editable: true
                };
                
                setDocuments([newDocument, ...documents]);
                setShowEditDocumentDialog(false);
                
                toast({
                  title: "Document Created",
                  description: "Your medical document has been created successfully.",
                });
              }}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsSection;