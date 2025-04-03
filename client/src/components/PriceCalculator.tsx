import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  TreatmentPrice, 
  initializePrices, 
  getAllTreatments,
  calculateTotal
} from '@/services/pricingService';
import PdfGenerator from './PdfGenerator';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  treatments: z.array(
    z.object({
      treatment: z.string().min(1, 'Please select a treatment'),
      quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Please add at least one treatment'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PriceCalculator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<TreatmentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<ReturnType<typeof calculateTotal> | null>(null);
  
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      treatments: [{ treatment: '', quantity: 1 }],
    },
  });
  
  // Load treatments from CSV when component mounts
  useEffect(() => {
    const loadTreatments = async () => {
      try {
        await initializePrices();
        setTreatments(getAllTreatments());
        setLoading(false);
      } catch (error) {
        console.error('Failed to load treatments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load treatment data. Please try again later.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    loadTreatments();
  }, [toast]);
  
  // Function to add a new treatment field
  const addTreatment = () => {
    const currentTreatments = form.getValues('treatments');
    form.setValue('treatments', [...currentTreatments, { treatment: '', quantity: 1 }]);
  };
  
  // Function to remove a treatment field
  const removeTreatment = (index: number) => {
    const currentTreatments = form.getValues('treatments');
    if (currentTreatments.length > 1) {
      form.setValue(
        'treatments',
        currentTreatments.filter((_, i) => i !== index)
      );
    }
  };
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Calculate the total prices
    const quoteResult = calculateTotal(data.treatments);
    setQuote({
      ...quoteResult,
      // Add any additional fields needed for the quote display/PDF
    });
    
    toast({
      title: 'Quote Generated',
      description: 'Your quote has been calculated successfully.',
    });
  };
  
  return (
    <div className="container mx-auto p-4 mt-8">
      <h2 className="text-3xl font-bold mb-8 text-center">{t('calculate_price')}</h2>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('treatment_selection')}</CardTitle>
              <CardDescription>{t('select_treatments_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('enter_name')} {...field} />
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
                          <FormLabel>{t('email')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('enter_email')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{t('treatments')}</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addTreatment}
                        >
                          {t('add_treatment')}
                        </Button>
                      </div>
                      
                      {form.getValues('treatments').map((_, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`treatments.${index}.treatment`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('treatment_type')}</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('select_treatment')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {treatments
                                        .filter(treatment => treatment.treatment && treatment.treatment.trim() !== '')
                                        .map((treatment, idx) => (
                                          <SelectItem key={idx} value={treatment.treatment}>
                                            {treatment.treatment}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="w-24">
                            <FormField
                              control={form.control}
                              name={`treatments.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('quantity')}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="pt-8">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTreatment(index)}
                              disabled={form.getValues('treatments').length <= 1}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {t('calculate_quote')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('quote_summary')}</CardTitle>
              <CardDescription>{t('quote_summary_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {quote ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left">{t('treatment')}</th>
                          <th className="px-4 py-2 text-right">{t('price')}</th>
                          <th className="px-4 py-2 text-right">{t('qty')}</th>
                          <th className="px-4 py-2 text-right">{t('subtotal')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2">
                              <div>{item.treatment}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.guarantee !== 'N/A' && `${t('guarantee')}: ${item.guarantee}`}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div>£{item.priceGBP.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                ${item.priceUSD.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">
                              <div>£{item.subtotalGBP.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                ${item.subtotalUSD.toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between pt-4 font-medium text-lg">
                    <div>{t('total')}</div>
                    <div>
                      <div>£{quote.totalGBP.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ${quote.totalUSD.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-sm text-muted-foreground">
                    {t('quote_validity_note')}
                  </div>
                </div>
              ) : (
                <div className="min-h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 mb-4"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <line x1="12" x2="12" y1="8" y2="16"></line>
                    <line x1="8" x2="16" y1="12" y2="12"></line>
                  </svg>
                  <p>{t('no_quote_generated')}</p>
                  <p className="text-xs mt-2">{t('select_treatments_to_generate')}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {quote && (
                <PdfGenerator
                  items={quote.items}
                  totalGBP={quote.totalGBP}
                  totalUSD={quote.totalUSD}
                  patientName={form.getValues('name')}
                  patientEmail={form.getValues('email')}
                />
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}