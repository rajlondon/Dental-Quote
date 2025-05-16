import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const PatientInfoForm: React.FC = () => {
  const { patientInfo, setPatientInfo } = useQuoteStore();
  
  // Initialize form state from store
  const [formData, setFormData] = useState({
    firstName: patientInfo?.firstName || '',
    lastName: patientInfo?.lastName || '',
    email: patientInfo?.email || '',
    phone: patientInfo?.phone || '',
    preferredDate: patientInfo?.preferredDate || '',
    notes: patientInfo?.notes || ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Update form if patientInfo changes externally
  useEffect(() => {
    if (patientInfo) {
      setFormData({
        firstName: patientInfo.firstName,
        lastName: patientInfo.lastName,
        email: patientInfo.email,
        phone: patientInfo.phone || '',
        preferredDate: patientInfo.preferredDate || '',
        notes: patientInfo.notes || ''
      });
    }
  }, [patientInfo]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        preferredDate: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  // Validate and submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      firstName: formData.firstName ? '' : 'First name is required',
      lastName: formData.lastName ? '' : 'Last name is required',
      email: formData.email ? '' : 'Email is required',
    };
    
    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    // Update store
    setPatientInfo({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      preferredDate: formData.preferredDate,
      notes: formData.notes
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Information</h2>
      <p className="text-gray-600 mb-6">
        Please provide your contact details so we can prepare your personalized quote.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4" onChange={() => handleSubmit} onBlur={() => handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-medium">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-medium">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>
        
        {/* Preferred Date */}
        <div className="space-y-2">
          <Label htmlFor="preferredDate" className="font-medium">
            Preferred Treatment Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.preferredDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.preferredDate ? format(new Date(formData.preferredDate), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.preferredDate ? new Date(formData.preferredDate) : undefined}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific concerns or questions..."
            rows={4}
          />
        </div>
        
        <div className="pt-2">
          <p className="text-sm text-gray-500 mb-4">
            Fields marked with <span className="text-red-500">*</span> are required.
          </p>
          
          <Button 
            type="submit"
            className="w-full"
          >
            Save Information
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientInfoForm;