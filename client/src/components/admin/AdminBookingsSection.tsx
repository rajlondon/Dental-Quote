import React, { useState } from "react";
import { Link } from "wouter";
// Removed react-i18next
import { useBookings } from "@/hooks/use-bookings";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

// Status and stage styling
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-purple-100 text-purple-800 border-purple-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const stageColors: Record<string, string> = {
  deposit: "bg-cyan-100 text-cyan-800 border-cyan-300",
  pre_travel: "bg-indigo-100 text-indigo-800 border-indigo-300",
  treatment: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  post_treatment: "bg-amber-100 text-amber-800 border-amber-300",
  completed: "bg-teal-100 text-teal-800 border-teal-300",
};

export default function AdminBookingsSection() {
  // Translation removed
  const { useAllBookings, useUpdateBookingStatus } = useBookings();
  
  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useAllBookings();
  
  const { updateStatus, isLoading: isUpdating } = useUpdateBookingStatus();
  
  // Search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Update booking status
  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    try {
      await updateStatus(bookingId, newStatus as any);
      refetch();
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };
  
  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      !searchQuery ||
      (booking.bookingReference &&
        booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      booking.id.toString().includes(searchQuery) ||
      (booking.flightNumber &&
        booking.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesStage = stageFilter === "all" || booking.stage === stageFilter;
    
    return matchesSearch && matchesStatus && matchesStage;
  });
  
  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aValue = a[sortField as keyof typeof a];
    let bValue = b[sortField as keyof typeof b];
    
    // Handle dates
    if (sortField === "createdAt" || sortField === "updatedAt") {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    // Handle strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }
    
    // Handle numbers and dates
    if (sortDirection === "asc") {
      return (aValue as number) - (bValue as number);
    } else {
      return (bValue as number) - (aValue as number);
    }
  });
  
  // Paginate bookings
  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  
  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      
      if (currentPage > 3) {
        items.push("ellipsis1");
      }
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        items.push("ellipsis2");
      }
      
      items.push(totalPages);
    }
    
    return items;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-lg font-medium">
          {t("bookings.loading_bookings")}
        </span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <X className="w-12 h-12 mx-auto text-destructive" />
        <h3 className="mt-2 text-xl font-bold">
          {t("bookings.error_loading_bookings")}
        </h3>
        <p className="mt-1 text-muted-foreground">
          {error instanceof Error ? error.message : t("common.unknown_error")}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("common.retry")}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("bookings.admin_bookings")}</h1>
          <p className="text-muted-foreground">
            {t("bookings.manage_all_bookings")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
          
          <Link href="/admin/create-booking">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t("bookings.create_booking")}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t("bookings.search_bookings")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("bookings.filter_by_status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_statuses")}</SelectItem>
              <SelectItem value="pending">{t("bookings.status.pending")}</SelectItem>
              <SelectItem value="confirmed">{t("bookings.status.confirmed")}</SelectItem>
              <SelectItem value="in_progress">{t("bookings.status.in_progress")}</SelectItem>
              <SelectItem value="completed">{t("bookings.status.completed")}</SelectItem>
              <SelectItem value="cancelled">{t("bookings.status.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={stageFilter}
            onValueChange={(value) => {
              setStageFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("bookings.filter_by_stage")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_stages")}</SelectItem>
              <SelectItem value="deposit">{t("bookings.stage.deposit")}</SelectItem>
              <SelectItem value="pre_travel">{t("bookings.stage.pre_travel")}</SelectItem>
              <SelectItem value="treatment">{t("bookings.stage.treatment")}</SelectItem>
              <SelectItem value="post_treatment">{t("bookings.stage.post_treatment")}</SelectItem>
              <SelectItem value="completed">{t("bookings.stage.completed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground flex items-center justify-end">
          {filteredBookings.length}{" "}
          {filteredBookings.length === 1
            ? t("bookings.booking_found")
            : t("bookings.bookings_found")}
        </div>
      </div>
      
      {paginatedBookings.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      {t("bookings.id")}
                      {sortField === "id" && (
                        <ArrowUpDown
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc" ? "transform rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("bookingReference")}
                  >
                    <div className="flex items-center">
                      {t("bookings.reference")}
                      {sortField === "bookingReference" && (
                        <ArrowUpDown
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc" ? "transform rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>{t("bookings.patient")}</TableHead>
                  <TableHead>{t("bookings.clinic")}</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      {t("bookings.created_at")}
                      {sortField === "createdAt" && (
                        <ArrowUpDown
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc" ? "transform rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>{t("bookings.status")}</TableHead>
                  <TableHead>{t("bookings.stage")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                      {booking.bookingReference || `#${booking.id}`}
                    </TableCell>
                    <TableCell>
                      {booking.userId ? `User #${booking.userId}` : t("common.not_available")}
                    </TableCell>
                    <TableCell>
                      {booking.clinicId ? `Clinic #${booking.clinicId}` : t("common.not_available")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(new Date(booking.createdAt), "PPP")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[booking.status || ''] || statusColors['pending']}
                      >
                        {t(`bookings.status.${booking.status || 'pending'}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={stageColors[booking.stage || ''] || stageColors['deposit']}
                      >
                        {t(`bookings.stage.${booking.stage || 'deposit'}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t("common.open_menu")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("common.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/bookings/${booking.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("common.view_details")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          
                          {/* Status update options */}
                          <DropdownMenuLabel>
                            {t("bookings.change_status")}
                          </DropdownMenuLabel>
                          
                          {booking.status !== "pending" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(booking.id, "pending")
                              }
                              disabled={isUpdating}
                            >
                              {booking.status === "pending" && (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {t("bookings.status.pending")}
                            </DropdownMenuItem>
                          )}
                          
                          {booking.status !== "confirmed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(booking.id, "confirmed")
                              }
                              disabled={isUpdating}
                            >
                              {booking.status === "confirmed" && (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {t("bookings.status.confirmed")}
                            </DropdownMenuItem>
                          )}
                          
                          {booking.status !== "in_progress" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(booking.id, "in_progress")
                              }
                              disabled={isUpdating}
                            >
                              {booking.status === "in_progress" && (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {t("bookings.status.in_progress")}
                            </DropdownMenuItem>
                          )}
                          
                          {booking.status !== "completed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(booking.id, "completed")
                              }
                              disabled={isUpdating}
                            >
                              {booking.status === "completed" && (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {t("bookings.status.completed")}
                            </DropdownMenuItem>
                          )}
                          
                          {booking.status !== "cancelled" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(booking.id, "cancelled")
                              }
                              disabled={isUpdating}
                              className="text-destructive"
                            >
                              {booking.status === "cancelled" && (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {t("bookings.status.cancelled")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("bookings.no_bookings_found")}</CardTitle>
            <CardDescription>
              {searchQuery || statusFilter !== "all" || stageFilter !== "all"
                ? t("bookings.no_bookings_with_filters")
                : t("bookings.no_bookings_yet")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchQuery || statusFilter !== "all" || stageFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setStageFilter("all");
                }}
              >
                {t("common.clear_filters")}
              </Button>
            ) : (
              <Link href="/admin/create-booking">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("bookings.create_first_booking")}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {getPaginationItems().map((item, index) => {
              if (item === "ellipsis1" || item === "ellipsis2") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    onClick={() => setCurrentPage(item as number)}
                    isActive={currentPage === item}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}