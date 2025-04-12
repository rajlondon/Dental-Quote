import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from 'lucide-react';

const ClinicAppointmentsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.appointments.title", "Appointment Management")}</CardTitle>
          <CardDescription>
            {t("clinic.appointments.description", "Manage patient appointments, schedules, and bookings")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("clinic.appointments.coming_soon", "Appointment Calendar Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("clinic.appointments.coming_soon_desc", "This section is currently under development. Soon you'll be able to manage your clinic schedule, patient appointments, and treatment sessions in a comprehensive calendar view.")}
          </p>
          <Button variant="outline" className="gap-2">
            {t("clinic.appointments.learn_more", "Learn More")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicAppointmentsSection;