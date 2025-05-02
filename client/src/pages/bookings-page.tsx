import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useBookings, type BookingStatus, type BookingStage } from "@/hooks/use-bookings";
import { Loader2, Plus, Search, Filter, Calendar, ArrowRight } from "lucide-react";

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

export default function BookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { useUserBookings } = useBookings();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [stageFilter, setStageFilter] = useState<BookingStage | "all">("all");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: bookings, isLoading, error, refetch } = useUserBookings(user?.id || 0);
  
  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    // Search filter
    const searchMatch = 
      !searchTerm || 
      booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.flightNumber && booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    
    // Stage filter
    const stageMatch = stageFilter === "all" || booking.stage === stageFilter;
    
    // Tab filter
    if (activeTab === "upcoming") {
      return (
        searchMatch && 
        statusMatch && 
        stageMatch && 
        booking.status !== "completed" && 
        booking.status !== "cancelled"
      );
    } else if (activeTab === "completed") {
      return searchMatch && statusMatch && stageMatch && booking.status === "completed";
    } else if (activeTab === "cancelled") {
      return searchMatch && statusMatch && stageMatch && booking.status === "cancelled";
    }
    
    return searchMatch && statusMatch && stageMatch;
  });
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("common.loading")}</span>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 mb-4">{t("common.error")}: {error.message}</p>
        <Button onClick={() => refetch()}>{t("common.retry")}</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("bookings.my_bookings")}</h1>
          <p className="text-muted-foreground">
            {t("bookings.manage_your_bookings")}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
          <Button variant="outline" onClick={() => refetch()}>
            {t("common.refresh")}
          </Button>
          <Link href="/bookings/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("bookings.create_new")}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">{t("bookings.all")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t("bookings.upcoming")}</TabsTrigger>
          <TabsTrigger value="completed">{t("bookings.completed")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("bookings.cancelled")}</TabsTrigger>
        </TabsList>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("bookings.search_placeholder")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">
                {t("bookings.status")}:
              </span>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={t("bookings.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="pending">{t("bookings.status.pending")}</SelectItem>
                  <SelectItem value="confirmed">{t("bookings.status.confirmed")}</SelectItem>
                  <SelectItem value="in_progress">{t("bookings.status.in_progress")}</SelectItem>
                  <SelectItem value="completed">{t("bookings.status.completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("bookings.status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">
                {t("bookings.stage")}:
              </span>
              <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as BookingStage | "all")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={t("bookings.stage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="deposit">{t("bookings.stage.deposit")}</SelectItem>
                  <SelectItem value="pre_travel">{t("bookings.stage.pre_travel")}</SelectItem>
                  <SelectItem value="treatment">{t("bookings.stage.treatment")}</SelectItem>
                  <SelectItem value="post_treatment">{t("bookings.stage.post_treatment")}</SelectItem>
                  <SelectItem value="completed">{t("bookings.stage.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Bookings Table/Cards */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("bookings.showing")} {filteredBookings.length} {t("bookings.bookings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("bookings.reference")}</TableHead>
                      <TableHead>{t("bookings.clinic")}</TableHead>
                      <TableHead>{t("bookings.created_at")}</TableHead>
                      <TableHead>{t("bookings.status")}</TableHead>
                      <TableHead>{t("bookings.stage")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.bookingReference || `#${booking.id}`}
                        </TableCell>
                        <TableCell>
                          {t("bookings.clinic_id")}: {booking.clinicId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {format(new Date(booking.createdAt), "PPP")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[booking.status]}>
                            {t(`bookings.status.${booking.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stageColors[booking.stage]}>
                            {t(`bookings.stage.${booking.stage}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="ghost" size="sm">
                              {t("common.view")}
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || stageFilter !== "all"
                  ? t("bookings.no_matching_bookings")
                  : t("bookings.no_bookings")}
              </p>
              {searchTerm || statusFilter !== "all" || stageFilter !== "all" ? (
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setStageFilter("all");
                }}>
                  {t("common.clear_filters")}
                </Button>
              ) : (
                <Link href="/bookings/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("bookings.create_new")}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}