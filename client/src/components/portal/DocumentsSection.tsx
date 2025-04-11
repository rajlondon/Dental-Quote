import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Image, 
  File, 
  FilePlus, 
  Info,
  SearchIcon,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@/types/clientPortal';

// Mock data for development
const mockDocuments: Document[] = [
  {
    id: 1,
    bookingId: 123,
    uploaderId: 2,
    uploaderType: 'patient',
    documentType: 'x_ray',
    fileName: 'front_teeth_xray.jpg',
    fileType: 'image/jpeg',
    fileSize: 1250000,
    url: '#',
    notes: 'Recent X-ray of front teeth',
    createdAt: '2025-04-08T14:30:45Z'
  },
  {
    id: 2,
    bookingId: 123,
    uploaderId: 2,
    uploaderType: 'patient',
    documentType: 'medical_history',
    fileName: 'medical_history_form.pdf',
    fileType: 'application/pdf',
    fileSize: 420000,
    url: '#',
    notes: 'Completed medical history form',
    createdAt: '2025-04-08T15:12:30Z'
  },
  {
    id: 3,
    bookingId: 123,
    uploaderId: 1,
    uploaderType: 'clinic',
    documentType: 'treatment_plan',
    fileName: 'proposed_treatment_plan.pdf',
    fileType: 'application/pdf',
    fileSize: 780000,
    url: '#',
    notes: 'Proposed treatment plan based on your X-rays and requirements',
    createdAt: '2025-04-09T10:45:22Z'
  },
  {
    id: 4,
    bookingId: 123,
    uploaderId: 3,
    uploaderType: 'admin',
    documentType: 'other',
    fileName: 'travel_information.pdf',
    fileType: 'application/pdf',
    fileSize: 550000,
    url: '#',
    notes: 'Information about travel to Istanbul and clinic location',
    createdAt: '2025-04-09T12:20:15Z'
  }
];

interface DocumentsSectionProps {
  bookingId?: number;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ bookingId = 123 }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleUpload = () => {
    if (selectedFiles.length === 0 || !documentType) {
      toast({
        title: t('portal.documents.missing_info', 'Missing Information'),
        description: t('portal.documents.missing_info_desc', 'Please select files and document type before uploading.'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newDocuments = selectedFiles.map((file, index) => ({
        id: Math.floor(Math.random() * 1000) + 10,
        bookingId,
        uploaderId: 2, // Current user
        uploaderType: 'patient' as const,
        documentType: documentType as any,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: '#',
        notes: notes,
        createdAt: new Date().toISOString(),
      }));
      
      setDocuments([...documents, ...newDocuments]);
      setIsUploading(false);
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setDocumentType('');
      setNotes('');
      
      toast({
        title: t('portal.documents.upload_success', 'Upload Successful'),
        description: t('portal.documents.upload_success_desc', `${selectedFiles.length} document(s) uploaded successfully.`),
      });
    }, 1500);
  };
  
  const handleDelete = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    
    toast({
      title: t('portal.documents.delete_success', 'Document Deleted'),
      description: t('portal.documents.delete_success_desc', 'The document has been deleted successfully.'),
    });
  };
  
  const handleDownload = (document: Document) => {
    // In a real app, this would trigger a download of the actual file
    toast({
      title: t('portal.documents.download_started', 'Download Started'),
      description: t('portal.documents.download_started_desc', `Downloading ${document.fileName}`),
    });
  };
  
  // Filter documents based on search term and active tab
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'x_rays') return matchesSearch && doc.documentType === 'x_ray';
    if (activeTab === 'treatment_plans') return matchesSearch && doc.documentType === 'treatment_plan';
    if (activeTab === 'medical') return matchesSearch && doc.documentType === 'medical_history';
    if (activeTab === 'other') return matchesSearch && doc.documentType === 'other';
    
    return matchesSearch;
  });
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };
  
  // Get badge color based on document type
  const getDocumentTypeBadge = (docType: string) => {
    switch (docType) {
      case 'x_ray':
        return <Badge className="bg-blue-500">X-Ray</Badge>;
      case 'ct_scan':
        return <Badge className="bg-purple-500">CT Scan</Badge>;
      case 'treatment_plan':
        return <Badge className="bg-green-500">Treatment Plan</Badge>;
      case 'medical_history':
        return <Badge className="bg-yellow-500">Medical History</Badge>;
      default:
        return <Badge className="bg-gray-500">Other</Badge>;
    }
  };
  
  // Get uploader label
  const getUploaderLabel = (uploaderType: string) => {
    switch (uploaderType) {
      case 'patient':
        return 'You';
      case 'clinic':
        return 'DentGroup Istanbul';
      case 'admin':
        return 'Istanbul Dental Smile';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t('portal.documents.title', 'Documents')}</CardTitle>
              <CardDescription>
                {t('portal.documents.description', 'Upload and manage your dental records and treatment plans')}
              </CardDescription>
            </div>
            
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('portal.documents.upload', 'Upload Document')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('portal.documents.upload_title', 'Upload Document')}</DialogTitle>
                  <DialogDescription>
                    {t('portal.documents.upload_description', 'Upload X-rays, CT scans, or other documents related to your dental treatment.')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="document-type">{t('portal.documents.document_type', 'Document Type')}</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger id="document-type">
                        <SelectValue placeholder={t('portal.documents.select_type', 'Select document type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="x_ray">{t('portal.documents.x_ray', 'X-Ray')}</SelectItem>
                        <SelectItem value="ct_scan">{t('portal.documents.ct_scan', 'CT Scan')}</SelectItem>
                        <SelectItem value="medical_history">{t('portal.documents.medical_history', 'Medical History')}</SelectItem>
                        <SelectItem value="other">{t('portal.documents.other', 'Other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="file-upload">{t('portal.documents.select_files', 'Select Files')}</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="file-upload"
                        className="hidden"
                        multiple
                        onChange={handleFileSelection}
                      />
                      <FilePlus className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        {t('portal.documents.drag_drop', 'Click or drag and drop files')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('portal.documents.supported_formats', 'Supported formats: PDF, JPG, PNG')}
                      </p>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          {t('portal.documents.selected_files', 'Selected Files')}:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="flex items-center">
                              <span className="truncate max-w-[250px]">
                                {file.name} ({formatFileSize(file.size)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notes">{t('portal.documents.notes', 'Notes (Optional)')}</Label>
                    <Input 
                      id="notes" 
                      placeholder={t('portal.documents.notes_placeholder', 'Add notes about the document')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    {t('portal.documents.cancel', 'Cancel')}
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-current"></div>
                        {t('portal.documents.uploading', 'Uploading...')}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('portal.documents.upload_button', 'Upload')}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <div className="px-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder={t('portal.documents.search', 'Search documents by name or notes')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">{t('portal.documents.all', 'All')}</TabsTrigger>
              <TabsTrigger value="x_rays">{t('portal.documents.x_rays', 'X-Rays')}</TabsTrigger>
              <TabsTrigger value="treatment_plans">{t('portal.documents.treatment_plans', 'Treatment Plans')}</TabsTrigger>
              <TabsTrigger value="medical">{t('portal.documents.medical', 'Medical')}</TabsTrigger>
              <TabsTrigger value="other">{t('portal.documents.other_tab', 'Other')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent className="flex-grow overflow-auto pt-0">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium text-gray-700">
                    {t('portal.documents.no_results', 'No documents found')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    {t('portal.documents.no_results_desc', 'No documents match your search. Try a different search term or clear the search.')}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-700">
                    {t('portal.documents.no_documents', 'No documents yet')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    {t('portal.documents.no_documents_desc', 'Upload X-rays, CT scans, or medical history documents for your dental treatment.')}
                  </p>
                  <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('portal.documents.upload_first', 'Upload Your First Document')}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 mb-3 sm:mb-0">
                    <div className="p-2 bg-gray-100 rounded">
                      {getFileIcon(doc.fileType)}
                    </div>
                    
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800 truncate max-w-xs">{doc.fileName}</h4>
                        {getDocumentTypeBadge(doc.documentType)}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 gap-1 sm:gap-3">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{t('portal.documents.uploaded_by', 'Uploaded by')} {getUploaderLabel(doc.uploaderType)}</span>
                      </div>
                      
                      {doc.notes && (
                        <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('portal.documents.download', 'Download')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {doc.uploaderType === 'patient' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(doc.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('portal.documents.delete', 'Delete')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-2" />
            {t('portal.documents.footer_info', 'Files uploaded here are securely shared with your dental team.')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentsSection;