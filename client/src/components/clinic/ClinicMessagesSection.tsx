import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from 'lucide-react';

const ClinicMessagesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.messages.title", "Patient Messaging")}</CardTitle>
          <CardDescription>
            {t("clinic.messages.description", "Communicate with patients about their treatments and appointments")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("clinic.messages.coming_soon", "Messaging System Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("clinic.messages.coming_soon_desc", "The messaging system is under development. Soon you'll be able to communicate directly with patients, answer their questions, and provide pre and post-treatment information.")}
          </p>
          <Button variant="outline" className="gap-2">
            {t("clinic.messages.learn_more", "Learn More")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicMessagesSection;