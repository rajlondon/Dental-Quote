import React, { useState, useRef, useEffect } from 'react';
// Removed react-i18next
import { 
  Send, 
  User, 
  Clock, 
  Paperclip, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Mail, 
  HelpCircle,
  HeadphonesIcon,
  ImageIcon,
  FileIcon,
  AlertCircle,
  Globe,
  Languages
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  read: boolean;
  attachments?: {
    id: string;
    name: string;
    type: 'image' | 'document';
  }[];
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'waiting';
  lastActivity: string;
  messages: Message[];
  category: string;
}

// Mock data for support tickets
const mockSupportTickets: SupportTicket[] = [
  {
    id: "1",
    subject: "Question about treatment plan",
    status: "open",
    lastActivity: "2025-04-14T15:30:00",
    category: "Treatment",
    messages: [
      {
        id: "1a",
        text: "Hi, I have a question about my treatment plan. It shows dental implants but I'm not sure if this includes the crown as well?",
        sender: "user",
        timestamp: "2025-04-14T15:30:00",
        read: true
      },
      {
        id: "1b",
        text: "Hello! Thank you for reaching out. Yes, the dental implant treatment includes both the implant fixture and the crown. The pricing shown in your treatment plan covers both components. Is there anything else you'd like to know about your treatment?",
        sender: "support",
        timestamp: "2025-04-14T16:05:00",
        read: true
      },
      {
        id: "1c",
        text: "That's great to know, thanks! One more question - how long is the healing time between placing the implant and getting the crown?",
        sender: "user",
        timestamp: "2025-04-14T16:15:00",
        read: true
      }
    ]
  },
  {
    id: "2",
    subject: "Help with deposit payment",
    status: "waiting",
    lastActivity: "2025-04-13T11:20:00",
    category: "Payment",
    messages: [
      {
        id: "2a",
        text: "I'm trying to pay my deposit but getting an error with my credit card. Can you help?",
        sender: "user",
        timestamp: "2025-04-13T11:20:00",
        read: true
      },
      {
        id: "2b",
        text: "I'm sorry to hear you're having trouble with the payment. Could you please provide more details about the error message you're seeing? Also, have you tried using a different card or payment method?",
        sender: "support",
        timestamp: "2025-04-13T11:45:00",
        read: true
      },
      {
        id: "2c",
        text: "It says 'Payment declined by issuer'. I'll try with another card and let you know.",
        sender: "user",
        timestamp: "2025-04-13T12:00:00",
        read: true,
        attachments: [
          {
            id: "att-1",
            name: "error-screenshot.jpg",
            type: "image"
          }
        ]
      }
    ]
  },
  {
    id: "3",
    subject: "Appointment rescheduling",
    status: "closed",
    lastActivity: "2025-04-10T09:15:00",
    category: "Appointments",
    messages: [
      {
        id: "3a",
        text: "Due to a change in my flight schedule, I need to reschedule my appointment on May 12th. Is that possible?",
        sender: "user",
        timestamp: "2025-04-10T09:15:00",
        read: true
      },
      {
        id: "3b",
        text: "Of course, we understand that travel plans can change. We have availability on May 14th or May 15th. Would either of those dates work for you?",
        sender: "support",
        timestamp: "2025-04-10T09:30:00",
        read: true
      },
      {
        id: "3c",
        text: "May 15th would be perfect. Thank you!",
        sender: "user",
        timestamp: "2025-04-10T09:45:00",
        read: true
      },
      {
        id: "3d",
        text: "Great! I've rescheduled your appointment for May 15th at 10:00 AM. You'll receive an email confirmation shortly, and your portal calendar has been updated. Is there anything else you need help with?",
        sender: "support",
        timestamp: "2025-04-10T10:00:00",
        read: true
      },
      {
        id: "3e",
        text: "That's all, thank you for your help!",
        sender: "user",
        timestamp: "2025-04-10T10:10:00",
        read: true
      }
    ]
  }
];

// Emergency contact information
const emergencyContacts = [
  {
    name: "24/7 Patient Support",
    phone: "+44 20 1234 5678",
    email: "support@mydentalfly.com"
  },
  {
    name: "Istanbul Clinic",
    phone: "+90 216 123 4567",
    email: "istanbul@mydentalfly.com"
  }
];

// FAQ items
const faqItems = [
  {
    question: "What should I do if I need to cancel my appointment?",
    answer: "You can cancel or reschedule your appointment through the Appointments section of your portal. Please note that cancellations made less than 48 hours before your appointment may incur a fee. If you're having trouble, please contact our support team."
  },
  {
    question: "How do I pay my deposit?",
    answer: "You can pay your deposit through your Treatment Plan section after approving your plan. We accept all major credit cards, and your payment information is securely processed through Stripe."
  },
  {
    question: "What happens if I experience a dental emergency while traveling?",
    answer: "If you experience a dental emergency while traveling, please contact our 24/7 emergency support line immediately at +44 20 1234 5678. We'll arrange urgent care with our partner clinics."
  },
  {
    question: "Can I get a refund if I need to cancel my treatment?",
    answer: "Deposit refunds depend on when you cancel. Cancellations made 14+ days before your appointment receive a full refund. Cancellations 7-13 days before receive a 50% refund. Cancellations less than 7 days before are non-refundable. Please refer to our refund policy in your deposit agreement for details."
  }
];

const SupportSection: React.FC = () => {
  // Translation removed
  const { toast } = useToast();
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('General');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);
  const messageEndRef = useRef<null | HTMLDivElement>(null);
  
  // Simulated translation function 
  // In a real app, this would be an API call to a translation service
  const translateText = (text: string, targetLang: string): string => {
    // This is a demo function that simulates translation for demo purposes
    if (targetLang === 'tr') {
      // Sample English to Turkish translations for demo
      const translations: Record<string, string> = {
        "Hello! Thank you for reaching out. Yes, the dental implant treatment includes both the implant fixture and the crown. The pricing shown in your treatment plan covers both components. Is there anything else you'd like to know about your treatment?": 
          "Merhaba! İletişime geçtiğiniz için teşekkür ederiz. Evet, diş implantı tedavisi hem implant fikstürünü hem de kronunu içerir. Tedavi planınızda gösterilen fiyat her iki bileşeni de kapsar. Tedaviniz hakkında bilmek istediğiniz başka bir şey var mı?",
        "I'm sorry to hear you're having trouble with the payment. Could you please provide more details about the error message you're seeing? Also, have you tried using a different card or payment method?": 
          "Ödeme konusunda sorun yaşadığınızı duyduğuma üzüldüm. Lütfen gördüğünüz hata mesajı hakkında daha fazla ayrıntı sağlayabilir misiniz? Ayrıca, farklı bir kart veya ödeme yöntemi kullanmayı denediniz mi?",
        "Of course, we understand that travel plans can change. We have availability on May 14th or May 15th. Would either of those dates work for you?": 
          "Elbette, seyahat planlarının değişebileceğini anlıyoruz. 14 Mayıs veya 15 Mayıs'ta müsaitlik var. Bu tarihlerden herhangi biri size uygun mu?",
        "Great! I've rescheduled your appointment for May 15th at 10:00 AM. You'll receive an email confirmation shortly, and your portal calendar has been updated. Is there anything else you need help with?": 
          "Harika! Randevunuzu 15 Mayıs saat 10:00 olarak yeniden planladım. Kısa süre içinde bir e-posta onayı alacaksınız ve portal takviminiz güncellenmiştir. Başka yardıma ihtiyacınız var mı?",
        "Thank you for your message. Our support team will get back to you as soon as possible, usually within 2 hours during business hours.":
          "Mesajınız için teşekkürler. Destek ekibimiz en kısa sürede, genellikle mesai saatleri içinde 2 saat içinde size geri dönecektir.",
        "Thank you for contacting MyDentalFly support. We've received your ticket and will respond as soon as possible, typically within 2 hours during business hours.":
          "MyDentalFly desteğiyle iletişime geçtiğiniz için teşekkür ederiz. Biletinizi aldık ve mümkün olan en kısa sürede, genellikle mesai saatleri içinde 2 saat içinde yanıt vereceğiz."
      };

      return translations[text] || "Çeviri mevcut değil. (Translation not available)";
    } else {
      // Turkish to English translations would be implemented here
      // This is just a placeholder, as we're focusing on clinic-to-patient direction
      return "English translation would appear here";
    }
  };
  
  // Effect to load translations when selected ticket changes or language changes
  useEffect(() => {
    if (autoTranslate && i18n.language && selectedTicket) {
      const newTranslations: Record<string, string> = {};
      
      selectedTicket.messages.forEach(message => {
        if (message.sender === 'support') {
          // Only translate messages from support/clinic staff
          const translatedText = translateText(message.text, 'tr');
          newTranslations[message.id] = translatedText;
        }
      });
      
      setTranslatedMessages(newTranslations);
    }
  }, [selectedTicket, i18n.language, autoTranslate]);
  
  // Function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  // Function to format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);
  
  // Function to handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedTicket) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Update the selected ticket with the new message
    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      lastActivity: new Date().toISOString(),
      status: 'waiting'
    };
    
    // Update the tickets list
    setSupportTickets(supportTickets.map(ticket => 
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    ));
    
    // Update the selected ticket
    setSelectedTicket(updatedTicket);
    
    // Clear the message input
    setMessageText('');
    
    // Toast notification
    toast({
      title: "Message Sent",
      description: "Your message has been sent to our support team.",
    });
    
    // Simulate support response after delay (only in development)
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. Our support team will get back to you as soon as possible, usually within 2 hours during business hours.",
        sender: 'support',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const ticketWithResponse: SupportTicket = {
        ...updatedTicket,
        messages: [...updatedTicket.messages, supportResponse],
        lastActivity: new Date().toISOString()
      };
      
      setSupportTickets(supportTickets.map(ticket => 
        ticket.id === selectedTicket.id ? ticketWithResponse : ticket
      ));
      
      if (selectedTicket.id === ticketWithResponse.id) {
        setSelectedTicket(ticketWithResponse);
      }
    }, 3000);
  };
  
  // Function to handle creating a new ticket
  const handleCreateTicket = () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;
    
    const newTicket: SupportTicket = {
      id: (supportTickets.length + 1).toString(),
      subject: newTicketSubject,
      status: 'open',
      lastActivity: new Date().toISOString(),
      category: newTicketCategory,
      messages: [
        {
          id: Date.now().toString(),
          text: newTicketMessage,
          sender: 'user',
          timestamp: new Date().toISOString(),
          read: false
        }
      ]
    };
    
    // Add the new ticket to the list
    setSupportTickets([newTicket, ...supportTickets]);
    
    // Select the new ticket
    setSelectedTicket(newTicket);
    
    // Close the dialog
    setShowNewTicketDialog(false);
    
    // Clear the form
    setNewTicketSubject('');
    setNewTicketMessage('');
    setNewTicketCategory('General');
    
    // Toast notification
    toast({
      title: "Support Ticket Created",
      description: "Your support ticket has been created successfully.",
    });
    
    // Simulate support response after delay (only in development)
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for contacting MyDentalFly support. We've received your ticket and will respond as soon as possible, typically within 2 hours during business hours.",
        sender: 'support',
        timestamp: new Date(Date.now() + 60000).toISOString(),
        read: false
      };
      
      const updatedTickets = supportTickets.map(ticket => {
        if (ticket.id === newTicket.id) {
          return {
            ...ticket,
            messages: [...ticket.messages, supportResponse],
            lastActivity: new Date(Date.now() + 60000).toISOString(),
            status: 'open' as const
          };
        }
        return ticket;
      });
      
      setSupportTickets([newTicket, ...updatedTickets.slice(1)]);
      
      if (selectedTicket && selectedTicket.id === newTicket.id) {
        setSelectedTicket({
          ...newTicket,
          messages: [...newTicket.messages, supportResponse],
          lastActivity: new Date(Date.now() + 60000).toISOString(),
          status: 'open' as const
        });
      }
    }, 5000);
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Support & Messages</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowContactDialog(true)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Emergency Contact
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowNewTicketDialog(true)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                New Support Ticket
              </Button>
            </div>
          </div>
          <CardDescription>
            Contact our dental concierge team or view your message history
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow p-0 flex">
          {/* Tickets sidebar */}
          <div className="w-1/3 border-r overflow-auto">
            <div className="p-4 border-b bg-gray-50">
              <Input 
                placeholder="Search messages..." 
                className="w-full" 
              />
            </div>
            <ScrollArea className="h-[calc(65vh-10rem)]">
              {supportTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium truncate pr-2">{ticket.subject}</h3>
                    <Badge 
                      variant={
                        ticket.status === 'open' ? 'outline' : 
                        ticket.status === 'waiting' ? 'default' : 'secondary'
                      }
                      className={
                        ticket.status === 'open' ? 'border-green-400 text-green-700 bg-green-50' :
                        ticket.status === 'waiting' ? 'bg-blue-600' : 
                        'bg-gray-200 text-gray-700'
                      }
                    >
                      {ticket.status === 'open' ? 'Open' : 
                       ticket.status === 'waiting' ? 'Awaiting Reply' : 
                       'Closed'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-1 truncate">
                    {ticket.category}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Last activity: {formatDate(ticket.lastActivity)}</span>
                    <span>{formatTime(ticket.lastActivity)}</span>
                  </div>
                </div>
              ))}
              
              {supportTickets.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <HeadphonesIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                  <p className="mb-2">No support tickets yet</p>
                  <p className="text-sm mb-4">Create a new ticket to get help from our team</p>
                  <Button 
                    size="sm"
                    onClick={() => setShowNewTicketDialog(true)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    New Support Ticket
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Message content */}
          <div className="w-2/3 flex flex-col h-full">
            {selectedTicket ? (
              <>
                {/* Message header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="font-semibold text-lg">{selectedTicket.subject}</h2>
                    <Badge 
                      variant={
                        selectedTicket.status === 'open' ? 'outline' : 
                        selectedTicket.status === 'waiting' ? 'default' : 'secondary'
                      }
                      className={
                        selectedTicket.status === 'open' ? 'border-green-400 text-green-700 bg-green-50' :
                        selectedTicket.status === 'waiting' ? 'bg-blue-600' : 
                        'bg-gray-200 text-gray-700'
                      }
                    >
                      {selectedTicket.status === 'open' ? 'Open' : 
                       selectedTicket.status === 'waiting' ? 'Awaiting Reply' : 
                       'Closed'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-3">Category: {selectedTicket.category}</span>
                    <span>Opened: {formatDate(selectedTicket.messages[0].timestamp)}</span>
                  </div>
                </div>
                
                {/* Translation toggle */}
                <div className="flex justify-end items-center px-4 py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2 gap-1"
                      onClick={() => setAutoTranslate(!autoTranslate)}
                    >
                      <Languages className="h-3.5 w-3.5" />
                      {autoTranslate 
                        ? t("portal.messages.translations_on", "Translations: On") 
                        : t("portal.messages.translations_off", "Translations: Off")}
                    </Button>
                  </div>
                </div>
                
                {/* Message content */}
                <ScrollArea className="flex-grow p-4">
                  <div className="space-y-4">
                    {selectedTicket.messages.map(message => {
                      const hasTranslation = message.sender === 'support' && 
                                             autoTranslate && 
                                             !!translatedMessages[message.id];
                                             
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`
                              max-w-[80%] rounded-lg p-3 shadow-sm
                              ${message.sender === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-800 border'
                              }
                            `}
                          >
                            <div className="mb-1">
                              <span className="font-medium">
                                {message.sender === 'user' ? 'You' : 'MyDentalFly Support'}
                              </span>
                            </div>
                            <p>{message.text}</p>
                            
                            {/* Show translation for support messages when available */}
                            {hasTranslation && (
                              <>
                                <Separator className="my-2 opacity-70" />
                                <div className="flex items-center gap-1 text-xs mb-1 text-gray-500">
                                  <Globe className="h-3 w-3" />
                                  {t("portal.messages.turkish_translation", "Turkish Translation:")}
                                </div>
                                <p className="text-sm italic text-gray-700">{translatedMessages[message.id]}</p>
                              </>
                            )}
                          
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map(attachment => (
                                  <div 
                                    key={attachment.id} 
                                    className={`
                                      flex items-center rounded px-2 py-1
                                      ${message.sender === 'user' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-800'
                                      }
                                    `}
                                  >
                                    {attachment.type === 'image' 
                                      ? <ImageIcon className="h-4 w-4 mr-1" /> 
                                      : <FileIcon className="h-4 w-4 mr-1" />
                                    }
                                    <span className="text-sm truncate">{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Message input */}
                {selectedTicket.status !== 'closed' && (
                  <div className="p-4 border-t mt-auto">
                    <div className="flex items-center">
                      <Input 
                        placeholder="Type your message..." 
                        className="flex-grow mr-2"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        size="icon" 
                        variant="outline"
                        className="mr-2"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <HeadphonesIcon className="h-16 w-16 text-gray-300 mb-6" />
                <h2 className="text-xl font-medium text-gray-700 mb-2">Welcome to Support</h2>
                <p className="text-gray-500 mb-6 max-w-md">
                  Select a conversation from the sidebar or create a new support ticket to get help from our dental concierge team.
                </p>
                <Button
                  onClick={() => setShowNewTicketDialog(true)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  New Support Ticket
                </Button>
                
                <div className="mt-8 w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 p-4">
          <div className="w-full flex justify-between items-center text-sm text-gray-500">
            <div>
              <p>Need immediate assistance? Call our 24/7 support line: <span className="font-medium">+44 20 1234 5678</span></p>
            </div>
            <div>
              <Button 
                variant="link" 
                size="sm"
                className="text-blue-600 p-0 h-auto"
                onClick={() => setShowContactDialog(true)}
              >
                Emergency Contact Information
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* New Ticket Dialog */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
              Create New Support Ticket
            </DialogTitle>
            <DialogDescription>
              Please provide details about your question or issue
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={newTicketCategory}
                onChange={(e) => setNewTicketCategory(e.target.value)}
              >
                <option value="General">General Inquiry</option>
                <option value="Payment">Payment & Deposits</option>
                <option value="Treatment">Treatment Questions</option>
                <option value="Appointments">Appointments</option>
                <option value="Travel">Travel & Accommodation</option>
                <option value="Technical">Technical Support</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Subject
              </label>
              <Input 
                placeholder="Enter a subject for your support ticket"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[120px]"
                placeholder="Describe your question or issue in detail"
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
              />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 flex items-start">
              <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <p>Our support team typically responds within 2 hours during business hours (9 AM - 5 PM UTC).</p>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowNewTicketDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={!newTicketSubject.trim() || !newTicketMessage.trim()}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Emergency Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-red-500" />
              Emergency Contact Information
            </DialogTitle>
            <DialogDescription>
              Use these contacts for urgent assistance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 text-sm">
              <h3 className="font-medium text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                Dental Emergency?
              </h3>
              <p className="text-red-700 mb-2">
                If you're experiencing severe pain, bleeding, swelling, or injury to your teeth or gums, please contact us immediately using the numbers below.
              </p>
              <p className="text-red-700">
                Our emergency support team is available 24/7 to assist you.
              </p>
            </div>
            
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">{contact.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Non-Emergency Support</h3>
              <p className="text-sm text-gray-600 mb-3">
                For non-urgent matters, please create a support ticket and our team will respond as soon as possible.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowContactDialog(false);
                  setTimeout(() => setShowNewTicketDialog(true), 100);
                }}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Create Support Ticket
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowContactDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportSection;