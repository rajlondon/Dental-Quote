import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from 'lucide-react';

const ClinicAnalyticsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.analytics.title", "Clinic Analytics")}</CardTitle>
          <CardDescription>
            {t("clinic.analytics.description", "Track clinic performance, patient satisfaction, and treatment outcomes")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("clinic.analytics.coming_soon", "Analytics Dashboard Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("clinic.analytics.coming_soon_desc", "The analytics dashboard is under development. Soon you'll be able to track your clinic's performance, patient satisfaction rates, and treatment outcomes with detailed charts and reports.")}
          </p>
          <Button variant="outline" className="gap-2">
            {t("clinic.analytics.learn_more", "Learn More")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicAnalyticsSection;