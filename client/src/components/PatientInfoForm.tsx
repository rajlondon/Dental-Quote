import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { InfoIcon, BadgeCheck } from 'lucide-react';

// Form schema
const formSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  travelMonth: z.string().optional(),
  departureCity: z.string().optional(),
  hotelAccommodation: z.enum(['yes', 'no', 'clinic_decide']).default('clinic_decide'),
  hasXrays: z.boolean().default(false),
  hasCtScan: z.boolean().default(false),
  hasDentalPhotos: z.boolean().default(false),
  additionalNotesForClinic: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).default('email'),
});

export type PatientInfo = z.infer<typeof formSchema>;

interface PatientInfoFormProps {
  initialData?: Partial<PatientInfo>;
  onSubmit: (data: PatientInfo) => void;
}

const DEPARTURE_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Glasgow', 'Edinburgh', 'Leeds', 'Liverpool',
  'Bristol', 'Newcastle', 'Sheffield', 'Belfast', 'Cardiff', 'Dublin', 'Cork', 'Galway',
  'Amsterdam', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Brussels', 'Vienna', 'Stockholm',
  'Copenhagen', 'Oslo', 'Helsinki', 'Zurich', 'Geneva', 'Barcelona', 'Lisbon'
];

const TRAVEL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December',
  'Flexible'
];

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  initialData = {},
  onSubmit,
}) => {
  
  // Initialize the form with default values
  const form = useForm<PatientInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      travelMonth: initialData.travelMonth || '',
      departureCity: initialData.departureCity || '',
      hotelAccommodation: initialData.hotelAccommodation || 'clinic_decide',
      hasXrays: initialData.hasXrays || false,
      hasCtScan: initialData.hasCtScan || false,
      hasDentalPhotos: initialData.hasDentalPhotos || false,
      additionalNotesForClinic: initialData.additionalNotesForClinic || '',
      preferredContactMethod: initialData.preferredContactMethod || 'email',
    },
  });

  const handleSubmitForm = (data: PatientInfo) => {
    onSubmit(data);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <BadgeCheck className="mr-2 h-5 w-5 text-blue-500" />
          Your Information
        </CardTitle>
        <CardDescription>
          Help us provide you with the most accurate treatment plan 
          by sharing some information about yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+44 123 456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Travel Month</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRAVEL_MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departureCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTURE_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hotelAccommodation"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Would you like to include hotel accommodation in your quote?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Yes, include hotel with my treatment
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            No, I'll arrange my own accommodation
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="clinic_decide" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Let the clinic decide if they include hotel
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Some clinics offer all-inclusive packages with hotel accommodation, while others leave it separate. We can help with both options.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="preferredContactMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-6">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="email" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Email
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="phone" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Phone
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="whatsapp" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                WhatsApp
                              </FormLabel>
                            </FormItem>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="font-medium text-gray-700">Dental Records</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hasXrays"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I have dental X-Rays
                        </FormLabel>
                        <FormDescription>
                          Recent panoramic or periapical X-Rays
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasCtScan"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I have CT Scans
                        </FormLabel>
                        <FormDescription>
                          3D imaging for complex procedures
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasDentalPhotos"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          I have dental photos
                        </FormLabel>
                        <FormDescription>
                          Recent photos of your teeth/smile
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md flex items-start mt-4">
                <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 mr-3" />
                <div className="text-sm text-blue-800">
                  <p>You can securely share your dental records directly with your chosen clinic through the Patient Portal after your quote is approved.</p>
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="additionalNotesForClinic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes for Clinic</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share any specific concerns, previous dental work, or special requirements that might help the clinic better understand your needs." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
              <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Your information is secure</p>
                <p className="mt-1">
                  We only share your information with the dental clinic you choose to proceed with. 
                  Your information is never sold or shared with third parties.
                </p>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Save & See My Matched Clinics</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientInfoForm;