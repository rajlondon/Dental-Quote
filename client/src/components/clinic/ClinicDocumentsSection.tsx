import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  File, 
  Image, 
  Search, 
  Download, 
  Eye, 
  Trash, 
  MoreHorizontal, 
  Upload, 
  Share,
  User,
  Filter,
  FileCode,
  FileArchive as Archive,
  FileX,
  FileQuestion,
  Edit,
  Loader2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import DocumentEditor from './DocumentEditor';
import DocumentViewer from './DocumentViewer';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface S3File {
  key: string;
  filename: string;
  originalname: string;
  url: string;
  type?: string;
  category?: string;
  uploaded: string;
  storageType: string;
  size?: number;
}

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
  description?: string;
  url?: string;
  key?: string;
}

const ClinicDocumentsSection: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewerDialog, setShowViewerDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('none');

  // Fetch actual files from the server
  const { 
    data: fileData, 
    isLoading: isLoadingFiles, 
    isError: isErrorFiles, 
    error: filesError,
    refetch: refreshFileList
  } = useQuery({
    queryKey: ['/api/files/list', activeTab, filterCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('type', activeTab);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      try {
        const response = await fetch(`/api/files/list?${params.toString()}`, {
          credentials: "include",
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
      }
    },
    // Add refetch options to ensure query is refreshed when tabs or filters change
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 10 * 1000 // 10 seconds before data becomes stale
  });

  // Transform S3 files into Document format
  const transformS3FilesToDocuments = (files: S3File[]): Document[] => {
    console.log("Raw S3 files data:", files);

    return files.map((file, index) => {
      // Extract file extension from filename
      const fileExt = file.filename.split('.').pop()?.toLowerCase() || '';

      // Determine document type and category
      const type = fileExt;
      const category = (file.category || 'other') as Document['category'];

      const transformedDoc = {
        id: file.key || `file-${index}`,
        name: file.originalname || file.filename,
        type,
        category,
        size: file.size || 0,
        uploaded: file.uploaded,
        uploadedBy: "Upload System", // We don't have this info from S3
        shared: false,
        url: file.url,
        key: file.key
      };

      // Log each transformed document for debugging
      console.log(`Transformed document ${index}:`, transformedDoc);

      return transformedDoc;
    });
  };

  // Use only real data from AWS S3 and sort by most recent first
  const allDocuments: Document[] = fileData?.files ? 
    transformS3FilesToDocuments(fileData.files)
      .sort((a, b) => {
        // Sort by newest first
        return new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime();
      }) : 
    // Empty array when no files are found
    [];

  // Filter documents based on search
  const filteredDocuments = allDocuments.filter(doc => {
    // Filter by search term (in name or patient name)
    if (searchTerm && 
        !doc.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(doc.patientName && doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
       ) {
      return false;
    }

    return true;
  });

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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

  // Get category label and badge color
  const getCategoryInfo = (category: Document['category']) => {
    switch (category) {
      case 'patient_record':
        return { 
          label: "Patient Record",
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'x_ray':
        return { 
          label: "X-Ray / Scan",
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'treatment_plan':
        return { 
          label: "Treatment Plan",
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'consent_form':
        return { 
          label: "Consent Form",
          color: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'lab_report':
        return { 
          label: "Lab Report",
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'other':
      default:
        return { 
          label: "Other",
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  // Set up mutation for file uploads
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Add category based on file type
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      let category = 'document';

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        category = 'image';
      } else if (['pdf'].includes(fileExt)) {
        category = 'document';
      } else if (['dcm'].includes(fileExt)) {
        category = 'xray';
      }

      formData.append('category', category);

      // Include patient ID if selected and not "none"
      if (selectedPatientId && selectedPatientId !== 'none') {
        formData.append('patientId', selectedPatientId);
        console.log(`Assigning file to patient: ${selectedPatientId}`);
      }

      // Use the new general upload endpoint
      console.log(`Uploading file ${file.name} with category ${category} in ${process.env.NODE_ENV} mode`);
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header since it will be automatically set with boundary for FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      return result;
    },
    onSuccess: (data) => {
      // Log the success for debugging the production issue
      console.log('File uploaded successfully:', data);
      // Invalidate the files query to refresh the file list
      queryClient.invalidateQueries({ queryKey: ['/api/files/list'] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  // Handle file upload
  const handleFileUpload = async (fileList: FileList | null, selectedFilesArray?: File[]) => {
    // Use either FileList or direct array of Files
    const fileArray = selectedFilesArray || (fileList ? Array.from(fileList) : []);

    if (fileArray.length === 0) return;

    const fileNames = fileArray.map(file => file.name).join(', ');

    // Only add to the UI state if we're uploading from a FileList (direct drop or input)
    if (fileList && !selectedFilesArray) {
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }

    toast({
      title: "Uploading Files",
      description: "Starting upload of {{count}} files",
    });

    try {
      // Upload each file, tracking successes and failures
      const results = await Promise.allSettled(
        fileArray.map(file => uploadFileMutation.mutateAsync(file))
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      if (successCount === fileArray.length) {
        toast({
          title: "Files Uploaded Successfully",
          description: "{{count}} files uploaded: {{files}}",
        });
      } else {
        toast({
          title: "Partial Upload Success",
          description: "{{success}} of {{total}} files uploaded successfully",
          variant: "destructive"
        });
      }

      // Refresh the file list after upload - include all query parameters
      queryClient.invalidateQueries({ 
        queryKey: ['/api/files/list', activeTab, filterCategory] 
      });

      // Dialog no longer closes automatically - users must click "Done" after setting categories
      // setShowUploadDialog(false);

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Add dropped files to selection first, instead of uploading immediately
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add files to selection first, instead of uploading immediately
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Handle document preview
  const handlePreview = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewDialog(true);
  };

  // Handle document download
  const handleDownload = (doc: Document) => {
    if (doc.url) {
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = doc.url;
      link.target = '_blank';
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Downloading",
        description: "Your download has started: {{name}}",
      });
    } else {
      // For documents without URLs, show an error
      toast({
        title: "Download Error",
        description: "Could not download file. URL not available.",
        variant: "destructive"
      });
    }
  };

  // Handle document deletion
  const handleDeleteConfirm = () => {
    if (selectedDocument) {
      // In a real app, this would delete the document from your server
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully.",
      });

      setSelectedDocument(null);
      setShowDeleteDialog(false);
    } else if (selectedDocuments.length > 0) {
      // In a real app, this would delete multiple documents
      toast({
        title: "Documents Deleted",
        description: "{{count}} documents have been deleted successfully.",
      });

      setSelectedDocuments([]);
      setShowDeleteDialog(false);
    }
  };

  // Handle document sharing
  const handleShareConfirm = () => {
    if (selectedDocument) {
      // In a real app, this would update sharing settings
      toast({
        title: "Document Shared",
        description: "Document sharing settings updated successfully.",
      });

      setSelectedDocument(null);
      setShowShareDialog(false);
    }
  };

  // Handle document editing
  const handleEditDocument = (updatedDocument: Document) => {
    // In a real app, this would update the document on the server
    toast({
      title: "Document Updated",
      description: "Document details have been updated successfully.",
    });

    // Update local state if needed
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Manage clinic documents, patient files, and medical records
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>

              <Button 
                variant="outline" 
                onClick={() => {
                  refreshFileList();
                  toast({
                    title: "Refreshing Documents",
                    description: "Document list is being refreshed..."
                  });
                }}
              >
                <svg 
                  className={`h-4 w-4 mr-2 ${isLoadingFiles ? 'animate-spin' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>

              {selectedDocuments.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions ({{count}})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Downloading",
                        description: "Your download of {{count}} files has started.",
                      });
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                      <Trash className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-red-500">
                        Delete Selected
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="patient_record">Patient Records</SelectItem>
                    <SelectItem value="x_ray">X-Rays & Scans</SelectItem>
                    <SelectItem value="treatment_plan">Treatment Plans</SelectItem>
                    <SelectItem value="consent_form">Consent Forms</SelectItem>
                    <SelectItem value="lab_report">Lab Reports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="pdf" className="text-xs">
                <FileText className="h-4 w-4 mr-1 text-red-500" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="image" className="text-xs">
                <Image className="h-4 w-4 mr-1 text-blue-500" />
                Images
              </TabsTrigger>
              <TabsTrigger value="docx" className="text-xs">
                <FileText className="h-4 w-4 mr-1 text-blue-700" />
                Word
              </TabsTrigger>
              <TabsTrigger value="zip" className="text-xs hidden md:flex">
                <Archive className="h-4 w-4 mr-1 text-yellow-600" />
                Archives
              </TabsTrigger>
              <TabsTrigger value="shared" className="text-xs hidden lg:flex">
                <Share className="h-4 w-4 mr-1" />
                Shared
              </TabsTrigger>
              <TabsTrigger value="patients" className="text-xs hidden lg:flex">
                <User className="h-4 w-4 mr-1" />
                Patient Files
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Document List */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={filteredDocuments.length > 0 && selectedDocuments.length === filteredDocuments.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDocuments(filteredDocuments.map(doc => doc.id));
                        } else {
                          setSelectedDocuments([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="min-w-[300px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                  <TableHead className="hidden lg:table-cell">Size</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingFiles ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-lg font-medium">
                          Loading documents...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isErrorFiles ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FileX className="h-10 w-10 text-red-500" />
                        <p className="text-lg font-medium text-red-500">
                          Error loading documents
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {String(filesError)}
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/files/list'] })}
                          className="mt-2"
                        >
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => {
                    const categoryInfo = getCategoryInfo(document.category);

                    return (
                      <TableRow 
                        key={document.id}
                        className={
                          // Highlight newly uploaded documents - anything in the last 60 seconds
                          new Date().getTime() - new Date(document.uploaded).getTime() < 60000 
                            ? "bg-green-50" 
                            : undefined
                        }
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedDocuments.includes(document.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDocuments([...selectedDocuments, document.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== document.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div 
                            className="flex items-center cursor-pointer hover:underline"
                            onClick={() => {
                              console.log("Document clicked for viewing:", document);
                              setSelectedDocument(document);
                              setShowViewerDialog(true);
                            }}
                          >
                            <div className="mr-2 flex-shrink-0">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="truncate font-medium">
                              {document.name}
                              {/* Badge for newly uploaded files */}
                              {new Date().getTime() - new Date(document.uploaded).getTime() < 60000 && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {document.patientName ? (
                            <div className="flex items-center space-x-2">
                              <div className="bg-primary/10 p-1 rounded-full">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span>{document.patientName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {new Date(document.uploaded).toLocaleDateString(
                                'en-GB'
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {document.uploadedBy}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatFileSize(document.size)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowViewerDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(document)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowShareDialog(true);
                                }}
                              >
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileX className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-base">
                          {searchTerm || filterCategory !== 'all' || activeTab !== 'all' ? (
                            "No documents match your search criteria"
                          ) : (
                            "No documents have been uploaded yet"
                          )}
                        </p>
                        {(searchTerm || filterCategory !== 'all' || activeTab !== 'all') && (
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearchTerm('');
                              setFilterCategory('all');
                              setActiveTab('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredDocuments.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {selectedDocuments.length > 0 ? (
                  <span>
                    {{selected}} of {{total}} selected
                  </span>
                ) : (
                  <span>
                    Showing {{count}} documents
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog 
        open={showUploadDialog} 
        onOpenChange={(open) => {
          setShowUploadDialog(open);
          if (!open) {
            // Reset state when dialog is closed
            setSelectedPatientId('none');
            setSelectedFiles([]);
          }
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload documents, images, and other files to the document management system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Document Category</Label>
              <RadioGroup defaultValue="patient_record" className="mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient_record" id="patient_record" />
                    <Label htmlFor="patient_record">
                      Patient Records
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="x_ray" id="x_ray" />
                    <Label htmlFor="x_ray">
                      X-Rays & Scans
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="treatment_plan" id="treatment_plan" />
                    <Label htmlFor="treatment_plan">
                      Treatment Plan
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consent_form" id="consent_form" />
                    <Label htmlFor="consent_form">
                      Consent Form
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lab_report" id="lab_report" />
                    <Label htmlFor="lab_report">
                      Lab Report
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">
                      Other
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_select">
                Assign to Patient (Optional)
              </Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No patient (general document)
                  </SelectItem>
                  <SelectItem value="pt001">John Smith</SelectItem>
                  <SelectItem value="pt002">Sarah Johnson</SelectItem>
                  <SelectItem value="pt003">Michael Brown</SelectItem>
                  <SelectItem value="pt004">Emma Davis</SelectItem>
                  <SelectItem value="pt005">William Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="share_with_patient" />
              <Label htmlFor="share_with_patient">
                Share with patient
              </Label>
            </div>
          </div>

          <div 
            className={`
              border-2 border-dashed rounded-lg p-10 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
            `}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileUpload"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />

            {selectedFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-base font-medium mb-1">
                    {{count}} files selected
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto w-full">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center p-2 border rounded bg-gray-50">
                        {(() => {
                          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
                          if (fileExt === 'pdf') {
                            return <FileText className="h-5 w-5 text-red-500 mr-2" />;
                          } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
                            return <Image className="h-5 w-5 text-blue-500 mr-2" />;
                          } else if (['doc', 'docx'].includes(fileExt)) {
                            return <FileText className="h-5 w-5 text-blue-700 mr-2" />;
                          } else {
                            return <File className="h-5 w-5 text-gray-500 mr-2" />;
                          }
                        })()}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatFileSize(file.size)}
                        </span>
                        {/* Add preview button for image files */}
                        {(['jpg', 'jpeg', 'png', 'gif'].includes(file.name.split('.').pop()?.toLowerCase() || '')) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2 p-1 h-8 w-8" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Create a temporary object URL for preview
                              const fileUrl = URL.createObjectURL(file);
                              const previewDoc: Document = {
                                id: `temp-${index}`,
                                name: file.name,
                                type: file.name.split('.').pop()?.toLowerCase() || '',
                                size: file.size,
                                category: 'other',
                                uploaded: new Date().toISOString(),
                                uploadedBy: 'You',
                                shared: false,
                                url: fileUrl,
                                thumbnail: fileUrl
                              };
                              setSelectedDocument(previewDoc);
                              setShowPreviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('fileUpload')?.click()}
                  className="mt-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add More Files
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="fileUpload" 
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-base font-medium mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, Word, images, and other files up to 10MB each
                </p>
              </label>
            )}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={() => {
                // Keep dialog open after upload so users can select category and share options
                document.getElementById('fileUpload')?.click();
              }}
            >
              Select Files
            </Button>
            <Button
              variant="default"
              onClick={async () => {
                if (selectedFiles.length > 0) {
                  // Upload all selected files
                  await handleFileUpload(null, selectedFiles);
                  // Explicitly refresh the document list
                  queryClient.invalidateQueries({ queryKey: ['/api/files/list'] });
                  // Also refresh specific active filters
                  queryClient.invalidateQueries({ 
                    queryKey: ['/api/files/list', activeTab, filterCategory] 
                  });
                }
                setShowUploadDialog(false);
                // Reset states when done
                setSelectedFiles([]);
                setSelectedPatientId('none');
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedDocument && getDocumentIcon(selectedDocument.type)}
              <span className="ml-2">{selectedDocument?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.patientName && (
                <span className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {selectedDocument.patientName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-[400px] overflow-hidden flex flex-col border rounded-md bg-gray-50 p-4">
            {selectedDocument ? (
              selectedDocument.type === 'jpg' || selectedDocument.type === 'png' || selectedDocument.type === 'jpeg' ? (
                // Image Preview
                <div className="flex-1 flex items-center justify-center overflow-auto">
                  {/* In a real app, you would use the actual image source from an API */}
                  {selectedDocument.thumbnail ? (
                    <img 
                      src={selectedDocument.thumbnail} 
                      alt={selectedDocument.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    // Fallback for when no thumbnail is available
                    <div className="text-center p-6">
                      <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                        <Image className="h-16 w-16 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Image Preview
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Image preview is not available. The file might be processing or unavailable.
                      </p>
                      <Button 
                        onClick={() => selectedDocument && handleDownload(selectedDocument)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Image
                      </Button>
                    </div>
                  )}
                </div>
              ) : selectedDocument.type === 'pdf' ? (
                // PDF Preview - In a real app, you might use a PDF viewer library like react-pdf
                <div className="flex-1 flex flex-col">
                  <div className="bg-gray-800 p-3 flex items-center justify-between mb-3 rounded-t-md">
                    <div className="text-white font-medium truncate">
                      {selectedDocument.name}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
                      onClick={() => selectedDocument && handleDownload(selectedDocument)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex-1 bg-white flex items-center justify-center border">
                    <div className="text-center p-6">
                      <div className="p-4 bg-red-50 rounded-full inline-block mb-4">
                        <FileText className="h-16 w-16 text-red-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        PDF Preview
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        This document has multiple pages.
                      </p>
                      <p className="text-sm text-muted-foreground mb-6">
                        For better viewing experience, download the document.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-100 p-2 rounded-b-md mt-3">
                    <div className="text-sm text-gray-500">
                      Page 1 of 3
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled>
                        Previous
                      </Button>
                      <Button size="sm" variant="outline">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Other File Types
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="mx-auto mb-4">
                      {selectedDocument.type.startsWith('doc') ? (
                        <div className="p-4 bg-blue-50 rounded-full inline-block">
                          <FileText className="h-16 w-16 text-blue-700" />
                        </div>
                      ) : selectedDocument.type === 'zip' || selectedDocument.type === 'rar' ? (
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
                      Preview not available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      This document type cannot be previewed directly. Please download the file to view its contents.
                    </p>
                    <Button 
                      onClick={() => selectedDocument && handleDownload(selectedDocument)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                </div>
              )
            ) : (
              // No document selected (shouldn't normally happen)
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                    <FileQuestion className="h-16 w-16 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No Document Selected
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Please select a document to preview.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <h4 className="text-sm font-medium mb-1">
                  Document Details
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Type:</dt>
                  <dd className="font-medium uppercase">{selectedDocument?.type}</dd>

                  <dt className="text-muted-foreground">Size:</dt>
                  <dd>{selectedDocument?.size ? formatFileSize(selectedDocument.size) : ""}</dd>

                  <dt className="text-muted-foreground">Uploaded:</dt>
                  <dd>{selectedDocument?.uploaded ? new Date(selectedDocument.uploaded).toLocaleDateString() : ""}</dd>

                  <dt className="text-muted-foreground">Uploaded By:</dt>
                  <dd>{selectedDocument?.uploadedBy}</dd>
                </dl>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowPreviewDialog(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => selectedDocument && handleDownload(selectedDocument)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              {selectedDocument ? (
                "Are you sure you want to delete this document? This action cannot be undone."
              ) : (
                "Are you sure you want to delete {{count}} documents? This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="border rounded p-3 bg-gray-50 flex items-center gap-3">
              {getDocumentIcon(selectedDocument.type)}
              <span className="font-medium">{selectedDocument.name}</span>
            </div>
          )}

          {!selectedDocument && selectedDocuments.length > 0 && (
            <div className="border rounded p-3 bg-red-50 text-center">
              <p className="font-medium text-red-800">
                You are about to delete {{count}} documents
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Share Document
            </DialogTitle>
            <DialogDescription>
              Control who can view and access this document.
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="border rounded p-3 bg-gray-50 flex items-center gap-3">
                {getDocumentIcon(selectedDocument.type)}
                <span className="font-medium truncate">{selectedDocument.name}</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sharing Options</Label>
                  <RadioGroup defaultValue={selectedDocument.shared ? "shared" : "private"}>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="private" id="private" className="mt-1" />
                        <div>
                          <Label htmlFor="private" className="font-medium">
                            Private - Clinic Staff Only
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Only clinic staff can view and access this document
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="shared" id="shared" className="mt-1" />
                        <div>
                          <Label htmlFor="shared" className="font-medium">
                            Shared with Patient
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            The patient can view and download this document
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Checkbox id="notify_patient" />
                  <Label htmlFor="notify_patient">
                    Send notification to the patient
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowShareDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleShareConfirm}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Document Editor */}
      <DocumentEditor
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        document={selectedDocument}
        onSave={handleEditDocument}
      />

      {/* Document Viewer */}
      <DocumentViewer
        open={showViewerDialog}
        onOpenChange={setShowViewerDialog}
        document={selectedDocument}
        onDownload={handleDownload}
        onEdit={(document) => {
          setShowViewerDialog(false);
          setTimeout(() => {
            setSelectedDocument(document);
            setShowEditDialog(true);
          }, 100);
        }}
        onShare={(document) => {
          setShowViewerDialog(false);
          setTimeout(() => {
            setSelectedDocument(document);
            setShowShareDialog(true);
          }, 100);
        }}
      />
    </div>
  );
};

export default ClinicDocumentsSection;