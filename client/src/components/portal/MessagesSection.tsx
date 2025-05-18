import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  PaperclipIcon, 
  SendIcon, 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useWebSocket } from '@/hooks/use-websocket';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';

// Types for API responses
interface Conversation {
  bookingId: number;
  bookingReference: string;
  clinicId: number;
  clinicName: string;
  clinicEmail?: string;
  clinicAvatar?: string;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  treatmentType: string;
}

interface BookingDetail {
  id: number;
  reference: string;
  status: string;
  treatmentType: string;
  clinic: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  };
}

interface Message {
  id: number;
  bookingId: number;
  content: string;
  sender: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isRead: boolean;
  messageType: string;
  attachmentId?: number;
  hasAttachment?: boolean;
}

const MessagesSection: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { connected, lastMessage } = useWebSocket();
  const { markAsRead } = useNotifications();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Filter for showing active or all conversations
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'active'>('all');
  
  // Check if there's a booking parameter in the URL
  useEffect(() => {
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const urlParams = new URLSearchParams(hashParts[1]);
      const bookingParam = urlParams.get('booking');
      
      if (bookingParam) {
        const bookingId = parseInt(bookingParam);
        if (!isNaN(bookingId)) {
          setActiveBookingId(bookingId);
        }
      }
    }
    
    // Load conversations on component mount
    fetchConversations();
  }, [location]);
  
  // Fetch conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (activeBookingId) {
      fetchMessages(activeBookingId);
    }
  }, [activeBookingId]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  // Listen for new messages from WebSocket via lastMessage
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_message' && lastMessage.payload) {
      const newMsg = lastMessage.payload;
      
      // If this message is for the current active booking, add it to messages
      if (activeBookingId && newMsg.bookingId === activeBookingId) {
        setMessages(prevMessages => [...prevMessages, {
          id: newMsg.id,
          bookingId: newMsg.bookingId,
          content: newMsg.content,
          sender: newMsg.senderId === activeBookingId ? 'clinic' : 'patient',
          senderName: newMsg.sender?.firstName || 'Clinic Staff',
          senderAvatar: newMsg.sender?.profileImage,
          timestamp: newMsg.createdAt,
          isRead: false,
          messageType: newMsg.messageType || 'text',
          attachmentId: newMsg.attachmentId,
          hasAttachment: newMsg.hasAttachment
        }]);
      }
      
      // Refresh conversations to update last message and unread count
      fetchConversations();
    }
  }, [lastMessage, activeBookingId]);
  
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages/patient/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
        
        // If we have conversations and none selected, select the first one
        if (data.conversations.length > 0 && !activeBookingId) {
          setActiveBookingId(data.conversations[0].bookingId);
        }
      } else {
        console.error('Failed to fetch conversations:', data.message);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: t("portal.messages.error", "Error"),
        description: t("portal.messages.conversations_error", "Failed to load conversations. Please try again."),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (bookingId: number) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages/patient/booking/${bookingId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setSelectedBooking(data.booking);
        
        // After fetching messages, refresh conversations to update unread counts
        fetchConversations();
        
        // Mark message notifications for this booking as read
        markAsRead(`message_${bookingId}`);
      } else {
        console.error('Failed to fetch messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: t("portal.messages.error", "Error"),
        description: t("portal.messages.messages_error", "Failed to load messages. Please try again."),
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!activeBookingId || !newMessage.trim()) return;
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: activeBookingId,
          content: newMessage.trim(),
          messageType: 'text'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new message to the state
        setMessages(prevMessages => [...prevMessages, data.message]);
        setNewMessage('');
        
        // Refresh conversations to show updated last message
        fetchConversations();
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t("portal.messages.send_error", "Error Sending Message"),
        description: error instanceof Error 
          ? error.message 
          : t("portal.messages.send_error_desc", "Failed to send message. Please try again."),
        variant: "destructive"
      });
    }
  };
  
  // Format relative time (e.g., "2 hours ago")
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  // Filter conversations based on search query and tab
  const filteredConversations = conversations.filter(conversation => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      conversation.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    let matchesTab = true;
    if (activeFilter === 'unread') {
      matchesTab = conversation.unreadCount > 0;
    } else if (activeFilter === 'active') {
      matchesTab = conversation.status === 'active' || conversation.status === 'upcoming';
    }
    
    return matchesSearch && matchesTab;
  });
  
  // Get total unread count
  const totalUnreadCount = conversations.reduce((total, conversation) => 
    total + conversation.unreadCount, 0);
  
  return (
    <div className="space-y-6">
      <Card className="h-[calc(100vh-13rem)]">
        <CardHeader className="pb-4">
          <CardTitle>
            {t("portal.messages.title", "Messages")}
            {totalUnreadCount > 0 && (
              <Badge variant="default" className="ml-2">{totalUnreadCount}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {t("portal.messages.description", "Communicate with your clinics directly through the platform")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex h-[calc(100%-5rem)]">
          {/* Conversations list */}
          <div className="w-full md:w-1/3 border-r h-full flex flex-col">
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  placeholder={t("portal.messages.search", "Search conversations...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs 
              defaultValue="all" 
              className="w-full"
              value={activeFilter}
              onValueChange={(value) => setActiveFilter(value as 'all' | 'unread' | 'active')}
            >
              <div className="px-4 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">{t("portal.messages.all", "All")}</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">{t("portal.messages.unread", "Unread")}</TabsTrigger>
                  <TabsTrigger value="active" className="flex-1">{t("portal.messages.active", "Active")}</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="divide-y">
                    {loading ? (
                      // Loading placeholder
                      <div className="flex items-center justify-center p-8">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            {t("portal.messages.loading_conversations", "Loading conversations...")}
                          </p>
                        </div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      // Empty state
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="font-medium">
                          {searchQuery 
                            ? t("portal.messages.no_search_results", "No conversations found")
                            : t("portal.messages.no_conversations", "No conversations yet")}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          {searchQuery 
                            ? t("portal.messages.try_different_search", "Try a different search term")
                            : t("portal.messages.create_booking", "Book a treatment to start messaging clinics")}
                        </p>
                      </div>
                    ) : (
                      // List of conversations
                      filteredConversations.map((conversation) => (
                        <div
                          key={conversation.bookingId}
                          className={`flex items-center p-4 hover:bg-muted cursor-pointer ${
                            activeBookingId === conversation.bookingId ? "bg-muted" : ""
                          }`}
                          onClick={() => setActiveBookingId(conversation.bookingId)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              {conversation.clinicAvatar ? (
                                <AvatarImage src={conversation.clinicAvatar} alt={conversation.clinicName} />
                              ) : (
                                <AvatarFallback>
                                  {conversation.clinicName.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="grid gap-1">
                              <div className="flex items-center">
                                <span className="font-medium text-sm">
                                  {conversation.clinicName}
                                </span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {conversation.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground truncate w-[140px]">
                                {conversation.lastMessage}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageTime)}
                              </div>
                            </div>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="unread" className="mt-0">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="divide-y">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            {t("portal.messages.loading_conversations", "Loading conversations...")}
                          </p>
                        </div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="font-medium">
                          {t("portal.messages.no_unread", "No unread messages")}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("portal.messages.all_caught_up", "You're all caught up!")}
                        </p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <div
                          key={conversation.bookingId}
                          className={`flex items-center p-4 hover:bg-muted cursor-pointer ${
                            activeBookingId === conversation.bookingId ? "bg-muted" : ""
                          }`}
                          onClick={() => setActiveBookingId(conversation.bookingId)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              {conversation.clinicAvatar ? (
                                <AvatarImage src={conversation.clinicAvatar} alt={conversation.clinicName} />
                              ) : (
                                <AvatarFallback>
                                  {conversation.clinicName.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="grid gap-1">
                              <div className="flex items-center">
                                <span className="font-medium text-sm">
                                  {conversation.clinicName}
                                </span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {conversation.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground truncate w-[140px]">
                                {conversation.lastMessage}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageTime)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="default" className="ml-auto">
                            {conversation.unreadCount}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="active" className="mt-0">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="divide-y">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            {t("portal.messages.loading_conversations", "Loading conversations...")}
                          </p>
                        </div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="font-medium">
                          {t("portal.messages.no_active", "No active conversations")}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("portal.messages.no_active_bookings", "You don't have any active bookings with ongoing conversations")}
                        </p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <div
                          key={conversation.bookingId}
                          className={`flex items-center p-4 hover:bg-muted cursor-pointer ${
                            activeBookingId === conversation.bookingId ? "bg-muted" : ""
                          }`}
                          onClick={() => setActiveBookingId(conversation.bookingId)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              {conversation.clinicAvatar ? (
                                <AvatarImage src={conversation.clinicAvatar} alt={conversation.clinicName} />
                              ) : (
                                <AvatarFallback>
                                  {conversation.clinicName.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="grid gap-1">
                              <div className="flex items-center">
                                <span className="font-medium text-sm">
                                  {conversation.clinicName}
                                </span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {conversation.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground truncate w-[140px]">
                                {conversation.lastMessage}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageTime)}
                              </div>
                            </div>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Messages panel */}
          <div className="hidden md:flex flex-col flex-1">
            {!activeBookingId || !selectedBooking ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {t("portal.messages.select_conversation", "Select a conversation")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t("portal.messages.intro", "Choose a clinic conversation from the list to view messages")}
                </p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      {selectedBooking.clinic.avatar ? (
                        <AvatarImage src={selectedBooking.clinic.avatar} alt={selectedBooking.clinic.name} />
                      ) : (
                        <AvatarFallback>
                          {selectedBooking.clinic.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedBooking.clinic.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedBooking.treatmentType} - {selectedBooking.reference}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{selectedBooking.status}</Badge>
                </div>
                
                {/* Messages display */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {loadingMessages ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="font-medium">
                        {t("portal.messages.no_messages", "No messages yet")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("portal.messages.start_conversation", "Send a message to start the conversation")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender !== 'patient' && (
                            <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                              {message.senderAvatar ? (
                                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                              ) : (
                                <AvatarFallback>
                                  {message.senderName.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender === 'patient'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.sender !== 'patient' && (
                              <div className="text-xs font-medium mb-1">
                                {message.senderName}
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.hasAttachment && message.attachmentId && (
                              <div className="mt-2 p-2 bg-background/50 rounded flex items-center">
                                <PaperclipIcon className="h-4 w-4 mr-2" />
                                <span className="text-xs">Attachment</span>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="ml-2 h-auto p-0 text-xs"
                                  onClick={() => window.open(`/api/files/${message.attachmentId}`, '_blank')}
                                >
                                  View
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.sender === 'patient' && (
                                <CheckCircle className={`h-3 w-3 ${
                                  message.isRead ? 'text-green-500' : 'text-muted-foreground/50'
                                }`} />
                              )}
                            </div>
                          </div>
                          {message.sender === 'patient' && (
                            <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                              <AvatarFallback>You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <PaperclipIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder={t("portal.messages.type_message", "Type your message...")}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      className="flex-shrink-0"
                    >
                      <SendIcon className="h-4 w-4 mr-2" />
                      {t("portal.messages.send", "Send")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Mobile View - Message Content */}
          {activeBookingId && selectedBooking && (
            <div className="w-full flex flex-col md:hidden">
              <div className="px-4 py-3 border-b flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="mr-2"
                  onClick={() => setActiveBookingId(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8 mr-2">
                  {selectedBooking.clinic.avatar ? (
                    <AvatarImage src={selectedBooking.clinic.avatar} alt={selectedBooking.clinic.name} />
                  ) : (
                    <AvatarFallback>
                      {selectedBooking.clinic.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{selectedBooking.clinic.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedBooking.treatmentType}</div>
                </div>
              </div>
              
              {/* Mobile Messages */}
              <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
                {loadingMessages ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t("portal.messages.no_messages", "No messages yet")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender !== 'patient' && (
                          <Avatar className="h-6 w-6 mr-1 mt-1 flex-shrink-0">
                            {message.senderAvatar ? (
                              <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                            ) : (
                              <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-2 ${
                            message.sender === 'patient'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.hasAttachment && message.attachmentId && (
                            <div className="mt-1 p-1 bg-background/50 rounded flex items-center">
                              <PaperclipIcon className="h-3 w-3 mr-1" />
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-xs"
                                onClick={() => window.open(`/api/files/${message.attachmentId}`, '_blank')}
                              >
                                View
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center justify-end mt-1">
                            <span className="text-[10px] opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sender === 'patient' && (
                              <CheckCircle className={`h-3 w-3 ml-1 ${
                                message.isRead ? 'text-green-500' : 'text-muted-foreground/50'
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {/* Mobile Message Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-shrink-0 h-9 w-9">
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder={t("portal.messages.type_message", "Type your message...")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 h-9"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    size="icon"
                    className="flex-shrink-0 h-9 w-9"
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesSection;