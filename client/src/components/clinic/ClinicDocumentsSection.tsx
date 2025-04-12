import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from 'lucide-react';

const ClinicDocumentsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.documents.title", "Document Management")}</CardTitle>
          <CardDescription>
            {t("clinic.documents.description", "Manage clinic documents, patient files, and medical records")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("clinic.documents.coming_soon", "Document Management Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("clinic.documents.coming_soon_desc", "This section is currently under development. Soon you'll be able to manage all your clinic documents, patient files, and medical records in one centralized location.")}
          </p>
          <Button variant="outline" className="gap-2">
            {t("clinic.documents.learn_more", "Learn More")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicDocumentsSection;