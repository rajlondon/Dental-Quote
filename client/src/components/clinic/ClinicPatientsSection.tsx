import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, ArrowRight } from 'lucide-react';

const ClinicPatientsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.patients.title", "Patient Management")}</CardTitle>
          <CardDescription>
            {t("clinic.patients.description", "Manage patient records, medical history, and treatment plans")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("clinic.patients.coming_soon", "Patient Management Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("clinic.patients.coming_soon_desc", "This section is currently under development. Soon you'll be able to manage detailed patient records, treatment histories, and preferences all in one place.")}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t("clinic.patients.add_patient", "Add Patient")}
            </Button>
            <Button variant="outline" className="gap-2">
              {t("clinic.patients.learn_more", "Learn More")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicPatientsSection;