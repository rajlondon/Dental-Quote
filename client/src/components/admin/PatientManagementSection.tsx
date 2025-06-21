import React, { useState } from 'react';
// Removed react-i18next
import { 
  Search, Filter, Download, Plus, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, ArrowUpDown, Mail, Phone, Calendar, FileText
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample patient data
const patients = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    email: 'sarah.j@example.com', 
    phone: '+44 7700 900123', 
    status: 'Active',
    lastInteraction: '2 days ago',
    treatmentStage: 'Quoted',
    created: 'May 1, 2025',
  },
  { 
    id: 2, 
    name: 'Michael Brown', 
    email: 'michael.b@example.com', 
    phone: '+44 7700 900456', 
    status: 'Active',
    lastInteraction: '3 days ago',
    treatmentStage: 'Booked',
    created: 'May 2, 2025',
  },
  { 
    id: 3, 
    name: 'David Smith', 
    email: 'david.s@example.com', 
    phone: '+44 7700 900789', 
    status: 'Active',
    lastInteraction: '1 week ago',
    treatmentStage: 'Treatment',
    created: 'May 3, 2025',
  },
  { 
    id: 4, 
    name: 'Emily Wilson', 
    email: 'emily.w@example.com', 
    phone: '+44 7700 900321', 
    status: 'Completed',
    lastInteraction: '2 weeks ago',
    treatmentStage: 'Completed',
    created: 'May 4, 2025',
  },
  { 
    id: 5, 
    name: 'Lisa Taylor', 
    email: 'lisa.t@example.com', 
    phone: '+44 7700 900654', 
    status: 'Active',
    lastInteraction: '1 day ago',
    treatmentStage: 'Treatment',
    created: 'May 5, 2025',
  },
  { 
    id: 6, 
    name: 'Robert Wilson', 
    email: 'robert.w@example.com', 
    phone: '+44 7700 900987', 
    status: 'Active',
    lastInteraction: '5 days ago',
    treatmentStage: 'Booked',
    created: 'May 6, 2025',
  },
  { 
    id: 7, 
    name: 'James Williams', 
    email: 'james.w@example.com', 
    phone: '+44 7700 900345', 
    status: 'Inactive',
    lastInteraction: '1 month ago',
    treatmentStage: 'Quoted',
    created: 'May 7, 2025',
  },
  { 
    id: 8, 
    name: 'Patricia Davis', 
    email: 'patricia.d@example.com', 
    phone: '+44 7700 900678', 
    status: 'Active',
    lastInteraction: '3 days ago',
    treatmentStage: 'Quoted',
    created: 'May 8, 2025',
  },
];

const PatientManagementSection: React.FC = () => {
  // Translation removed
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesStage = stageFilter === 'all' || patient.treatmentStage.toLowerCase() === stageFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("admin.patients.search_placeholder", "Search patients...")}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("admin.patients.status_filter", "Filter by Status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.patients.all_statuses", "All Statuses")}</SelectItem>
                  <SelectItem value="active">{t("admin.patients.active", "Active")}</SelectItem>
                  <SelectItem value="inactive">{t("admin.patients.inactive", "Inactive")}</SelectItem>
                  <SelectItem value="completed">{t("admin.patients.completed", "Completed")}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("admin.patients.stage_filter", "Filter by Stage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.patients.all_stages", "All Stages")}</SelectItem>
                  <SelectItem value="quoted">{t("admin.patients.quoted", "Quoted")}</SelectItem>
                  <SelectItem value="booked">{t("admin.patients.booked", "Booked")}</SelectItem>
                  <SelectItem value="treatment">{t("admin.patients.treatment", "Treatment")}</SelectItem>
                  <SelectItem value="completed">{t("admin.patients.completed", "Completed")}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t("admin.patients.export", "Export")}
              </Button>
              
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("admin.patients.add_patient", "Add Patient")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("admin.patients.patients_list", "Patients List")}</CardTitle>
          <CardDescription>
            {t("admin.patients.manage_patients", "Manage and track all patient records")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-1">
                      {t("admin.patients.patient_name", "Patient Name")}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      {t("admin.patients.contact", "Contact")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      {t("admin.patients.stage", "Stage")}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      {t("admin.patients.last_interaction", "Last Interaction")}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    {t("admin.patients.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-gray-500">ID: #{patient.id.toString().padStart(5, '0')}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {patient.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            patient.treatmentStage === 'Quoted' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                            patient.treatmentStage === 'Booked' ? 'border-green-200 bg-green-50 text-green-600' :
                            patient.treatmentStage === 'Treatment' ? 'border-purple-200 bg-purple-50 text-purple-600' :
                            'border-gray-200 bg-gray-50 text-gray-600'
                          }`}
                        >
                          {patient.treatmentStage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{patient.lastInteraction}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open menu</span>
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("admin.patients.actions", "Actions")}</DropdownMenuLabel>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              {t("admin.patients.view_profile", "View Profile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {t("admin.patients.send_message", "Send Message")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {t("admin.patients.view_documents", "View Documents")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {t("admin.patients.schedule", "Schedule Appointment")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              {t("admin.patients.edit", "Edit Patient")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                              <Trash2 className="h-4 w-4" />
                              {t("admin.patients.delete", "Delete Patient")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      {t("admin.patients.no_results", "No patients found matching the criteria")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <CardFooter className="flex items-center justify-between pt-0 pb-4 px-6">
            <div className="text-sm text-gray-500">
              {t("admin.patients.showing_results", "Showing {{start}} to {{end}} of {{total}} patients", {
                start: Math.min((currentPage - 1) * itemsPerPage + 1, filteredPatients.length),
                end: Math.min(currentPage * itemsPerPage, filteredPatients.length),
                total: filteredPatients.length,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("admin.patients.previous", "Previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                {t("admin.patients.next", "Next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PatientManagementSection;