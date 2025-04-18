import React, { useState } from "react";
import WhatsAppButton from "./WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Phone, X, MessageCircle } from "lucide-react";

interface ContactWidgetProps {
  // Phone number in international format without '+' or spaces, e.g., "447123456789"
  whatsappNumber: string;
  phoneNumber: string; // Formatted phone number for display, e.g., "+44 7123 456789"
}

const ContactWidget: React.FC<ContactWidgetProps> = ({ 
  whatsappNumber, 
  phoneNumber 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Contact options that show when widget is open */}
      {isOpen && (
        <div className="flex flex-col gap-3 mb-4 items-end">
          {/* WhatsApp Button */}
          <div className="transform transition-all duration-300 hover:scale-105">
            <WhatsAppButton 
              phoneNumber={whatsappNumber} 
              className="flex" 
            />
          </div>

          {/* Phone Call Button */}
          <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="flex">
            <Button 
              className="bg-primary hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span>Call Us</span>
            </Button>
          </a>
        </div>
      )}

      {/* Main toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg p-0 ${
          isOpen ? "bg-neutral-700" : "bg-primary"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
};

export default ContactWidget;