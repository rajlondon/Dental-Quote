import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';
import ConsistentPageHeader from '@/components/ConsistentPageHeader';
import Footer from '@/components/Footer';
import { useLocation } from 'wouter';

export default function FAQPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsistentPageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about dental tourism in Istanbul"
        showBackButton={true}
        backButtonText="Back to Home"
        onBack={() => setLocation('/')}
      />
      <Footer />
    </div>
  );
}