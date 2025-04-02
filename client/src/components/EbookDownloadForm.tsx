import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, loadEmailJSConfig } from "../utils/config";

// Define form schema with validation
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  country: z.string()
    .min(2, { message: "Country must be at least 2 characters" })
    .max(50, { message: "Country must be less than 50 characters" })
});

type FormValues = z.infer<typeof formSchema>;

interface EbookDownloadFormProps {
  onSuccess?: () => void;
}

export default function EbookDownloadForm({ onSuccess }: EbookDownloadFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      country: ""
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Ensure EmailJS config is loaded and up-to-date
      await loadEmailJSConfig();
      
      // Verify EmailJS configuration is available
      if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
        console.error('EmailJS configuration incomplete:',
          {
            serviceIdAvailable: !!EMAILJS_CONFIG.serviceId,
            templateIdAvailable: !!EMAILJS_CONFIG.templateId,
            publicKeyAvailable: !!EMAILJS_CONFIG.publicKey
          }
        );
        
        // Show error to user but still allow download
        toast({
          title: t('ebook.error.title'),
          description: 'Email notification could not be sent, but you can still download the e-book.',
          variant: "destructive"
        });
        
        // Skip email sending and proceed to success
        setShowDownload(true);
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        }
        
        return;
      }

      // Prepare template parameters for EmailJS
      const templateParams = {
        name: data.name,
        email: data.email,
        country: data.country,
        download_type: "E-book: 10 Reasons Why Istanbul for Dental Treatment",
        to_email: "rajsingh140186@googlemail.com", // Client's email address
        message: `New e-book download request from ${data.name} (${data.email}) from ${data.country}.`
      };
      
      try {
        // Send the email via EmailJS
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams,
          EMAILJS_CONFIG.publicKey
        );
      } catch (emailError) {
        console.error("EmailJS sending failed:", emailError);
        
        // Show partial success message but still allow download
        toast({
          title: "E-book ready",
          description: "Your e-book is ready for download, but we couldn't send you a confirmation email.",
          variant: "default"
        });
        
        // Still proceed with success flow
        setShowDownload(true);
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        }
        
        return;
      }
      
      // Show success notification
      toast({
        title: t('ebook.success.title'),
        description: t('ebook.success.description'),
      });
      
      // Show download button
      setShowDownload(true);
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      toast({
        title: t('ebook.error.title'),
        description: t('ebook.error.description'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownload = () => {
    // Create an anchor element to trigger download
    const link = document.createElement('a');
    link.href = '/ebooks/dental-istanbul.pdf';
    link.download = "10-Reasons-Istanbul-Dental-Treatment.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      {!showDownload ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.namePlaceholder')} {...field} />
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
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.emailPlaceholder')} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.country')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.countryPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormDescription className="text-xs text-gray-500">
              {t('blog.ebook.privacyNotice')}
            </FormDescription>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('form.submitting')}
                </div>
              ) : t('blog.ebook.submitButton')}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          
          <h4 className="text-lg font-semibold mb-2">{t('blog.ebook.thankyou')}</h4>
          <p className="text-sm text-gray-600 mb-4">{t('blog.ebook.downloadReady')}</p>
          
          <Button onClick={handleDownload} className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('blog.ebook.downloadButton')}
          </Button>
        </div>
      )}
    </>
  );
}