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
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {isImage ? (
          <img 
            src={item.fileUrl} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        ) : isVideo ? (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-12 w-12 text-gray-400" />
          </div>
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
              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>
                {item.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isImage ? (
                <img 
                  src={item.fileUrl} 
                  alt={item.title} 
                  className="w-full object-contain max-h-[70vh]"
                />
              ) : isVideo ? (
                <video 
                  src={item.fileUrl} 
                  controls 
                  className="w-full max-h-[70vh]"
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
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as MediaType)}>
        <TabsList className="mb-6">
          {mediaTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type === MediaType.BEFORE_AFTER && 'Before/After Images'}
              {type === MediaType.CLINIC_TOUR && 'Clinic Tour Videos'}
              {type === MediaType.TESTIMONIAL && 'Patient Testimonials'}
            </TabsTrigger>
          ))}
        </TabsList>
        
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item) => (
                  <MediaItemCard 
                    key={item.id} 
                    item={item} 
                    onEdit={handleEditStart} 
                    onDelete={deleteMedia}
                    isDeleting={isDeleting}
                  />
                ))}
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