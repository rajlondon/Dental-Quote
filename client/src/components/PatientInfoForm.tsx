import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { InfoIcon, Upload, Camera, BadgeCheck } from 'lucide-react';

// Form schema
const formSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  travelMonth: z.string().optional(),
  departureCity: z.string().optional(),
  hasXrays: z.boolean().default(false),
  hasCtScan: z.boolean().default(false),
  additionalNotes: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).default('email'),
});

export type PatientInfo = z.infer<typeof formSchema>;

interface PatientInfoFormProps {
  initialData?: Partial<PatientInfo>;
  onSubmit: (data: PatientInfo) => void;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  initialData = {},
  onSubmit,
}) => {
  const { toast } = useToast();
  const [xrayFiles, setXrayFiles] = useState<File[]>([]);
  
  // Initialize the form with default values
  const form = useForm<PatientInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      travelMonth: initialData.travelMonth || '',
      departureCity: initialData.departureCity || '',
      hasXrays: initialData.hasXrays || false,
      hasCtScan: initialData.hasCtScan || false,
      additionalNotes: initialData.additionalNotes || '',
      preferredContactMethod: initialData.preferredContactMethod || 'email',
    },
  });

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setXrayFiles(prev => [...prev, ...fileArray]);
      
      toast({
        title: "Files Added",
        description: `Added ${fileArray.length} file(s) to your quote`,
      });
    }
  };

  const handleSubmitForm = (data: PatientInfo) => {
    // Add files to form data if needed before submission
    onSubmit(data);
  };

  const removeFile = (index: number) => {
    setXrayFiles(prev => prev.filter((_, i) => i !== index));
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
                    <FormControl>
                      <Input placeholder="e.g. June 2025" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="e.g. London" {...field} />
                    </FormControl>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Recent panoramic or periapical X-Rays can help with your quote
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
                          CT Scans provide better treatment planning for complex procedures
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* File upload section */}
              <div className="mt-6">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                  <div className="flex justify-center mb-4">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload X-Rays or CT Scans</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*, application/pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display uploaded files */}
                  {xrayFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                      <ul className="space-y-2">
                        {xrayFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="flex items-center">
                              <Upload className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any other information you'd like us to know about your dental needs or travel preferences?" 
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
            
            <Button type="submit" className="w-full">Save Your Information</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientInfoForm;