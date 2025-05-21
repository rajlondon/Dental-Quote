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
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      
      toast({
        title: 'Support ticket created',
        description: 'Your support ticket has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create support ticket',
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
    onSuccess: (ticket) => {
      setReplyMessage('');
      setSelectedTicket(ticket);
      
      // Invalidate tickets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      
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

  const handleCreateTicket = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both subject and message for your support ticket.',
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

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a message before sending.',
        variant: 'destructive',
      });
      return;
    }
    
    replyToTicketMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyMessage,
    });
  };

  const getStatusColor = (status: 'open' | 'closed' | 'waiting') => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: 'open' | 'closed' | 'waiting') => {
    switch (status) {
      case 'open':
        return <MessagesSquare className="h-4 w-4" />;
      case 'waiting':
        return <Clock className="h-4 w-4" />;
      case 'closed':
        return <Check className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('patient.support.title', 'Support')}</CardTitle>
          <CardDescription>
            {t('patient.support.description', 'Get help with your dental treatment journey')}
          </CardDescription>
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
          <CardDescription>
            {t('patient.support.description', 'Get help with your dental treatment journey')}
          </CardDescription>
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
            <CardDescription>
              {t('patient.support.description', 'Get help with your dental treatment journey')}
            </CardDescription>
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
                  {t('patient.support.create_description', 'Provide details about your inquiry or issue.')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('patient.support.category', 'Category')}</Label>
                  <Select value={ticketCategory} onValueChange={setTicketCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('patient.support.select_category', 'Select category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">{t('patient.support.category_general', 'General Inquiry')}</SelectItem>
                      <SelectItem value="Technical">{t('patient.support.category_technical', 'Technical Issue')}</SelectItem>
                      <SelectItem value="Billing">{t('patient.support.category_billing', 'Billing & Payments')}</SelectItem>
                      <SelectItem value="Treatment">{t('patient.support.category_treatment', 'Treatment Question')}</SelectItem>
                      <SelectItem value="Travel">{t('patient.support.category_travel', 'Travel & Accommodations')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('patient.support.subject', 'Subject')}</Label>
                  <Input
                    id="subject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder={t('patient.support.subject_placeholder', 'Brief description of your inquiry')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('patient.support.message', 'Message')}</Label>
                  <Textarea
                    id="message"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder={t('patient.support.message_placeholder', 'Provide details about your inquiry or issue')}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  onClick={handleCreateTicket} 
                  disabled={createTicketMutation.isPending || !ticketSubject.trim() || !ticketMessage.trim()}
                >
                  {createTicketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('patient.support.submit_ticket', 'Submit Ticket')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tickets && tickets.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-2 border-r pr-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">
                {t('patient.support.your_tickets', 'Your Tickets')}
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {tickets.map((ticket: SupportTicket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm truncate max-w-[180px]">{ticket.subject}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('patient.support.category_label', 'Category')}: {ticket.category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('patient.support.last_updated', 'Last updated')}: {format(new Date(ticket.lastActivity), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              {selectedTicket ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{selectedTicket.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('patient.support.ticket_id', 'Ticket ID')}: {selectedTicket.id.substring(0, 8)}...
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      <span className="ml-1">
                        {selectedTicket.status === 'open' 
                          ? t('patient.support.status_open', 'Open')
                          : selectedTicket.status === 'waiting'
                            ? t('patient.support.status_waiting', 'Waiting')
                            : t('patient.support.status_closed', 'Closed')
                        }
                      </span>
                    </span>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto mb-4 space-y-3">
                    {selectedTicket.messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-primary/10 ml-8' 
                            : 'bg-accent mr-8 border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-medium">
                            {message.sender === 'user' 
                              ? t('patient.support.you', 'You')
                              : t('patient.support.support_team', 'Support Team')
                            }
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedTicket.status !== 'closed' && (
                    <div>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <Label htmlFor="reply">
                          {t('patient.support.your_reply', 'Your Reply')}
                        </Label>
                        <Textarea
                          id="reply"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder={t('patient.support.reply_placeholder', 'Type your reply here...')}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSendReply}
                            disabled={replyToTicketMutation.isPending || !replyMessage.trim()}
                          >
                            {replyToTicketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="h-4 w-4 mr-2" />
                            {t('patient.support.send_reply', 'Send Reply')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MessagesSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t('patient.support.select_ticket', 'Select a Ticket')}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {t('patient.support.select_description', 'Choose a support ticket from the list to view the conversation history.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <MessagesSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('patient.support.no_tickets', 'No Support Tickets')}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mx-auto mb-6">
              {t('patient.support.no_tickets_description', 'You haven\'t created any support tickets yet. Need assistance? Create your first ticket now.')}
            </p>
            <Button onClick={() => setNewTicketOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('patient.support.create_first_ticket', 'Create Your First Ticket')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportSection;