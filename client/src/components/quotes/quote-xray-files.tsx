import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Image, Download, FileX, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/utils";

type PortalType = "patient" | "clinic" | "admin";

interface QuoteXrayFilesProps {
  quoteId: number;
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

export default function QuoteXrayFiles({ quoteId, portalType }: QuoteXrayFilesProps) {
  const [previewFile, setPreviewFile] = useState<XrayFile | null>(null);

  // Query to fetch X-ray files
  const { data, isLoading, error } = useQuery<XrayFile[]>({
    queryKey: [`/api/quotes/${quoteId}/xrays`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quotes/${quoteId}/xrays`);
      const data = await response.json();
      return data.data;
    }
  });

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
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">
          No X-rays are available to view.
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((file) => (
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