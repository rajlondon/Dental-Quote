import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useBookings, BookingStatus, BookingStage } from "@/hooks/use-bookings";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  ClipboardList,
  FileText,
  Loader2,
  MessageSquare,
  Pencil,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  User,
  Building,
  Calendar as CalendarIcon,
  Smartphone,
  Mail,
  MapPin,
  Check,
  X,
} from "lucide-react";

// Status and stage colors for badges
const statusColors: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-purple-100 text-purple-800 border-purple-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const stageColors: Record<BookingStage, string> = {
  deposit: "bg-cyan-100 text-cyan-800 border-cyan-300",
  pre_travel: "bg-indigo-100 text-indigo-800 border-indigo-300",
  treatment: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  post_treatment: "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-teal-100 text-teal-800 border-teal-300",
};

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = parseInt(id);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { useBooking, useUpdateBooking, useUpdateBookingStatus, useUpdateBookingStage } = useBookings();
  
  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useBooking(bookingId);
  
  const { updateBooking, isLoading: isUpdatingBooking } = useUpdateBooking();
  const { updateStatus, isLoading: isUpdatingStatus } = useUpdateBookingStatus();
  const { updateStage, isLoading: isUpdatingStage } = useUpdateBookingStage();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [stageChangeOpen, setStageChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<BookingStatus>("pending");
  const [newStage, setNewStage] = useState<BookingStage>("deposit");
  
  // Load current notes when booking data is available
  useEffect(() => {
    if (booking) {
      setNotes(booking.patientNotes || "");
      setAdminNotes(booking.adminNotes || "");
      
      // Set page title
      document.title = `${t("bookings.booking")} #${booking.id} | ${t("admin.portal")}`;
    }
  }, [booking, t]);
  
  // Handle saving patient notes
  const handleSaveNotes = async () => {
    if (!booking) return;
    
    try {
      await updateBooking(booking.id, { patientNotes: notes });
      toast({
        title: t("bookings.notes_saved"),
        description: t("bookings.notes_saved_description"),
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: t("bookings.notes_save_failed"),
        description: t("common.please_try_again"),
        variant: "destructive",
      });
    }
  };
  
  // Handle saving admin notes
  const handleSaveAdminNotes = async () => {
    if (!booking) return;
    
    try {
      await updateBooking(booking.id, { adminNotes });
      toast({
        title: t("bookings.admin_notes_saved"),
        description: t("bookings.admin_notes_saved_description"),
      });
    } catch (error) {
      console.error("Error saving admin notes:", error);
      toast({
        title: t("bookings.admin_notes_save_failed"),
        description: t("common.please_try_again"),
        variant: "destructive",
      });
    }
  };
  
  // Handle changing booking status
  const handleChangeStatus = async () => {
    if (!booking) return;
    
    try {
      await updateStatus(booking.id, newStatus);
      setStatusChangeOpen(false);
      refetch();
      toast({
        title: t("bookings.status_updated"),
        description: t("bookings.status_updated_description"),
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: t("bookings.status_update_failed"),
        description: t("common.please_try_again"),
        variant: "destructive",
      });
    }
  };
  
  // Handle changing booking stage
  const handleChangeStage = async () => {
    if (!booking) return;
    
    try {
      await updateStage(booking.id, newStage);
      setStageChangeOpen(false);
      refetch();
      toast({
        title: t("bookings.stage_updated"),
        description: t("bookings.stage_updated_description"),
      });
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        title: t("bookings.stage_update_failed"),
        description: t("common.please_try_again"),
        variant: "destructive",
      });
    }
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!booking) return;
    
    try {
      await updateStatus(booking.id, "cancelled");
      setCancelConfirmOpen(false);
      refetch();
      toast({
        title: t("bookings.booking_cancelled"),
        description: t("bookings.booking_cancelled_description"),
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: t("bookings.booking_cancellation_failed"),
        description: t("common.please_try_again"),
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("common.loading")}</span>
      </div>
    );
  }
  
  if (error || !booking) {
    return (
      <div className="container max-w-6xl py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">
          {t("bookings.booking_not_found")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error
            ? error.message
            : t("bookings.booking_load_error")}
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.retry")}
          </Button>
          <Button onClick={() => setLocation("/admin/bookings")}>
            {t("common.back_to_bookings")}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/admin/bookings")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {t("bookings.booking")} #{booking.id}
            <Badge
              variant="outline"
              className={`ml-4 ${statusColors[booking.status]}`}
            >
              {t(`bookings.status.${booking.status}`)}
            </Badge>
            <Badge
              variant="outline"
              className={`ml-2 ${stageColors[booking.stage]}`}
            >
              {t(`bookings.stage.${booking.stage}`)}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            {t("bookings.booking_reference")}:{" "}
            <span className="font-medium">
              {booking.bookingReference || `#${booking.id}`}
            </span>
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Dialog open={statusChangeOpen} onOpenChange={setStatusChangeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t("bookings.change_status")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("bookings.change_status")}</DialogTitle>
              <DialogDescription>
                {t("bookings.change_status_description")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as BookingStatus)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("bookings.select_status")}
                    defaultValue={booking.status}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    {t("bookings.status.pending")}
                  </SelectItem>
                  <SelectItem value="confirmed">
                    {t("bookings.status.confirmed")}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {t("bookings.status.in_progress")}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t("bookings.status.completed")}
                  </SelectItem>
                  <SelectItem value="cancelled" className="text-destructive">
                    {t("bookings.status.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusChangeOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleChangeStatus}
                disabled={isUpdatingStatus || newStatus === booking.status}
              >
                {isUpdatingStatus && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={stageChangeOpen} onOpenChange={setStageChangeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t("bookings.change_stage")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("bookings.change_stage")}</DialogTitle>
              <DialogDescription>
                {t("bookings.change_stage_description")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select
                value={newStage}
                onValueChange={(value) => setNewStage(value as BookingStage)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("bookings.select_stage")}
                    defaultValue={booking.stage}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">
                    {t("bookings.stage.deposit")}
                  </SelectItem>
                  <SelectItem value="pre_travel">
                    {t("bookings.stage.pre_travel")}
                  </SelectItem>
                  <SelectItem value="treatment">
                    {t("bookings.stage.treatment")}
                  </SelectItem>
                  <SelectItem value="post_treatment">
                    {t("bookings.stage.post_treatment")}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t("bookings.stage.completed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStageChangeOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleChangeStage}
                disabled={isUpdatingStage || newStage === booking.stage}
              >
                {isUpdatingStage && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
        
        {booking.status !== "cancelled" && (
          <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {t("bookings.cancel_booking")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("bookings.confirm_cancellation")}</DialogTitle>
                <DialogDescription>
                  {t("bookings.confirm_cancellation_description")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelConfirmOpen(false)}
                >
                  {t("common.back")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelBooking}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("bookings.confirm_cancel")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">{t("bookings.overview")}</TabsTrigger>
          <TabsTrigger value="treatment">{t("bookings.treatment")}</TabsTrigger>
          <TabsTrigger value="documents">{t("bookings.documents")}</TabsTrigger>
          <TabsTrigger value="messages">{t("bookings.messages")}</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  {t("bookings.patient_information")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">{t("common.id")}:</span>
                    <span>{booking.userId || t("common.not_available")}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">{t("common.name")}:</span>
                    <span>
                      {t("common.not_available")} {/* Will need to fetch user details */}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {t("common.not_available")} {/* Will need to fetch user details */}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {t("common.not_available")} {/* Will need to fetch user details */}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Clinic Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  {t("bookings.clinic_information")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">{t("common.id")}:</span>
                    <span>{booking.clinicId || t("common.not_available")}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">{t("common.name")}:</span>
                    <span>
                      {t("common.not_available")} {/* Will need to fetch clinic details */}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {t("common.not_available")} {/* Will need to fetch clinic details */}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {t("common.not_available")} {/* Will need to fetch clinic details */}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.booking_details")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.status")}
                  </h3>
                  <Badge
                    variant="outline"
                    className={statusColors[booking.status]}
                  >
                    {t(`bookings.status.${booking.status}`)}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.stage")}
                  </h3>
                  <Badge
                    variant="outline"
                    className={stageColors[booking.stage]}
                  >
                    {t(`bookings.stage.${booking.stage}`)}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.created_at")}
                  </h3>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(booking.createdAt), "PPP p")}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t("bookings.updated_at")}
                  </h3>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(booking.updatedAt), "PPP p")}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
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
          
          {/* Patient Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.patient_notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("bookings.patient_notes_placeholder")}
                className="min-h-[150px]"
              />
              <Button
                className="mt-4"
                onClick={handleSaveNotes}
                disabled={isUpdatingBooking}
              >
                {isUpdatingBooking && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common.save")}
              </Button>
            </CardContent>
          </Card>
          
          {/* Admin Notes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("bookings.admin_notes")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("bookings.admin_notes_description")}
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t("bookings.admin_notes_placeholder")}
                className="min-h-[150px]"
              />
              <Button
                className="mt-4"
                onClick={handleSaveAdminNotes}
                disabled={isUpdatingBooking}
              >
                {isUpdatingBooking && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
                  <Button variant="outline">
                    {t("bookings.create_treatment_plan")}
                  </Button>
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
                <Button variant="outline">{t("bookings.upload_document")}</Button>
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
                  {t("bookings.no_messages_admin_description")}
                </p>
                <Button variant="outline">{t("bookings.send_message")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}