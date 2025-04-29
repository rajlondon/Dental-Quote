import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, Send, Paperclip, User, Phone, Calendar, 
  Video, MoreVertical, Image, FileText, ArrowRight,
  CheckCircle2, Languages, Globe, MessageSquare 
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  bookingId: number;
  bookingReference: string;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientAvatar: string | null;
  status: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  treatmentType: string;
}

interface Message {
  id: number;
  bookingId: number;
  content: string;
  sender: 'clinic' | 'patient';
  senderName: string;
  senderAvatar: string | null;
  timestamp: Date;
  isRead: boolean;
  messageType: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

interface BookingDetails {
  id: number;
  reference: string;
  status: string;
  treatmentType: string;
  patient: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
}

const ClinicMessagesSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState<string>('');
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  useEffect(() => {
    // Fetch conversations on component mount
    fetchConversations();
  }, []);
  
  useEffect(() => {
    // Fetch messages when a conversation is selected
    if (selectedBookingId) {
      fetchMessages(selectedBookingId);
    }
  }, [selectedBookingId]);
  
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages/clinic/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
        
        // If we have conversations and none selected, select the first one
        if (data.conversations.length > 0 && !selectedBookingId) {
          setSelectedBookingId(data.conversations[0].bookingId);
        }
      } else {
        console.error('Failed to fetch conversations:', data.message);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: t("clinic.messages.error", "Error"),
        description: t("clinic.messages.conversations_error", "Failed to load conversations. Please try again."),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (bookingId: number) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages/clinic/booking/${bookingId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setSelectedBooking(data.booking);
        
        // After fetching messages, fetch conversations again to update unread counts
        fetchConversations();
      } else {
        console.error('Failed to fetch messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: t("clinic.messages.error", "Error"),
        description: t("clinic.messages.messages_error", "Failed to load messages. Please try again."),
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Message status indicators
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800"
  };

  // Simulated translation function 
  // In a real app, this would be an API call to a translation service
  const translateText = (text: string, targetLang: string): string => {
    // This is a demo function that simulates translation for demonstration purposes
    if (targetLang === 'tr') {
      // Sample English to Turkish translations for demo
      const translations: Record<string, string> = {
        "Hello, I have some questions about my upcoming treatment.": 
          "Merhaba, yaklaşan tedavim hakkında bazı sorularım var.",
        "Hello James, of course! How can I help you today?": 
          "Merhaba James, tabii ki! Bugün size nasıl yardımcı olabilirim?",
        "When should I arrive for my appointment? And is there anything I should bring with me?": 
          "Randevum için ne zaman gelmeliyim? Ve yanımda getirmem gereken bir şey var mı?",
        "We recommend arriving 15 minutes early to complete any paperwork. Please bring your passport or ID, and any medical records or x-rays related to your dental history if you have them. If you've already sent us your x-rays, you don't need to bring them again.": 
          "Evrak işlemlerini tamamlamak için 15 dakika erken gelmenizi öneririz. Lütfen pasaportunuzu veya kimliğinizi ve diş geçmişinizle ilgili tıbbi kayıtlarınızı veya röntgenlerinizi varsa getirin. Röntgenlerinizi zaten bize gönderdiyseniz, tekrar getirmenize gerek yok.",
        "When should I arrive for my appointment?": 
          "Randevum için ne zaman gelmeliyim?",
        "Thank you for your message. Our support team will get back to you as soon as possible, usually within 2 hours during business hours.":
          "Mesajınız için teşekkürler. Destek ekibimiz en kısa sürede, genellikle mesai saatleri içinde 2 saat içinde size geri dönecektir."
      };

      return translations[text] || "Çeviri mevcut değil. (Translation not available)";
    } else {
      // Turkish to English translations
      const translations: Record<string, string> = {
        "Merhaba, yaklaşan tedavim hakkında bazı sorularım var.": 
          "Hello, I have some questions about my upcoming treatment.",
        "Merhaba James, tabii ki! Bugün size nasıl yardımcı olabilirim?": 
          "Hello James, of course! How can I help you today?",
        "Randevum için ne zaman gelmeliyim? Ve yanımda getirmem gereken bir şey var mı?": 
          "When should I arrive for my appointment? And is there anything I should bring with me?",
        "Evrak işlemlerini tamamlamak için 15 dakika erken gelmenizi öneririz. Lütfen pasaportunuzu veya kimliğinizi ve diş geçmişinizle ilgili tıbbi kayıtlarınızı veya röntgenlerinizi varsa getirin. Röntgenlerinizi zaten bize gönderdiyseniz, tekrar getirmenize gerek yok.": 
          "We recommend arriving 15 minutes early to complete any paperwork. Please bring your passport or ID, and any medical records or x-rays related to your dental history if you have them. If you've already sent us your x-rays, you don't need to bring them again.",
        "Randevum için ne zaman gelmeliyim?": 
          "When should I arrive for my appointment?",
        "Mesajınız için teşekkürler. Destek ekibimiz en kısa sürede, genellikle mesai saatleri içinde 2 saat içinde size geri dönecektir.":
          "Thank you for your message. Our support team will get back to you as soon as possible, usually within 2 hours during business hours."
      };

      return translations[text] || "Translation not available. (Çeviri mevcut değil.)";
    }
  };

  // Effect to load translations when messages change or language changes
  useEffect(() => {
    if (autoTranslate && i18n.language) {
      const newTranslations: Record<string, string> = {};
      
      messages.forEach(message => {
        const translateTo = i18n.language === 'en' ? 'tr' : 'en';
        const translatedText = translateText(message.content, translateTo);
        newTranslations[message.id] = translatedText;
      });
      
      setTranslatedMessages(newTranslations);
    }
  }, [messages, i18n.language, autoTranslate]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedBookingId) return;
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          content: messageText,
          messageType: 'text'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success toast
        toast({
          title: t("clinic.messages.message_sent", "Message Sent"),
          description: t("clinic.messages.successfully_sent", "Your message has been sent to the patient."),
        });
        
        // Clear the input field
        setMessageText('');
        
        // Refresh messages to show the new message
        fetchMessages(selectedBookingId);
      } else {
        toast({
          title: t("clinic.messages.send_error", "Send Error"),
          description: data.message || t("clinic.messages.failed_to_send", "Failed to send message. Please try again."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t("clinic.messages.send_error", "Send Error"),
        description: t("clinic.messages.failed_to_send", "Failed to send message. Please try again."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="h-[calc(100vh-13rem)]">
        <CardHeader className="pb-4">
          <CardTitle>{t("clinic.messages.title", "Messages")}</CardTitle>
          <CardDescription>
            {t("clinic.messages.description", "Communicate with your patients directly through the platform")}
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
                  placeholder={t("clinic.messages.search", "Search conversations...")} 
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <div className="px-4 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">{t("clinic.messages.all", "All")}</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">{t("clinic.messages.unread", "Unread")}</TabsTrigger>
                  <TabsTrigger value="active" className="flex-1">{t("clinic.messages.active", "Active")}</TabsTrigger>
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
                            {t("clinic.messages.loading_conversations", "Loading conversations...")}
                          </p>
                        </div>
                      </div>
                    ) : conversations.length === 0 ? (
                      // Empty state
                      <div className="flex items-center justify-center p-8">
                        <div className="flex flex-col items-center text-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                          <h3 className="font-medium mb-1">
                            {t("clinic.messages.no_conversations", "No conversations")}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("clinic.messages.no_conversations_desc", "You don't have any message threads yet. Create a test message to see how it works.")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Conversations list
                      conversations.map((conversation) => (
                        <div 
                          key={conversation.bookingId} 
                          onClick={() => setSelectedBookingId(conversation.bookingId)}
                          className={`px-4 py-3 flex items-start space-x-3 hover:bg-muted/50 cursor-pointer transition ${
                            selectedBookingId === conversation.bookingId ? "bg-muted/50" : ""
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.patientAvatar || ""} alt={conversation.patientName} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {conversation.patientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="truncate font-medium">{conversation.patientName}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="px-1 h-5 text-xs font-normal">
                                {conversation.treatmentType}
                              </Badge>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                statusColors[conversation.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                              }`}>
                                {conversation.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
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
                            {t("clinic.messages.loading_conversations", "Loading conversations...")}
                          </p>
                        </div>
                      </div>
                    ) : conversations.filter(conv => conv.unreadCount > 0).length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-center p-4">
                        <div>
                          <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="font-medium mb-1">{t("clinic.messages.all_caught_up", "All Caught Up!")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t("clinic.messages.no_unread", "You have no unread messages")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      conversations
                        .filter(conv => conv.unreadCount > 0)
                        .map((conversation) => (
                          <div 
                            key={conversation.bookingId} 
                            onClick={() => setSelectedBookingId(conversation.bookingId)}
                            className={`px-4 py-3 flex items-start space-x-3 hover:bg-muted/50 cursor-pointer transition ${
                              selectedBookingId === conversation.bookingId ? "bg-muted/50" : ""
                            }`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.patientAvatar || ""} alt={conversation.patientName} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {conversation.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="truncate font-medium">{conversation.patientName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="px-1 h-5 text-xs font-normal">
                                  {conversation.treatmentType}
                                </Badge>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  statusColors[conversation.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                                }`}>
                                  {conversation.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </p>
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                  {conversation.unreadCount}
                                </span>
                              </div>
                            </div>
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
                            {t("clinic.messages.loading_conversations", "Loading conversations...")}
                          </p>
                        </div>
                      </div>
                    ) : conversations.filter(conv => conv.status === 'active').length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-center p-4">
                        <div>
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="font-medium mb-1">{t("clinic.messages.no_active", "No Active Conversations")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t("clinic.messages.no_active_desc", "You don't have any active conversations at the moment")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      conversations
                        .filter(conv => conv.status === 'active')
                        .map((conversation) => (
                          <div 
                            key={conversation.bookingId} 
                            onClick={() => setSelectedBookingId(conversation.bookingId)}
                            className={`px-4 py-3 flex items-start space-x-3 hover:bg-muted/50 cursor-pointer transition ${
                              selectedBookingId === conversation.bookingId ? "bg-muted/50" : ""
                            }`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.patientAvatar || ""} alt={conversation.patientName} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {conversation.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="truncate font-medium">{conversation.patientName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="px-1 h-5 text-xs font-normal">
                                  {conversation.treatmentType}
                                </Badge>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                  {conversation.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Message thread */}
          <div className={`hidden md:flex md:w-2/3 flex-col h-full ${selectedBookingId ? 'flex' : 'hidden'}`}>
            {selectedBooking && (
              <>
                {/* Chat header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedBooking.patient.avatar || ""} alt={selectedBooking.patient.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedBooking.patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedBooking.patient.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {selectedBooking.reference}
                        </span>
                        <span className="flex items-center gap-1">
                          <Badge variant="outline" className="px-1 h-5 text-xs font-normal">
                            {selectedBooking.treatmentType || 'Dental Treatment'}
                          </Badge>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title={t("clinic.messages.call", "Call Patient")}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={t("clinic.messages.patient_details", "Patient Details")}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={t("clinic.messages.more", "More Options")}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Translation toggle */}
                <div className="flex justify-end items-center px-4 py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-translate" className="text-sm">
                      {t("clinic.messages.auto_translate", "Auto-Translate Messages")}
                    </Label>
                    <Switch
                      id="auto-translate"
                      checked={autoTranslate}
                      onCheckedChange={setAutoTranslate}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Languages className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("clinic.messages.translation_tooltip", "When enabled, messages are automatically translated between English and Turkish.")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          {t("clinic.messages.loading_messages", "Loading messages...")}
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-1">
                          {t("clinic.messages.no_messages", "No messages yet")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("clinic.messages.no_messages_desc", "Start the conversation by sending a message to this patient.")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isCurrentLanguageTurkish = i18n.language === 'tr';
                        const hasTranslation = !!translatedMessages[message.id];
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sender === 'clinic' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                message.sender === 'clinic' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              {/* Message content */}
                              <p>{message.content}</p>
                              
                              {/* Translation section shown when autoTranslate is on */}
                              {autoTranslate && hasTranslation && (
                                <>
                                  <Separator className="my-2 opacity-30" />
                                  <div className="flex items-center gap-1 text-xs mb-1 opacity-70">
                                    <Globe className="h-3 w-3" />
                                    {isCurrentLanguageTurkish 
                                      ? t("clinic.messages.english_translation", "English Translation:") 
                                      : t("clinic.messages.turkish_translation", "Turkish Translation:")}
                                  </div>
                                  <p className="text-sm opacity-90">{translatedMessages[message.id]}</p>
                                </>
                              )}
                              
                              <div 
                                className={`text-xs mt-1 flex justify-end ${
                                  message.sender === 'clinic' 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}
                                {message.sender === 'clinic' && (
                                  <span className="ml-1">
                                    {message.isRead ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message input */}
                <div className="p-4 border-t mt-auto">
                  <div className="flex gap-2">
                    <Textarea 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={t("clinic.messages.type_message", "Type a message...")}
                      className="min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title={t("clinic.messages.attach", "Attach File")}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || !selectedBookingId}
                        title={t("clinic.messages.send", "Send Message")}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <FileText className="h-3 w-3 mr-1" />
                        {t("clinic.messages.documents", "Documents")}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Image className="h-3 w-3 mr-1" />
                        {t("clinic.messages.gallery", "Gallery")}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {t("clinic.messages.secure_messaging", "End-to-end encrypted messaging")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Empty state */}
          <div className={`md:w-2/3 flex-col items-center justify-center text-center p-8 ${!selectedBookingId ? 'md:flex' : 'hidden'}`}>
            <div className="max-w-md">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">{t("clinic.messages.select_convo", "Select a Conversation")}</h3>
              <p className="text-muted-foreground">
                {t("clinic.messages.select_convo_desc", "Choose a patient conversation from the list to view messages")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicMessagesSection;