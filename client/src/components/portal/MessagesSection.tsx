import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MessageCircle, 
  Send as SendIcon,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { apiRequest } from '@/lib/queryClient';

// Define component interfaces
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

// Main component
const MessagesSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { markAsRead, notifications } = useNotifications();
  
  // Local state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'active'>('all');
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  
  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Fetch messages when active booking changes
  useEffect(() => {
    if (activeBookingId) {
      fetchMessages(activeBookingId);
    } else {
      setMessages([]);
      setSelectedBooking(null);
    }
  }, [activeBookingId]);
  
  // Find and mark message notifications as read
  const markMessageNotificationsAsRead = (bookingId: number) => {
    // Find all message notifications related to this booking
    const messageNotifications = notifications.filter(notification => 
      notification.type === 'message' &&
      notification.metadata?.bookingId === bookingId &&
      !notification.read
    );
    
    // Mark each one as read
    messageNotifications.forEach(notification => {
      console.log(`Marking notification ${notification.id} as read`);
      markAsRead(notification.id);
    });
    
    if (messageNotifications.length > 0) {
      console.log(`Marked ${messageNotifications.length} message notifications as read for booking ${bookingId}`);
    }
  };
  
  // Fetch all conversations for the current user
  const fetchConversations = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/messages/patient/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
        
        // If we have conversations but no active one selected, select the first one
        if (data.conversations.length > 0 && !activeBookingId) {
          setActiveBookingId(data.conversations[0].bookingId);
        }
      } else {
        console.error('Failed to fetch conversations:', data.message);
        toast({
          title: t("portal.messages.error", "Error"),
          description: t("portal.messages.conversations_error", "Failed to load conversations. Please try again."),
          variant: "destructive"
        });
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
  
  // Fetch messages for a specific booking
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
        
        // Try to mark message notifications as read
        markMessageNotificationsAsRead(bookingId);
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
  
  // Create test conversation for testing the messaging functionality
  const createTestConversation = async () => {
    setIsCreatingTest(true);
    
    try {
      // First create a test booking
      const bookingResponse = await apiRequest('POST', '/api/test/create-test-booking', {
        patientEmail: 'patient@mydentalfly.com',
        clinicEmail: 'clinic@mydentalfly.com'
      });
      
      const bookingData = await bookingResponse.json();
      
      if (!bookingData.success && !bookingData.message?.includes('Existing booking found')) {
        throw new Error(bookingData.message || 'Failed to create test booking');
      }
      
      const bookingId = bookingData.booking?.id;
      
      if (!bookingId) {
        throw new Error('No booking ID returned from test booking creation');
      }
      
      // Now create test messages for this booking
      const messagesResponse = await apiRequest('POST', '/api/test/create-test-messages', {
        bookingId
      });
      
      const messagesData = await messagesResponse.json();
      
      if (!messagesData.success) {
        throw new Error(messagesData.message || 'Failed to create test messages');
      }
      
      toast({
        title: "Test Conversation Created",
        description: `Created a test conversation with ${messagesData.messageCount} messages for you to try out the messaging feature.`,
        variant: "default"
      });
      
      // Refresh the conversations list
      await fetchConversations();
      
    } catch (error) {
      console.error('Error creating test conversation:', error);
      toast({
        title: "Error Creating Test Conversation",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTest(false);
    }
  };
  
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
                        
                        {/* Add a test messages button when no conversations available */}
                        {!searchQuery && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2" 
                            onClick={createTestConversation}
                            disabled={isCreatingTest}
                          >
                            {isCreatingTest ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating Test Conversation...
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-4 w-4" />
                                Create Test Conversation
                              </>
                            )}
                          </Button>
                        )}
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
                          {t("portal.messages.no_unread", "No unread conversations")}
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
                          {t("portal.messages.no_active_desc", "You don't have any ongoing treatment conversations")}
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
          
          {/* Message content area */}
          {activeBookingId ? (
            <div className="hidden md:flex w-2/3 flex-col h-full">
              {/* Booking info header */}
              {selectedBooking ? (
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                      <h3 className="font-medium text-sm">
                        {selectedBooking.clinic.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t("portal.messages.booking", "Booking")}: {selectedBooking.reference}</span>
                        <span>•</span>
                        <span>{selectedBooking.treatmentType}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    selectedBooking.status === 'active' || selectedBooking.status === 'upcoming' ? 'default' :
                    selectedBooking.status === 'completed' ? 'success' : 'secondary'
                  }>{selectedBooking.status}</Badge>
                </div>
              ) : loadingMessages ? (
                <div className="p-4 border-b h-[72px] flex items-center">
                  <div className="animate-pulse w-48 h-5 bg-muted rounded"></div>
                </div>
              ) : null}
              
              {/* Messages area */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      {t("portal.messages.loading_messages", "Loading messages...")}
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="font-medium">
                      {t("portal.messages.no_messages", "No messages yet")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      {t("portal.messages.start_conversation", "Start the conversation by sending a message to the clinic.")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOutgoing = message.sender === 'patient';
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start gap-2 max-w-[80%] ${isOutgoing ? 'flex-row-reverse' : ''}`}>
                            {!isOutgoing && (
                              <Avatar className="h-8 w-8 mt-1">
                                {message.senderAvatar ? (
                                  <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                                ) : (
                                  <AvatarFallback>
                                    {message.senderName.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                            <div>
                              <div className={`px-4 py-2 rounded-lg ${
                                isOutgoing 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {message.content}
                              </div>
                              <div className={`text-xs text-muted-foreground mt-1 ${isOutgoing ? 'text-right' : ''}`}>
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
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
          ) : (
            <div className="hidden md:flex w-2/3 items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium">
                  {t("portal.messages.select_conversation", "Select a conversation")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {t("portal.messages.select_to_view", "Choose a conversation from the list to view messages")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesSection;