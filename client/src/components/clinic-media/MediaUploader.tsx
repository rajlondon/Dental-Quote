import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, X, Check } from 'lucide-react';
import { MediaType, useClinicMedia } from '@/hooks/use-clinic-media';

interface MediaUploaderProps {
  clinicId: number;
  mediaType: MediaType;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  onUploadComplete?: () => void;
  maxFiles?: number;
}

export function MediaUploader({
  clinicId,
  mediaType,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  maxFileSize = 50, // 50MB default for video support
  onUploadComplete,
  maxFiles = 10
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const { uploadMedia, isUploading, uploadProgress } = useClinicMedia(clinicId, mediaType);

  // Display title based on media type if not provided
  const displayTitle = title || {
    [MediaType.BEFORE_AFTER]: 'Upload Before/After Images',
    [MediaType.CLINIC_TOUR]: 'Upload Clinic Tour Video',
    [MediaType.TESTIMONIAL]: 'Upload Patient Testimonial'
  }[mediaType];

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      setFileError(null);
      return;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setFileError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setFileError(`File too large. Maximum size: ${maxFileSize}MB`);
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    // Generate file preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // For videos, we can't easily generate a preview
      // Use a placeholder or video thumbnail in future
      setFilePreview(null);
    }
  };

  // Handle file upload
  const handleUpload = () => {
    if (!selectedFile) {
      setFileError('Please select a file to upload');
      return;
    }

    if (!mediaTitle.trim()) {
      setFileError('Please enter a title for the media');
      return;
    }

    uploadMedia(
      { 
        file: selectedFile, 
        title: mediaTitle,
        description: description || undefined
      },
      {
        onSuccess: () => {
          // Reset form
          setSelectedFile(null);
          setFilePreview(null);
          setMediaTitle('');
          setDescription('');
          setFileError(null);

          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          // Callback
          if (onUploadComplete) {
            onUploadComplete();
          }
        }
      }
    );
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file) {
      // Simulate file input change
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;

        // Manually trigger change event
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
        <CardDescription>
          {mediaType === MediaType.BEFORE_AFTER && 'Upload before and after treatment images to showcase results'}
          {mediaType === MediaType.CLINIC_TOUR && 'Upload videos showcasing your clinic facilities'}
          {mediaType === MediaType.TESTIMONIAL && 'Upload patient testimonial videos or images'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File uploader area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${fileError ? 'border-red-500' : 'border-gray-300 hover:border-primary'}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {filePreview ? (
            <div className="relative mx-auto max-h-40 overflow-hidden">
              <img 
                src={filePreview} 
                alt="Preview" 
                className="mx-auto max-h-40 object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setFilePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                Drop file here or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Allowed types: {allowedTypes.map(type => type.replace('image/', '.').replace('video/', '.')).join(', ')}
                <br />
                Max size: {maxFileSize}MB
              </p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={allowedTypes.join(',')}
            onChange={handleFileChange}
          />
        </div>

        {/* Error message */}
        {fileError && (
          <p className="text-sm text-red-500">{fileError}</p>
        )}

        {/* File info */}
        {selectedFile && !fileError && (
          <div className="text-sm text-gray-500">
            <p>Selected file: <span className="font-medium">{selectedFile.name}</span></p>
            <p>Size: <span className="font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span></p>
          </div>
        )}

        {/* Title and description inputs */}
        <div className="space-y-2">
          <Label htmlFor="media-title">Title</Label>
          <Input
            id="media-title"
            value={mediaTitle}
            onChange={(e) => setMediaTitle(e.target.value)}
            placeholder="Enter a title for this media"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="media-description">Description (optional)</Label>
          <Textarea
            id="media-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description"
            disabled={isUploading}
          />
        </div>

        {/* Upload progress bar (visible only during upload) */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-gray-500">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !mediaTitle.trim() || isUploading}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Upload
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}