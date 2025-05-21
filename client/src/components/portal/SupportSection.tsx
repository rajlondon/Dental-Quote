import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Plus, MessagesSquare, Clock, Check, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

type SupportTicket = {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'closed' | 'waiting';
  category: string;
  createdAt: string;
  lastActivity: string;
  messages: TicketMessage[];
};

type TicketMessage = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  read: boolean;
};

const SupportSection = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [replyMessage, setReplyMessage] = useState('');

  // Fetch all support tickets
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['/api/support/tickets'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/support/tickets');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch support tickets');
      }
      return data.tickets || [];
    }
  });

  // Create new ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (newTicket: { subject: string; message: string; category: string }) => {
      const res = await apiRequest('POST', '/api/support/ticket', newTicket);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create ticket');
      }
      return data.ticket;
    },
    onSuccess: () => {
      // Reset form and close dialog
      setTicketSubject('');
      setTicketMessage('');
      setTicketCategory('General');
      setNewTicketOpen(false);
      
      // Invalidate tickets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/patient/support/tickets'] });
      
      toast({
        title: 'Support ticket created',
        description: 'Your support ticket has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reply to ticket mutation
  const replyToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await apiRequest('POST', `/api/support/ticket/${ticketId}/reply`, { message });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send reply');
      }
      return data.ticket;
    },
    onSuccess: (updatedTicket) => {
      // Update the selected ticket with the new messages
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      
      // Invalidate tickets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/patient/support/tickets'] });
      
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send reply',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a subject and a message for your support ticket.',
        variant: 'destructive',
      });
      return;
    }
    
    createTicketMutation.mutate({
      subject: ticketSubject,
      message: ticketMessage,
      category: ticketCategory,
    });
  };

  const handleReplyToTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }
    
    replyToTicketMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyMessage,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'waiting':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessagesSquare className="h-4 w-4 mr-1" />;
      case 'closed':
        return <Check className="h-4 w-4 mr-1" />;
      case 'waiting':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('patient.support.title', 'Support')}</CardTitle>
          <CardDescription>{t('patient.support.description', 'Get help with your dental treatment')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('patient.support.title', 'Support')}</CardTitle>
          <CardDescription>{t('patient.support.description', 'Get help with your dental treatment')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('patient.support.error_title', 'Error')}</AlertTitle>
            <AlertDescription>
              {t('patient.support.fetch_error', 'Failed to load support tickets. Please try again later.')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('patient.support.title', 'Support')}</CardTitle>
            <CardDescription>{t('patient.support.description', 'Get help with your dental treatment')}</CardDescription>
          </div>
          <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('patient.support.new_ticket', 'New Ticket')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('patient.support.create_ticket', 'Create Support Ticket')}</DialogTitle>
                <DialogDescription>
                  {t('patient.support.create_description', 'Please provide details about the issue you are experiencing.')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTicket}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">{t('patient.support.category', 'Category')}</Label>
                    <Select
                      value={ticketCategory}
                      onValueChange={setTicketCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('patient.support.select_category', 'Select category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">{t('patient.support.category_general', 'General')}</SelectItem>
                        <SelectItem value="Treatment">{t('patient.support.category_treatment', 'Treatment')}</SelectItem>
                        <SelectItem value="Travel">{t('patient.support.category_travel', 'Travel')}</SelectItem>
                        <SelectItem value="Payment">{t('patient.support.category_payment', 'Payment')}</SelectItem>
                        <SelectItem value="Technical">{t('patient.support.category_technical', 'Technical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">{t('patient.support.subject', 'Subject')}</Label>
                    <Input 
                      id="subject" 
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder={t('patient.support.subject_placeholder', 'Brief description of your issue')} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">{t('patient.support.message', 'Message')}</Label>
                    <Textarea 
                      id="message" 
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder={t('patient.support.message_placeholder', 'Please provide all relevant details about your issue')} 
                      rows={5} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('patient.support.submit_ticket', 'Submit Ticket')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-medium">{t('patient.support.your_tickets', 'Your Tickets')}</h3>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket: SupportTicket) => (
                  <div 
                    key={ticket.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-muted/50' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium line-clamp-1">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(ticket.lastActivity), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {ticket.messages[ticket.messages.length - 1]?.text || ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {t('patient.support.no_tickets', 'You have no support tickets yet')}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            {selectedTicket ? (
              <div className="flex flex-col h-full max-h-[500px]">
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{selectedTicket.subject}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                    <span>{t('patient.support.opened', 'Opened')}:</span>
                    <span>{format(new Date(selectedTicket.createdAt), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>{t('patient.support.category', 'Category')}:</span>
                    <span>{selectedTicket.category}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className="mt-1 text-xs opacity-70 flex justify-between">
                          <span>{message.sender === 'user' ? 'You' : 'Support Team'}</span>
                          <span>{format(new Date(message.timestamp), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t mt-auto">
                  <form onSubmit={handleReplyToTicket} className="flex gap-2">
                    <Textarea 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={t('patient.support.reply_placeholder', 'Type your message here...')}
                      className="min-h-[60px]"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={replyToTicketMutation.isPending}
                    >
                      {replyToTicketMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center h-full flex items-center justify-center">
                <div>
                  <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t('patient.support.select_ticket', 'Select a ticket')}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('patient.support.select_description', 'Please select a ticket from the list or create a new one to get help from our support team.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportSection;