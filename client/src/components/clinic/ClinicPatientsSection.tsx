import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, User, Mail, Phone, Calendar, MoreHorizontal } from 'lucide-react';

const ClinicPatientsSection: React.FC = () => {
  const { t } = useTranslation();

  // Sample patient data - in a real app, this would come from an API
  const patients = [
    {
      id: 1,
      name: "James Wilson",
      email: "james.wilson@example.com",
      phone: "+44 7700 900123",
      treatment: "Dental Implants",
      status: "Active",
      lastVisit: "10 Mar 2025"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+44 7700 900456",
      treatment: "Veneers",
      status: "Completed",
      lastVisit: "05 Apr 2025"
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "m.brown@example.com",
      phone: "+44 7700 900789",
      treatment: "Crowns",
      status: "Scheduled",
      lastVisit: "25 Feb 2025"
    },
    {
      id: 4,
      name: "Emma Davis",
      email: "e.davis@example.com",
      phone: "+44 7700 900555",
      treatment: "Root Canal",
      status: "Active",
      lastVisit: "18 Mar 2025"
    },
    {
      id: 5,
      name: "Robert Taylor",
      email: "r.taylor@example.com",
      phone: "+44 7700 900222",
      treatment: "Full Mouth Restoration",
      status: "New Patient",
      lastVisit: "-"
    }
  ];

  // Status badge styles
  const statusStyles = {
    "Active": "bg-green-100 text-green-800",
    "Completed": "bg-blue-100 text-blue-800",
    "Scheduled": "bg-purple-100 text-purple-800",
    "New Patient": "bg-yellow-100 text-yellow-800"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.patients.title", "Patient Management")}</CardTitle>
          <CardDescription>
            {t("clinic.patients.description", "View and manage your clinic's patients and their treatment history")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            {/* Search and filter section */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 w-full sm:w-80" 
                placeholder={t("clinic.patients.search", "Search patients...")} 
              />
            </div>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              {t("clinic.patients.add_patient", "Add Patient")}
            </Button>
          </div>

          {/* Patients table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>{t("clinic.patients.name", "Name")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("clinic.patients.contact", "Contact")}</TableHead>
                  <TableHead>{t("clinic.patients.treatment", "Treatment")}</TableHead>
                  <TableHead>{t("clinic.patients.status", "Status")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("clinic.patients.last_visit", "Last Visit")}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
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
                          <span className="text-muted-foreground">{patient.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">{patient.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.treatment}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[patient.status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"}`}>
                        {patient.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{patient.lastVisit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" disabled>
              {t("clinic.patients.previous", "Previous")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t("clinic.patients.page_info", "Showing {{start}} to {{end}} of {{total}} patients", { start: 1, end: 5, total: 24 })}
            </div>
            <Button variant="outline" size="sm">
              {t("clinic.patients.next", "Next")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicPatientsSection;