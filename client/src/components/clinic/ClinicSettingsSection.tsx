import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ArrowRight } from 'lucide-react';

const ClinicSettingsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.settings.title", "Clinic Settings")}</CardTitle>
          <CardDescription>
            {t("clinic.settings.description", "Manage clinic profile, preferences, and account settings")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Settings className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("clinic.settings.coming_soon", "Settings Panel Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("clinic.settings.coming_soon_desc", "The clinic settings panel is under development. Soon you'll be able to manage your clinic profile, staff accounts, notification preferences, and platform settings.")}
          </p>
          <Button variant="outline" className="gap-2">
            {t("clinic.settings.learn_more", "Learn More")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicSettingsSection;