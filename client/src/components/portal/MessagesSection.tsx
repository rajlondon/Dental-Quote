import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, PaperclipIcon, SendIcon, ChevronLeft, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Sample clinic data
const SAMPLE_CLINICS = [
  { 
    id: 'clinic_001', 
    name: 'Istanbul Smile Center', 
    location: 'Istanbul, Turkey', 
    avatar: '/assets/clinic1.jpg' 
  },
  { 
    id: 'clinic_002', 
    name: 'Premium Dental Istanbul', 
    location: 'Istanbul, Turkey', 
    avatar: '/assets/clinic2.jpg' 
  },
  { 
    id: 'clinic_003', 
    name: 'Dental Excellence Turkey', 
    location: 'Istanbul, Turkey', 
    avatar: '/assets/clinic3.jpg' 
  },
];

// Sample message data
const SAMPLE_MESSAGES = {
  'clinic_001': [
    { 
      id: 'm1', 
      from: 'clinic', 
      text: 'Thank you for your interest in Istanbul Smile Center. How can we help you with your dental needs?', 
      time: '2 days ago',
      read: true
    },
    { 
      id: 'm2', 
      from: 'user', 
      text: 'I\'m interested in dental implants. Can you tell me about your options?', 
      time: '1 day ago',
      read: true
    },
    { 
      id: 'm3', 
      from: 'clinic', 
      text: 'We offer several implant options. Our standard titanium implants are £695, which includes the fixture, abutment, and a temporary crown. We also offer premium options with longer warranties.', 
      time: '1 day ago',
      read: true
    },
    { 
      id: 'm4', 
      from: 'clinic', 
      text: 'Would you like to schedule a free video consultation to discuss your specific needs?', 
      time: '1 day ago',
      read: true
    }
  ],
  'clinic_002': [
    { 
      id: 'm1', 
      from: 'clinic', 
      text: 'Welcome to Premium Dental Istanbul! We specialize in high-quality dental treatments using the latest technology.', 
      time: '3 days ago',
      read: true
    },
    { 
      id: 'm2', 
      from: 'user', 
      text: 'Hi, I\'m looking for information about your veneer options.', 
      time: '3 days ago',
      read: true
    },
    { 
      id: 'm3', 
      from: 'clinic', 
      text: 'We offer E-max and zirconia veneers, both with excellent aesthetics. Our E-max veneers start at £300 per tooth and include digital design and custom shade matching.', 
      time: '2 days ago',
      read: true
    }
  ],
  'clinic_003': []
};

interface Message {
  id: string;
  from: 'user' | 'clinic';
  text: string;
  time: string;
  read: boolean;
}

export const MessagesSection: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  
  // Check if there's a clinic parameter in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const clinicParam = urlParams.get('clinic');
    
    if (clinicParam) {
      setActiveClinicId(clinicParam);
    }
  }, [location]);
  
  const handleSendMessage = () => {
    if (!activeClinicId || !newMessage.trim()) return;
    
    const newMsg: Message = {
      id: `user_${Date.now()}`,
      from: 'user',
      text: newMessage,
      time: 'Just now',
      read: false
    };
    
    setMessages(prev => ({
      ...prev,
      [activeClinicId]: [...(prev[activeClinicId] || []), newMsg]
    }));
    
    setNewMessage('');
    
    // Simulate clinic response after a delay
    setTimeout(() => {
      const responseMsg: Message = {
        id: `clinic_${Date.now()}`,
        from: 'clinic',
        text: `Thank you for your message. A representative from ${SAMPLE_CLINICS.find(c => c.id === activeClinicId)?.name} will respond shortly.`,
        time: 'Just now',
        read: false
      };
      
      setMessages(prev => ({
        ...prev,
        [activeClinicId]: [...(prev[activeClinicId] || []), responseMsg]
      }));
    }, 1500);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">
      {/* Clinics List */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t('portal.messages.title', 'Messages')}</CardTitle>
            <CardDescription>
              {t('portal.messages.subtitle', 'Communicate with your clinics')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-2">
              {SAMPLE_CLINICS.map(clinic => {
                const clinicMessages = messages[clinic.id] || [];
                const unreadCount = clinicMessages.filter(m => m.from === 'clinic' && !m.read).length;
                const lastMessage = clinicMessages[clinicMessages.length - 1];
                
                return (
                  <div 
                    key={clinic.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer 
                      ${activeClinicId === clinic.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setActiveClinicId(clinic.id)}
                  >
                    <Avatar>
                      <AvatarFallback>{clinic.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {clinic.name}
                      </p>
                      {lastMessage ? (
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">
                          {lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          {t('portal.messages.no_messages', 'No messages yet')}
                        </p>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <Badge className="bg-blue-500">{unreadCount}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Message Content */}
      <div className="md:col-span-2">
        <Card className="h-full flex flex-col">
          {!activeClinicId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('portal.messages.select_clinic', 'Select a clinic to start messaging')}
              </h3>
              <p className="text-gray-500 max-w-md">
                {t('portal.messages.intro', 'Send questions about treatments, prices, or arrange your consultation directly with clinics.')}
              </p>
            </div>
          ) : (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2 md:hidden"
                    onClick={() => setActiveClinicId(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle>
                      {SAMPLE_CLINICS.find(c => c.id === activeClinicId)?.name}
                    </CardTitle>
                    <CardDescription>
                      {SAMPLE_CLINICS.find(c => c.id === activeClinicId)?.location}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {!messages[activeClinicId] || messages[activeClinicId].length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {t('portal.messages.start_conversation', 'Start a conversation with this clinic')}
                      </p>
                    </div>
                  ) : (
                    messages[activeClinicId].map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.from === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`text-xs mt-1 flex items-center justify-end ${
                            message.from === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.time}
                            {message.from === 'user' && (
                              <span className="ml-1">
                                {message.read ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="border-t p-3">
                <div className="flex w-full items-center space-x-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Input 
                    placeholder={t('portal.messages.type_message', 'Type your message...')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    className="shrink-0"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};