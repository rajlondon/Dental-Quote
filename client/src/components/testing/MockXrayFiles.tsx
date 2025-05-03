import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Image, Download, FileX, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/utils";

type PortalType = "patient" | "clinic" | "admin";

interface MockXrayFilesProps {
  portalType: PortalType;
}

interface XrayFile {
  id: number;
  originalName: string;
  filename: string;
  mimetype: string;
  fileSize: number;
  fileType: string;
  fileCategory: string;
  visibility: string;
  uploadedAt: string;
  uploadedById: number;
  thumbnailUrl?: string;
  downloadUrl?: string;
  presignedUrl?: string;
}

// Mock data to demonstrate component functionality
const mockXrayFiles: XrayFile[] = [
  {
    id: 1,
    originalName: "Panoramic X-ray.jpg",
    filename: "panoramic-xray-123456.jpg",
    mimetype: "image/jpeg",
    fileSize: 2456789,
    fileType: "image",
    fileCategory: "xray",
    visibility: "all",
    uploadedAt: "2025-05-01T12:34:56Z",
    uploadedById: 1,
    presignedUrl: "https://placehold.co/600x400/png?text=Panoramic+X-ray",
    downloadUrl: "https://placehold.co/600x400/png?text=Panoramic+X-ray"
  },
  {
    id: 2,
    originalName: "Dental Report.pdf",
    filename: "dental-report-123456.pdf",
    mimetype: "application/pdf",
    fileSize: 1234567,
    fileType: "document",
    fileCategory: "report",
    visibility: "all",
    uploadedAt: "2025-05-01T13:45:22Z",
    uploadedById: 1,
    presignedUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: 3,
    originalName: "Lateral Cephalogram.png",
    filename: "lateral-ceph-123456.png",
    mimetype: "image/png",
    fileSize: 3567890,
    fileType: "image",
    fileCategory: "xray",
    visibility: "all",
    uploadedAt: "2025-05-01T14:22:33Z",
    uploadedById: 1,
    presignedUrl: "https://placehold.co/600x400/png?text=Lateral+Cephalogram",
    downloadUrl: "https://placehold.co/600x400/png?text=Lateral+Cephalogram"
  },
  {
    id: 4,
    originalName: "Medical History.docx",
    filename: "medical-history-123456.docx",
    mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 567890,
    fileType: "document",
    fileCategory: "medical_record",
    visibility: "clinic_admin",
    uploadedAt: "2025-05-01T15:11:05Z",
    uploadedById: 1,
    downloadUrl: "#"
  }
];

export default function MockXrayFiles({ portalType }: MockXrayFilesProps) {
  const [previewFile, setPreviewFile] = useState<XrayFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Demo purposes - we'll show a loading state for 2 seconds when requested
  const showLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  
  // Demo purposes - we'll show an error state when requested
  const showError = () => {
    setError(new Error("This is a simulated error for demonstration purposes"));
    setTimeout(() => setError(null), 5000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileX className="h-10 w-10 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Failed to load X-ray files</h3>
        <p className="text-sm text-muted-foreground">
          {error.message}
        </p>
      </div>
    );
  }

  const isImageType = (mimetype: string) => {
    return mimetype.startsWith('image/');
  };

  const isPdfType = (mimetype: string) => {
    return mimetype === 'application/pdf';
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={showLoading}>
          Simulate Loading
        </Button>
        <Button size="sm" variant="outline" onClick={showError}>
          Simulate Error
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {mockXrayFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex flex-col h-full">
                <div 
                  className="bg-muted/50 rounded-md flex justify-center items-center h-32 mb-2 cursor-pointer" 
                  onClick={() => setPreviewFile(file)}
                >
                  {isImageType(file.mimetype) ? (
                    <div className="relative w-full h-full">
                      {file.presignedUrl ? (
                        <img 
                          src={file.presignedUrl} 
                          alt={file.originalName}
                          className="object-contain w-full h-full" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Image className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ) : isPdfType(file.mimetype) ? (
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-1">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M9 18v-6" />
                        <path d="M12 18v-3" />
                        <path d="M15 18v-6" />
                      </svg>
                      <span className="text-xs text-muted-foreground">PDF Document</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FileX className="h-12 w-12 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Unsupported Format</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="text-sm font-medium truncate" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 text-xs h-7 px-2"
                      onClick={() => setPreviewFile(file)}
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    {file.downloadUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs h-7 px-2"
                        asChild
                      >
                        <a href={file.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{previewFile?.originalName}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => setPreviewFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-muted/30 rounded-md">
            {previewFile && isImageType(previewFile.mimetype) && previewFile.presignedUrl ? (
              <img 
                src={previewFile.presignedUrl} 
                alt={previewFile.originalName}
                className="max-h-[70vh] max-w-full object-contain" 
              />
            ) : previewFile && isPdfType(previewFile.mimetype) && previewFile.presignedUrl ? (
              <iframe 
                src={previewFile.presignedUrl}
                title={previewFile.originalName}
                className="w-full h-[70vh]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <FileX className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Preview not available</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  This file format cannot be previewed. Please download the file to view it.
                </p>
                {previewFile?.downloadUrl && (
                  <Button className="mt-4" asChild>
                    <a href={previewFile.downloadUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setPreviewFile(null)}>
                Close
              </Button>
            </DialogClose>
            {previewFile?.downloadUrl && (
              <Button asChild>
                <a href={previewFile.downloadUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}