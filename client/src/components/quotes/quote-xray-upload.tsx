import React, { useState, useRef } from "react";
import { useQuotes } from "@/hooks/use-quotes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuoteXrayUploadProps {
  quoteId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function QuoteXrayUpload({
  quoteId,
  onSuccess,
  onCancel
}: QuoteXrayUploadProps) {
  const { uploadXraysMutation } = useQuotes();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      // Validate file types (only images and PDFs)
      const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      
      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid file type",
          description: "Only images and PDF files are allowed",
          variant: "destructive"
        });
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      // Validate file types (only images and PDFs)
      const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      
      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid file type",
          description: "Only images and PDF files are allowed",
          variant: "destructive"
        });
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }

    uploadXraysMutation.mutate(
      { quoteId, files: selectedFiles },
      {
        onSuccess: () => {
          setSelectedFiles([]);
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload X-Ray Images</CardTitle>
        <CardDescription>
          Upload your dental X-rays to help clinics provide a more accurate quote
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">Drag and drop your files here</h3>
            <p className="text-sm text-muted-foreground mb-3">
              or click to browse your device
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: JPEG, PNG, TIFF, PDF
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted/40 rounded"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-muted/30 p-4 rounded-md">
          <div className="flex gap-2">
            <File className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Important Information</h4>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                <li>All X-rays and medical images are stored securely and encrypted</li>
                <li>Only assigned clinics and platform administrators can view your uploads</li>
                <li>High-quality, recent X-rays will help clinics provide more accurate quotes</li>
                <li>Maximum file size: 10MB per file</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={selectedFiles.length === 0 || uploadXraysMutation.isPending}
        >
          {uploadXraysMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload X-Rays"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}