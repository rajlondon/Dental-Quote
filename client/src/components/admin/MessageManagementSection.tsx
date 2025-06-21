import React from 'react';
// Removed react-i18next
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MessageManagementSection: React.FC = () => {
  // Translation removed

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Message Management</CardTitle>
          <CardDescription>
            Manage communications with patients and dental clinics
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Messaging System Coming Soon</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            The messaging system is under development. Soon you'll be able to communicate with patients, manage inquiries, and coordinate with dental clinics in one place.
          </p>
          <Button variant="outline" className="gap-2">
            Learn More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageManagementSection;