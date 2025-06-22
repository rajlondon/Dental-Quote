import React from 'react';
// Removed react-i18next
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, BarChart, Download, Calendar, User, 
  PieChart, LineChart, Upload, Eye, MoreHorizontal 
} from 'lucide-react';

const ClinicReportsSection: React.FC = () => {
  // Translation placeholder function
  const t = (key: string) => {
    const translations: { [key: string]: string } = {
      'reports.title': 'Reports & Analytics',
      'reports.description': 'View clinic performance and analytics',
      'reports.revenue': 'Revenue',
      'reports.patients': 'Patients',
      'reports.appointments': 'Appointments',
      'reports.treatments': 'Treatments',
      'reports.period': 'Period',
      'reports.thisMonth': 'This Month',
      'reports.lastMonth': 'Last Month',
      'reports.thisYear': 'This Year',
      'reports.export': 'Export Report',
      'reports.loading': 'Loading reports...',
      'reports.noData': 'No data available',
      'common.loading': 'Loading...',
      'common.error': 'Error loading data',
      "clinic.reports.title": "Reports & Analytics",
      "clinic.reports.description": "View and generate reports on patient treatments and clinic performance",
      "clinic.reports.patient": "Patient Reports",
      "clinic.reports.analytics": "Analytics Reports",
      "clinic.reports.upload": "Upload Report",
      "clinic.reports.report_id": "Report ID",
      "clinic.reports.type": "Report Type",
      "clinic.reports.date": "Date Created",
      "clinic.reports.created_by": "Created By",
      "clinic.reports.actions": "Actions",
      "clinic.reports.view": "View Report",
      "clinic.reports.download": "Download PDF",
      "clinic.reports.more": "More Options"
    };
    return translations[key] || key;
  };

  // Sample reports data - in a real app, this would come from an API
  const patientReports = [
    {
      id: "PR-2025-028",
      patientName: "James Wilson",
      reportType: "Treatment Summary",
      dateCreated: "10 Apr 2025",
      createdBy: "Dr. Smith"
    },
    {
      id: "PR-2025-027",
      patientName: "Sarah Johnson",
      reportType: "X-Ray Analysis",
      dateCreated: "05 Apr 2025",
      createdBy: "Dr. Adams"
    },
    {
      id: "PR-2025-025",
      patientName: "Michael Brown",
      reportType: "Treatment Plan",
      dateCreated: "01 Apr 2025",
      createdBy: "Dr. Smith"
    },
    {
      id: "PR-2025-023",
      patientName: "Emma Davis",
      reportType: "Pre-Treatment Assessment",
      dateCreated: "28 Mar 2025",
      createdBy: "Dr. Williams"
    }
  ];

  const analyticsReports = [
    {
      id: "AR-2025-012",
      title: "Monthly Performance",
      description: "Summary of clinic performance for April 2025",
      type: "Performance",
      dateCreated: "11 Apr 2025"
    },
    {
      id: "AR-2025-011",
      title: "Treatment Popularity",
      description: "Analysis of most popular treatments and procedures",
      type: "Analytics",
      dateCreated: "05 Apr 2025"
    },
    {
      id: "AR-2025-010",
      title: "Patient Satisfaction",
      description: "Overview of patient satisfaction scores and feedback",
      type: "Feedback",
      dateCreated: "01 Apr 2025"
    },
    {
      id: "AR-2025-009",
      title: "Revenue Analysis",
      description: "Detailed revenue breakdown by treatment category",
      type: "Financial",
      dateCreated: "25 Mar 2025"
    }
  ];

  // Report type icons
  const reportTypeIcons = {
    "Treatment Summary": <FileText className="h-4 w-4 text-primary" />,
    "X-Ray Analysis": <PieChart className="h-4 w-4 text-primary" />,
    "Treatment Plan": <LineChart className="h-4 w-4 text-primary" />,
    "Pre-Treatment Assessment": <User className="h-4 w-4 text-primary" />,
    "Performance": <BarChart className="h-4 w-4 text-blue-500" />,
    "Analytics": <PieChart className="h-4 w-4 text-purple-500" />,
    "Feedback": <User className="h-4 w-4 text-green-500" />,
    "Financial": <LineChart className="h-4 w-4 text-red-500" />
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.reports.title")}</CardTitle>
          <CardDescription>
            {t("clinic.reports.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patient">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="patient">{t("clinic.reports.patient")}</TabsTrigger>
                <TabsTrigger value="analytics">{t("clinic.reports.analytics")}</TabsTrigger>
              </TabsList>

              <Button className="w-full sm:w-auto gap-2">
                <Upload className="h-4 w-4" />
                {t("clinic.reports.upload")}
              </Button>
            </div>

            <TabsContent value="patient" className="mt-0">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("clinic.reports.report_id")}</TableHead>
                      <TableHead>{t("clinic.reports.patient")}</TableHead>
                      <TableHead>{t("clinic.reports.type")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("clinic.reports.date")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("clinic.reports.created_by")}</TableHead>
                      <TableHead className="text-right">{t("clinic.reports.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-1 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span>{report.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {reportTypeIcons[report.reportType as keyof typeof reportTypeIcons]}
                            <span>{report.reportType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{report.dateCreated}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{report.createdBy}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title={t("clinic.reports.view")}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title={t("clinic.reports.download")}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title={t("clinic.reports.more")}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsReports.map((report) => (
                  <Card key={report.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-1 rounded-full">
                            {reportTypeIcons[report.type as keyof typeof reportTypeIcons] || 
                             <BarChart className="h-4 w-4 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{report.dateCreated}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {t("clinic.reports.view")}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            {t("clinic.reports.download")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicReportsSection;