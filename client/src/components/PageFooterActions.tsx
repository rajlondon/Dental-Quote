
import React from 'react';
import { Button } from '@/components/ui/button';
import WhatsAppButton from '@/components/WhatsAppButton';
import { MessageCircle, Phone, Mail } from 'lucide-react';

interface PageFooterActionsProps {
  showHelpSection?: boolean;
  helpMessage?: string;
  whatsappNumber?: string;
}

const PageFooterActions: React.FC<PageFooterActionsProps> = ({
  showHelpSection = true,
  helpMessage = "Need help choosing the right treatment? Our dental tourism specialists are here to help.",
  whatsappNumber = "+905465465050"
}) => {
  return (
    <div className="mt-10 border-t pt-6 bg-gray-50 rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {showHelpSection && (
          <div className="text-sm text-gray-600 max-w-md">
            <p>{helpMessage}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm" className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            Call Us
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email Support
          </Button>
          
          <WhatsAppButton 
            phoneNumber={whatsappNumber}
            message="Hi, I need help with my dental treatment options. Can you assist me?"
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default PageFooterActions;
