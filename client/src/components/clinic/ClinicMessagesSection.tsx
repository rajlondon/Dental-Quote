import React, { useState } from 'react';
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
  CheckCircle2 
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ClinicMessagesSection: React.FC = () => {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState<string>('');
  
  // Sample conversations data - in a real app, this would come from an API
  const conversations = [
    {
      id: "conv1",
      patientName: "James Wilson",
      patientId: "P-2025-041",
      lastMessage: "When should I arrive for my appointment?",
      unread: 2,
      time: "10:45 AM",
      avatar: null,
      status: "upcoming", // upcoming, active, completed
      treatmentType: "Dental Implants"
    },
    {
      id: "conv2",
      patientName: "Sarah Johnson",
      patientId: "P-2025-039",
      lastMessage: "Do I need to bring anything with me?",
      unread: 0,
      time: "Yesterday",
      avatar: null,
      status: "active",
      treatmentType: "Veneers"
    },
    {
      id: "conv3",
      patientName: "Michael Brown",
      patientId: "P-2025-037",
      lastMessage: "Thank you for the treatment plan!",
      unread: 0,
      time: "Apr 10",
      avatar: null,
      status: "upcoming",
      treatmentType: "Full Mouth Restoration"
    },
    {
      id: "conv4",
      patientName: "Emma Davis",
      patientId: "P-2025-035",
      lastMessage: "I'll see you tomorrow at the clinic.",
      unread: 0,
      time: "Apr 5",
      avatar: null,
      status: "active",
      treatmentType: "Root Canal"
    },
    {
      id: "conv5",
      patientName: "Robert Taylor",
      patientId: "P-2025-033",
      lastMessage: "Your aftercare has been excellent, thank you.",
      unread: 0,
      time: "Mar 28",
      avatar: null,
      status: "completed",
      treatmentType: "Dental Implants"
    }
  ];

  // Sample messages for the currently selected conversation
  const messages = [
    {
      id: "msg1",
      sender: "patient",
      text: "Hello, I have some questions about my upcoming treatment.",
      time: "10:30 AM",
      read: true
    },
    {
      id: "msg2",
      sender: "clinic",
      text: "Hello James, of course! How can I help you today?",
      time: "10:32 AM",
      read: true
    },
    {
      id: "msg3",
      sender: "patient",
      text: "When should I arrive for my appointment? And is there anything I should bring with me?",
      time: "10:35 AM",
      read: true
    },
    {
      id: "msg4",
      sender: "clinic",
      text: "We recommend arriving 15 minutes early to complete any paperwork. Please bring your passport or ID, and any medical records or x-rays related to your dental history if you have them. If you've already sent us your x-rays, you don't need to bring them again.",
      time: "10:40 AM",
      read: true
    },
    {
      id: "msg5",
      sender: "patient",
      text: "When should I arrive for my appointment?",
      time: "10:45 AM",
      read: false
    }
  ];

  // Message status indicators
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800"
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would add the message to the conversation
      console.log("Sending message:", messageText);
      setMessageText('');
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
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.id} 
                        className={`px-4 py-3 flex items-start space-x-3 hover:bg-muted/50 cursor-pointer transition ${
                          conversation.id === "conv1" ? "bg-muted/50" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar || ""} alt={conversation.patientName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {conversation.patientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="truncate font-medium">{conversation.patientName}</div>
                            <div className="text-xs text-muted-foreground">{conversation.time}</div>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="px-1 h-5 text-xs font-normal">
                              {conversation.treatmentType}
                            </Badge>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              statusColors[conversation.status as keyof typeof statusColors]
                            }`}>
                              {conversation.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread > 0 && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="unread" className="mt-0">
                <div className="flex items-center justify-center h-64 text-center p-4">
                  <div>
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-1">{t("clinic.messages.all_caught_up", "All Caught Up!")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("clinic.messages.no_unread", "You have no unread messages")}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="mt-0">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="divide-y">
                    {conversations
                      .filter(conv => conv.status === "active")
                      .map((conversation) => (
                        <div 
                          key={conversation.id} 
                          className="px-4 py-3 flex items-start space-x-3 hover:bg-muted/50 cursor-pointer transition"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar || ""} alt={conversation.patientName} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {conversation.patientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="truncate font-medium">{conversation.patientName}</div>
                              <div className="text-xs text-muted-foreground">{conversation.time}</div>
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
                              {conversation.unread > 0 && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                  {conversation.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Message thread */}
          <div className="hidden md:flex md:w-2/3 flex-col h-full">
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="James Wilson" />
                  <AvatarFallback className="bg-primary/10 text-primary">JW</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">James Wilson</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      P-2025-041
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Apr 15, 2025
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" title={t("clinic.messages.call", "Call Patient")}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title={t("clinic.messages.video", "Video Call")}>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title={t("clinic.messages.patient_details", "Patient Details")}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title={t("clinic.messages.more", "More Options")}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
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
                      <p>{message.text}</p>
                      <div 
                        className={`text-xs mt-1 flex justify-end ${
                          message.sender === 'clinic' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <Textarea 
                  placeholder={t("clinic.messages.type_message", "Type your message...")}
                  className="min-h-[80px]"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="icon" title={t("clinic.messages.attach", "Attach file")}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="bg-primary" 
                    size="icon"
                    onClick={handleSendMessage}
                    title={t("clinic.messages.send", "Send message")}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  {t("clinic.messages.image", "Image")}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {t("clinic.messages.document", "Document")}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Empty state for mobile (message not selected) */}
          <div className="md:hidden w-full flex items-center justify-center">
            <div className="text-center p-8">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="font-medium text-lg mb-2">
                {t("clinic.messages.select_convo", "Select a Conversation")}
              </h3>
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