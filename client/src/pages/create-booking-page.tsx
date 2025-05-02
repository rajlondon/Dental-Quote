import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { BookingsProvider } from "@/hooks/use-bookings";
import CreateBookingForm from "@/components/forms/CreateBookingForm";

export default function CreateBookingPage() {
  const { t } = useTranslation();
  
  return (
    <BookingsProvider>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Link href="/bookings">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t("bookings.create_new_booking")}</h1>
        </div>
        
        <CreateBookingForm />
      </div>
    </BookingsProvider>
  );
}