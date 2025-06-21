import React from 'react';
// Removed react-i18next
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BookingManagementSection: React.FC = () => {
  // Translation removed

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.bookings.title", "Booking Management")}</CardTitle>
          <CardDescription>
            {t("admin.bookings.description", "Manage patient bookings and appointments for dental treatments in Istanbul")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t("admin.bookings.coming_soon", "Booking Management Coming Soon")}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t("admin.bookings.coming_soon_desc", "This section is currently under development. Soon you'll be able to manage all patient bookings, appointments, and travel arrangements in one place.")}
          </p>
          <Button variant="outline" className="gap-2">
            {t("admin.bookings.learn_more", "Learn More")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagementSection;