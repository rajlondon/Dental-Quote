import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageCircle, Phone } from 'lucide-react';

interface FreeConsultationWidgetProps {
  clinicId?: string;
  className?: string;
  onSuccess?: () => void;
}

/**
 * A widget for requesting a free consultation
 */
const FreeConsultationWidget: React.FC<FreeConsultationWidgetProps> = ({
  clinicId,
  className = '',
  onSuccess
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/free-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          clinicId: clinicId || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Consultation request sent!',
          description: 'We will contact you shortly to arrange your free consultation.',
          variant: 'default'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          message: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error requesting consultation:', error);
      toast({
        title: 'Could not send request',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl">Free Dental Consultation</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          Speak with a specialist about your dental needs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your contact number"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="preferredDate">Preferred Date (Optional)</Label>
              <Input
                id="preferredDate"
                name="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any specific concerns or questions?"
                className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Submitting...' : 'Request Free Consultation'}
        </Button>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="h-3 w-3 mr-1" />
            <span>Video or Phone Call</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>30 Minutes Session</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3 mr-1" />
            <span>No Obligation</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FreeConsultationWidget;