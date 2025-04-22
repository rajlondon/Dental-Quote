import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  Paperclip, 
  ChevronDown,
  User,
  Building2,
  Clock,
  CheckCheck,
  Image,
  FileText,
  X,
  FilePlus2,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Message, Attachment } from '@/types/clientPortal';
import { apiRequest } from '@/lib/queryClient';

// Mock data for initial development
const mockMessages: Message[] = [
  {
    id: 1,
    bookingId: 123,
    senderId: 1,
    senderType: 'clinic',
    content: "Welcome to DentGroup Istanbul! We're excited to provide you with excellent dental care. Let me know if you have any questions about your upcoming treatment.",
    createdAt: '2025-04-08T10:23:45Z',
    readAt: '2025-04-08T10:24:45Z'
  },
  {
    id: 2,
    bookingId: 123,
    senderId: 2,
    senderType: 'patient',
    content: 'Thank you for the welcome! I have a few questions about the dental implant procedure. How long will I need to stay in Istanbul for the full treatment?',
    createdAt: '2025-04-08T11:05:22Z',
    readAt: '2025-04-08T11:06:30Z'
  },
  {
    id: 3,
    bookingId: 123,
    senderId: 1,
    senderType: 'clinic',
    content: "For dental implants, we typically recommend staying for 5-7 days for the initial procedure. Then you'll need to return after 3-4 months for the final crown placement, which requires another 3-5 days. During your first visit, we'll take detailed impressions and place the implants.",
    createdAt: '2025-04-08T11:15:42Z',
    readAt: '2025-04-08T11:20:15Z'
  },
  {
    id: 4,
    bookingId: 123,
    senderId: 1,
    senderType: 'clinic',
    content: 'Here are some before/after photos of similar cases to yours:',
    attachments: [
      {
        id: 1,
        messageId: 4,
        fileName: 'before_after_implants.jpg',
        fileType: 'image/jpeg',
        fileSize: 245000,
        url: '#',
        createdAt: '2025-04-08T11:16:22Z'
      }
    ],
    createdAt: '2025-04-08T11:16:22Z',
    readAt: '2025-04-08T11:20:15Z'
  },
  {
    id: 5,
    bookingId: 123,
    senderId: 2,
    senderType: 'patient',
    content: "That's very helpful, thank you! I'll need to plan my trips accordingly. Is there a specific time of year that's best for this procedure?",
    createdAt: '2025-04-08T13:45:10Z',
    readAt: '2025-04-08T14:00:30Z'
  },
  {
    id: 6,
    bookingId: 123,
    senderId: 1,
    senderType: 'admin',
    content: "Hello! This is Destina from MyDentalFly. I wanted to let you know that I'll be your personal concierge throughout your dental journey. I can help coordinate your travel plans, accommodation, and answer any questions about Istanbul.",
    createdAt: '2025-04-08T15:30:22Z',
    readAt: '2025-04-08T15:45:10Z'
  },
  {
    id: 7,
    bookingId: 123,
    senderId: 2,
    senderType: 'patient',
    content: "That's great to hear, Destina! I'm looking forward to my treatment. I've attached my recent X-rays for the dentist to review before my visit.",
    attachments: [
      {
        id: 2,
        messageId: 7,
        fileName: 'recent_xrays.pdf',
        fileType: 'application/pdf',
        fileSize: 3500000,
        url: '#',
        createdAt: '2025-04-09T09:12:45Z'
      }
    ],
    createdAt: '2025-04-09T09:12:45Z',
    readAt: '2025-04-09T09:30:15Z'
  },
  {
    id: 8,
    bookingId: 123,
    senderId: 1,
    senderType: 'clinic',
    content: "Thank you for sharing your X-rays. Our dental team will review them and provide feedback. Regarding the best time to visit - we can perform the procedure any time of year, but many patients prefer spring or autumn when Istanbul's weather is most pleasant.",
    createdAt: '2025-04-09T10:22:15Z',
    readAt: '2025-04-09T10:45:30Z'
  }
];

interface MessagingSectionProps {
  bookingId?: number;
  clinicId?: string;
}

const MessagingSection: React.FC<MessagingSectionProps> = ({ bookingId = 123, clinicId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = window.location.hash;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeClinic, setActiveClinic] = useState<string | null>(clinicId || null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check URL parameters for clinic selection
  useEffect(() => {
    // Parse clinic from URL if present (e.g., #/client-portal?section=messages&clinic=clinic_001)
    if (!clinicId && location.includes('clinic=')) {
      try {
        // Get everything after the "?"
        const queryPart = location.split('?')[1] || '';
        const params = new URLSearchParams(queryPart);
        const urlClinicId = params.get('clinic');
        
        if (urlClinicId) {
          setActiveClinic(urlClinicId);
          console.log(`Setting active clinic from URL: ${urlClinicId}`);
          // Also store in localStorage for persistence
          localStorage.setItem('selectedClinicId', urlClinicId);
        }
      } catch (error) {
        console.error('Error parsing clinic from URL:', error);
      }
    }
  }, [location, clinicId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // State to track upload progress for each attachment
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [processedAttachments, setProcessedAttachments] = useState<Attachment[]>([]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && processedAttachments.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // First ensure all files are uploaded
      if (attachments.length > 0 && processedAttachments.length < attachments.length) {
        // Some files still need to be uploaded
        await Promise.all(attachments.map((file, index) => uploadFile(file)));
      }
      
      // Create a new message object
      const newMsg: Message = {
        id: Math.floor(Math.random() * 1000) + 10, // In production this would come from the server
        bookingId,
        senderId: 2, // Current user ID
        senderType: 'patient',
        content: newMessage.trim(),
        attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
        createdAt: new Date().toISOString(),
      };
      
      // In production, this would be an API call to save the message
      // For now, we'll just add it to the local state
      // Example API call: await apiRequest('POST', '/api/messages', { message: newMsg });
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setAttachments([]);
      setProcessedAttachments([]);
      
      toast({
        title: t('portal.message_sent', 'Message Sent'),
        description: t('portal.message_sent_desc', 'Your message has been sent successfully.'),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('portal.message_error', 'Error Sending Message'),
        description: error instanceof Error ? error.message : 'An error occurred while sending your message.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<Attachment> => {
    // Skip if already uploaded
    const existingAttachment = processedAttachments.find(a => a.fileName === file.name && a.fileSize === file.size);
    if (existingAttachment) {
      return existingAttachment;
    }
    
    // Track this file as uploading
    setUploadingFiles(prev => ({ ...prev, [file.name]: true }));
    
    try {
      // Create form data for the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      console.log(`Uploading file: ${file.name}`);
      const response = await fetch('/api/files/upload-message-attachment', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Important for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Unknown upload error');
      }
      
      console.log(`File uploaded successfully:`, result.file);
      
      // Create an attachment object from the response
      const newAttachment: Attachment = {
        id: Math.floor(Math.random() * 1000) + 10, // Would come from server in production
        messageId: 0, // Will be assigned when the message is created
        fileName: result.file.originalname,
        fileType: result.file.mimetype,
        fileSize: result.file.size,
        url: result.file.url,
        createdAt: new Date().toISOString()
      };
      
      // Add to processed attachments
      setProcessedAttachments(prev => [...prev, newAttachment]);
      
      return newAttachment;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: t('portal.upload_error', 'Upload Error'),
        description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Remove from uploading state
      setUploadingFiles(prev => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file count
      if (attachments.length + newFiles.length > 5) {
        toast({
          title: t('portal.max_files', 'Maximum Files Exceeded'),
          description: t('portal.max_files_desc', 'You can only attach up to 5 files per message.'),
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file sizes
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024); // 10MB
      if (oversizedFiles.length > 0) {
        toast({
          title: t('portal.file_too_large', 'File Too Large'),
          description: t('portal.file_too_large_desc', 'Some files exceed the 10MB size limit.'),
          variant: 'destructive',
        });
        return;
      }
      
      // Add files to attachments state
      setAttachments(prev => [...prev, ...newFiles]);
      
      // Start uploading files immediately
      try {
        for (const file of newFiles) {
          await uploadFile(file);
        }
      } catch (error) {
        console.error('Error processing uploads:', error);
      }
    }
  };

  const removeAttachment = (index: number) => {
    const fileToRemove = attachments[index];
    
    // Remove from attachments list
    setAttachments(attachments.filter((_, i) => i !== index));
    
    // Also remove from processed attachments if it exists there
    if (fileToRemove) {
      setProcessedAttachments(prev => 
        prev.filter(a => !(a.fileName === fileToRemove.name && a.fileSize === fileToRemove.size))
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to format message timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Function to format message date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle>{t('portal.messages.title', 'Messages')}</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-[calc(65vh-8rem)]" ref={scrollAreaRef}>
            <div className="px-6 py-4">
              {Object.entries(messageGroups).map(([date, messages]) => (
                <div key={date} className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {formatDate(messages[0].createdAt)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div 
                        key={message.id}
                        className={`flex ${message.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] ${
                            message.senderType === 'patient' 
                              ? 'bg-blue-50 text-blue-800' 
                              : message.senderType === 'admin'
                                ? 'bg-purple-50 text-purple-800'
                                : 'bg-gray-50 text-gray-800'
                          } rounded-lg px-4 py-3 shadow-sm`}
                        >
                          {message.senderType !== 'patient' && (
                            <div className="flex items-center mb-2">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage 
                                  src={message.senderType === 'admin' ? '/assets/destina.jpeg' : '/assets/dentist.png'} 
                                  alt={message.senderType === 'admin' ? 'Admin' : 'Clinic'} 
                                />
                                <AvatarFallback>
                                  {message.senderType === 'admin' ? 'A' : 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">
                                {message.senderType === 'admin' ? 'MyDentalFly.com' : 'DentGroup Istanbul'}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map(attachment => (
                                <div 
                                  key={attachment.id}
                                  className="flex items-center bg-white rounded p-2 text-sm"
                                >
                                  {attachment.fileType.startsWith('image/')
                                    ? <Image className="h-4 w-4 mr-2 text-blue-500" />
                                    : <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                  }
                                  <span className="truncate flex-1">{attachment.fileName}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-70">{formatTime(message.createdAt)}</span>
                            {message.senderType === 'patient' && (
                              <CheckCheck className={`h-3 w-3 ${message.readAt ? 'text-blue-500' : 'text-gray-400'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="pt-3">
          {attachments.length > 0 && (
            <div className="mb-2 w-full flex flex-wrap gap-2">
              {attachments.map((file, index) => {
                const isUploading = uploadingFiles[file.name] || false;
                const isUploaded = processedAttachments.some(a => a.fileName === file.name && a.fileSize === file.size);
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center ${isUploaded ? 'bg-green-50' : isUploading ? 'bg-blue-50' : 'bg-gray-50'} rounded-full pl-2 pr-1 py-1 text-xs`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 mr-1 text-blue-500 animate-spin" />
                    ) : isUploaded ? (
                      <CheckCheck className="h-3 w-3 mr-1 text-green-500" />
                    ) : file.type.startsWith('image/') ? (
                      <Image className="h-3 w-3 mr-1 text-blue-500" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1 text-blue-500" />
                    )}
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-5 w-5 ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => removeAttachment(index)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="w-full flex items-end gap-2">
            <div className="relative flex-grow">
              <Textarea 
                placeholder={t('portal.messages.type_message', 'Type your message...')}
                className="pr-10 resize-none"
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute bottom-2 right-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Paperclip className="h-5 w-5 text-gray-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" side="top" align="end">
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        {t('portal.messages.attach_file', 'Attach File')}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileUpload}
                      />
                      
                      <Label className="text-xs text-gray-500">
                        {t('portal.messages.max_size', 'Max 5 files, 10MB each')}
                      </Label>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Button
              className="flex-shrink-0 rounded-full p-2 w-10 h-10"
              onClick={handleSendMessage}
              disabled={isLoading || (!newMessage.trim() && attachments.length === 0)}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MessagingSection;