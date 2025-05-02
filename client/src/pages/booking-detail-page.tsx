import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useBookings, type BookingStatus, type BookingStage } from "@/hooks/use-bookings";
import { Loader2, ArrowLeft, Calendar, User, MapPin, ClipboardList, FileText, MessageSquare } from "lucide-react";

// Status colors
const statusColors: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-purple-100 text-purple-800 border-purple-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

// Stage colors
const stageColors: Record<BookingStage, string> = {
  deposit: "bg-cyan-100 text-cyan-800 border-cyan-300",
  pre_travel: "bg-indigo-100 text-indigo-800 border-indigo-300",
  treatment: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  post_treatment: "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-teal-100 text-teal-800 border-teal-300",
};

export default function BookingDetailPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, params] = useRoute("/bookings/:id");
  const bookingId = params?.id;
  
  const { useBooking, useUpdateBookingStatus, useUpdateBookingStage } = useBookings();
  const { data: booking, isLoading, error, refetch } = useBooking(bookingId as string);
  
  const [activeTab, setActiveTab] = useState("details");
  const [notes, setNotes] = useState("");
  
  const { updateStatus, isLoading: isStatusUpdating } = useUpdateBookingStatus();
  const { updateStage, isLoading: isStageUpdating } = useUpdateBookingStage();
  
  // Handle status change
  const handleStatusChange = async (value: string) => {
    try {
      await updateStatus(Number(bookingId), value as BookingStatus);
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  // Handle stage change
  const handleStageChange = async (value: string) => {
    try {
      await updateStage(Number(bookingId), value as BookingStage);
      refetch();
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };
  
  // Handle saving notes
  const handleSaveNotes = () => {
    // In a real implementation, we would update the notes via API
    toast({
      title: t("bookings.notes_saved"),
      description: t("bookings.notes_saved_description"),
      variant: "default",
    });
  };
  
  // Initialize notes when booking data is loaded
  useEffect(() => {
    if (booking) {
      setNotes(booking.patientNotes || "");
    }
  }, [booking]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("common.loading")}</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 mb-4">{t("common.error")}: {error.message}</p>
        <Button onClick={() => refetch()}>{t("common.retry")}</Button>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg mb-4">{t("bookings.booking_not_found")}</p>
        <Link href="/bookings">
          <Button>{t("common.back_to_list")}</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/bookings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{t("bookings.booking_details")}</h1>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-muted-foreground font-medium">
              {t("bookings.reference")}: {booking.bookingReference}
            </p>
            <Badge variant="outline" className={statusColors[booking.status]}>
              {t(`bookings.status.${booking.status}`)}
            </Badge>
            <Badge variant="outline" className={stageColors[booking.stage]}>
              {t(`bookings.stage.${booking.stage}`)}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
          <Button variant="outline" onClick={() => refetch()}>
            {t("common.refresh")}
          </Button>
          {/* Add more action buttons here as needed */}
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="details">{t("bookings.details")}</TabsTrigger>
          <TabsTrigger value="treatment">{t("bookings.treatment")}</TabsTrigger>
          <TabsTrigger value="documents">{t("bookings.documents")}</TabsTrigger>
          <TabsTrigger value="messages">{t("bookings.messages")}</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Booking Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.booking_information")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.created_at")}
                  </h3>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(booking.createdAt), "PPP p")}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.patient")}
                  </h3>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t("bookings.patient_id")}: {booking.userId}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.clinic")}
                  </h3>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t("bookings.clinic_id")}: {booking.clinicId}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.status")}
                  </h3>
                  <Select
                    value={booking.status}
                    onValueChange={handleStatusChange}
                    disabled={isStatusUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("bookings.select_status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("bookings.status.pending")}</SelectItem>
                      <SelectItem value="confirmed">{t("bookings.status.confirmed")}</SelectItem>
                      <SelectItem value="in_progress">{t("bookings.status.in_progress")}</SelectItem>
                      <SelectItem value="completed">{t("bookings.status.completed")}</SelectItem>
                      <SelectItem value="cancelled">{t("bookings.status.cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.stage")}
                  </h3>
                  <Select
                    value={booking.stage}
                    onValueChange={handleStageChange}
                    disabled={isStageUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("bookings.select_stage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">{t("bookings.stage.deposit")}</SelectItem>
                      <SelectItem value="pre_travel">{t("bookings.stage.pre_travel")}</SelectItem>
                      <SelectItem value="treatment">{t("bookings.stage.treatment")}</SelectItem>
                      <SelectItem value="post_treatment">{t("bookings.stage.post_treatment")}</SelectItem>
                      <SelectItem value="completed">{t("bookings.stage.completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.deposit_status")}
                  </h3>
                  <Badge className={booking.depositPaid ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}>
                    {booking.depositPaid
                      ? t("bookings.deposit_paid")
                      : t("bookings.deposit_not_paid")}
                  </Badge>
                  {booking.depositPaid && (
                    <p className="text-sm mt-1">
                      {t("bookings.deposit_amount")}: £{booking.depositAmount}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Travel Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.travel_details")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.arrival_date")}
                  </h3>
                  <p>
                    {booking.arrivalDate
                      ? format(new Date(booking.arrivalDate), "PPP")
                      : t("common.not_available")}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.departure_date")}
                  </h3>
                  <p>
                    {booking.departureDate
                      ? format(new Date(booking.departureDate), "PPP")
                      : t("common.not_available")}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.flight_number")}
                  </h3>
                  <p>{booking.flightNumber || t("common.not_available")}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.accommodation")}
                  </h3>
                  <p>{booking.accommodationType || t("common.not_available")}</p>
                  {booking.accommodationDetails && (
                    <p className="text-sm mt-1">{booking.accommodationDetails}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.patient_notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("bookings.enter_notes")}
                className="min-h-[150px]"
              />
              <Button className="mt-4" onClick={handleSaveNotes}>
                {t("common.save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Treatment Tab */}
        <TabsContent value="treatment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.treatment_information")}</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.treatmentPlanId ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {t("bookings.treatment_plan_id")}: {booking.treatmentPlanId}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {t("bookings.treatment_notes")}
                    </h3>
                    <p>{booking.treatmentNotes || t("common.no_notes_available")}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="secondary">
                      {t("bookings.view_treatment_plan")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("bookings.no_treatment_plan")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("bookings.no_treatment_plan_description")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.documents")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("bookings.no_documents")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("bookings.no_documents_description")}
                </p>
                <Button variant="secondary">{t("bookings.upload_document")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.messages")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("bookings.no_messages")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("bookings.no_messages_description")}
                </p>
                <Button variant="secondary">{t("bookings.send_message")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}