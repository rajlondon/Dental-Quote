import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MoreVertical, Eye, Pencil, Trash2, Video, FileImage } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { MediaType, useClinicMedia, type MediaItem } from '@/hooks/use-clinic-media';

interface MediaItemCardProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function MediaItemCard({ item, onEdit, onDelete, isDeleting }: MediaItemCardProps) {
  const isImage = item.metadata?.mimeType?.startsWith('image/');
  const isVideo = item.metadata?.mimeType?.startsWith('video/');
  
  // Format date
  const formattedDate = new Date(item.uploadDate).toLocaleDateString();
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-video bg-gray-100 overflow-hidden group">
        {isImage ? (
          <>
            <img 
              src={item.fileUrl} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              IMAGE
            </div>
          </>
        ) : isVideo ? (
          <>
            <video 
              src={item.fileUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              onMouseEnter={(e) => {
                const video = e.target as HTMLVideoElement;
                video.currentTime = 1; // Show frame at 1 second for preview
              }}
            />
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              VIDEO
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="bg-white/90 rounded-full p-3">
                <Video className="h-8 w-8 text-gray-700" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileImage className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Preview overlay button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isVideo ? <Video className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
                {item.title}
              </DialogTitle>
              <DialogDescription>
                {item.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-auto">
              {isImage ? (
                <img 
                  src={item.fileUrl} 
                  alt={item.title} 
                  className="w-full object-contain max-h-[65vh] rounded"
                />
              ) : isVideo ? (
                <video 
                  src={item.fileUrl} 
                  controls 
                  className="w-full max-h-[65vh] rounded"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="py-12 text-center">
                  <FileImage className="h-16 w-16 mx-auto text-gray-400" />
                  <p className="mt-2">Preview not available</p>
                  <a 
                    href={item.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-primary hover:underline"
                  >
                    Download File
                  </a>
                </div>
              )}
              
              {/* Media metadata */}
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">File Type:</span>
                  <span>{item.metadata?.mimeType || 'Unknown'}</span>
                </div>
                {item.metadata?.size && (
                  <div className="flex justify-between">
                    <span className="font-medium">File Size:</span>
                    <span>{formatFileSize(item.metadata.size)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Upload Date:</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <CardContent className="flex-grow pt-4">
        <h3 className="font-semibold text-base truncate">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">Added: {formattedDate}</span>
          {/* Info about file type and size */}
          <span className="text-xs text-gray-500">
            {item.metadata?.mimeType?.split('/')[1]?.toUpperCase() || 'UNKNOWN'} 
            {item.metadata?.size && ` • ${Math.round(item.metadata.size / 1024)}KB`}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 mt-auto flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onEdit(item)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-red-500">Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the media.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(item.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>Delete</>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

interface MediaGalleryProps {
  clinicId: number;
  mediaTypes?: MediaType[];
  title?: string;
  allowUploads?: boolean;
  className?: string;
}

export function MediaGallery({ 
  clinicId,
  mediaTypes = [MediaType.BEFORE_AFTER, MediaType.CLINIC_TOUR, MediaType.TESTIMONIAL],
  title = 'Clinic Media',
  allowUploads = true,
  className = ''
}: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<MediaType>(mediaTypes[0] || MediaType.BEFORE_AFTER);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Configurable items per page
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get media data for the active tab
  const { 
    media, 
    isLoading, 
    isError, 
    deleteMedia, 
    isDeleting,
    updateMedia,
    isUpdating,
    refetch
  } = useClinicMedia(clinicId, activeTab);

  // Pagination logic
  const totalItems = media.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = media.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when tab changes
  const handleTabChange = (newTab: MediaType) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Handle edit item
  const handleEditStart = (item: MediaItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
  };

  // Handle edit save
  const handleEditSave = () => {
    if (editItem && editTitle.trim()) {
      updateMedia({
        mediaId: editItem.id,
        updates: {
          title: editTitle,
          description: editDescription || undefined
        }
      }, {
        onSuccess: () => {
          setEditItem(null);
          setEditTitle('');
          setEditDescription('');
        }
      });
    }
  };

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => handleTabChange(value as MediaType)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            {mediaTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type === MediaType.BEFORE_AFTER && 'Before/After Images'}
                {type === MediaType.CLINIC_TOUR && 'Clinic Tour Videos'}
                {type === MediaType.TESTIMONIAL && 'Patient Testimonials'}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {media.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  List
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {mediaTypes.map((type) => (
          <TabsContent key={type} value={type} className="space-y-6">
            {allowUploads && (
              <MediaUploader 
                clinicId={clinicId} 
                mediaType={type}
                allowedTypes={
                  type === MediaType.BEFORE_AFTER 
                    ? ['image/jpeg', 'image/png', 'image/webp'] 
                    : ['video/mp4', 'video/webm', 'image/jpeg', 'image/png']
                }
                onUploadComplete={() => refetch()}
              />
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-red-500">
                  Failed to load media. Please try again later.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()} 
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-gray-500">No media items found.</p>
                {type === MediaType.BEFORE_AFTER && (
                  <p className="text-sm text-gray-400 mt-2">
                    Upload before and after treatment images to showcase your results.
                  </p>
                )}
                {type === MediaType.CLINIC_TOUR && (
                  <p className="text-sm text-gray-400 mt-2">
                    Add videos showcasing your clinic facilities and equipment.
                  </p>
                )}
                {type === MediaType.TESTIMONIAL && (
                  <p className="text-sm text-gray-400 mt-2">
                    Share videos of satisfied patients sharing their experience.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Media Grid/List */}
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                    : "space-y-4"
                }>
                  {paginatedMedia.map((item) => (
                    <MediaItemCard 
                      key={item.id} 
                      item={item} 
                      onEdit={handleEditStart} 
                      onDelete={deleteMedia}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Items per page info */}
                <div className="text-center text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} items
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media Item</DialogTitle>
            <DialogDescription>
              Update the details for this media item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditItem(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={!editTitle.trim() || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}