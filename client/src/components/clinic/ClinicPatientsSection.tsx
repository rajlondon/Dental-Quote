import React, { useState } from 'react';
// Removed react-i18next
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, User, Mail, Phone, Calendar, MoreHorizontal, Loader2, ShieldAlert } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { usePatients, Patient } from '@/hooks/use-patients';
import { format } from 'date-fns';
import AddPatientDialog from './AddPatientDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ClinicPatientsSection: React.FC = () => {
  // Translation removed
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');  // For debouncing search
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);

  // Fetch patients data using our hook
  const { data, isLoading, isError } = usePatients({
    page,
    limit,
    search,
    status
  });

  // Status badge styles
  const statusStyles: Record<string, string> = {
    "Active": "bg-green-100 text-green-800",
    "Completed": "bg-blue-100 text-blue-800",
    "Scheduled": "bg-purple-100 text-purple-800",
    "New Patient": "bg-yellow-100 text-yellow-800"
  };

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    
    // Implement simple debounce for search
    const timeoutId = setTimeout(() => {
      setSearch(e.target.value);
      setPage(1); // Reset to first page on new search
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.data?.pagination && page < data.data.pagination.pages) {
      setPage(page + 1);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Helper to mask email addresses to protect patient privacy
  const maskEmail = (email: string, patientStatus: string) => {
    if (!email) return '';
    
    // Only show full email if treatment is completed
    if (patientStatus === "Completed") return email;
    
    // Otherwise mask the email: jo***@example.com
    const [username, domain] = email.split('@');
    if (!domain) return email; // Return as is if not a valid email
    
    return `${username.substring(0, 2)}***@${domain}`;
  };
  
  // Helper to mask phone numbers to protect patient privacy
  const maskPhone = (phone: string, patientStatus: string) => {
    if (!phone) return '';
    
    // Only show full phone if treatment is completed
    if (patientStatus === "Completed") return phone;
    
    // Otherwise mask the middle digits
    if (phone.length < 6) return phone; // Return as is if too short
    
    return `${phone.substring(0, 3)}•••••${phone.substring(phone.length - 3)}`;
  };

  return (
    <div className="space-y-6">
      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={showAddPatientDialog}
        onOpenChange={setShowAddPatientDialog}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>
            View and manage your clinic's patients and their treatment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-yellow-500 bg-yellow-50">
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-800">Privacy Protection Notice</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Patient contact information is partially masked for privacy and business protection. 
              Complete details are only visible for patients with completed treatments.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            {/* Search and filter section */}
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10 w-full" 
                  placeholder="Search patients..." 
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>
              
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="New Patient">New Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => setShowAddPatientDialog(true)}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="flex justify-center items-center py-8 text-destructive">
              <p>Error loading data. Please try again.</p>
            </div>
          )}

          {/* Patients table */}
          {!isLoading && !isError && data?.data?.patients && (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.data.patients.map((patient: Patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-1 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span>{patient.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {maskEmail(patient.email, patient.status)}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {maskPhone(patient.phone, patient.status)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{patient.treatment}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[patient.status] || "bg-gray-100 text-gray-800"}`}>
                            {patient.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{formatDate(patient.lastVisit)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && data?.data?.pagination && (
            <div className="flex items-center justify-between mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={handlePreviousPage}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {data.data.pagination.total > 0 ? (
                  `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.data.pagination.total)} of ${data.data.pagination.total} patients`
                ) : (
                  "No results"
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!data.data.pagination || page >= data.data.pagination.pages}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicPatientsSection;